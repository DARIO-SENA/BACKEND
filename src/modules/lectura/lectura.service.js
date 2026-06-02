import pool from '../../config/db.js';
import eventBus from '../../eventBus/index.js';
import { EVENTS } from '../../eventBus/events.js';

export const initLecturaTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lectura_libros (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      titulo VARCHAR(255) NOT NULL,
      autor VARCHAR(255) DEFAULT '',
      paginas_totales INTEGER DEFAULT 0,
      paginas_leidas INTEGER DEFAULT 0,
      estado VARCHAR(20) DEFAULT 'sin_leer'
        CHECK (estado IN ('sin_leer','leyendo','completado','abandonado')),
      portada TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lectura_registros (
      id SERIAL PRIMARY KEY,
      libro_id INTEGER NOT NULL REFERENCES lectura_libros(id) ON DELETE CASCADE,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      paginas_leidas INTEGER DEFAULT 0,
      fecha DATE NOT NULL DEFAULT CURRENT_DATE,
      duracion_minutos INTEGER,
      notas TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lectura_planes (
      id SERIAL PRIMARY KEY,
      libro_id INTEGER NOT NULL REFERENCES lectura_libros(id) ON DELETE CASCADE,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      fecha_inicio DATE NOT NULL,
      fecha_fin DATE NOT NULL,
      dias_lectura JSONB DEFAULT '[1,2,3,4,5]',
      paginas_por_dia DECIMAL(10,2) DEFAULT 0,
      completado BOOLEAN DEFAULT FALSE,
      habito_id INTEGER REFERENCES habitos(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE lectura_planes
    ADD COLUMN IF NOT EXISTS dias_lectura JSONB DEFAULT '[1,2,3,4,5]'
  `);
  await pool.query(`
    ALTER TABLE lectura_planes
    ADD COLUMN IF NOT EXISTS habito_id INTEGER REFERENCES habitos(id) ON DELETE SET NULL
  `);
};

export const obtenerLibros = async (usuarioId, filtros = {}) => {
  let query = `SELECT * FROM lectura_libros WHERE usuario_id = $1`;
  const params = [usuarioId];
  if (filtros.estado) {
    query += ` AND estado = $2`;
    params.push(filtros.estado);
  }
  query += ` ORDER BY updated_at DESC`;
  const { rows } = await pool.query(query, params);
  return rows;
};

export const obtenerLibro = async (id, usuarioId) => {
  const { rows } = await pool.query(
    `SELECT * FROM lectura_libros WHERE id = $1 AND usuario_id = $2`,
    [id, usuarioId]
  );
  return rows[0] || null;
};

export const crearLibro = async (usuarioId, datos) => {
  const { titulo, autor, paginas_totales, portada } = datos;
  const { rows } = await pool.query(
    `INSERT INTO lectura_libros (usuario_id, titulo, autor, paginas_totales, portada)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [usuarioId, titulo, autor || '', paginas_totales || 0, portada || '']
  );
  return rows[0];
};

export const actualizarLibro = async (id, usuarioId, datos) => {
  const campos = [];
  const params = [];
  let idx = 1;
  for (const key of ['titulo', 'autor', 'paginas_totales', 'paginas_leidas', 'estado', 'portada']) {
    if (datos[key] !== undefined) {
      campos.push(`${key} = $${idx++}`);
      params.push(datos[key]);
    }
  }
  if (campos.length === 0) return null;
  campos.push(`updated_at = NOW()`);
  params.push(id, usuarioId);
  const { rows } = await pool.query(
    `UPDATE lectura_libros SET ${campos.join(', ')} WHERE id = $${idx++} AND usuario_id = $${idx} RETURNING *`,
    params
  );
  return rows[0] || null;
};

export const eliminarLibro = async (id, usuarioId) => {
  await pool.query(`DELETE FROM lectura_libros WHERE id = $1 AND usuario_id = $2`, [id, usuarioId]);
};

export const obtenerRegistros = async (libroId, usuarioId) => {
  const { rows } = await pool.query(
    `SELECT * FROM lectura_registros WHERE libro_id = $1 AND usuario_id = $2 ORDER BY fecha DESC, created_at DESC`,
    [libroId, usuarioId]
  );
  return rows;
};

export const crearRegistro = async (usuarioId, datos) => {
  const { libro_id, paginas_leidas, fecha, duracion_minutos, notas } = datos;
  const { rows } = await pool.query(
    `INSERT INTO lectura_registros (libro_id, usuario_id, paginas_leidas, fecha, duracion_minutos, notas)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [libro_id, usuarioId, paginas_leidas || 0, fecha || new Date().toISOString().split('T')[0], duracion_minutos || null, notas || '']
  );
  await pool.query(
    `UPDATE lectura_libros SET paginas_leidas = (
      SELECT COALESCE(SUM(paginas_leidas),0) FROM lectura_registros WHERE libro_id = $1
    ), updated_at = NOW() WHERE id = $1`,
    [libro_id]
  );
  return rows[0];
};

export const eliminarRegistro = async (id, libroId, usuarioId) => {
  await pool.query(
    `DELETE FROM lectura_registros WHERE id = $1 AND libro_id = $2 AND usuario_id = $3`,
    [id, libroId, usuarioId]
  );
  await pool.query(
    `UPDATE lectura_libros SET paginas_leidas = (
      SELECT COALESCE(SUM(paginas_leidas),0) FROM lectura_registros WHERE libro_id = $1
    ), updated_at = NOW() WHERE id = $1`,
    [libroId]
  );
};

export const toggleDiaLectura = async (usuarioId, datos) => {
  const { libro_id, plan_id, fecha, paginas_leidas } = datos;
  const existing = await pool.query(
    `SELECT id FROM lectura_registros WHERE libro_id = $1 AND usuario_id = $2 AND fecha = $3::date`,
    [libro_id, usuarioId, fecha]
  );

  let accion = '';
  if (existing.rows.length > 0) {
    await pool.query(`DELETE FROM lectura_registros WHERE id = $1`, [existing.rows[0].id]);
    accion = 'eliminado';
  } else {
    await pool.query(
      `INSERT INTO lectura_registros (libro_id, usuario_id, paginas_leidas, fecha)
       VALUES ($1, $2, $3, $4::date) RETURNING *`,
      [libro_id, usuarioId, paginas_leidas || 0, fecha]
    );
    accion = 'creado';
  }

  // Update libro paginas_leidas sum
  await pool.query(
    `UPDATE lectura_libros SET paginas_leidas = (
      SELECT COALESCE(SUM(paginas_leidas),0) FROM lectura_registros WHERE libro_id = $1
    ), updated_at = NOW() WHERE id = $1`,
    [libro_id]
  );

  // Recalculate plan
  const recalc = await recalcularPlan(plan_id, usuarioId);

  // Toggle linked habit
  const plan = (await pool.query(`SELECT habito_id FROM lectura_planes WHERE id = $1`, [plan_id])).rows[0];
  if (plan?.habito_id) {
    const existingHabito = await pool.query(
      `SELECT id FROM registros_habitos WHERE habito_id = $1 AND fecha = $2::date`,
      [plan.habito_id, fecha]
    );
    if (accion === 'creado' && existingHabito.rows.length === 0) {
      await pool.query(
        `INSERT INTO registros_habitos (habito_id, fecha) VALUES ($1, $2::date)`,
        [plan.habito_id, fecha]
      );
      eventBus.emit(EVENTS.HABIT_COMPLETED, { usuarioId, habitoId: plan.habito_id });
    } else if (accion === 'eliminado' && existingHabito.rows.length > 0) {
      await pool.query(
        `DELETE FROM registros_habitos WHERE id = $1`,
        [existingHabito.rows[0].id]
      );
    }
  }

  return {
    accion,
    completado: accion === 'creado',
    recalculo: recalc,
  };
};

function contarDiasLectura(fechaInicio, fechaFin, diasSemana) {
  let count = 0;
  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);
  const current = new Date(start);
  while (current <= end) {
    if (diasSemana.includes(current.getDay())) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count || 1;
}

export const recalcularPlan = async (planId, usuarioId) => {
  const planRows = await pool.query(
    `SELECT p.*, l.paginas_totales, l.paginas_leidas
     FROM lectura_planes p
     JOIN lectura_libros l ON l.id = p.libro_id
     WHERE p.id = $1 AND p.usuario_id = $2`,
    [planId, usuarioId]
  );
  if (planRows.rows.length === 0) return null;
  const plan = planRows.rows[0];

  const paginasTotales = Number(plan.paginas_totales);
  const paginasLeidas = Number(plan.paginas_leidas);
  const paginasRestantes = paginasTotales - paginasLeidas;

  if (paginasRestantes <= 0) {
    await pool.query(`UPDATE lectura_planes SET completado = true, paginas_por_dia = 0 WHERE id = $1`, [planId]);
    await pool.query(`UPDATE lectura_libros SET estado = 'completado', updated_at = NOW() WHERE id = $1`, [plan.libro_id]);
    return { completado: true, paginas_por_dia: 0 };
  }

  const dias = Array.isArray(plan.dias_lectura)
    ? plan.dias_lectura
    : (typeof plan.dias_lectura === 'string' ? JSON.parse(plan.dias_lectura) : [1,2,3,4,5]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const planEnd = plan.fecha_fin instanceof Date ? plan.fecha_fin.toISOString().split('T')[0] : String(plan.fecha_fin).split('T')[0];

  const remainingDays = contarDiasLectura(tomorrowStr, planEnd, dias);

  if (remainingDays <= 0) {
    return { paginas_por_dia: Number(plan.paginas_por_dia), completado: false };
  }

  const newPorDia = Math.max(1, Math.ceil(paginasRestantes / remainingDays));

  await pool.query(
    `UPDATE lectura_planes SET paginas_por_dia = $1 WHERE id = $2`,
    [newPorDia, planId]
  );

  return { paginas_por_dia: newPorDia, completado: false };
};

export const obtenerPlanes = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT p.*, l.titulo AS libro_titulo, l.paginas_totales, l.paginas_leidas
     FROM lectura_planes p
     JOIN lectura_libros l ON l.id = p.libro_id
     WHERE p.usuario_id = $1
     ORDER BY p.fecha_fin ASC`,
    [usuarioId]
  );
  return rows.map(r => ({
    ...r,
    dias_lectura: typeof r.dias_lectura === 'string' ? JSON.parse(r.dias_lectura) : r.dias_lectura,
    paginas_por_dia: Number(r.paginas_por_dia),
  }));
};

export const crearPlan = async (usuarioId, datos) => {
  const { libro_id, fecha_inicio, fecha_fin, dias_lectura } = datos;
  const dias = Array.isArray(dias_lectura) && dias_lectura.length > 0
    ? JSON.stringify(dias_lectura)
    : '[1,2,3,4,5]';

  const libro = await obtenerLibro(libro_id, usuarioId);
  const paginasRestantes = (libro?.paginas_totales || 0) - (libro?.paginas_leidas || 0);
  const totalDias = contarDiasLectura(fecha_inicio, fecha_fin, JSON.parse(dias));
  const paginasPorDia = Math.max(1, Math.ceil(paginasRestantes / totalDias));

  const { rows } = await pool.query(
    `INSERT INTO lectura_planes (libro_id, usuario_id, fecha_inicio, fecha_fin, dias_lectura, paginas_por_dia)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6) RETURNING *`,
    [libro_id, usuarioId, fecha_inicio, fecha_fin, dias, paginasPorDia]
  );
  const plan = rows[0];

  // Convert reading days (0=Dom) to habit days (0=Lun)
  const diasPlan = JSON.parse(dias);
  const habitoDias = diasPlan.map(d => (d + 6) % 7);

  const { rows: habitoRows } = await pool.query(
    `INSERT INTO habitos (usuario_id, titulo, descripcion, frecuencia, dias_semana, categoria, auto_programado)
     VALUES ($1, $2, $3, 'diario', $4, 'lectura', true)
     RETURNING id`,
    [usuarioId, `📖 ${libro.titulo}`, `Plan de lectura: ${fecha_inicio} → ${fecha_fin}`, JSON.stringify(habitoDias)]
  );

  await pool.query(
    `UPDATE lectura_planes SET habito_id = $1 WHERE id = $2`,
    [habitoRows[0].id, plan.id]
  );

  return { ...plan, habito_id: habitoRows[0].id };
};

export const actualizarPlan = async (id, usuarioId, datos) => {
  const campos = [];
  const params = [];
  let idx = 1;

  if (datos.dias_lectura !== undefined) {
    campos.push(`dias_lectura = $${idx++}::jsonb`);
    params.push(JSON.stringify(datos.dias_lectura));
  }
  if (datos.fecha_inicio !== undefined) {
    campos.push(`fecha_inicio = $${idx++}`);
    params.push(datos.fecha_inicio);
  }
  if (datos.fecha_fin !== undefined) {
    campos.push(`fecha_fin = $${idx++}`);
    params.push(datos.fecha_fin);
  }
  if (datos.completado !== undefined) {
    campos.push(`completado = $${idx++}`);
    params.push(datos.completado);
  }

  if (campos.length === 0) return null;

  const shouldRecalc = datos.dias_lectura !== undefined || datos.fecha_inicio !== undefined || datos.fecha_fin !== undefined;
  if (shouldRecalc) {
    const planActual = (await pool.query(`SELECT * FROM lectura_planes WHERE id = $1 AND usuario_id = $2`, [id, usuarioId])).rows[0];
    if (planActual) {
      const libro = await obtenerLibro(planActual.libro_id, usuarioId);
      const paginasRestantes = (libro?.paginas_totales || 0) - (libro?.paginas_leidas || 0);
      const fi = datos.fecha_inicio || planActual.fecha_inicio;
      const ff = datos.fecha_fin || planActual.fecha_fin;
      const dias = datos.dias_lectura || planActual.dias_lectura;
      const totalDias = contarDiasLectura(fi, ff, Array.isArray(dias) ? dias : (typeof dias === 'string' ? JSON.parse(dias) : [1,2,3,4,5]));
      campos.push(`paginas_por_dia = $${idx++}`);
      params.push(Math.max(1, Math.ceil(paginasRestantes / totalDias)));
    }
  }

  // Sync linked habit's dias_semana when dias_lectura changes
  if (datos.dias_lectura !== undefined && planActual?.habito_id) {
    const habitoDias = datos.dias_lectura.map(d => (d + 6) % 7);
    await pool.query(
      `UPDATE habitos SET dias_semana = $1::jsonb WHERE id = $2`,
      [JSON.stringify(habitoDias), planActual.habito_id]
    );
  }

  params.push(id, usuarioId);
  const { rows } = await pool.query(
    `UPDATE lectura_planes SET ${campos.join(', ')} WHERE id = $${idx++} AND usuario_id = $${idx} RETURNING *`,
    params
  );
  return rows[0] || null;
};

export const eliminarPlan = async (id, usuarioId) => {
  const plan = (await pool.query(`SELECT habito_id FROM lectura_planes WHERE id = $1 AND usuario_id = $2`, [id, usuarioId])).rows[0];
  if (plan?.habito_id) {
    await pool.query(`DELETE FROM habitos WHERE id = $1`, [plan.habito_id]);
  }
  await pool.query(`DELETE FROM lectura_planes WHERE id = $1 AND usuario_id = $2`, [id, usuarioId]);
};

export const obtenerPlanDetalle = async (id, usuarioId) => {
  const planRows = await pool.query(
    `SELECT p.*, l.titulo AS libro_titulo, l.autor, l.paginas_totales, l.paginas_leidas AS libro_paginas_leidas
     FROM lectura_planes p
     JOIN lectura_libros l ON l.id = p.libro_id
     WHERE p.id = $1 AND p.usuario_id = $2`,
    [id, usuarioId]
  );
  if (planRows.rows.length === 0) return null;
  const plan = planRows.rows[0];

  const dias = Array.isArray(plan.dias_lectura)
    ? plan.dias_lectura
    : (typeof plan.dias_lectura === 'string' ? JSON.parse(plan.dias_lectura) : [1,2,3,4,5]);

  const regRows = await pool.query(
    `SELECT * FROM lectura_registros
     WHERE libro_id = $1 AND usuario_id = $2 AND fecha >= $3 AND fecha <= $4
     ORDER BY fecha ASC`,
    [plan.libro_id, usuarioId, plan.fecha_inicio, plan.fecha_fin]
  );

  const registrosPorFecha = {};
  for (const r of regRows.rows) {
    const key = r.fecha instanceof Date ? r.fecha.toISOString().split('T')[0] : String(r.fecha).split('T')[0];
    if (!registrosPorFecha[key]) registrosPorFecha[key] = [];
    registrosPorFecha[key].push(r);
  }

  const diasDetalle = [];
  const start = new Date(plan.fecha_inicio);
  const end = new Date(plan.fecha_fin);
  const current = new Date(start);
  while (current <= end) {
    const diaSemana = current.getDay();
    if (dias.includes(diaSemana)) {
      const fechaStr = current.toISOString().split('T')[0];
      const sesiones = registrosPorFecha[fechaStr] || [];
      const totalPaginas = sesiones.reduce((sum, s) => sum + Number(s.paginas_leidas), 0);
      diasDetalle.push({
        fecha: fechaStr,
        dia_semana: diaSemana,
        paginas_objetivo: Number(plan.paginas_por_dia),
        paginas_leidas: totalPaginas,
        completado: totalPaginas > 0,
        sesiones,
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return {
    ...plan,
    dias_lectura: dias,
    paginas_por_dia: Number(plan.paginas_por_dia),
    paginas_totales: Number(plan.paginas_totales),
    libro_paginas_leidas: Number(plan.libro_paginas_leidas),
    dias: diasDetalle,
    total_dias: diasDetalle.length,
    completados: diasDetalle.filter(d => d.completado).length,
  };
};

export const obtenerDashboard = async (usuarioId) => {
  const { rows: totales } = await pool.query(
    `SELECT
       COUNT(*) AS total_libros,
       COUNT(*) FILTER (WHERE estado = 'leyendo') AS leyendo,
       COUNT(*) FILTER (WHERE estado = 'completado') AS completados,
       COALESCE(SUM(paginas_totales),0) AS total_paginas,
       COALESCE(SUM(paginas_leidas),0) AS paginas_leidas
     FROM lectura_libros WHERE usuario_id = $1`,
    [usuarioId]
  );

  const { rows: hoy } = await pool.query(
    `SELECT COALESCE(SUM(paginas_leidas),0) AS paginas_hoy
     FROM lectura_registros WHERE usuario_id = $1 AND fecha = CURRENT_DATE`,
    [usuarioId]
  );

  const { rows: racha } = await pool.query(
    `SELECT COUNT(*) AS racha FROM (
      SELECT fecha, COUNT(*) FROM lectura_registros
      WHERE usuario_id = $1 AND fecha >= CURRENT_DATE - INTERVAL '60 days'
      GROUP BY fecha ORDER BY fecha DESC
    ) sub`,
    [usuarioId]
  );

  const { rows: ultimos } = await pool.query(
    `SELECT lr.*, l.titulo FROM lectura_registros lr
     JOIN lectura_libros l ON l.id = lr.libro_id
     WHERE lr.usuario_id = $1 ORDER BY lr.created_at DESC LIMIT 5`,
    [usuarioId]
  );

  return {
    ...totales[0],
    paginas_hoy: Number(hoy[0]?.paginas_hoy || 0),
    racha: racha.length,
    ultimos_registros: ultimos,
  };
};
