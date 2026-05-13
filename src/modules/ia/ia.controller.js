import * as iaService from './ia.service.js';
import { crearAgente } from './ia.agent.js';
import { getRedisClient } from '../../config/redis.js';
import pool from '../../config/db.js';
import * as tareasService from '../tareas/tareas.service.js';
import * as analyticsService from '../analytics/analytics.service.js';
import * as gamificacionService from '../gamificacion/gamificacion.service.js';

// ─── FASE 1: NLP CREATION ─────────────────────────────

export const crearTareaNLP = async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({ ok: false, error: 'Texto requerido' });
    }
    const tarea = await iaService.crearTareaNLP(req.usuario.id, texto);
    res.status(201).json({ ok: true, data: tarea, creado_con_ia: true });
  } catch (err) {
    console.error('crearTareaNLP:', err.message);
    res.status(500).json({ ok: false, error: 'Error al procesar con IA' });
  }
};

export const crearHabitoNLP = async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({ ok: false, error: 'Texto requerido' });
    }
    const habito = await iaService.crearHabitoNLP(req.usuario.id, texto);
    res.status(201).json({ ok: true, data: habito, creado_con_ia: true });
  } catch (err) {
    console.error('crearHabitoNLP:', err.message);
    res.status(500).json({ ok: false, error: 'Error al procesar con IA' });
  }
};

export const crearEventoNLP = async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({ ok: false, error: 'Texto requerido' });
    }
    const evento = await iaService.crearEventoNLP(req.usuario.id, texto);
    res.status(201).json({ ok: true, data: evento, creado_con_ia: true });
  } catch (err) {
    console.error('crearEventoNLP:', err.message);
    res.status(500).json({ ok: false, error: 'Error al procesar con IA' });
  }
};

// ─── FASE 1: CHAT & PRIORITIES ────────────────────────

const getRedis = () => {
  try {
    return getRedisClient();
  } catch {
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
      } catch {
      }
    }

    const result = await crearAgente(req.usuario.id, mensaje, historial);

    if (redis) {
      try {
        await redis.rpush(sessionKey, JSON.stringify({ role: 'human', content: mensaje }));
        await redis.rpush(sessionKey, JSON.stringify({ role: 'assistant', content: result.respuesta }));
        await redis.expire(sessionKey, 3600);
      } catch {
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
  } catch (err) {
    console.error('chat:', err.message);
    res.status(500).json({ ok: false, error: 'Error al procesar mensaje' });
  }
};

export const prioridadesDelDia = async (req, res) => {
  try {
    const tareasOrdenadas = await iaService.priorizarTareasDelDia(req.usuario.id);
    res.json({ ok: true, data: tareasOrdenadas });
  } catch (err) {
    console.error('prioridadesDelDia:', err.message);
    res.status(500).json({ ok: false, error: 'Error al priorizar' });
  }
};

export const resumen = async (req, res) => {
  try {
    const tipo = req.query.tipo || 'diario';
    const resultado = await iaService.generarResumen(req.usuario.id, tipo);
    res.json({ ok: true, data: resultado });
  } catch (err) {
    console.error('resumen:', err.message);
    res.status(500).json({ ok: false, error: 'Error al generar resumen' });
  }
};

// ─── FASE 2: PREDICTIONS & OPTIMIZATION ───────────────

export const predecirDuracion = async (req, res) => {
  try {
    const { tarea_id } = req.query;
    if (!tarea_id) return res.status(400).json({ ok: false, error: 'tarea_id requerido' });

    const resultado = await iaService.predecirDuracion(req.usuario.id, parseInt(tarea_id));
    res.json({ ok: true, data: resultado });
  } catch (err) {
    console.error('predecirDuracion:', err.message);
    res.status(500).json({ ok: false, error: 'Error al predecir duracion' });
  }
};

export const optimizarAgenda = async (req, res) => {
  try {
    const resultado = await iaService.optimizarAgenda(req.usuario.id);
    res.json({ ok: true, data: resultado });
  } catch (err) {
    console.error('optimizarAgenda:', err.message);
    res.status(500).json({ ok: false, error: 'Error al optimizar agenda' });
  }
};

// ─── FASE 3: RECOMMENDATIONS ─────────────────────────

export const recomendarHabitos = async (req, res) => {
  try {
    const sugerencias = await iaService.recomendarHabitos(req.usuario.id);
    res.json({ ok: true, data: sugerencias });
  } catch (err) {
    console.error('recomendarHabitos:', err.message);
    res.status(500).json({ ok: false, error: 'Error al recomendar habitos' });
  }
};

export const sugerirRutina = async (req, res) => {
  try {
    const { objetivo = 'fuerza', nivel = 'principiante' } = req.body;
    const rutina = await iaService.sugerirRutina(req.usuario.id, objetivo, nivel);
    res.status(201).json({ ok: true, data: rutina });
  } catch (err) {
    console.error('sugerirRutina:', err.message);
    res.status(500).json({ ok: false, error: 'Error al sugerir rutina' });
  }
};

export const recomendarAmigos = async (req, res) => {
  try {
    const recomendaciones = await iaService.recomendarAmigos(req.usuario.id);
    res.json({ ok: true, data: recomendaciones });
  } catch (err) {
    console.error('recomendarAmigos:', err.message);
    res.status(500).json({ ok: false, error: 'Error al recomendar amigos' });
  }
};

export const recomendarProyectos = async (req, res) => {
  try {
    const recomendaciones = await iaService.recomendarProyectos(req.usuario.id);
    res.json({ ok: true, data: recomendaciones });
  } catch (err) {
    console.error('recomendarProyectos:', err.message);
    res.status(500).json({ ok: false, error: 'Error al recomendar proyectos' });
  }
};

export const sugerirLogro = async (req, res) => {
  try {
    const logro = await iaService.sugerirLogro(req.usuario.id);
    res.status(201).json({ ok: true, data: logro });
  } catch (err) {
    console.error('sugerirLogro:', err.message);
    res.status(500).json({ ok: false, error: 'Error al sugerir logro' });
  }
};

// ─── FASE 4: PATTERNS & ANOMALIES ────────────────────

export const patrones = async (req, res) => {
  try {
    const resultado = await iaService.analizarPatrones(req.usuario.id);
    res.json({ ok: true, data: resultado });
  } catch (err) {
    console.error('patrones:', err.message);
    res.status(500).json({ ok: false, error: 'Error al analizar patrones' });
  }
};

export const anomalias = async (req, res) => {
  try {
    const resultado = await iaService.detectarAnomalias(req.usuario.id);
    res.json({ ok: true, data: resultado });
  } catch (err) {
    console.error('anomalias:', err.message);
    res.status(500).json({ ok: false, error: 'Error al detectar anomalias' });
  }
};

export const sobrecarga = async (req, res) => {
  try {
    const resultado = await iaService.detectarSobrecarga(req.usuario.id);
    res.json({ ok: true, data: resultado });
  } catch (err) {
    console.error('sobrecarga:', err.message);
    res.status(500).json({ ok: false, error: 'Error al evaluar sobrecarga' });
  }
};
