import OpenAI from 'openai';
import * as prompts from './ia.prompts.js';
import { obtenerCache, guardarCache } from './ia.cache.js';
import { AppError } from '../../utils/AppError.js';
import * as tareasService from '../tareas/tareas.service.js';
import * as habitosService from '../habitos/habitos.service.js';
import * as analyticsService from '../analytics/analytics.service.js';
import * as gamificacionService from '../gamificacion/gamificacion.service.js';
import * as gymService from '../gym/gym.service.js';
import * as agendaService from '../agenda/agenda.service.js';
import { LLM_MODEL } from '../../config/openai.js';
import pool from '../../config/db.js';

export const safeJsonParse = (str, fallback = {}) => {
  try {
    return JSON.parse(str);
  } catch {
    console.error('[ia] Error parseando respuesta JSON de OpenAI');
    return fallback;
  }
};

let _openai = null;
const getOpenAI = () => {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AppError('OPENAI_API_KEY no configurada', 503);
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
};

export const llamarOpenAI = async (prompt, systemPrompt = null, formatoJson = true) => {
  try {
    getOpenAI();
  } catch {
    return '¡Sigue así! Cada pequeño paso cuenta.';
  }

  try {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const response = await getOpenAI().chat.completions.create({
      model: LLM_MODEL,
      messages,
      temperature: 0.3,
      ...(formatoJson ? { response_format: { type: 'json_object' } } : {}),
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error('[ia] Error llamando OpenAI:', err.message);
    return '¡Sigue así! Cada pequeño paso cuenta.';
  }
};

// ─── HELPERS ──────────────────────────────────────────────

const obtenerOCrearCategoria = async (usuarioId, nombre) => {
  const { rows } = await pool.query(
    'SELECT id FROM categorias WHERE usuario_id = $1 AND LOWER(nombre) = LOWER($2)',
    [usuarioId, nombre]
  );
  if (rows.length > 0) return rows[0].id;

  const colors = ['#6366F1', '#8B5CF6', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444', '#EC4899'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const nueva = await tareasService.crearCategoria(usuarioId, nombre, color);
  return nueva.id;
};

// ─── FASE 1: NLP CREATION ────────────────────────────────

export const crearTareaNLP = async (usuarioId, texto) => {
  const prompt = prompts.PROMPT_CREAR_TAREA.replace('{texto}', texto);
  const respuesta = await llamarOpenAI(prompt, null, true);
  const datos = safeJsonParse(respuesta);

  let categoriaId = null;
  if (datos.categoria) {
    categoriaId = await obtenerOCrearCategoria(usuarioId, datos.categoria);
  }

  const tarea = await tareasService.crearTarea(usuarioId, {
    titulo: datos.titulo,
    descripcion: datos.descripcion || '',
    prioridad: datos.prioridad || 'media',
    fecha_limite: datos.fecha_limite || null,
    fecha_inicio: datos.fecha_inicio || null,
    duracion_minutos: datos.duracion_minutos || 30,
    categoria_id: categoriaId,
  });

  return tarea;
};

export const crearHabitoNLP = async (usuarioId, texto) => {
  const prompt = prompts.PROMPT_CREAR_HABITO.replace('{texto}', texto);
  const respuesta = await llamarOpenAI(prompt, null, true);
  const datos = safeJsonParse(respuesta);

  const habito = await habitosService.crearHabito(usuarioId, {
    titulo: datos.titulo,
    descripcion: datos.descripcion || '',
    frecuencia: datos.frecuencia || 'diario',
  });

  return habito;
};

export const crearEventoNLP = async (usuarioId, texto) => {
  const prompt = prompts.PROMPT_CREAR_EVENTO.replace('{texto}', texto);
  const respuesta = await llamarOpenAI(prompt, null, true);
  const datos = safeJsonParse(respuesta);

  const fechaInicio = new Date(datos.fecha_inicio);
  const horaInicio = fechaInicio.toTimeString().slice(0, 5);
  const fechaFin = new Date(fechaInicio.getTime() + (datos.duracion_minutos || 60) * 60000);
  const horaFin = fechaFin.toTimeString().slice(0, 5);

  const evento = await agendaService.crearBloque(usuarioId, {
    nombre: datos.titulo,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
  });

  return evento;
};

// ─── FASE 1: PRIORITIES ──────────────────────────────────

export const priorizarTareasDelDia = async (usuarioId) => {
  const hoy = new Date().toISOString().split('T')[0];
  const ahora = new Date().toTimeString().slice(0, 5);

  const [tareas, perfil] = await Promise.all([
    tareasService.obtenerAgendaDia(usuarioId, hoy),
    gamificacionService.obtenerPerfil(usuarioId),
  ]);

  if (tareas.length === 0) return [];

  const prompt = prompts.PROMPT_PRIORIDADES
    .replace('{nivel}', perfil.nivel)
    .replace('{racha}', perfil.racha_actual)
    .replace('{hora}', ahora)
    .replace('{tareas}', JSON.stringify(tareas, null, 2));

  const respuesta = await llamarOpenAI(prompt, null, true);
  const orden = safeJsonParse(respuesta, []);

  if (!Array.isArray(orden)) return tareas;

  return orden.map(item => {
    const tarea = tareas.find(t => t.id === item.id);
    return tarea ? { ...tarea, razon_prioridad: item.razon } : null;
  }).filter(Boolean);
};

export const generarResumen = async (usuarioId, tipo = 'diario') => {
  const cacheKey = `resumen:${usuarioId}:${tipo}:${new Date().toISOString().split('T')[0]}`;
  const cache = await obtenerCache(cacheKey);
  if (cache) return cache;

  if (tipo === 'diario') {
    const [dashboard, perfil] = await Promise.all([
      tareasService.obtenerEstadisticas(usuarioId),
      gamificacionService.obtenerPerfil(usuarioId),
    ]);

    const total = (dashboard.completadas || 0) + (dashboard.pendientes || 0) + (dashboard.en_progreso || 0);

    const prompt = prompts.PROMPT_RESUMEN_DIARIO
      .replace('{completadas}', dashboard.completadas || 0)
      .replace('{total}', total)
      .replace('{racha}', perfil.racha_actual || 0)
      .replace('{puntos}', perfil.puntos_totales || 0);

    const respuesta = await llamarOpenAI(prompt, null, false);
    const resultado = { resumen: respuesta, fecha: new Date().toISOString().split('T')[0] };
    await guardarCache(cacheKey, resultado, 3600);
    return resultado;
  }

  if (tipo === 'semanal') {
    const reporte = await analyticsService.generarReporte(usuarioId);
    const prompt = prompts.PROMPT_RESUMEN_SEMANAL.replace('{reporte}', JSON.stringify(reporte, null, 2));
    const respuesta = await llamarOpenAI(prompt, null, false);
    const resultado = { resumen: respuesta, fecha: new Date().toISOString().split('T')[0] };
    await guardarCache(cacheKey, resultado, 7200);
    return resultado;
  }
};

// ─── FASE 2: PREDICTIONS ─────────────────────────────────

export const predecirDuracion = async (usuarioId, tareaId) => {
  const tarea = await tareasService.obtenerTareaPorId(tareaId, usuarioId);
  if (!tarea) throw new Error('Tarea no encontrada');

  const { rows: historial } = await pool.query(
    `SELECT duracion_minutos, prioridad
     FROM tareas
     WHERE usuario_id = $1 AND estado = 'completada'
       AND (categoria_id = $2 OR $2 IS NULL)
       AND duracion_minutos IS NOT NULL
     ORDER BY actualizado_en DESC LIMIT 10`,
    [usuarioId, tarea.categoria_id]
  );

  if (historial.length >= 3) {
    const duraciones = historial.map(h => h.duracion_minutos);
    const promedio = duraciones.reduce((a, b) => a + b, 0) / duraciones.length;
    const min = Math.min(...duraciones);
    const max = Math.max(...duraciones);

    if (historial.length >= 5) {
      const prompt = prompts.PROMPT_PREDECIR_DURACION
        .replace('{tarea}', JSON.stringify(tarea, null, 2))
        .replace('{historial}', JSON.stringify(historial, null, 2));

      const respuesta = await llamarOpenAI(prompt, null, true);
      return safeJsonParse(respuesta, { duracion_estimada_minutos: tarea.duracion_minutos || 30, confianza: 'baja' });
    }

    return {
      duracion_estimada_minutos: Math.round(promedio),
      confianza: historial.length >= 5 ? 'alta' : 'media',
      rango: { min, max },
      razon: `Basado en ${historial.length} tareas similares anteriores`,
    };
  }

  return {
    duracion_estimada_minutos: tarea.duracion_minutos || 30,
    confianza: 'baja',
    rango: { min: 15, max: 120 },
    razon: 'No hay suficiente historial de tareas similares',
  };
};

export const optimizarAgenda = async (usuarioId) => {
  const hoy = new Date().toISOString().split('T')[0];

  const [tareasDelDia, bloques] = await Promise.all([
    tareasService.obtenerAgendaDia(usuarioId, hoy),
    agendaService.obtenerBloques(usuarioId),
  ]);

  const pendientes = tareasDelDia.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso');

  if (pendientes.length === 0) {
    return { mensaje: 'No hay tareas pendientes para hoy', data: [] };
  }

  const prompt = prompts.PROMPT_OPTIMIZAR_AGENDA
    .replace('{tareas}', JSON.stringify(pendientes, null, 2))
    .replace('{bloques}', JSON.stringify(bloques, null, 2));

  const respuesta = await llamarOpenAI(prompt, null, true);
  const orden = safeJsonParse(respuesta, []);

  if (!Array.isArray(orden)) return pendientes;

  const actualizadas = [];
  for (const item of orden) {
    const actualizada = await tareasService.actualizarTarea(item.id, usuarioId, {
      fecha_inicio: item.fecha_inicio,
      fecha_fin: new Date(new Date(item.fecha_inicio).getTime() + 30 * 60000).toISOString(),
    });
    if (actualizada) {
      actualizadas.push({ ...actualizada, razon: item.razon });
    }
  }

  return actualizadas;
};

// ─── FASE 3: RECOMMENDATIONS ─────────────────────────────

export const recomendarHabitos = async (usuarioId) => {
  const [habitos, tareas] = await Promise.all([
    habitosService.listarHabitos(usuarioId),
    tareasService.obtenerTareas(usuarioId),
  ]);

  const categoriasFrecuentes = [...new Set(tareas.map(t => t.categoria_nombre).filter(Boolean))];

  const prompt = prompts.PROMPT_RECOMENDAR_HABITOS
    .replace('{habitos}', JSON.stringify(habitos.map(h => h.titulo)))
    .replace('{categorias_frecuentes}', JSON.stringify(categoriasFrecuentes))
    .replace('{horas_productivas}', '—')
    .replace('{promedio_tareas}', '—');

  const respuesta = await llamarOpenAI(prompt, null, true);
  const sugerencias = safeJsonParse(respuesta, []);

  if (Array.isArray(sugerencias)) {
    for (const s of sugerencias) {
      await pool.query(
        `INSERT INTO sugerencias_ia (usuario_id, tipo, titulo, descripcion)
         VALUES ($1, 'habito', $2, $3)`,
        [usuarioId, s.titulo, s.descripcion]
      );
    }
  }

  return sugerencias;
};

export const sugerirRutina = async (usuarioId, objetivo = 'fuerza', nivel = 'principiante') => {
  const [historial, ejerciciosConocidos] = await Promise.all([
    gymService.obtenerEstadisticas(usuarioId),
    pool.query(
      `SELECT DISTINCT e.nombre, e.grupo_muscular
       FROM ejercicios e
       JOIN rutinas r ON e.rutina_id = r.id
       WHERE r.usuario_id = $1`,
      [usuarioId]
    ),
  ]);

  const prompt = prompts.PROMPT_SUGERIR_RUTINA
    .replace('{objetivo}', objetivo)
    .replace('{nivel}', nivel)
    .replace('{historial}', JSON.stringify(historial || {}))
    .replace('{ejercicios_conocidos}', JSON.stringify(ejerciciosConocidos.rows));

  const respuesta = await llamarOpenAI(prompt, null, true);
  const rutina = safeJsonParse(respuesta, { nombre: `Rutina ${objetivo}`, ejercicios: [] });

  const rutinaCreada = await gymService.crearRutina(usuarioId, {
    nombre: rutina.nombre || `Rutina ${objetivo}`,
    descripcion: rutina.descripcion || '',
    dificultad: rutina.dificultad || nivel,
  });

  const ejercicios = rutina.ejercicios || [];
  for (const ej of ejercicios) {
    await pool.query(
      `INSERT INTO ejercicios (rutina_id, nombre, grupo_muscular, series_default, repeticiones_default)
       VALUES ($1, $2, $3, $4, $5)`,
      [rutinaCreada.id, ej.nombre, ej.grupo_muscular, ej.series || 3, ej.repeticiones || 10]
    );
  }

  return { ...rutinaCreada, ejercicios };
};

export const recomendarAmigos = async (usuarioId) => {
  const { rows: info } = await pool.query('SELECT nombre FROM usuarios WHERE id = $1', [usuarioId]);
  const nombre = info[0]?.nombre || '';

  const { rows: amigosActuales } = await pool.query(
    `SELECT solicitante_id, receptor_id FROM amistades
     WHERE (solicitante_id = $1 OR receptor_id = $1) AND estado = 'aceptada'`,
    [usuarioId]
  );

  const idsExcluir = [usuarioId];
  amigosActuales.forEach(a => { idsExcluir.push(a.solicitante_id, a.receptor_id); });
  const placeholders = idsExcluir.map((_, i) => `$${i + 1}`).join(',');

  const { rows: potenciales } = await pool.query(
    `SELECT id, nombre FROM usuarios WHERE id NOT IN (${placeholders}) LIMIT 20`,
    idsExcluir
  );

  if (potenciales.length === 0) return [];

  const { rows: miPatron } = await pool.query(
    `SELECT COUNT(*) AS tareas_completadas,
            COUNT(DISTINCT DATE(actualizado_en)) AS dias_activos
     FROM tareas WHERE usuario_id = $1 AND estado = 'completada'
     AND actualizado_en >= NOW() - INTERVAL '30 days'`,
    [usuarioId]
  );

  const prompt = prompts.PROMPT_RECOMENDAR_AMIGOS
    .replace('{usuario_id}', usuarioId)
    .replace('{nombre}', nombre)
    .replace('{patron}', JSON.stringify(miPatron[0]))
    .replace('{potenciales}', JSON.stringify(potenciales));

  const respuesta = await llamarOpenAI(prompt, null, true);
  const recomendaciones = safeJsonParse(respuesta, []);

  if (!Array.isArray(recomendaciones)) return [];

  for (const r of recomendaciones) {
    await pool.query(
      `INSERT INTO sugerencias_ia (usuario_id, tipo, titulo, metadata)
       VALUES ($1, 'amigo', $2, $3)`,
      [usuarioId, `Conectar con usuario #${r.usuario_id}`, JSON.stringify(r)]
    );
  }

  return recomendaciones;
};

export const recomendarProyectos = async (usuarioId) => {
  const { rows: proyectos } = await pool.query(
    `SELECT p.id, p.nombre FROM proyectos p
     WHERE p.creador_id != $1
       AND p.id NOT IN (SELECT proyecto_id FROM proyecto_miembros WHERE usuario_id = $1)
     LIMIT 10`,
    [usuarioId]
  );

  return proyectos;
};

export const sugerirLogro = async (usuarioId) => {
  const perfil = await gamificacionService.obtenerPerfil(usuarioId);
  const logros = await gamificacionService.obtenerLogrosUsuario(usuarioId);

  const prompt = prompts.PROMPT_LOGRO_PERSONALIZADO
    .replace('{datos}', JSON.stringify({ perfil, logros_existentes: logros.length }, null, 2));

  const respuesta = await llamarOpenAI(prompt, null, true);
  const logro = safeJsonParse(respuesta, { titulo: 'Nuevo logro', descripcion: '' });

  await pool.query(
    `INSERT INTO sugerencias_ia (usuario_id, tipo, titulo, descripcion, metadata)
     VALUES ($1, 'logro', $2, $3, $4)`,
    [usuarioId, logro.titulo, logro.descripcion, JSON.stringify(logro)]
  );

  return logro;
};

// ─── FASE 4: PATTERNS & ANOMALIES ────────────────────────

export const analizarPatrones = async (usuarioId) => {
  const cacheKey = `patrones:${usuarioId}:${new Date().toISOString().split('T')[0]}`;
  const cache = await obtenerCache(cacheKey);
  if (cache) return cache;

  const [semanal, porDia, categorias, racha, dashboard] = await Promise.all([
    analyticsService.obtenerProductividadSemanal(usuarioId),
    analyticsService.obtenerProductividadPorDia(usuarioId),
    analyticsService.obtenerTareasPorCategoria(usuarioId),
    analyticsService.obtenerRacha(usuarioId),
    analyticsService.obtenerDashboard(usuarioId),
  ]);

  const datos = { productividad_semanal: semanal, productividad_por_dia: porDia, categorias, racha, dashboard };

  const prompt = prompts.PROMPT_PATRONES.replace('{datos}', JSON.stringify(datos, null, 2));
  const respuesta = await llamarOpenAI(prompt, null, true);
  const resultado = safeJsonParse(respuesta, {});

  await pool.query(
    `INSERT INTO analisis_ia (usuario_id, tipo, entrada, resultado, modelo)
     VALUES ($1, 'patrones', $2, $3, $4)`,
    [usuarioId, JSON.stringify(datos), JSON.stringify(resultado), LLM_MODEL]
  );

  await guardarCache(cacheKey, resultado, 86400);
  return resultado;
};

export const detectarAnomalias = async (usuarioId) => {
  const { rows: reciente } = await pool.query(
    `SELECT DATE(actualizado_en) AS fecha, COUNT(*) AS completadas
     FROM tareas WHERE usuario_id = $1 AND estado = 'completada'
     AND actualizado_en >= NOW() - INTERVAL '14 days'
     GROUP BY DATE(actualizado_en) ORDER BY fecha`,
    [usuarioId]
  );

  const { rows: historico } = await pool.query(
    `SELECT DATE(actualizado_en) AS fecha, COUNT(*) AS completadas
     FROM tareas WHERE usuario_id = $1 AND estado = 'completada'
     AND actualizado_en >= NOW() - INTERVAL '60 days'
     GROUP BY DATE(actualizado_en) ORDER BY fecha`,
    [usuarioId]
  );

  const prompt = prompts.PROMPT_ANOMALIAS
    .replace('{datos}', JSON.stringify({ ultimos_14_dias: reciente, ultimos_60_dias: historico }, null, 2));

  const respuesta = await llamarOpenAI(prompt, null, true);
  const resultado = safeJsonParse(respuesta, {});

  await pool.query(
    `INSERT INTO analisis_ia (usuario_id, tipo, entrada, resultado, modelo)
     VALUES ($1, 'anomalias', $2, $3, $4)`,
    [usuarioId, JSON.stringify({ reciente, historico }), JSON.stringify(resultado), 'gpt-4o-mini']
  );

  return resultado;
};

export const detectarSobrecarga = async (usuarioId) => {
  const [estadisticas, tareas] = await Promise.all([
    tareasService.obtenerEstadisticas(usuarioId),
    tareasService.obtenerTareas(usuarioId, { estado: 'pendiente' }),
  ]);

  const { rows } = await pool.query(
    `SELECT COUNT(*)::float / 7 AS promedio_diario
     FROM tareas WHERE usuario_id = $1 AND estado = 'completada'
     AND actualizado_en >= NOW() - INTERVAL '7 days'`,
    [usuarioId]
  );

  const promedioDiario = rows[0]?.promedio_diario || 2;
  const pendientes = tareas.filter(t => t.estado === 'pendiente').length;
  const vencidas = estadisticas.vencidas || 0;

  const fechas = tareas.filter(t => t.fecha_limite).map(t => new Date(t.fecha_limite));
  const diasDisponibles = fechas.length > 0
    ? Math.ceil((Math.min(...fechas) - new Date()) / (1000 * 60 * 60 * 24))
    : 7;

  const prompt = prompts.PROMPT_SOBRECARGA
    .replace('{pendientes}', pendientes)
    .replace('{vencidas}', vencidas)
    .replace('{promedio_completadas}', promedioDiario.toFixed(1))
    .replace('{dias_disponibles}', Math.max(1, diasDisponibles));

  const respuesta = await llamarOpenAI(prompt, null, true);
  return safeJsonParse(respuesta, { sobrecarga: false, recomendacion: 'No se pudo analizar' });
};

export const obtenerHistorialChat = async (usuarioId, sessionId = 'default') => {
  const { rows } = await pool.query(
    `SELECT id, mensaje, respuesta, herramientas_usadas, tokens_usados, creado_en
     FROM conversaciones_ia
     WHERE usuario_id = $1
     ORDER BY creado_en DESC
     LIMIT 50`,
    [usuarioId]
  );
  return rows;
};
