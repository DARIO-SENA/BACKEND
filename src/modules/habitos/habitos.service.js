import pool from '../../config/db.js';
import eventBus from '../../eventBus/index.js';
import { EVENTS } from '../../eventBus/events.js';
import { AppError } from '../../utils/AppError.js';
import { crearHabitoSchema, actualizarHabitoSchema } from '../../validation/index.js';

export const crearHabito = async (usuarioId, datos) => {
  const parsed = crearHabitoSchema.safeParse(datos);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }
  let { titulo, descripcion, frecuencia, icono, categoria, categoria_id, dias_semana } = parsed.data;
  if (categoria_id && !categoria) {
    const cat = await pool.query('SELECT nombre FROM categorias_habitos WHERE id = $1 AND usuario_id = $2', [categoria_id, usuarioId]);
    if (cat.rows.length > 0) categoria = cat.rows[0].nombre;
  }
  const { rows } = await pool.query(
    `INSERT INTO habitos (usuario_id, titulo, descripcion, frecuencia, icono, categoria, categoria_id, dias_semana)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [usuarioId, titulo, descripcion, frecuencia, icono, categoria, categoria_id, JSON.stringify(dias_semana)]
  );
  return rows[0];
};

export const listarHabitos = async (usuarioId, limite = 50, pagina = 1) => {
  const offset = (pagina - 1) * limite;
  const { rows } = await pool.query(
    `SELECT h.*, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color,
            CASE WHEN rh.id IS NOT NULL THEN true ELSE false END as completado_hoy
     FROM habitos h
     LEFT JOIN categorias_habitos c ON h.categoria_id = c.id
     LEFT JOIN registros_habitos rh ON rh.habito_id = h.id AND rh.fecha = CURRENT_DATE
     WHERE h.usuario_id = $1 ORDER BY h.creado_en DESC LIMIT $2 OFFSET $3`,
    [usuarioId, limite, offset]
  );
  const { rows: [{ count }] } = await pool.query(
    'SELECT COUNT(*) FROM habitos WHERE usuario_id = $1',
    [usuarioId]
  );
  return { data: rows, total: parseInt(count) };
};

export const actualizarHabito = async (id, usuarioId, datos) => {
  const parsed = actualizarHabitoSchema.safeParse(datos);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }
  datos = parsed.data;

  // 1. Buscar hábito actual
  const actual = await pool.query(
    `SELECT h.*, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color
     FROM habitos h
     LEFT JOIN categorias_habitos c ON h.categoria_id = c.id
     WHERE h.id = $1 AND h.usuario_id = $2`,
    [id, usuarioId]
  );

  if (actual.rows.length === 0) {
    return null;
  }

  const habitoActual = actual.rows[0];

  // 2. Mantener valores anteriores si no llegan nuevos
  const titulo = datos.titulo ?? habitoActual.titulo;
  const descripcion = datos.descripcion ?? habitoActual.descripcion;
  const frecuencia = datos.frecuencia ?? habitoActual.frecuencia;
  const completado = datos.completado ?? habitoActual.completado;
  const icono = datos.icono ?? habitoActual.icono;
  let categoria = datos.categoria ?? habitoActual.categoria;
  const categoria_id = datos.categoria_id ?? habitoActual.categoria_id;
  if (datos.categoria_id !== undefined && categoria_id && !categoria) {
    const cat = await pool.query('SELECT nombre FROM categorias_habitos WHERE id = $1 AND usuario_id = $2', [categoria_id, usuarioId]);
    if (cat.rows.length > 0) categoria = cat.rows[0].nombre;
  }
  const dias_semana = datos.dias_semana ?? habitoActual.dias_semana;

  // 3. Actualizar
  const { rows } = await pool.query(
    `UPDATE habitos
     SET titulo = $1,
         descripcion = $2,
         frecuencia = $3,
         completado = $4,
         icono = $5,
         categoria = $6,
         categoria_id = $7,
         dias_semana = $8,
         actualizado_en = NOW()
     WHERE id = $9 AND usuario_id = $10
     RETURNING *`,
    [titulo, descripcion, frecuencia, completado, icono, categoria, categoria_id, JSON.stringify(dias_semana), id, usuarioId]
  );

  const habitoActualizado = rows[0];

  return habitoActualizado;
};

export const cambiarEstadoHabito = async (id, usuarioId, estado) => {
  const actual = await pool.query(
    `SELECT * FROM habitos WHERE id = $1 AND usuario_id = $2`,
    [id, usuarioId]
  );

  if (actual.rows.length === 0) return null;

  const habitoActual = actual.rows[0];
  const completado = estado === 'completada';

  const { rows } = await pool.query(
    `UPDATE habitos
     SET completado = $1, actualizado_en = NOW()
     WHERE id = $2 AND usuario_id = $3
     RETURNING *`,
    [completado, id, usuarioId]
  );

  const habitoActualizado = rows[0];

  if (completado) {
    if (!habitoActual.completado) {
      await pool.query(
        `INSERT INTO registros_habitos (habito_id, completado, fecha) VALUES ($1, true, CURRENT_DATE)
         ON CONFLICT DO NOTHING`,
        [id]
      );
      eventBus.emit(EVENTS.HABIT_COMPLETED, { usuarioId, habitoId: id });
    }
  } else {
    await pool.query(
      `DELETE FROM registros_habitos WHERE habito_id = $1 AND fecha = CURRENT_DATE`,
      [id]
    );
  }

  return habitoActualizado;
};

export const eliminarHabito = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    `DELETE FROM habitos WHERE id = $1 AND usuario_id = $2`,
    [id, usuarioId]
  );
  return rowCount > 0;
};

export const eliminarTodos = async (usuarioId) => {
  const { rowCount } = await pool.query(
    `DELETE FROM habitos WHERE usuario_id = $1`,
    [usuarioId]
  );
  return rowCount;
};