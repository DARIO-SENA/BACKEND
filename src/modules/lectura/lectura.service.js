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
      genero VARCHAR(100) DEFAULT '',
      etiquetas TEXT[] DEFAULT '{}',
      notas TEXT DEFAULT '',
      citas JSONB DEFAULT '[]',
      puntuacion INTEGER DEFAULT 0,
      fecha_inicio DATE,
      fecha_fin DATE,
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

    CREATE INDEX IF NOT EXISTS idx_lectura_registros_fecha
      ON lectura_registros (usuario_id, fecha);

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lectura_metas (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('libros', 'paginas', 'dias')),
      objetivo INTEGER NOT NULL,
      periodo VARCHAR(20) NOT NULL CHECK (periodo IN ('mensual', 'anual')),
      anio INTEGER NOT NULL,
      mes INTEGER,
      progreso INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
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
  const { titulo, autor, paginas_totales, portada, genero } = datos;
  const { rows } = await pool.query(
    `INSERT INTO lectura_libros (usuario_id, titulo, autor, paginas_totales, portada, genero)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [usuarioId, titulo, autor || '', paginas_totales || 0, portada || '', genero || '']
  );
  return rows[0];
};

export const actualizarLibro = async (id, usuarioId, datos) => {
  const campos = [];
  const params = [];
  let idx = 1;
  for (const key of ['titulo', 'autor', 'paginas_totales', 'paginas_leidas', 'estado', 'portada', 'genero', 'etiquetas', 'puntuacion']) {
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

  // Check if book is completed → mark plan completed too
  const libroUpd = await pool.query(
    `SELECT paginas_totales, paginas_leidas FROM lectura_libros WHERE id = $1`,
    [libro_id]
  );
  const l = libroUpd.rows[0];
  if (Number(l.paginas_leidas) >= Number(l.paginas_totales)) {
    await pool.query(`UPDATE lectura_planes SET completado = true WHERE id = $1 AND usuario_id = $2`, [plan_id, usuarioId]);
    await pool.query(`UPDATE lectura_libros SET estado = 'completado', updated_at = NOW() WHERE id = $1`, [libro_id]);
  } else {
    await pool.query(`UPDATE lectura_planes SET completado = false WHERE id = $1 AND usuario_id = $2`, [plan_id, usuarioId]);
  }

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
  return count;
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

  const todayStr = new Date().toISOString().split('T')[0];
  const planEnd = plan.fecha_fin instanceof Date ? plan.fecha_fin.toISOString().split('T')[0] : String(plan.fecha_fin).split('T')[0];

  const remainingDays = contarDiasLectura(todayStr, planEnd, dias);

  if (remainingDays <= 0) {
    await pool.query(`UPDATE lectura_planes SET paginas_por_dia = $1 WHERE id = $2`, [0, planId]);
    return { paginas_por_dia: 0, completado: false, vencido: true };
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
  const paginasPorDia = totalDias > 0 ? Math.max(1, Math.ceil(paginasRestantes / totalDias)) : 0;

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

  const planActual = (await pool.query(`SELECT * FROM lectura_planes WHERE id = $1 AND usuario_id = $2`, [id, usuarioId])).rows[0];

  const shouldRecalc = datos.dias_lectura !== undefined || datos.fecha_inicio !== undefined || datos.fecha_fin !== undefined;
  if (shouldRecalc && planActual) {
    const libro = await obtenerLibro(planActual.libro_id, usuarioId);
    const paginasRestantes = (libro?.paginas_totales || 0) - (libro?.paginas_leidas || 0);
    const fi = datos.fecha_inicio || planActual.fecha_inicio;
    const ff = datos.fecha_fin || planActual.fecha_fin;
    const dias = datos.dias_lectura || planActual.dias_lectura;
    const totalDias = contarDiasLectura(fi, ff, Array.isArray(dias) ? dias : (typeof dias === 'string' ? JSON.parse(dias) : [1,2,3,4,5]));
    campos.push(`paginas_por_dia = $${idx++}`);
    params.push(totalDias > 0 ? Math.max(1, Math.ceil(paginasRestantes / totalDias)) : 0);
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
      const paginasObj = Number(plan.paginas_por_dia);
      diasDetalle.push({
        fecha: fechaStr,
        dia_semana: diaSemana,
        paginas_objetivo: paginasObj,
        paginas_leidas: totalPaginas,
        completado: totalPaginas >= paginasObj,
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

// ───────────────────────────
// Stats detallados
// ───────────────────────────
export const obtenerStats = async (usuarioId) => {
  const hoy = new Date();
  const inicioSemana = new Date(hoy); inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  const finSemana = new Date(inicioSemana); finSemana.setDate(inicioSemana.getDate() + 6);
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

  const [semana, mes, totales, rachaCalc, calendario, porLibro] = await Promise.all([
    pool.query(
      `SELECT COALESCE(SUM(paginas_leidas),0) AS paginas, COUNT(*) AS dias
       FROM lectura_registros WHERE usuario_id = $1 AND fecha >= $2 AND fecha <= $3`,
      [usuarioId, inicioSemana.toISOString().split('T')[0], finSemana.toISOString().split('T')[0]]
    ),
    pool.query(
      `SELECT COALESCE(SUM(paginas_leidas),0) AS paginas, COUNT(*) AS dias
       FROM lectura_registros WHERE usuario_id = $1 AND fecha >= $2 AND fecha <= $3`,
      [usuarioId, inicioMes.toISOString().split('T')[0], finMes.toISOString().split('T')[0]]
    ),
    pool.query(
      `SELECT
         COUNT(*) AS total_libros,
         COUNT(*) FILTER (WHERE estado = 'leyendo') AS leyendo,
         COUNT(*) FILTER (WHERE estado = 'completado') AS completados,
         COALESCE(SUM(paginas_totales),0) AS total_paginas,
         COALESCE(SUM(paginas_leidas),0) AS paginas_leidas
       FROM lectura_libros WHERE usuario_id = $1`,
      [usuarioId]
    ),
    pool.query(
      `SELECT DISTINCT fecha FROM lectura_registros WHERE usuario_id = $1
       ORDER BY fecha DESC`,
      [usuarioId]
    ),
    pool.query(
      `SELECT fecha, COALESCE(SUM(paginas_leidas),0) AS paginas
       FROM lectura_registros WHERE usuario_id = $1
         AND fecha >= $2 AND fecha <= $3
       GROUP BY fecha ORDER BY fecha`,
      [usuarioId, inicioMes.toISOString().split('T')[0], finMes.toISOString().split('T')[0]]
    ),
    pool.query(
      `SELECT l.id, l.titulo, l.paginas_totales, l.paginas_leidas, l.genero,
              COALESCE(SUM(r.paginas_leidas),0) AS paginas_registradas,
              COALESCE(SUM(r.duracion_minutos),0) AS minutos_totales
       FROM lectura_libros l
       LEFT JOIN lectura_registros r ON r.libro_id = l.id
       WHERE l.usuario_id = $1
       GROUP BY l.id ORDER BY l.updated_at DESC`,
      [usuarioId]
    ),
  ]);

  const fechasRacha = rachaCalc.rows.map(r => r.fecha instanceof Date ? r.fecha.toISOString().split('T')[0] : String(r.fecha).split('T')[0]);
  let racha = 0;
  for (let i = 0; i < fechasRacha.length; i++) {
    const esperada = new Date();
    esperada.setDate(esperada.getDate() - i);
    const esperadaStr = esperada.toISOString().split('T')[0];
    if (fechasRacha[i] === esperadaStr) racha++;
    else break;
  }

  const libros = porLibro.rows.map(l => ({
    ...l,
    paginas_totales: Number(l.paginas_totales),
    paginas_leidas: Number(l.paginas_leidas),
    paginas_registradas: Number(l.paginas_registradas),
    minutos_totales: Number(l.minutos_totales),
    velocidad: l.minutos_totales > 0 ? Math.round(Number(l.paginas_registradas) / Number(l.minutos_totales) * 60) : 0,
  }));

  return {
    semana: { paginas: Number(semana.rows[0].paginas), dias: Number(semana.rows[0].dias) },
    mes: { paginas: Number(mes.rows[0].paginas), dias: Number(mes.rows[0].dias) },
    libros: totales.rows[0],
    racha,
    calendario: calendario.rows.map(r => ({
      fecha: r.fecha instanceof Date ? r.fecha.toISOString().split('T')[0] : String(r.fecha).split('T')[0],
      paginas: Number(r.paginas),
    })),
    por_libro: libros,
  };
};

// ───────────────────────────
// Notas y citas por libro
// ───────────────────────────
export const obtenerNotas = async (libroId, usuarioId) => {
  const { rows } = await pool.query(
    `SELECT id, notas, citas FROM lectura_libros WHERE id = $1 AND usuario_id = $2`,
    [libroId, usuarioId]
  );
  if (rows.length === 0) return null;
  return {
    notas: rows[0].notas || '',
    citas: typeof rows[0].citas === 'string' ? JSON.parse(rows[0].citas) : (rows[0].citas || []),
  };
};

export const guardarNotas = async (libroId, usuarioId, datos) => {
  const { notas, citas } = datos;
  const { rows } = await pool.query(
    `UPDATE lectura_libros SET notas = $1, citas = $2::jsonb, updated_at = NOW()
     WHERE id = $3 AND usuario_id = $4 RETURNING id, notas, citas`,
    [notas || '', JSON.stringify(citas || []), libroId, usuarioId]
  );
  return rows[0] || null;
};

export const agregarCita = async (libroId, usuarioId, datos) => {
  const { texto, pagina } = datos;
  const libro = await obtenerLibro(libroId, usuarioId);
  if (!libro) return null;
  const citas = typeof libro.citas === 'string' ? JSON.parse(libro.citas) : (libro.citas || []);
  const nueva = { id: Date.now(), texto, pagina: pagina || null, creada_en: new Date().toISOString() };
  citas.push(nueva);
  await pool.query(
    `UPDATE lectura_libros SET citas = $1::jsonb, updated_at = NOW() WHERE id = $2`,
    [JSON.stringify(citas), libroId]
  );
  return nueva;
};

export const eliminarCita = async (libroId, usuarioId, citaId) => {
  const libro = await obtenerLibro(libroId, usuarioId);
  if (!libro) return null;
  const citas = typeof libro.citas === 'string' ? JSON.parse(libro.citas) : (libro.citas || []);
  const filtradas = citas.filter(c => c.id !== Number(citaId));
  await pool.query(
    `UPDATE lectura_libros SET citas = $1::jsonb, updated_at = NOW() WHERE id = $2`,
    [JSON.stringify(filtradas), libroId]
  );
  return filtradas;
};

// ───────────────────────────
// Metas de lectura
// ───────────────────────────
export const obtenerMetas = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT * FROM lectura_metas WHERE usuario_id = $1 ORDER BY anio DESC, mes DESC NULLS LAST`,
    [usuarioId]
  );
  return rows;
};

export const crearMeta = async (usuarioId, datos) => {
  const { tipo, objetivo, periodo, anio, mes } = datos;
  const { rows } = await pool.query(
    `INSERT INTO lectura_metas (usuario_id, tipo, objetivo, periodo, anio, mes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [usuarioId, tipo, objetivo, periodo, anio, mes || null]
  );
  await recalcularProgresoMetas(usuarioId);
  return rows[0];
};

export const eliminarMeta = async (id, usuarioId) => {
  await pool.query(`DELETE FROM lectura_metas WHERE id = $1 AND usuario_id = $2`, [id, usuarioId]);
};

export const recalcularProgresoMetas = async (usuarioId) => {
  const metas = await obtenerMetas(usuarioId);
  const ahora = new Date();
  const anioActual = ahora.getFullYear();
  const mesActual = ahora.getMonth() + 1;

  for (const meta of metas) {
    let progreso = 0;
    if (meta.tipo === 'libros') {
      const { rows } = await pool.query(
        `SELECT COUNT(*) AS total FROM lectura_libros
         WHERE usuario_id = $1 AND estado = 'completado'
           AND EXTRACT(YEAR FROM updated_at) = $2`,
        [usuarioId, meta.anio || anioActual]
      );
      progreso = Number(rows[0].total);
    } else if (meta.tipo === 'paginas') {
      let query = `SELECT COALESCE(SUM(paginas_leidas),0) AS total FROM lectura_registros WHERE usuario_id = $1`;
      const params = [usuarioId];
      if (meta.periodo === 'mensual') {
        query += ` AND EXTRACT(YEAR FROM fecha) = $2 AND EXTRACT(MONTH FROM fecha) = $3`;
        params.push(meta.anio || anioActual, meta.mes || mesActual);
      } else {
        query += ` AND EXTRACT(YEAR FROM fecha) = $2`;
        params.push(meta.anio || anioActual);
      }
      const { rows } = await pool.query(query, params);
      progreso = Number(rows[0].total);
    } else if (meta.tipo === 'dias') {
      let query = `SELECT COUNT(DISTINCT fecha) AS total FROM lectura_registros WHERE usuario_id = $1`;
      const params = [usuarioId];
      if (meta.periodo === 'mensual') {
        query += ` AND EXTRACT(YEAR FROM fecha) = $2 AND EXTRACT(MONTH FROM fecha) = $3`;
        params.push(meta.anio || anioActual, meta.mes || mesActual);
      } else {
        query += ` AND EXTRACT(YEAR FROM fecha) = $2`;
        params.push(meta.anio || anioActual);
      }
      const { rows } = await pool.query(query, params);
      progreso = Number(rows[0].total);
    }
    await pool.query(
      `UPDATE lectura_metas SET progreso = $1 WHERE id = $2`,
      [Math.min(progreso, meta.objetivo), meta.id]
    );
  }
  return true;
};

// ───────────────────────────
// Timer de lectura
// ───────────────────────────
const timersActivos = {};

export const iniciarTimer = async (usuarioId, datos) => {
  const { libro_id } = datos;
  const libro = await obtenerLibro(libro_id, usuarioId);
  if (!libro) throw new Error('Libro no encontrado');
  const timerId = `lectura_${usuarioId}`;
  timersActivos[timerId] = {
    inicio: Date.now(),
    libro_id,
    usuarioId,
    pausado: false,
    segundosAcumulados: 0,
  };
  return { iniciado: true, desde: new Date().toISOString(), libro_id };
};

export const detenerTimer = async (usuarioId, datos) => {
  const { libro_id, paginas_leidas, notas } = datos;
  const timerId = `lectura_${usuarioId}`;
  const sesion = timersActivos[timerId];
  if (!sesion || sesion.libro_id !== Number(libro_id)) {
    throw new Error('No hay sesión activa para este libro');
  }
  const duracionMs = Date.now() - sesion.inicio;
  const duracionMinutos = Math.round(duracionMs / 60000);
  delete timersActivos[timerId];
  const registro = await crearRegistro(usuarioId, {
    libro_id,
    paginas_leidas: paginas_leidas || 0,
    fecha: new Date().toISOString().split('T')[0],
    duracion_minutos: duracionMinutos,
    notas: notas || '',
  });

  // Check if this book has an active plan → update plan completion & toggle habit
  const hoy = new Date().toISOString().split('T')[0];
  const { rows: planesActivos } = await pool.query(
    `SELECT id, habito_id FROM lectura_planes
     WHERE libro_id = $1 AND usuario_id = $2
       AND fecha_inicio <= $3::date AND fecha_fin >= $3::date`,
    [libro_id, usuarioId, hoy]
  );
  for (const plan of planesActivos) {
    const libroUpd = await pool.query(
      `SELECT paginas_totales, paginas_leidas FROM lectura_libros WHERE id = $1`,
      [libro_id]
    );
    const l = libroUpd.rows[0];
    if (Number(l.paginas_leidas) >= Number(l.paginas_totales)) {
      await pool.query(`UPDATE lectura_planes SET completado = true WHERE id = $1`, [plan.id]);
      await pool.query(`UPDATE lectura_libros SET estado = 'completado', updated_at = NOW() WHERE id = $1`, [libro_id]);
    }

    // Toggle linked habit for today
    if (plan.habito_id) {
      const existingHabito = await pool.query(
        `SELECT id FROM registros_habitos WHERE habito_id = $1 AND fecha = $2::date`,
        [plan.habito_id, hoy]
      );
      if (existingHabito.rows.length === 0) {
        await pool.query(
          `INSERT INTO registros_habitos (habito_id, fecha) VALUES ($1, $2::date)`,
          [plan.habito_id, hoy]
        );
        eventBus.emit(EVENTS.HABIT_COMPLETED, { usuarioId, habitoId: plan.habito_id });
      }
    }
  }

  return { ...registro, duracion_minutos: duracionMinutos };
};

export const timerEstado = async (usuarioId) => {
  const timerId = `lectura_${usuarioId}`;
  const sesion = timersActivos[timerId];
  if (!sesion) return { activo: false };
  const segundos = sesion.pausado
    ? sesion.segundosAcumulados
    : sesion.segundosAcumulados + Math.round((Date.now() - sesion.inicio) / 1000);
  return {
    activo: true,
    pausado: sesion.pausado,
    libro_id: sesion.libro_id,
    desde: new Date(sesion.inicio).toISOString(),
    segundos,
  };
};

export const pausarTimer = async (usuarioId) => {
  const timerId = `lectura_${usuarioId}`;
  const sesion = timersActivos[timerId];
  if (!sesion || sesion.pausado) throw new Error('No hay sesión activa para pausar');
  const transcurridos = Math.round((Date.now() - sesion.inicio) / 1000);
  sesion.segundosAcumulados += transcurridos;
  sesion.pausado = true;
  return { pausado: true, segundos: sesion.segundosAcumulados };
};

export const reanudarTimer = async (usuarioId) => {
  const timerId = `lectura_${usuarioId}`;
  const sesion = timersActivos[timerId];
  if (!sesion || !sesion.pausado) throw new Error('No hay sesión pausada para reanudar');
  sesion.inicio = Date.now();
  sesion.pausado = false;
  return { reanudado: true, segundos: sesion.segundosAcumulados };
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

  const { rows: rachaRows } = await pool.query(
    `SELECT DISTINCT fecha FROM lectura_registros
     WHERE usuario_id = $1 AND fecha >= CURRENT_DATE - INTERVAL '60 days'
     ORDER BY fecha DESC`,
    [usuarioId]
  );
  let racha = 0;
  const ahora = new Date();
  for (let i = 0; i < rachaRows.length; i++) {
    const esperada = new Date(ahora);
    esperada.setDate(esperada.getDate() - i);
    const esperadaStr = esperada.toISOString().split('T')[0];
    const fechaRow = rachaRows[i].fecha instanceof Date ? rachaRows[i].fecha.toISOString().split('T')[0] : String(rachaRows[i].fecha).split('T')[0];
    if (fechaRow === esperadaStr) racha++;
    else break;
  }

  const { rows: ultimos } = await pool.query(
    `SELECT lr.*, l.titulo FROM lectura_registros lr
     JOIN lectura_libros l ON l.id = lr.libro_id
     WHERE lr.usuario_id = $1 ORDER BY lr.created_at DESC LIMIT 5`,
    [usuarioId]
  );

  return {
    ...totales[0],
    paginas_hoy: Number(hoy[0]?.paginas_hoy || 0),
    racha,
    ultimos_registros: ultimos,
  };
};
