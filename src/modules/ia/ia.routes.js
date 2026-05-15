import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './ia.controller.js';

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { ok: false, error: 'Demasiadas solicitudes al chat. Intenta de nuevo en 1 minuto' },
  standardHeaders: true,
  legacyHeaders: false,
});

const nlpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3,
  message: { ok: false, error: 'Demasiadas solicitudes de creación. Intenta de nuevo en 1 minuto' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();
router.use(verificarToken);

// ─── FASE 1: NLP CREATION ────────────────────────────

/**
 * @openapi
 * /api/ia/crear-tarea:
 *   post:
 *     tags: [IA - NLP Creation]
 *     summary: Crear una tarea mediante lenguaje natural
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [texto]
 *             properties:
 *               texto:
 *                 type: string
 *                 example: "Comprar víveres mañana a las 10am, prioridad alta"
 *     responses:
 *       201:
 *         description: Tarea creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean }
 *                 data: { type: object }
 *                 creado_con_ia: { type: boolean }
 *       400:
 *         description: Texto requerido
 *       500:
 *         description: Error del servidor
 */
router.post('/crear-tarea',  nlpLimiter, ctrl.crearTareaNLP);

/**
 * @openapi
 * /api/ia/crear-habito:
 *   post:
 *     tags: [IA - NLP Creation]
 *     summary: Crear un hábito mediante lenguaje natural
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [texto]
 *             properties:
 *               texto:
 *                 type: string
 *                 example: "Quiero meditar todos los días después de cenar"
 *     responses:
 *       201:
 *         description: Hábito creado
 *       400:
 *         description: Texto requerido
 *       500:
 *         description: Error del servidor
 */
router.post('/crear-habito', nlpLimiter, ctrl.crearHabitoNLP);

/**
 * @openapi
 * /api/ia/crear-evento:
 *   post:
 *     tags: [IA - NLP Creation]
 *     summary: Crear un evento de agenda mediante lenguaje natural
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [texto]
 *             properties:
 *               texto:
 *                 type: string
 *                 example: "Reunión de equipo el viernes a las 3pm por 1 hora"
 *     responses:
 *       201:
 *         description: Evento creado
 *       400:
 *         description: Texto requerido
 *       500:
 *         description: Error del servidor
 */
router.post('/crear-evento', nlpLimiter, ctrl.crearEventoNLP);

// ─── FASE 1: CHAT & PRIORITIES ───────────────────────

/**
 * @openapi
 * /api/ia/chat:
 *   post:
 *     tags: [IA - Chat & Priorities]
 *     summary: Conversar con el asistente IA (DARIO)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mensaje]
 *             properties:
 *               mensaje:
 *                 type: string
 *                 example: "¿Qué tengo que hacer hoy?"
 *               session_id:
 *                 type: string
 *                 example: "sesion-123"
 *     responses:
 *       200:
 *         description: Respuesta del asistente
 *       400:
 *         description: Mensaje requerido
 *       500:
 *         description: Error del servidor
 */
router.post('/chat',            chatLimiter, ctrl.chat);

/**
 * @openapi
 * /api/ia/hoy-prioridades:
 *   get:
 *     tags: [IA - Chat & Priorities]
 *     summary: Obtener tareas del día ordenadas por prioridad con IA
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Tareas priorizadas
 *       500:
 *         description: Error del servidor
 */
router.get('/hoy-prioridades',  ctrl.prioridadesDelDia);

/**
 * @openapi
 * /api/ia/resumen:
 *   get:
 *     tags: [IA - Chat & Priorities]
 *     summary: Generar resumen diario o semanal con IA
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [diario, semanal]
 *           default: diario
 *         description: Tipo de resumen
 *     responses:
 *       200:
 *         description: Resumen generado
 *       500:
 *         description: Error del servidor
 */
router.get('/resumen',           ctrl.resumen);

// ─── FASE 2: PREDICTIONS & OPTIMIZATION ──────────────

/**
 * @openapi
 * /api/ia/predecir-duracion:
 *   get:
 *     tags: [IA - Predictions & Optimization]
 *     summary: Predecir la duración estimada de una tarea basado en historial
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: tarea_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Duración estimada
 *       400:
 *         description: tarea_id requerido
 *       500:
 *         description: Error del servidor
 */
router.get('/predecir-duracion', ctrl.predecirDuracion);

/**
 * @openapi
 * /api/ia/optimizar-agenda:
 *   post:
 *     tags: [IA - Predictions & Optimization]
 *     summary: Optimizar la agenda del día reordenando tareas con IA
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Agenda optimizada
 *       500:
 *         description: Error del servidor
 */
router.post('/optimizar-agenda', nlpLimiter, ctrl.optimizarAgenda);

// ─── FASE 3: RECOMMENDATIONS ─────────────────────────

/**
 * @openapi
 * /api/ia/recomendar-habitos:
 *   get:
 *     tags: [IA - Recommendations]
 *     summary: Recomendar nuevos hábitos basados en el perfil del usuario
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Hábitos recomendados
 *       500:
 *         description: Error del servidor
 */
router.get('/recomendar-habitos',  ctrl.recomendarHabitos);

/**
 * @openapi
 * /api/ia/sugerir-rutina:
 *   post:
 *     tags: [IA - Recommendations]
 *     summary: Sugerir una rutina de ejercicios personalizada con IA
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               objetivo:
 *                 type: string
 *                 enum: [fuerza, hipertrofia, resistencia]
 *                 default: fuerza
 *               nivel:
 *                 type: string
 *                 enum: [principiante, intermedio, avanzado]
 *                 default: principiante
 *     responses:
 *       201:
 *         description: Rutina creada
 *       500:
 *         description: Error del servidor
 */
router.post('/sugerir-rutina',     nlpLimiter, ctrl.sugerirRutina);

/**
 * @openapi
 * /api/ia/recomendar-amigos:
 *   get:
 *     tags: [IA - Recommendations]
 *     summary: Recomendar amigos compatibles basado en patrones de productividad
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Amigos recomendados
 *       500:
 *         description: Error del servidor
 */
router.get('/recomendar-amigos',   ctrl.recomendarAmigos);

/**
 * @openapi
 * /api/ia/recomendar-proyectos:
 *   get:
 *     tags: [IA - Recommendations]
 *     summary: Recomendar proyectos colaborativos disponibles
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Proyectos recomendados
 *       500:
 *         description: Error del servidor
 */
router.get('/recomendar-proyectos', ctrl.recomendarProyectos);

/**
 * @openapi
 * /api/ia/sugerir-logro:
 *   post:
 *     tags: [IA - Recommendations]
 *     summary: Sugerir un logro personalizado basado en el comportamiento del usuario
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Logro sugerido
 *       500:
 *         description: Error del servidor
 */
router.post('/sugerir-logro',      ctrl.sugerirLogro);

// ─── FASE 4: PATTERNS & ANOMALIES ────────────────────

/**
 * @openapi
 * /api/ia/patrones:
 *   get:
 *     tags: [IA - Patterns & Anomalies]
 *     summary: Analizar patrones de productividad de los últimos 30 días
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Patrones encontrados
 *       500:
 *         description: Error del servidor
 */
router.get('/patrones',   ctrl.patrones);

/**
 * @openapi
 * /api/ia/anomalias:
 *   get:
 *     tags: [IA - Patterns & Anomalies]
 *     summary: Detectar anomalías en el comportamiento del usuario
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Anomalías detectadas
 *       500:
 *         description: Error del servidor
 */
router.get('/anomalias',  ctrl.anomalias);

/**
 * @openapi
 * /api/ia/sobrecarga:
 *   get:
 *     tags: [IA - Patterns & Anomalies]
 *     summary: Evaluar si el usuario está sobrecargado de trabajo
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Evaluación de sobrecarga
 *       500:
 *         description: Error del servidor
 */
router.get('/sobrecarga', ctrl.sobrecarga);

export { router as iaRouter };
