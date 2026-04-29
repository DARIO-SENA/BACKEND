import pool from '../../config/db.js';

export const crearHabito = async (usuarioId, { titulo, descripcion, frecuencia }) => {
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
  const { titulo, descripcion, frecuencia } = datos;
  const { rows } = await pool.query(
    `UPDATE habitos
     SET titulo = $1, descripcion = $2, frecuencia = $3, actualizado_en = NOW()
     WHERE id = $4 AND usuario_id = $5 RETURNING *`,
    [titulo, descripcion, frecuencia, id, usuarioId]
  );
  return rows[0] || null;
};

export const eliminarHabito = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    `DELETE FROM habitos WHERE id = $1 AND usuario_id = $2`,
    [id, usuarioId]
  );
  return rowCount > 0;
};