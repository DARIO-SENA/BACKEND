import pool from "../../config/db.js";
import { manejarError } from "../../utils/error.handler.js";

export const createCheckin = async (req, res) => {
  try {
    const { estado_animo, energia, sueno_horas, notas } = req.body;
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
      [req.usuario.id, estado_animo, energia, sueno_horas, notas]
    );
    res.status(201).json(rows[0]);
  } catch (err) { manejarError(res, err); }
};

export const getCheckinHoy = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM checkins_emocionales WHERE usuario_id = $1 AND fecha = CURRENT_DATE`,
      [req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ error: "No hay check-in hoy" });
    res.json(rows[0]);
  } catch (err) { manejarError(res, err); }
};

export const getHistorial = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 30;
    const offset = parseInt(req.query.offset) || 0;
    const { rows } = await pool.query(
      `SELECT * FROM checkins_emocionales WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT $2 OFFSET $3`,
      [req.usuario.id, limite, offset]
    );
    res.json(rows);
  } catch (err) { manejarError(res, err); }
};

export const updateCheckinHoy = async (req, res) => {
  try {
    const { estado_animo, energia, sueno_horas, notas } = req.body;
    const { rows } = await pool.query(
      `UPDATE checkins_emocionales
       SET estado_animo = COALESCE($2, estado_animo),
           energia = COALESCE($3, energia),
           sueno_horas = COALESCE($4, sueno_horas),
           notas = COALESCE($5, notas),
           actualizado_en = CURRENT_TIMESTAMP
       WHERE usuario_id = $1 AND fecha = CURRENT_DATE
       RETURNING *`,
      [req.usuario.id, estado_animo, energia, sueno_horas, notas]
    );
    if (!rows.length) return res.status(404).json({ error: "No hay check-in hoy" });
    res.json(rows[0]);
  } catch (err) { manejarError(res, err); }
};

export const getEstadisticas = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         ROUND(AVG(energia), 1) as promedio_energia,
         ROUND(AVG(sueno_horas), 1) as promedio_sueno,
         MODE() WITHIN GROUP (ORDER BY estado_animo) as estado_frecuente,
         COUNT(*) as total_checkins
       FROM checkins_emocionales
       WHERE usuario_id = $1`,
      [req.usuario.id]
    );
    const tendencia = await pool.query(
      `SELECT fecha, energia FROM checkins_emocionales WHERE usuario_id = $1 ORDER BY fecha ASC`,
      [req.usuario.id]
    );
    res.json({ ...rows[0], tendencia: tendencia.rows });
  } catch (err) { manejarError(res, err); }
};

export const createDiario = async (req, res) => {
  try {
    const { titulo, contenido, etiquetas, es_publico } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO diario_personal (usuario_id, titulo, contenido, etiquetas, es_publico)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.usuario.id, titulo, contenido, etiquetas || [], es_publico || false]
    );
    res.status(201).json(rows[0]);
  } catch (err) { manejarError(res, err); }
};

export const listDiario = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;
    const { rows } = await pool.query(
      `SELECT * FROM diario_personal WHERE usuario_id = $1 ORDER BY creado_en DESC LIMIT $2 OFFSET $3`,
      [req.usuario.id, limite, offset]
    );
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) as total FROM diario_personal WHERE usuario_id = $1`,
      [req.usuario.id]
    );
    res.json({
      data: rows,
      total: parseInt(countRows[0].total),
      pagina,
      totalPaginas: Math.ceil(parseInt(countRows[0].total) / limite),
    });
  } catch (err) { manejarError(res, err); }
};

export const getDiario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM diario_personal WHERE id = $1 AND usuario_id = $2`,
      [id, req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Entrada no encontrada" });
    res.json(rows[0]);
  } catch (err) { manejarError(res, err); }
};

export const updateDiario = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, etiquetas, es_publico } = req.body;
    const { rows } = await pool.query(
      `UPDATE diario_personal
       SET titulo = COALESCE($2, titulo),
           contenido = COALESCE($3, contenido),
           etiquetas = COALESCE($4, etiquetas),
           es_publico = COALESCE($5, es_publico),
           actualizado_en = CURRENT_TIMESTAMP
       WHERE id = $1 AND usuario_id = $6 RETURNING *`,
      [id, titulo, contenido, etiquetas, es_publico, req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Entrada no encontrada" });
    res.json(rows[0]);
  } catch (err) { manejarError(res, err); }
};

export const deleteDiario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      `DELETE FROM diario_personal WHERE id = $1 AND usuario_id = $2`,
      [id, req.usuario.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Entrada no encontrada" });
    res.status(204).send();
  } catch (err) { manejarError(res, err); }
};

export const getDiarioAleatorio = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM diario_personal WHERE usuario_id = $1 ORDER BY RANDOM() LIMIT 1`,
      [req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ error: "No hay entradas en el diario" });
    res.json(rows[0]);
  } catch (err) { manejarError(res, err); }
};

export const getInsights = async (req, res) => {
  try {
    const desdeCache = await pool.query(
      `SELECT resultado FROM analisis_ia WHERE usuario_id = $1 AND tipo = 'insights' AND cache_hasta > NOW() ORDER BY creado_en DESC LIMIT 1`,
      [req.usuario.id]
    );
    if (desdeCache.rows.length) return res.json(desdeCache.rows[0].resultado);

    const checkins = await pool.query(
      `SELECT estado_animo, energia, sueno_horas FROM checkins_emocionales WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT 30`,
      [req.usuario.id]
    );
    const promedios = await pool.query(
      `SELECT
         ROUND(AVG(energia), 1) as avg_energia,
         ROUND(AVG(sueno_horas), 1) as avg_sueno,
         MODE() WITHIN GROUP (ORDER BY estado_animo) as estado_comun
       FROM checkins_emocionales WHERE usuario_id = $1`,
      [req.usuario.id]
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
      [req.usuario.id, JSON.stringify(resultado)]
    );
    res.json(resultado);
  } catch (err) { manejarError(res, err); }
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

export const programarPausa = async (req, res) => {
  try {
    const { ejercicio, duracion_minutos, programada_para } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO pausas_activas (usuario_id, ejercicio, duracion_minutos, programada_para) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.usuario.id, ejercicio, duracion_minutos, programada_para]
    );
    res.status(201).json(rows[0]);
  } catch (err) { manejarError(res, err); }
};

export const listEjercicios = async (req, res) => {
  const ejercicios = [
    { id: 1, nombre: "Estiramiento de cuello", duracion: 2 },
    { id: 2, nombre: "Respiración profunda", duracion: 3 },
    { id: 3, nombre: "Caminata corta", duracion: 5 },
    { id: 4, nombre: "Estiramiento de brazos", duracion: 2 },
    { id: 5, nombre: "Ejercicio de ojos (20-20-20)", duracion: 1 },
    { id: 6, nombre: "Flexión de piernas", duracion: 3 },
  ];
  res.json(ejercicios);
};

export const completarPausa = async (req, res) => {
  try {
    const { id } = req.body;
    const { rows } = await pool.query(
      `UPDATE pausas_activas SET completada = true WHERE id = $1 AND usuario_id = $2 RETURNING *`,
      [id, req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Pausa no encontrada" });
    res.json(rows[0]);
  } catch (err) { manejarError(res, err); }
};

export const healthCheck = async (req, res) => {
  const estado = { db: "ok", redis: "ok", timestamp: new Date().toISOString() };
  try {
    await pool.query("SELECT 1");
  } catch {
    estado.db = "error";
  }
  try {
    const { getRedisClient } = await import("../../config/redis.js");
    const redis = getRedisClient();
    await redis.ping();
  } catch {
    estado.redis = "error";
  }
  const statusCode = estado.db === "ok" ? 200 : 503;
  res.status(statusCode).json(estado);
};