import pool from '../../config/db.js';
import eventBus from '../../eventBus/index.js';
import { EVENTS } from '../../eventBus/events.js';
import * as gamificacionService from '../gamificacion/gamificacion.service.js';
import * as tareasService from '../tareas/tareas.service.js';
import { llamarOpenAI } from '../ia/ia.service.js';

const PROMPT_DESCOMPONER = `Eres un experto en OKRs. Descompón la siguiente meta en 3-5 Key Results (resultados clave) medibles y sugiera 2-3 tareas concretas para cada KR.

Meta: {titulo}
Descripción: {descripcion}

Responde SOLO con JSON:
{
  "key_results": [
    {
      "titulo": "KR nombre",
      "descripcion": "descripción del resultado clave",
      "tareas_sugeridas": ["tarea 1", "tarea 2"]
    }
  ]
}`;

const PROMPT_PLAN_SEMANAL = `Eres un planificador de productividad. Dada una meta con sus Key Results, genera un plan semanal de 5-10 tareas concretas distribuidas en los próximos 7 días.

Meta: {titulo}
Key Results: {krs}
Fecha fin: {fecha_fin}

Responde SOLO con JSON:
{
  "tareas": [
    {
      "titulo": "nombre tarea",
      "descripcion": "descripción",
      "key_result_id": null,
      "duracion_minutos": 30,
      "fecha_inicio": "YYYY-MM-DDTHH:mm:ss.sssZ",
      "prioridad": "alta|media|baja"
    }
  ]
}`;

export const crearMeta = async (usuarioId, datos) => {
  const { titulo, descripcion, categoria, fecha_inicio, fecha_fin, es_borrador } = datos;
  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0 || titulo.length > 200) {
    throw Object.assign(new Error('Título requerido (máx 200 caracteres)'), { status: 400 });
  }
  const { rows } = await pool.query(
    `INSERT INTO metas (usuario_id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, es_borrador)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [usuarioId, titulo, descripcion || '', categoria || 'personal', fecha_inicio || null, fecha_fin || null, es_borrador || false]
  );
  await verificarLogrosMetas(usuarioId);
  return rows[0];
};

export const obtenerMetas = async (usuarioId, filtros = {}) => {
  const { estado, categoria } = filtros;
  const valores = [usuarioId];
  const condiciones = ['m.usuario_id = $1'];
  let i = 2;

  if (estado) { condiciones.push(`m.estado = $${i++}`); valores.push(estado); }
  if (categoria) { condiciones.push(`m.categoria = $${i++}`); valores.push(categoria); }

  const { rows } = await pool.query(
    `SELECT m.*,
       COALESCE(
         (SELECT json_agg(json_build_object(
           'id', kr.id, 'titulo', kr.titulo, 'progreso', kr.progreso,
           'orden', kr.orden, 'descripcion', kr.descripcion
         ) ORDER BY kr.orden)
         FROM key_results kr WHERE kr.meta_id = m.id),
         '[]'::json
       ) AS key_results,
       (SELECT COUNT(*) FROM key_results kr WHERE kr.meta_id = m.id AND kr.progreso >= 100) AS krs_completados,
       (SELECT COUNT(*) FROM key_results kr WHERE kr.meta_id = m.id) AS total_krs
     FROM metas m
     WHERE ${condiciones.join(' AND ')}
     ORDER BY m.creado_en DESC`,
    valores
  );
  return rows;
};

export const obtenerMetaPorId = async (id, usuarioId) => {
  const { rows } = await pool.query(
    `SELECT m.*,
       COALESCE(
         (SELECT json_agg(json_build_object(
           'id', kr.id, 'titulo', kr.titulo, 'descripcion', kr.descripcion,
           'progreso', kr.progreso, 'orden', kr.orden
         ) ORDER BY kr.orden)
         FROM key_results kr WHERE kr.meta_id = m.id),
         '[]'::json
       ) AS key_results
     FROM metas m WHERE m.id = $1 AND m.usuario_id = $2`,
    [id, usuarioId]
  );
  return rows[0] || null;
};

export const actualizarMeta = async (id, usuarioId, datos) => {
  const campos = [];
  const valores = [];
  let i = 1;

  const permitidos = ['titulo', 'descripcion', 'categoria', 'fecha_inicio', 'fecha_fin', 'estado', 'es_borrador'];
  for (const campo of permitidos) {
    if (datos[campo] !== undefined) {
      campos.push(`${campo} = $${i++}`);
      valores.push(datos[campo]);
    }
  }

  if (campos.length === 0) return null;

  if (datos.estado === 'completada') {
    campos.push(`progreso = $${i++}`);
    valores.push(100);
  }

  valores.push(id, usuarioId);
  const { rows } = await pool.query(
    `UPDATE metas SET ${campos.join(', ')}
     WHERE id = $${i++} AND usuario_id = $${i} RETURNING *`,
    valores
  );

  if (rows[0]) {
    await verificarLogrosMetas(usuarioId);
  }

  return rows[0] || null;
};

export const eliminarMeta = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM metas WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return rowCount > 0;
};

export const crearKeyResult = async (metaId, usuarioId, datos) => {
  const { rows: meta } = await pool.query(
    'SELECT id FROM metas WHERE id = $1 AND usuario_id = $2',
    [metaId, usuarioId]
  );
  if (!meta[0]) throw Object.assign(new Error('Meta no encontrada'), { status: 404 });

  const { titulo, descripcion, orden } = datos;
  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0 || titulo.length > 200) {
    throw Object.assign(new Error('Título del KR requerido (máx 200 caracteres)'), { status: 400 });
  }
  const { rows } = await pool.query(
    `INSERT INTO key_results (meta_id, titulo, descripcion, orden)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [metaId, titulo, descripcion || '', orden || 0]
  );
  return rows[0];
};

export const obtenerKeyResults = async (metaId, usuarioId) => {
  const { rows: meta } = await pool.query(
    'SELECT id FROM metas WHERE id = $1 AND usuario_id = $2',
    [metaId, usuarioId]
  );
  if (!meta[0]) throw Object.assign(new Error('Meta no encontrada'), { status: 404 });

  const { rows } = await pool.query(
    'SELECT * FROM key_results WHERE meta_id = $1 ORDER BY orden',
    [metaId]
  );
  return rows;
};

export const actualizarKeyResult = async (metaId, krId, usuarioId, datos) => {
  const { rows: meta } = await pool.query(
    'SELECT id FROM metas WHERE id = $1 AND usuario_id = $2',
    [metaId, usuarioId]
  );
  if (!meta[0]) throw Object.assign(new Error('Meta no encontrada'), { status: 404 });

  const campos = [];
  const valores = [];
  let i = 1;

  const permitidos = ['titulo', 'descripcion', 'progreso', 'orden'];
  for (const campo of permitidos) {
    if (datos[campo] !== undefined) {
      campos.push(`${campo} = $${i++}`);
      valores.push(datos[campo]);
    }
  }

  if (campos.length === 0) return null;

  valores.push(krId, metaId);
  const { rows } = await pool.query(
    `UPDATE key_results SET ${campos.join(', ')}
     WHERE id = $${i++} AND meta_id = $${i} RETURNING *`,
    valores
  );

  if (rows[0]) {
    await recalcularProgresoMeta(metaId);
  }

  return rows[0] || null;
};

export const actualizarProgresoKR = async (metaId, krId, usuarioId, progreso) => {
  if (progreso < 0 || progreso > 100) {
    throw Object.assign(new Error('Progreso debe estar entre 0 y 100'), { status: 400 });
  }

  const { rows: meta } = await pool.query(
    'SELECT id FROM metas WHERE id = $1 AND usuario_id = $2',
    [metaId, usuarioId]
  );
  if (!meta[0]) throw Object.assign(new Error('Meta no encontrada'), { status: 404 });

  const { rows } = await pool.query(
    `UPDATE key_results SET progreso = $1 WHERE id = $2 AND meta_id = $3 RETURNING *`,
    [progreso, krId, metaId]
  );

  if (!rows[0]) throw Object.assign(new Error('Key Result no encontrado'), { status: 404 });

  const metaActualizada = await recalcularProgresoMeta(metaId);

  await pool.query(
    `INSERT INTO meta_progreso (meta_id, progreso, fecha)
     VALUES ($1, $2, CURRENT_DATE)
     ON CONFLICT (meta_id, fecha) DO UPDATE SET progreso = $2`,
    [metaId, metaActualizada.progreso]
  );

  if (metaActualizada.progreso >= 100 && metaActualizada.estado !== 'completada') {
    await pool.query(
      `UPDATE metas SET estado = 'completada', progreso = 100 WHERE id = $1`,
      [metaId]
    );
    await verificarLogrosMetas(usuarioId);
  }

  const krActualizado = rows[0];
  if (krActualizado.progreso >= 100) {
    await verificarLogrosMetas(usuarioId);
  }

  return { key_result: krActualizado, meta: metaActualizada };
};

const recalcularProgresoMeta = async (metaId) => {
  const { rows } = await pool.query(
    `UPDATE metas SET progreso = (
       SELECT COALESCE(AVG(progreso), 0) FROM key_results WHERE meta_id = $1
     ) WHERE id = $1 RETURNING *`,
    [metaId]
  );
  return rows[0];
};

export const descomponerConIA = async (usuarioId, metaId) => {
  const meta = await obtenerMetaPorId(metaId, usuarioId);
  if (!meta) throw Object.assign(new Error('Meta no encontrada'), { status: 404 });

  const prompt = PROMPT_DESCOMPONER
    .replace('{titulo}', meta.titulo)
    .replace('{descripcion}', meta.descripcion || '');

  const respuesta = await llamarOpenAI(prompt, null, true);
  const datos = JSON.parse(respuesta);

  for (const kr of datos.key_results) {
    await pool.query(
      `INSERT INTO key_results (meta_id, titulo, descripcion, orden)
       VALUES ($1, $2, $3, $4)`,
      [metaId, kr.titulo, kr.descripcion || '', datos.key_results.indexOf(kr)]
    );
  }

  await pool.query(
    `UPDATE metas SET es_borrador = false WHERE id = $1`,
    [metaId]
  );

  return obtenerMetaPorId(metaId, usuarioId);
};

export const planSemanal = async (usuarioId, metaId, fechaFin) => {
  const meta = await obtenerMetaPorId(metaId, usuarioId);
  if (!meta) throw Object.assign(new Error('Meta no encontrada'), { status: 404 });

  const krsTexto = meta.key_results.map(kr => `- ${kr.titulo}`).join('\n');

  const prompt = PROMPT_PLAN_SEMANAL
    .replace('{titulo}', meta.titulo)
    .replace('{krs}', krsTexto)
    .replace('{fecha_fin}', fechaFin || meta.fecha_fin || 'sin fecha');

  const respuesta = await llamarOpenAI(prompt, null, true);
  const datos = JSON.parse(respuesta);

  const tareasCreadas = [];

  for (const t of datos.tareas) {
    const tarea = await tareasService.crearTarea(usuarioId, {
      titulo: t.titulo,
      descripcion: t.descripcion || '',
      duracion_minutos: t.duracion_minutos || 30,
      fecha_inicio: t.fecha_inicio || null,
      prioridad: t.prioridad || 'media',
    });

    const krId = t.key_result_id || null;

    await pool.query(
      `UPDATE tareas SET meta_id = $1, key_result_id = $2 WHERE id = $3`,
      [metaId, krId, tarea.id]
    );

    tareasCreadas.push({ ...tarea, meta_id: metaId, key_result_id: krId });
  }

  return tareasCreadas;
};

export const obtenerDashboard = async (usuarioId) => {
  const { rows: totales } = await pool.query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE estado = 'en_progreso') AS en_progreso,
       COUNT(*) FILTER (WHERE estado = 'completada') AS completadas,
       COUNT(*) FILTER (WHERE estado = 'borrador') AS borradores,
       COALESCE(AVG(progreso), 0) AS progreso_promedio
     FROM metas WHERE usuario_id = $1`,
    [usuarioId]
  );

  const { rows: porVencer } = await pool.query(
    `SELECT id, titulo, progreso, fecha_fin
     FROM metas
     WHERE usuario_id = $1 AND estado = 'en_progreso'
       AND fecha_fin IS NOT NULL
       AND fecha_fin <= CURRENT_DATE + INTERVAL '7 days'
       AND progreso < 100
     ORDER BY fecha_fin ASC`,
    [usuarioId]
  );

  const { rows: krsMes } = await pool.query(
    `SELECT kr.id, kr.titulo, kr.progreso, m.titulo AS meta_titulo, m.id AS meta_id
     FROM key_results kr
     JOIN metas m ON m.id = kr.meta_id
     WHERE m.usuario_id = $1
       AND (kr.actualizado_en >= DATE_TRUNC('month', CURRENT_DATE)
            OR kr.creado_en >= DATE_TRUNC('month', CURRENT_DATE))
     ORDER BY kr.actualizado_en DESC`,
    [usuarioId]
  );

  const { rows: progresoHistorico } = await pool.query(
    `SELECT mp.fecha, mp.progreso, m.titulo
     FROM meta_progreso mp
     JOIN metas m ON m.id = mp.meta_id
     WHERE m.usuario_id = $1
       AND mp.fecha >= CURRENT_DATE - INTERVAL '30 days'
     ORDER BY mp.fecha ASC`,
    [usuarioId]
  );

  return {
    totales: totales[0],
    metas_por_vencer: porVencer,
    krs_del_mes: krsMes,
    grafico_progreso: progresoHistorico,
  };
};

export const obtenerTimeline = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT
       DATE_TRUNC('month', m.creado_en) AS mes,
       json_agg(json_build_object(
         'id', m.id,
         'titulo', m.titulo,
         'progreso', m.progreso,
         'estado', m.estado,
         'fecha_fin', m.fecha_fin,
         'fecha_inicio', m.fecha_inicio,
         'progreso_historico', (
           SELECT json_agg(json_build_object('fecha', mp.fecha, 'progreso', mp.progreso) ORDER BY mp.fecha)
           FROM meta_progreso mp WHERE mp.meta_id = m.id
         )
       )) AS metas
     FROM metas m
     WHERE m.usuario_id = $1
     GROUP BY DATE_TRUNC('month', m.creado_en)
     ORDER BY mes DESC`,
    [usuarioId]
  );
  return rows;
};

const verificarLogrosMetas = async (usuarioId) => {
  try {
    await gamificacionService.verificarLogros(usuarioId);
  } catch (err) {
    console.error('[Metas] Error verificando logros:', err.message);
  }
};

export const procesarTareaDone = async (usuarioId, tarea) => {
  const { rows } = await pool.query(
    `SELECT t.key_result_id, t.meta_id
     FROM tareas t WHERE t.id = $1 AND t.usuario_id = $2`,
    [tarea.id, usuarioId]
  );
  if (!rows[0]) return;

  const { key_result_id, meta_id } = rows[0];
  if (!key_result_id && !meta_id) return;

  if (key_result_id) {
    const { rows: kr } = await pool.query(
      `SELECT kr.progreso, kr.meta_id,
         (SELECT COUNT(*) FROM tareas t2
          WHERE t2.key_result_id = kr.id AND t2.estado = 'completada') AS completadas,
         (SELECT COUNT(*) FROM tareas t2
          WHERE t2.key_result_id = kr.id) AS totales
       FROM key_results kr WHERE kr.id = $1`,
      [key_result_id]
    );

    if (kr[0] && kr[0].totales > 0) {
      const nuevoProgreso = Math.round((kr[0].completadas / kr[0].totales) * 100);
      await pool.query(
        'UPDATE key_results SET progreso = $1 WHERE id = $2',
        [Math.min(nuevoProgreso, 100), key_result_id]
      );
      await recalcularProgresoMeta(kr[0].meta_id);
      await verificarLogrosMetas(usuarioId);
    }
  }
};
