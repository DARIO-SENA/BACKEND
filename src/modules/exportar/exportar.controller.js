import { manejarError } from '../../utils/error.handler.js';
import pool from '../../config/db.js';

const quoteCsv = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
};

const toCsv = (rows, columns) => {
  const header = columns.map(c => quoteCsv(c.label)).join(',');
  const body = rows.map(row => columns.map(c => quoteCsv(row[c.key])).join(','));
  return [header, ...body].join('\r\n');
};

const queryModulo = async (usuarioId, modulo) => {
  const queries = {
    habitos: {
      sql: 'SELECT id, titulo, descripcion, frecuencia, completado, creado_en, actualizado_en FROM habitos WHERE usuario_id = $1 ORDER BY creado_en DESC',
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'titulo', label: 'Titulo' },
        { key: 'descripcion', label: 'Descripcion' },
        { key: 'frecuencia', label: 'Frecuencia' },
        { key: 'completado', label: 'Completado' },
        { key: 'creado_en', label: 'Creado' },
        { key: 'actualizado_en', label: 'Actualizado' },
      ],
    },
    tareas: {
      sql: `SELECT t.id, t.titulo, t.descripcion, t.prioridad, t.estado, t.fecha_limite, t.fecha_inicio, t.fecha_fin,
                   c.nombre AS categoria, t.duracion_minutos, t.creado_en, t.actualizado_en
            FROM tareas t LEFT JOIN categorias c ON t.categoria_id = c.id
            WHERE t.usuario_id = $1 ORDER BY t.creado_en DESC`,
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'titulo', label: 'Titulo' },
        { key: 'descripcion', label: 'Descripcion' },
        { key: 'prioridad', label: 'Prioridad' },
        { key: 'estado', label: 'Estado' },
        { key: 'fecha_limite', label: 'Fecha Limite' },
        { key: 'fecha_inicio', label: 'Fecha Inicio' },
        { key: 'fecha_fin', label: 'Fecha Fin' },
        { key: 'categoria', label: 'Categoria' },
        { key: 'duracion_minutos', label: 'Duracion (min)' },
        { key: 'creado_en', label: 'Creado' },
        { key: 'actualizado_en', label: 'Actualizado' },
      ],
    },
    metas: {
      sql: `SELECT m.id, m.titulo, m.descripcion, m.categoria, m.progreso, m.estado, m.fecha_inicio, m.fecha_fin,
                   m.creado_en, m.actualizado_en
            FROM metas m WHERE m.usuario_id = $1 ORDER BY m.creado_en DESC`,
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'titulo', label: 'Titulo' },
        { key: 'descripcion', label: 'Descripcion' },
        { key: 'categoria', label: 'Categoria' },
        { key: 'progreso', label: 'Progreso (%)' },
        { key: 'estado', label: 'Estado' },
        { key: 'fecha_inicio', label: 'Fecha Inicio' },
        { key: 'fecha_fin', label: 'Fecha Fin' },
        { key: 'creado_en', label: 'Creado' },
        { key: 'actualizado_en', label: 'Actualizado' },
      ],
    },
  };

  if (modulo === 'todas') {
    const results = {};
    for (const [key, q] of Object.entries(queries)) {
      const { rows } = await pool.query(q.sql, [usuarioId]);
      results[key] = { rows, columns: q.columns };
    }
    return results;
  }

  if (!queries[modulo]) throw Object.assign(new Error(`Modulo no valido: ${modulo}`), { status: 400 });
  const q = queries[modulo];
  const { rows } = await pool.query(q.sql, [usuarioId]);
  return { [modulo]: { rows, columns: q.columns } };
};

export const exportarDatos = async (req, res) => {
  try {
    const formato = req.query.formato || 'json';
    const modulo = req.query.modulo || 'todas';

    if (!['csv', 'json'].includes(formato)) {
      return res.status(400).json({ ok: false, error: 'Formato no valido. Use csv o json' });
    }

    const data = await queryModulo(req.usuario.id, modulo);

    if (formato === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=dario-export-${modulo}-${Date.now()}.json`);
      return res.json(data);
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=dario-export-${modulo}-${Date.now()}.csv`);

    const partes = [];
    for (const [key, q] of Object.entries(data)) {
      partes.push(`--- ${key.toUpperCase()} ---`);
      partes.push(toCsv(q.rows, q.columns));
    }
    return res.send(partes.join('\r\n\r\n'));
  } catch (err) { manejarError(res, err); }
};
