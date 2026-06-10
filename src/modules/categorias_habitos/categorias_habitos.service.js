import pool from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

const DEFAULT_CATEGORIES = [
  { nombre: 'Salud', icono: '💪', color: '#4caf50' },
  { nombre: 'Mente', icono: '🧠', color: '#b06ef3' },
  { nombre: 'Fitness', icono: '🏋️', color: '#00bcd4' },
  { nombre: 'Lectura', icono: '📖', color: '#2979ff' },
  { nombre: 'Trabajo', icono: '💼', color: '#ff9800' },
  { nombre: 'Creatividad', icono: '🎨', color: '#e91e63' },
  { nombre: 'Hogar', icono: '🏠', color: '#607d8b' },
  { nombre: 'Social', icono: '👥', color: '#9c27b0' },
  { nombre: 'Finanzas', icono: '💰', color: '#ffd700' },
  { nombre: 'Espiritual', icono: '🌸', color: '#ff3d00' },
];

export const listarCategorias = async (usuarioId) => {
  let { rows } = await pool.query(
    `SELECT * FROM categorias_habitos WHERE usuario_id = $1 ORDER BY nombre`,
    [usuarioId]
  );
  if (rows.length === 0) {
    // Seed defaults
    for (const cat of DEFAULT_CATEGORIES) {
      const r = await pool.query(
        `INSERT INTO categorias_habitos (usuario_id, nombre, icono, color)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [usuarioId, cat.nombre, cat.icono, cat.color]
      );
      rows.push(r.rows[0]);
    }
    // Also import legacy category text values from existing habits
    const legacy = await pool.query(
      `SELECT DISTINCT categoria FROM habitos
       WHERE usuario_id = $1 AND categoria IS NOT NULL AND categoria != ''
       ORDER BY categoria`,
      [usuarioId]
    );
    const existingNames = new Set(rows.map(r => r.nombre.toLowerCase()));
    for (const row of legacy.rows) {
      const name = row.categoria.trim();
      if (name && !existingNames.has(name.toLowerCase())) {
        const r = await pool.query(
          `INSERT INTO categorias_habitos (usuario_id, nombre, icono, color)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [usuarioId, name, '', '#b06ef3']
        );
        rows.push(r.rows[0]);
        existingNames.add(name.toLowerCase());
      }
    }
    // Link habits that have categoria text but no categoria_id
    for (const cat of rows) {
      await pool.query(
        `UPDATE habitos SET categoria_id = $1
         WHERE usuario_id = $2 AND categoria ILIKE $3 AND categoria_id IS NULL`,
        [cat.id, usuarioId, cat.nombre]
      );
    }
  }
  return rows;
};

export const crearCategoria = async (usuarioId, data) => {
  const { nombre, icono, color } = data;
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0 || nombre.length > 50) {
    throw new AppError('Nombre requerido (máx 50 caracteres)', 400);
  }
  const { rows } = await pool.query(
    `INSERT INTO categorias_habitos (usuario_id, nombre, icono, color)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [usuarioId, nombre.trim(), icono || '', color || '#b06ef3']
  );
  return rows[0];
};

export const actualizarCategoria = async (id, usuarioId, data) => {
  const campos = [], valores = [];
  let i = 1;
  for (const key of ['nombre', 'icono', 'color']) {
    if (data[key] !== undefined) {
      campos.push(`${key} = $${i++}`);
      valores.push(data[key]);
    }
  }
  if (campos.length === 0) return null;
  valores.push(id, usuarioId);
  const { rows } = await pool.query(
    `UPDATE categorias_habitos SET ${campos.join(', ')}
     WHERE id = $${i++} AND usuario_id = $${i} RETURNING *`,
    valores
  );
  return rows[0] || null;
};

export const eliminarCategoria = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    `DELETE FROM categorias_habitos WHERE id = $1 AND usuario_id = $2`,
    [id, usuarioId]
  );
  return rowCount > 0;
};
