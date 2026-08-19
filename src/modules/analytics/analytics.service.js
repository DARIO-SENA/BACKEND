import pool from '../../config/db.js';

// 📊 Dashboard principal
export const obtenerDashboard = async (usuarioId) => {
  const hoy = new Date().toISOString().split('T')[0];

  const [tareas, habitos, progreso] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE estado = 'completada') AS completadas
       FROM tareas WHERE usuario_id = $1`,
      [usuarioId]
    ),
    pool.query(
      `SELECT COUNT(*) AS total
       FROM habitos WHERE usuario_id = $1`,
      [usuarioId]
    ),
    pool.query(
      `SELECT COALESCE(SUM(valor), 0) AS puntos_totales
       FROM progreso WHERE usuario_id = $1`,
      [usuarioId]
    ),
  ]);

return {
  fecha: hoy,
  tareas: { total: parseInt(tareas.rows[0].total), completadas: parseInt(tareas.rows[0].completadas) },
  habitos: { total: parseInt(habitos.rows[0].total) },
  puntos_totales: progreso.rows[0].puntos_totales,
};
};

// 📈 Productividad por semana
export const obtenerProductividadSemanal = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT
       DATE_TRUNC('week', actualizado_en) AS semana,
       COUNT(*) FILTER (WHERE estado = 'completada') AS completadas,
       COUNT(*) AS total,
       ROUND(
         COUNT(*) FILTER (WHERE estado = 'completada') * 100.0 / NULLIF(COUNT(*), 0), 2
       ) AS porcentaje
     FROM tareas
     WHERE usuario_id = $1
       AND actualizado_en >= NOW() - INTERVAL '8 weeks'
     GROUP BY semana
     ORDER BY semana ASC`,
    [usuarioId]
  );
  return rows;
};

// 📅 Productividad por día de la semana
export const obtenerProductividadPorDia = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT
       TO_CHAR(actualizado_en, 'Day') AS dia,
       EXTRACT(DOW FROM actualizado_en) AS numero_dia,
       COUNT(*) FILTER (WHERE estado = 'completada') AS completadas,
       COUNT(*) AS total
     FROM tareas
     WHERE usuario_id = $1
       AND actualizado_en >= NOW() - INTERVAL '30 days'
     GROUP BY dia, numero_dia
     ORDER BY numero_dia ASC`,
    [usuarioId]
  );
  return rows;
};

// 🏷️ Tareas por categoría
export const obtenerTareasPorCategoria = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT
       COALESCE(c.nombre, 'Sin categoría') AS categoria,
       COALESCE(c.color, '#gray') AS color,
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE t.estado = 'completada') AS completadas,
       ROUND(
         COUNT(*) FILTER (WHERE t.estado = 'completada') * 100.0 / NULLIF(COUNT(*), 0), 2
       ) AS porcentaje
     FROM tareas t
     LEFT JOIN categorias c ON t.categoria_id = c.id AND c.tipo = 'tarea'
     WHERE t.usuario_id = $1
     GROUP BY c.nombre, c.color
     ORDER BY total DESC`,
    [usuarioId]
  );
  return rows;
};

// 🔥 Racha actual
export const obtenerRacha = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT DATE(actualizado_en) AS fecha
     FROM tareas
     WHERE usuario_id = $1
       AND estado = 'completada'
     GROUP BY DATE(actualizado_en)
     ORDER BY fecha DESC`,
    [usuarioId]
  );

  if (rows.length === 0) return { racha_actual: 0, mejor_racha: 0 };

  let rachaActual = 1;
  let mejorRacha = 1;
  let racha = 1;

  for (let i = 1; i < rows.length; i++) {
    const diff = (new Date(rows[i - 1].fecha) - new Date(rows[i].fecha)) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      racha++;
      if (racha > mejorRacha) mejorRacha = racha;
    } else {
      racha = 1;
    }
  }

  const TZ = 'America/Bogota';
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: TZ });
  const fecha = rows[0].fecha;
  const ultimaLocal = fecha instanceof Date
    ? fecha.toLocaleDateString('en-CA', { timeZone: TZ })
    : String(fecha).split('T')[0];
  rachaActual = ultimaLocal === hoy ? racha : 0;

  return { racha_actual: rachaActual, mejor_racha: mejorRacha };
};

// 💾 Guardar progreso diario
export const guardarProgreso = async (usuarioId, tipo, valor) => {
  const hoy = new Date().toISOString().split('T')[0];

  const { rows } = await pool.query(
    `INSERT INTO progreso (usuario_id, tipo, valor, fecha)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (usuario_id, tipo, fecha)
     DO UPDATE SET valor = COALESCE(progreso.valor, 0) + EXCLUDED.valor
     RETURNING *`,
    [usuarioId, tipo, valor, hoy]
  );
  return rows[0];
};

// 📊 Analytics completos por categoría
export const obtenerAnalyticsCompletos = async (usuarioId) => {
  const safeQuery = async (query, params, defaults) => {
    try {
      const { rows } = await pool.query(query, params);
      return rows[0] || defaults;
    } catch {
      return defaults;
    }
  };

  const [
    tareas,
    habitos,
    gymStats,
    metas,
    bienestar,
    pomodoro,
    lectura,
    finanzas,
    gamificacion,
    social,
  ] = await Promise.all([
    safeQuery(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE estado = 'completada') AS completadas,
         COUNT(*) FILTER (WHERE estado = 'pendiente') AS pendientes,
         COUNT(*) FILTER (WHERE fecha_limite < CURRENT_DATE AND estado != 'completada') AS vencidas
       FROM tareas WHERE usuario_id = $1`,
      [usuarioId],
      { total: 0, completadas: 0, pendientes: 0, vencidas: 0 }
    ),
    safeQuery(
      `SELECT
         COUNT(DISTINCT h.id) AS total,
         COUNT(DISTINCT rh.habito_id) AS activos
       FROM habitos h
       LEFT JOIN registros_habitos rh ON rh.habito_id = h.id
         AND rh.fecha >= CURRENT_DATE - INTERVAL '30 days'
       WHERE h.usuario_id = $1`,
      [usuarioId],
      { total: 0, activos: 0 }
    ),
    safeQuery(
      `SELECT
         COUNT(DISTINCT re.id) AS total_entrenamientos,
         COUNT(DISTINCT re.ejercicio_id) AS ejercicios_distintos,
         COUNT(se.id) AS total_sets,
         COALESCE(SUM(se.repeticiones), 0) AS total_reps,
         COALESCE(MAX(se.peso_kg), 0) AS peso_maximo,
         COUNT(DISTINCT DATE(re.fecha)) AS dias_entrenados
       FROM registros_entrenamiento re
       LEFT JOIN series_entrenamiento se ON se.registro_id = re.id
       WHERE re.usuario_id = $1`,
      [usuarioId],
      { total_entrenamientos: 0, ejercicios_distintos: 0, total_sets: 0, total_reps: 0, peso_maximo: 0, dias_entrenados: 0 }
    ),
    safeQuery(
      `SELECT
         COUNT(*) AS total_metas,
         COUNT(*) FILTER (WHERE estado = 'completada') AS completadas,
         COUNT(*) FILTER (WHERE estado = 'en_progreso') AS en_progreso,
         COALESCE(AVG(progreso), 0) AS progreso_promedio
       FROM metas WHERE usuario_id = $1`,
      [usuarioId],
      { total_metas: 0, completadas: 0, en_progreso: 0, progreso_promedio: 0 }
    ),
    safeQuery(
      `SELECT
         COUNT(*) AS total_checkins,
         ROUND(AVG(energia), 1) AS energia_promedio,
         ROUND(AVG(sueno_horas), 1) AS sueno_promedio,
         MODE() WITHIN GROUP (ORDER BY estado_animo) AS estado_frecuente
       FROM checkins_emocionales WHERE usuario_id = $1`,
      [usuarioId],
      { total_checkins: 0, energia_promedio: null, sueno_promedio: null, estado_frecuente: null }
    ),
    safeQuery(
      `SELECT
         COUNT(*) AS total_sesiones,
         COALESCE(SUM(duracion_minutos), 0) AS total_minutos,
         ROUND(AVG(duracion_minutos), 0) AS promedio_minutos
       FROM pomodoro_sessions WHERE usuario_id = $1`,
      [usuarioId],
      { total_sesiones: 0, total_minutos: 0, promedio_minutos: 0 }
    ),
    safeQuery(
      `SELECT
         COUNT(*) AS total_libros,
         COALESCE(SUM(paginas_leidas), 0) AS paginas_totales,
         COALESCE(SUM(minutos_lectura), 0) AS minutos_totales
       FROM lectura_progreso WHERE usuario_id = $1`,
      [usuarioId],
      { total_libros: 0, paginas_totales: 0, minutos_totales: 0 }
    ),
    safeQuery(
      `SELECT
         COUNT(*) AS total_transacciones,
         COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) AS total_ingresos,
         COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END), 0) AS total_gastos
       FROM finanzas_transacciones WHERE usuario_id = $1`,
      [usuarioId],
      { total_transacciones: 0, total_ingresos: 0, total_gastos: 0 }
    ),
    safeQuery(
      `SELECT
         COALESCE(tp.p, 0) + COALESCE(th.h, 0) + COALESCE(tg.g, 0) AS puntos,
         COALESCE(tp.p, 0) AS xp,
         GREATEST(1, FLOOR(COALESCE(tp.p, 0) / 50) + 1) AS nivel,
         COALESCE(tl.l, 0) AS logros,
         COALESCE(tr.r, 0) AS racha
       FROM
         (SELECT COUNT(*) AS p FROM tareas WHERE usuario_id = $1 AND estado = 'completada') tp,
         (SELECT COUNT(*) AS h FROM habitos WHERE usuario_id = $1) th,
         (SELECT COUNT(*) AS g FROM registros_entrenamiento WHERE usuario_id = $1) tg,
         (SELECT COUNT(*) AS l FROM logros_usuario WHERE usuario_id = $1) tl,
         (SELECT COUNT(DISTINCT DATE(actualizado_en)) AS r FROM tareas WHERE usuario_id = $1 AND estado = 'completada' AND actualizado_en >= CURRENT_DATE - INTERVAL '7 days') tr`,
      [usuarioId],
      { nivel: 1, puntos: 0, xp: 0, racha: 0, logros: 0 }
    ),
    safeQuery(
      `SELECT
         COUNT(*) FILTER (WHERE estado = 'aceptada') AS amigos,
         (SELECT COUNT(*) FROM proyectos WHERE creador_id = $1) AS proyectos
       FROM amistades WHERE (usuario_id = $1 OR amigo_id = $1)`,
      [usuarioId],
      { amigos: 0, proyectos: 0 }
    ),
  ]);

  return {
    tareas,
    habitos,
    gimnasio: { ...gymStats },
    metas,
    bienestar,
    pomodoro,
    lectura,
    finanzas,
    gamificacion,
    social,
  };
};

// 🏋️ Analytics de hábitos
export const obtenerAnalyticsHabitos = async (usuarioId) => {
  const [stats, semanal, porDia, rachaResult] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(DISTINCT h.id) AS total,
         COUNT(DISTINCT rh30.habito_id) AS activos,
         COUNT(DISTINCT rhHoy.habito_id) AS completados_hoy,
         COALESCE(COUNT(DISTINCT CASE WHEN rhSem.habito_id IS NOT NULL THEN 1 END), 0) AS completados_semana
       FROM habitos h
       LEFT JOIN registros_habitos rh30 ON rh30.habito_id = h.id AND rh30.fecha >= CURRENT_DATE - INTERVAL '30 days'
       LEFT JOIN registros_habitos rhHoy ON rhHoy.habito_id = h.id AND rhHoy.fecha = CURRENT_DATE
       LEFT JOIN registros_habitos rhSem ON rhSem.habito_id = h.id
         AND rhSem.fecha >= DATE_TRUNC('week', CURRENT_DATE)
         AND rhSem.fecha < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
       WHERE h.usuario_id = $1`,
      [usuarioId]
    ),
    pool.query(
      `SELECT
         DATE_TRUNC('week', rh.fecha) AS semana,
         COUNT(DISTINCT rh.habito_id) AS completados,
         COUNT(*) AS total_completions
       FROM registros_habitos rh
       JOIN habitos h ON h.id = rh.habito_id AND h.usuario_id = $1
       WHERE rh.fecha >= NOW() - INTERVAL '8 weeks'
       GROUP BY semana
       ORDER BY semana ASC`,
      [usuarioId]
    ),
    pool.query(
      `SELECT
         EXTRACT(DOW FROM rh.fecha) AS numero_dia,
         COUNT(DISTINCT rh.habito_id) AS completados,
         COUNT(*) AS total
       FROM registros_habitos rh
       JOIN habitos h ON h.id = rh.habito_id AND h.usuario_id = $1
       WHERE rh.fecha >= NOW() - INTERVAL '30 days'
       GROUP BY numero_dia
       ORDER BY numero_dia ASC`,
      [usuarioId]
    ),
    obtenerRachaHabitos(usuarioId),
  ]);

  const s = stats.rows[0] || { total: 0, activos: 0, completados_hoy: 0, completados_semana: 0 };
  const total_semanas = Math.max(1, semanal.rows.length);

  return {
    total: parseInt(s.total),
    activos: parseInt(s.activos),
    completados_hoy: parseInt(s.completados_hoy),
    completados_semana: parseInt(s.completados_semana),
    racha_actual: rachaResult.racha_actual,
    mejor_racha: rachaResult.mejor_racha,
    porcentaje_semana: Math.round((s.completados_hoy * 100) / total_semanas),
    semanal: semanal.rows.map(r => ({
      semana: r.semana,
      completados: parseInt(r.completados),
      total: parseInt(r.total_completions),
    })),
    por_dia: porDia.rows.map(r => ({
      numero_dia: parseInt(r.numero_dia),
      completados: parseInt(r.completados),
      total: parseInt(r.total),
    })),
  };
};

async function obtenerRachaHabitos(usuarioId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT rh.fecha
     FROM registros_habitos rh
     JOIN habitos h ON h.id = rh.habito_id AND h.usuario_id = $1
     WHERE rh.completado = true
     ORDER BY rh.fecha DESC`,
    [usuarioId]
  );

  if (rows.length === 0) return { racha_actual: 0, mejor_racha: 0 };

  let rachaActual = 1;
  let mejorRacha = 1;
  let racha = 1;

  for (let i = 1; i < rows.length; i++) {
    const diff = (new Date(rows[i - 1].fecha) - new Date(rows[i].fecha)) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      racha++;
      if (racha > mejorRacha) mejorRacha = racha;
    } else {
      racha = 1;
    }
  }

  const TZ = 'America/Bogota';
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: TZ });
  const ultimaLocal = rows[0].fecha instanceof Date
    ? rows[0].fecha.toLocaleDateString('en-CA', { timeZone: TZ })
    : String(rows[0].fecha).split('T')[0];
  rachaActual = ultimaLocal === hoy ? racha : 0;

  return { racha_actual: rachaActual, mejor_racha: mejorRacha };
}

// 📄 Reporte exportable completo
export const generarReporte = async (usuarioId) => {
  const [dashboard, semanal, porDia, categorias, racha] = await Promise.all([
    obtenerDashboard(usuarioId),
    obtenerProductividadSemanal(usuarioId),
    obtenerProductividadPorDia(usuarioId),
    obtenerTareasPorCategoria(usuarioId),
    obtenerRacha(usuarioId),
  ]);

  return {
    generado_en: new Date().toISOString(),
    resumen: dashboard,
    productividad: {
      semanal,
      por_dia: porDia,
    },
    categorias,
    racha,
  };
};