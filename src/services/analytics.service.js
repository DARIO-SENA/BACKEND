import pool from '../config/db.js';

// 📊 Dashboard principal
export const obtenerDashboard = async (usuarioId) => {
  const hoy = new Date().toISOString().split('T')[0];

  const [tareas, habitos, progreso] = await Promise.all([
pool.query(
  `SELECT
     COUNT(*) AS total
   FROM habitos WHERE usuario_id = $1`,
  [usuarioId]
),
    pool.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE activo = true) AS activos
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
  tareas: tareas.rows[0],
  habitos: { total: habitos.rows[0].total },
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
     LEFT JOIN categorias c ON t.categoria_id = c.id
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

  // Verificar si la racha llega hasta hoy
  const hoy = new Date().toISOString().split('T')[0];
  const ultimaFecha = rows[0].fecha.toISOString().split('T')[0];
  rachaActual = ultimaFecha === hoy ? racha : 0;

  return { racha_actual: rachaActual, mejor_racha: mejorRacha };
};

// 💾 Guardar progreso diario
export const guardarProgreso = async (usuarioId, tipo, valor) => {
  const hoy = new Date().toISOString().split('T')[0];

  const { rows } = await pool.query(
    `INSERT INTO progreso (usuario_id, tipo, valor, fecha)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (usuario_id, tipo, fecha)
     DO UPDATE SET valor = progreso.valor + EXCLUDED.valor
     RETURNING *`,
    [usuarioId, tipo, valor, hoy]
  );
  return rows[0];
};