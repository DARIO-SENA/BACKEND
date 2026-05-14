import pool from '../../config/db.js';
import eventBus from '../../eventBus/index.js';
import { EVENTS } from '../../eventBus/events.js';
import { crearHabitoSchema, actualizarHabitoSchema } from '../../validation/index.js';

export const crearHabito = async (usuarioId, datos) => {
  const parsed = crearHabitoSchema.safeParse(datos);
  if (!parsed.success) {
    throw Object.assign(new Error(parsed.error.issues[0].message), { status: 400 });
  }
  const { titulo, descripcion, frecuencia } = parsed.data;
  const { rows } = await pool.query(
    `INSERT INTO habitos (usuario_id, titulo, descripcion, frecuencia)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [usuarioId, titulo, descripcion, frecuencia]
  );
  return rows[0];
};

export const listarHabitos = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT * FROM habitos WHERE usuario_id = $1 ORDER BY creado_en DESC`,
    [usuarioId]
  );
  return rows;
};

export const actualizarHabito = async (id, usuarioId, datos) => {
  const parsed = actualizarHabitoSchema.safeParse(datos);
  if (!parsed.success) {
    throw Object.assign(new Error(parsed.error.issues[0].message), { status: 400 });
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

  // 3. Actualizar
  const { rows } = await pool.query(
    `UPDATE habitos
     SET titulo = $1,
         descripcion = $2,
         frecuencia = $3,
         completado = $4,
         actualizado_en = NOW()
     WHERE id = $5 AND usuario_id = $6
     RETURNING *`,
    [titulo, descripcion, frecuencia, completado, id, usuarioId]
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