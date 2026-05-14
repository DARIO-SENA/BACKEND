import pool from "../../config/db.js";

export const crearCheckin = async (usuarioId, datos) => {
  const { estado_animo, energia, sueno_horas, notas } = datos;
  const { rows } = await pool.query(
    `INSERT INTO checkins_emocionales (usuario_id, estado_animo, energia, sueno_horas, notas)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (usuario_id, fecha) DO UPDATE
       SET estado_animo = EXCLUDED.estado_animo,
           energia = EXCLUDED.energia,
           sueno_horas = EXCLUDED.sueno_horas,
           notas = EXCLUDED.notas,
           actualizado_en = CURRENT_TIMESTAMP
     RETURNING *`,
    [usuarioId, estado_animo, energia, sueno_horas, notas]
  );
  return rows[0];
};

export const obtenerCheckinHoy = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT * FROM checkins_emocionales WHERE usuario_id = $1 AND fecha = CURRENT_DATE`,
    [usuarioId]
  );
  return rows[0] || null;
};

export const obtenerHistorial = async (usuarioId, limite = 30, offset = 0) => {
  const { rows } = await pool.query(
    `SELECT * FROM checkins_emocionales WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT $2 OFFSET $3`,
    [usuarioId, limite, offset]
  );
  return rows;
};

export const actualizarCheckinHoy = async (usuarioId, datos) => {
  const { estado_animo, energia, sueno_horas, notas } = datos;
  const { rows } = await pool.query(
    `UPDATE checkins_emocionales
     SET estado_animo = COALESCE($2, estado_animo),
         energia = COALESCE($3, energia),
         sueno_horas = COALESCE($4, sueno_horas),
         notas = COALESCE($5, notas),
         actualizado_en = CURRENT_TIMESTAMP
     WHERE usuario_id = $1 AND fecha = CURRENT_DATE
     RETURNING *`,
    [usuarioId, estado_animo, energia, sueno_horas, notas]
  );
  return rows[0] || null;
};

export const obtenerEstadisticas = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT
       ROUND(AVG(energia), 1) as promedio_energia,
       ROUND(AVG(sueno_horas), 1) as promedio_sueno,
       MODE() WITHIN GROUP (ORDER BY estado_animo) as estado_frecuente,
       COUNT(*) as total_checkins
     FROM checkins_emocionales
     WHERE usuario_id = $1`,
    [usuarioId]
  );
  const tendencia = await pool.query(
    `SELECT fecha, energia FROM checkins_emocionales WHERE usuario_id = $1 ORDER BY fecha ASC`,
    [usuarioId]
  );
  return { ...rows[0], tendencia: tendencia.rows };
};

export const crearEntradaDiario = async (usuarioId, datos) => {
  const { titulo, contenido, etiquetas, es_publico } = datos;
  const { rows } = await pool.query(
    `INSERT INTO diario_personal (usuario_id, titulo, contenido, etiquetas, es_publico)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [usuarioId, titulo, contenido, etiquetas || [], es_publico || false]
  );
  return rows[0];
};

export const listarDiario = async (usuarioId, pagina = 1, limite = 10) => {
  const offset = (pagina - 1) * limite;
  const { rows } = await pool.query(
    `SELECT * FROM diario_personal WHERE usuario_id = $1 ORDER BY creado_en DESC LIMIT $2 OFFSET $3`,
    [usuarioId, limite, offset]
  );
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) as total FROM diario_personal WHERE usuario_id = $1`,
    [usuarioId]
  );
  return {
    data: rows,
    total: parseInt(countRows[0].total),
    pagina,
    totalPaginas: Math.ceil(parseInt(countRows[0].total) / limite),
  };
};

export const obtenerEntradaDiario = async (id, usuarioId) => {
  const { rows } = await pool.query(
    `SELECT * FROM diario_personal WHERE id = $1 AND usuario_id = $2`,
    [id, usuarioId]
  );
  return rows[0] || null;
};

export const actualizarEntradaDiario = async (id, usuarioId, datos) => {
  const { titulo, contenido, etiquetas, es_publico } = datos;
  const { rows } = await pool.query(
    `UPDATE diario_personal
     SET titulo = COALESCE($2, titulo),
         contenido = COALESCE($3, contenido),
         etiquetas = COALESCE($4, etiquetas),
         es_publico = COALESCE($5, es_publico),
         actualizado_en = CURRENT_TIMESTAMP
     WHERE id = $1 AND usuario_id = $6 RETURNING *`,
    [id, titulo, contenido, etiquetas, es_publico, usuarioId]
  );
  return rows[0] || null;
};

export const eliminarEntradaDiario = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    `DELETE FROM diario_personal WHERE id = $1 AND usuario_id = $2`,
    [id, usuarioId]
  );
  return rowCount > 0;
};

export const obtenerEntradaDiarioAleatoria = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT * FROM diario_personal WHERE usuario_id = $1 ORDER BY RANDOM() LIMIT 1`,
    [usuarioId]
  );
  return rows[0] || null;
};

function generarObservaciones(checkins, promedios) {
  const observaciones = [];
  const energia = parseFloat(promedios.avg_energia) || 0;
  const sueno = parseFloat(promedios.avg_sueno) || 0;
  if (sueno < 6) observaciones.push("Tu promedio de sueño es bajo (<6h). Intenta descansar más.");
  if (energia < 5) observaciones.push("Tu nivel de energía promedio es bajo. Considera hacer pausas activas.");
  if (sueno >= 7 && energia >= 7) observaciones.push("¡Buen equilibrio! Duermes bien y tienes buena energía.");
  if (checkins.length > 0) observaciones.push("Sigue registrando tus emociones diariamente para obtener mejores recomendaciones.");
  return observaciones;
}

export const obtenerInsights = async (usuarioId) => {
  const desdeCache = await pool.query(
    `SELECT resultado FROM analisis_ia WHERE usuario_id = $1 AND tipo = 'insights' AND cache_hasta > NOW() ORDER BY creado_en DESC LIMIT 1`,
    [usuarioId]
  );
  if (desdeCache.rows.length) return desdeCache.rows[0].resultado;

  const checkins = await pool.query(
    `SELECT estado_animo, energia, sueno_horas FROM checkins_emocionales WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT 30`,
    [usuarioId]
  );
  const promedios = await pool.query(
    `SELECT
       ROUND(AVG(energia), 1) as avg_energia,
       ROUND(AVG(sueno_horas), 1) as avg_sueno,
       MODE() WITHIN GROUP (ORDER BY estado_animo) as estado_comun
     FROM checkins_emocionales WHERE usuario_id = $1`,
    [usuarioId]
  );

  const resultado = {
    fecha_generacion: new Date().toISOString(),
    resumen: `Basado en ${checkins.rows.length} check-ins recientes.`,
    promedio_energia: promedios.rows[0].avg_energia,
    promedio_sueno: promedios.rows[0].avg_sueno,
    estado_animo_frecuente: promedios.rows[0].estado_comun,
    observaciones: generarObservaciones(checkins.rows, promedios.rows[0]),
  };

  await pool.query(
    `INSERT INTO analisis_ia (usuario_id, tipo, resultado, cache_hasta) VALUES ($1, 'insights', $2, NOW() + INTERVAL '1 hour')`,
    [usuarioId, JSON.stringify(resultado)]
  );
  return resultado;
};

export const programarPausaActiva = async (usuarioId, datos) => {
  const { ejercicio, duracion_minutos, programada_para } = datos;
  const { rows } = await pool.query(
    `INSERT INTO pausas_activas (usuario_id, ejercicio, duracion_minutos, programada_para) VALUES ($1, $2, $3, $4) RETURNING *`,
    [usuarioId, ejercicio, duracion_minutos, programada_para]
  );
  return rows[0];
};

export const completarPausaActiva = async (id, usuarioId) => {
  const { rows } = await pool.query(
    `UPDATE pausas_activas SET completada = true WHERE id = $1 AND usuario_id = $2 RETURNING *`,
    [id, usuarioId]
  );
  return rows[0] || null;
};

export const listarEjercicios = () => [
  { id: 1, nombre: "Estiramiento de cuello", duracion: 2 },
  { id: 2, nombre: "Respiración profunda", duracion: 3 },
  { id: 3, nombre: "Caminata corta", duracion: 5 },
  { id: 4, nombre: "Estiramiento de brazos", duracion: 2 },
  { id: 5, nombre: "Ejercicio de ojos (20-20-20)", duracion: 1 },
  { id: 6, nombre: "Flexión de piernas", duracion: 3 },
];

export const verificarConexionDB = async () => {
  await pool.query("SELECT 1");
};
