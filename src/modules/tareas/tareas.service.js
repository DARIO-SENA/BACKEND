import pool from '../../config/db.js';
import { programarTareasAutomaticamente } from '../agenda/agenda.service.js';
import eventBus from '../../eventBus/index.js';
import { EVENTS } from '../../eventBus/events.js';
import { crearTareaSchema, actualizarTareaSchema } from '../../validation/index.js';

export const obtenerTareas = async (usuarioId, filtros = {}) => {
  const { estado, prioridad, desde, hasta, categoria_id } = filtros;
  const valores = [usuarioId];
  const condiciones = ['t.usuario_id = $1'];
  let i = 2;

  if (estado)       { condiciones.push(`t.estado = $${i++}`);        valores.push(estado); }
  if (prioridad)    { condiciones.push(`t.prioridad = $${i++}`);      valores.push(prioridad); }
  if (desde)        { condiciones.push(`t.fecha_inicio >= $${i++}`);  valores.push(desde); }
  if (hasta)        { condiciones.push(`t.fecha_inicio <= $${i++}`);  valores.push(hasta); }
  if (categoria_id) { condiciones.push(`t.categoria_id = $${i++}`);   valores.push(categoria_id); }

  const { rows } = await pool.query(
    `SELECT t.*, c.nombre AS categoria_nombre, c.color AS categoria_color
     FROM tareas t
     LEFT JOIN categorias c ON t.categoria_id = c.id
     WHERE ${condiciones.join(' AND ')}
     ORDER BY
       CASE t.prioridad WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END,
       t.fecha_inicio ASC NULLS LAST`,
    valores
  );
  return rows;
};

export const obtenerTareaPorId = async (id, usuarioId) => {
  const { rows } = await pool.query(
    `SELECT t.*, c.nombre AS categoria_nombre, c.color AS categoria_color
     FROM tareas t
     LEFT JOIN categorias c ON t.categoria_id = c.id
     WHERE t.id = $1 AND t.usuario_id = $2`,
    [id, usuarioId]
  );
  return rows[0] || null;
};

export const crearTarea = async (usuarioId, datos) => {
  const parsed = crearTareaSchema.safeParse(datos);
  if (!parsed.success) {
    throw Object.assign(new Error(parsed.error.issues[0].message), { status: 400 });
  }
  const {
    titulo, descripcion, prioridad, duracion_minutos,
    fecha_inicio, fecha_fin, fecha_limite,
    todo_el_dia, categoria_id,
    es_recurrente, recurrencia, dias_semana,
  } = parsed.data;
  const auto_programado = false;

  const { rows } = await pool.query(
    `INSERT INTO tareas (
       usuario_id, titulo, descripcion, prioridad, duracion_minutos,
       fecha_inicio, fecha_fin, fecha_limite, todo_el_dia, categoria_id,
       es_recurrente, recurrencia, auto_programado, dias_semana
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [usuarioId, titulo, descripcion, prioridad, duracion_minutos,
     fecha_inicio, fecha_fin, fecha_limite, todo_el_dia, categoria_id,
     es_recurrente, recurrencia, auto_programado, JSON.stringify(dias_semana)]
  );

  eventBus.emit(EVENTS.TASK_CREATED, { usuarioId, tarea: rows[0] });

  return rows[0];
};

export const programarYObtener = async (usuarioId, tarea) => {
  await programarTareasAutomaticamente(usuarioId, [tarea]);
  return obtenerTareaPorId(tarea.id, usuarioId);
};

export const actualizarTarea = async (id, usuarioId, datos) => {
  const parsed = actualizarTareaSchema.safeParse(datos);
  if (!parsed.success) {
    throw Object.assign(new Error(parsed.error.issues[0].message), { status: 400 });
  }
  datos = parsed.data;
  const campos = [];
  const valores = [];
  let i = 1;

  const permitidos = Object.keys(actualizarTareaSchema.shape);

  for (const campo of permitidos) {
    if (datos[campo] !== undefined) {
      campos.push(`${campo} = $${i++}`);
      valores.push(datos[campo]);
    }
  }

  if (campos.length === 0) return null;

  valores.push(id, usuarioId);
  const { rows } = await pool.query(
    `UPDATE tareas SET ${campos.join(', ')}
     WHERE id = $${i++} AND usuario_id = $${i} RETURNING *`,
    valores
  );
  return rows[0] || null;
};

export const eliminarTarea = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM tareas WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return rowCount > 0;
};

export const eliminarTodas = async (usuarioId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM tareas WHERE usuario_id = $1',
    [usuarioId]
  );
  return rowCount;
};

export const cambiarEstado = async (id, usuarioId, estado) => {

  // 1. Obtener tarea actual
  const tareaActual = await obtenerTareaPorId(id, usuarioId);

  if (!tareaActual) return null;

  // 2. Actualizar estado
  const { rows } = await pool.query(
    `UPDATE tareas
     SET estado = $1,
         actualizado_en = NOW()
     WHERE id = $2 AND usuario_id = $3
     RETURNING *`,
    [estado, id, usuarioId]
  );

  const tareaActualizada = rows[0];

  if (tareaActual.estado !== 'completada' && estado === 'completada') {
    eventBus.emit(EVENTS.TASK_DONE, {
      usuarioId,
      tarea: { id: tareaActualizada.id, prioridad: tareaActualizada.prioridad }
    });
  }

  return tareaActualizada;
};

export const obtenerAgendaDia = async (usuarioId, fecha) => {
  const inicioDia = new Date(fecha); inicioDia.setHours(0, 0, 0, 0);
  const finDia    = new Date(fecha); finDia.setHours(23, 59, 59, 999);

  const { rows } = await pool.query(
    `SELECT t.*, c.nombre AS categoria_nombre, c.color AS categoria_color
     FROM tareas t
     LEFT JOIN categorias c ON t.categoria_id = c.id
     WHERE t.usuario_id = $1 AND t.estado != 'cancelada'
       AND (
         (t.fecha_inicio >= $2 AND t.fecha_inicio <= $3)
         OR (t.todo_el_dia = true AND t.fecha_limite::date = $4::date)
         OR (t.fecha_inicio IS NULL AND t.fecha_limite::date = $4::date)
       )
     ORDER BY t.todo_el_dia DESC, t.fecha_inicio ASC NULLS LAST`,
    [usuarioId, inicioDia, finDia, fecha]
  );
  return rows;
};

export const obtenerEstadisticas = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE estado = 'pendiente')   AS pendientes,
       COUNT(*) FILTER (WHERE estado = 'en_progreso') AS en_progreso,
       COUNT(*) FILTER (WHERE estado = 'completada')  AS completadas,
       COUNT(*) FILTER (WHERE estado = 'completada'
         AND actualizado_en >= NOW() - INTERVAL '7 days') AS completadas_semana,
       COUNT(*) FILTER (WHERE fecha_limite < NOW()
         AND estado NOT IN ('completada', 'cancelada')) AS vencidas
     FROM tareas WHERE usuario_id = $1`,
    [usuarioId]
  );
  return rows[0];
};

export const obtenerCategorias = async (usuarioId) => {
  const { rows } = await pool.query(
    'SELECT * FROM categorias WHERE usuario_id = $1 ORDER BY nombre',
    [usuarioId]
  );
  return rows;
};

export const crearCategoria = async (usuarioId, nombre, color) => {
  const { rows } = await pool.query(
    'INSERT INTO categorias (usuario_id, nombre, color) VALUES ($1, $2, $3) RETURNING *',
    [usuarioId, nombre, color]
  );
  return rows[0];
};

export const eliminarCategoria = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM categorias WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return rowCount > 0;
};

export const actualizarCategoria = async (id, usuarioId, datos) => {
  const campos = [];
  const valores = [];
  let i = 1;
  if (datos.nombre) { campos.push(`nombre = $${i++}`); valores.push(datos.nombre); }
  if (datos.color)  { campos.push(`color = $${i++}`); valores.push(datos.color); }
  if (campos.length === 0) return null;
  valores.push(id, usuarioId);
  const { rows } = await pool.query(
    `UPDATE categorias SET ${campos.join(', ')} WHERE id = $${i++} AND usuario_id = $${i} RETURNING *`,
    valores
  );
  return rows[0] || null;
};