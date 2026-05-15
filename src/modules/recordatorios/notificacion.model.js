// src/modules/recordatorios/notificacion.model.js
import pool from '../../config/db.js';

export const encontrarPorUsuario = async (usuarioId, soloNoLeidas = false) => {
  const filtro = soloNoLeidas ? 'AND leida = false' : '';
  const { rows } = await pool.query(
    `SELECT * FROM notificaciones
     WHERE usuario_id = $1 ${filtro}
     ORDER BY creado_en DESC LIMIT 100`,
    [usuarioId]
  );
  const { rows: [{ count }] } = await pool.query(
    `SELECT COUNT(*) FROM notificaciones WHERE usuario_id = $1 ${filtro}`,
    [usuarioId]
  );
  return { data: rows, total: parseInt(count) };
};

export const contarNoLeidas = async (usuarioId) => {
  const { rows } = await pool.query(
    'SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_id = $1 AND leida = false',
    [usuarioId]
  );
  return parseInt(rows[0].total);
};

export const insertar = async ({ usuarioId, titulo, mensaje, recordatorioId = null }) => {
  const { rows } = await pool.query(
    `INSERT INTO notificaciones (usuario_id, titulo, mensaje, recordatorio_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [usuarioId, titulo, mensaje, recordatorioId]
  );
  return rows[0];
};

export const marcarLeida = async (id, usuarioId) => {
  const { rows } = await pool.query(
    'UPDATE notificaciones SET leida = true WHERE id = $1 AND usuario_id = $2 RETURNING *',
    [id, usuarioId]
  );
  return rows[0] || null;
};

export const marcarTodasLeidas = async (usuarioId) => {
  const { rowCount } = await pool.query(
    'UPDATE notificaciones SET leida = true WHERE usuario_id = $1 AND leida = false',
    [usuarioId]
  );
  return rowCount;
};
