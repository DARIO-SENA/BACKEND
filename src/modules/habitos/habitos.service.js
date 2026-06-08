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
  const { titulo, descripcion, frecuencia, dias_semana } = parsed.data;
  const { rows } = await pool.query(
    `INSERT INTO habitos (usuario_id, titulo, descripcion, frecuencia, dias_semana)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [usuarioId, titulo, descripcion, frecuencia, JSON.stringify(dias_semana)]
  );
  return rows[0];
};

export const listarHabitos = async (usuarioId, limite = 50, pagina = 1) => {
  const offset = (pagina - 1) * limite;
  const { rows } = await pool.query(
    `SELECT * FROM habitos WHERE usuario_id = $1 ORDER BY creado_en DESC LIMIT $2 OFFSET $3`,
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
    `SELECT * FROM habitos
     WHERE id = $1 AND usuario_id = $2`,
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
  const dias_semana = datos.dias_semana ?? habitoActual.dias_semana;

  // 3. Actualizar
  const { rows } = await pool.query(
    `UPDATE habitos
     SET titulo = $1,
         descripcion = $2,
         frecuencia = $3,
         completado = $4,
         dias_semana = $5,
         actualizado_en = NOW()
     WHERE id = $6 AND usuario_id = $7
     RETURNING *`,
    [titulo, descripcion, frecuencia, completado, JSON.stringify(dias_semana), id, usuarioId]
  );

  const habitoActualizado = rows[0];

  if (!habitoActual.completado && completado === true) {
    eventBus.emit(EVENTS.HABIT_COMPLETED, { usuarioId, habitoId: id });
  }

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

  if (!habitoActual.completado && completado) {
    eventBus.emit(EVENTS.HABIT_COMPLETED, { usuarioId, habitoId: id });
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