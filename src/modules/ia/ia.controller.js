import * as iaService from './ia.service.js';
import { crearAgente } from './ia.agent.js';
import { getRedisClient } from '../../config/redis.js';
import pool from '../../config/db.js';
import logger from '../../config/logger.js';
import { manejarError } from '../../utils/error.handler.js';

// ─── FASE 1: NLP CREATION ─────────────────────────────

export const crearTareaNLP = async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({ ok: false, error: 'Texto requerido' });
    }
    const tarea = await iaService.crearTareaNLP(req.usuario.id, texto);
    res.status(201).json({ ok: true, data: tarea, creado_con_ia: true });
  } catch (err) { manejarError(res, err); }
};

export const crearHabitoNLP = async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({ ok: false, error: 'Texto requerido' });
    }
    const habito = await iaService.crearHabitoNLP(req.usuario.id, texto);
    res.status(201).json({ ok: true, data: habito, creado_con_ia: true });
  } catch (err) { manejarError(res, err); }
};

export const crearEventoNLP = async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({ ok: false, error: 'Texto requerido' });
    }
    const evento = await iaService.crearEventoNLP(req.usuario.id, texto);
    res.status(201).json({ ok: true, data: evento, creado_con_ia: true });
  } catch (err) { manejarError(res, err); }
};

// ─── FASE 1: CHAT & PRIORITIES ────────────────────────

const getRedis = () => {
  try {
    return getRedisClient();
  } catch (err) {
    logger.error('[ia.controller] Error obteniendo Redis:', err.message);
    return null;
  }
};

export const chat = async (req, res) => {
  try {
    const { mensaje, session_id } = req.body;
    if (!mensaje || !mensaje.trim()) {
      return res.status(400).json({ ok: false, error: 'Mensaje requerido' });
    }

    const redis = getRedis();
    const sessionKey = `ia:chat:${req.usuario.id}:${session_id || 'default'}`;
    let historial = [];

    if (redis) {
      try {
        const historialRaw = await redis.lrange(sessionKey, -10, -1);
        historial = historialRaw.map(m => JSON.parse(m));
      } catch (err) {
        logger.error('[ia.controller] Error leyendo historial Redis:', err.message);
      }
    }

    const result = await crearAgente(req.usuario.id, mensaje, historial);

    if (redis) {
      try {
        await redis.rpush(sessionKey, JSON.stringify({ role: 'human', content: mensaje }));
        await redis.rpush(sessionKey, JSON.stringify({ role: 'assistant', content: result.respuesta }));
        await redis.expire(sessionKey, 3600);
      } catch (err) {
        logger.error('[ia.controller] Error guardando historial Redis:', err.message);
      }
    }

    const tokens = result.tokens_usados || 0;

    await pool.query(
      `INSERT INTO conversaciones_ia (usuario_id, mensaje, respuesta, herramientas_usadas, tokens_usados)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.usuario.id, mensaje, result.respuesta, JSON.stringify(result.herramientas_usadas), tokens]
    );

    res.json({
      ok: true,
      data: {
        respuesta: result.respuesta,
        herramientas_usadas: result.herramientas_usadas,
      },
    });
  } catch (err) { manejarError(res, err); }
};

export const obtenerHistorial = async (req, res) => {
  try {
    const sessionId = req.query.session_id || 'default';
    const data = await iaService.obtenerHistorialChat(req.usuario.id, sessionId);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const prioridadesDelDia = async (req, res) => {
  try {
    const tareasOrdenadas = await iaService.priorizarTareasDelDia(req.usuario.id);
    res.json({ ok: true, data: tareasOrdenadas });
  } catch (err) { manejarError(res, err); }
};

export const resumen = async (req, res) => {
  try {
    const tipo = req.query.tipo || 'diario';
    const resultado = await iaService.generarResumen(req.usuario.id, tipo);
    res.json({ ok: true, data: resultado });
  } catch (err) { manejarError(res, err); }
};

// ─── FASE 2: PREDICTIONS & OPTIMIZATION ───────────────

export const predecirDuracion = async (req, res) => {
  try {
    const { tarea_id } = req.query;
    if (!tarea_id) return res.status(400).json({ ok: false, error: 'tarea_id requerido' });

    const resultado = await iaService.predecirDuracion(req.usuario.id, parseInt(tarea_id));
    res.json({ ok: true, data: resultado });
  } catch (err) { manejarError(res, err); }
};

export const optimizarAgenda = async (req, res) => {
  try {
    const resultado = await iaService.optimizarAgenda(req.usuario.id);
    res.json({ ok: true, data: resultado });
  } catch (err) { manejarError(res, err); }
};

// ─── FASE 3: RECOMMENDATIONS ─────────────────────────

export const recomendarHabitos = async (req, res) => {
  try {
    const sugerencias = await iaService.recomendarHabitos(req.usuario.id);
    res.json({ ok: true, data: sugerencias });
  } catch (err) { manejarError(res, err); }
};

export const sugerirRutina = async (req, res) => {
  try {
    const { objetivo = 'fuerza', nivel = 'principiante' } = req.body;
    const rutina = await iaService.sugerirRutina(req.usuario.id, objetivo, nivel);
    res.status(201).json({ ok: true, data: rutina });
  } catch (err) { manejarError(res, err); }
};

export const recomendarAmigos = async (req, res) => {
  try {
    const recomendaciones = await iaService.recomendarAmigos(req.usuario.id);
    res.json({ ok: true, data: recomendaciones });
  } catch (err) { manejarError(res, err); }
};

export const recomendarProyectos = async (req, res) => {
  try {
    const recomendaciones = await iaService.recomendarProyectos(req.usuario.id);
    res.json({ ok: true, data: recomendaciones });
  } catch (err) { manejarError(res, err); }
};

export const sugerirLogro = async (req, res) => {
  try {
    const logro = await iaService.sugerirLogro(req.usuario.id);
    res.status(201).json({ ok: true, data: logro });
  } catch (err) { manejarError(res, err); }
};

// ─── FASE 4: PATTERNS & ANOMALIES ────────────────────

export const patrones = async (req, res) => {
  try {
    const resultado = await iaService.analizarPatrones(req.usuario.id);
    res.json({ ok: true, data: resultado });
  } catch (err) { manejarError(res, err); }
};

export const anomalias = async (req, res) => {
  try {
    const resultado = await iaService.detectarAnomalias(req.usuario.id);
    res.json({ ok: true, data: resultado });
  } catch (err) { manejarError(res, err); }
};

export const sobrecarga = async (req, res) => {
  try {
    const resultado = await iaService.detectarSobrecarga(req.usuario.id);
    res.json({ ok: true, data: resultado });
  } catch (err) { manejarError(res, err); }
};
