// src/modules/recordatorios/recordatorio.model.js

import pool from '../../config/db.js';

export const encontrarTodos = async (usuarioId, filtros = {}) => {
  const { tipo, estado } = filtros;
  const valores = [usuarioId];
  const condiciones = ['usuario_id = $1'];
  let i = 2;

  if (tipo)   { condiciones.push(`tipo = $${i++}`);   valores.push(tipo); }
  if (estado) { condiciones.push(`estado = $${i++}`); valores.push(estado); }

  const { rows } = await pool.query(
    `SELECT r.*,
            c.nombre AS categoria_nombre, c.color AS categoria_color, c.icono AS categoria_icono
     FROM recordatorios r
     LEFT JOIN categorias c ON r.categoria_id = c.id
     WHERE r.${condiciones.join(' AND r.')}
     ORDER BY r.fecha_hora ASC`,
    valores
  );
  const { rows: [{ count }] } = await pool.query(
    `SELECT COUNT(*) FROM recordatorios r
     LEFT JOIN categorias c ON r.categoria_id = c.id
     WHERE r.${condiciones.join(' AND r.')}`,
    valores
  );
  return { data: rows, total: parseInt(count) };
};

export const encontrarPorId = async (id, usuarioId) => {
  const { rows } = await pool.query(
    'SELECT * FROM recordatorios WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return rows[0] || null;
};

export const encontrarPendientes = async () => {
  const { rows } = await pool.query(
    `SELECT * FROM recordatorios
     WHERE estado = 'pendiente' AND fecha_hora > NOW()
     ORDER BY fecha_hora ASC`
  );
  return rows;
};

export const insertar = async (usuarioId, datos) => {
  const {
    tipo = 'manual', referencia_id = null, titulo, mensaje = null,
    fecha_hora, anticipacion_min = 0,
    es_recurrente = false, regla_recurrencia = null,
    icono = '', categoria_id = null,
  } = datos;

  const { rows } = await pool.query(
    `INSERT INTO recordatorios
     (usuario_id, tipo, referencia_id, titulo, mensaje,
      fecha_hora, anticipacion_min, es_recurrente, regla_recurrencia,
      icono, categoria_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [usuarioId, tipo, referencia_id, titulo, mensaje,
     fecha_hora, anticipacion_min, es_recurrente, regla_recurrencia,
     icono, categoria_id]
  );
  return rows[0];
};

export const actualizar = async (id, usuarioId, datos) => {
  const actual = await encontrarPorId(id, usuarioId);
  if (!actual) return null;

  const titulo = datos.titulo ?? actual.titulo;
  const mensaje = datos.mensaje ?? actual.mensaje;
  const fecha_hora = datos.fecha_hora ?? actual.fecha_hora;
  const anticipacion_min = datos.anticipacion_min ?? actual.anticipacion_min;
  const es_recurrente = datos.es_recurrente ?? actual.es_recurrente;
  const regla_recurrencia = datos.regla_recurrencia ?? actual.regla_recurrencia;
  const icono = datos.icono !== undefined ? datos.icono : actual.icono;
  const categoria_id = datos.categoria_id !== undefined ? datos.categoria_id : actual.categoria_id;

  const { rows } = await pool.query(
    `UPDATE recordatorios
     SET titulo = $1, mensaje = $2, fecha_hora = $3,
         anticipacion_min = $4, es_recurrente = $5,
         regla_recurrencia = $6, estado = 'pendiente',
         icono = $7, categoria_id = $8
     WHERE id = $9 AND usuario_id = $10
     RETURNING *`,
    [titulo, mensaje, fecha_hora, anticipacion_min,
     es_recurrente, regla_recurrencia, icono, categoria_id, id, usuarioId]
  );
  return rows[0] || null;
};

export const actualizarEstado = async (id, estado) => {
  const { rows } = await pool.query(
    `UPDATE recordatorios SET estado = $1 WHERE id = $2 RETURNING *`,
    [estado, id]
  );
  return rows[0] || null;
};

export const eliminar = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM recordatorios WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return rowCount > 0;
};

export const eliminarTodos = async (usuarioId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM recordatorios WHERE usuario_id = $1',
    [usuarioId]
  );
  return rowCount;
};
