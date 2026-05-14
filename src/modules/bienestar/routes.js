import { Router } from "express";
import { verificarToken } from "../../middlewares/auth.middleware.js";
import {
  createCheckin,
  getCheckinHoy,
  getHistorial,
  updateCheckinHoy,
  getEstadisticas,
  createDiario,
  listDiario,
  getDiario,
  updateDiario,
  deleteDiario,
  getDiarioAleatorio,
  getInsights,
  programarPausa,
  listEjercicios,
  completarPausa,
  healthCheck,
} from "./controller.js";

const router = Router();

/**
 * @openapi
 * /api/bienestar/health:
 *   get:
 *     tags: [Bienestar]
 *     summary: Health check del servidor
 *     responses:
 *       200: { description: Estado del servidor }
 */
router.get("/health", healthCheck);

router.use(verificarToken);

/**
 * @openapi
 * /api/bienestar/checkin:
 *   post:
 *     tags: [Bienestar]
 *     summary: Crear o actualizar check-in emocional del día
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado_animo]
 *             properties:
 *               estado_animo: { type: string }
 *               energia: { type: integer }
 *               sueno_horas: { type: number }
 *               notas: { type: string }
 *     responses:
 *       201: { description: Check-in creado/actualizado }
 */
router.post("/checkin", createCheckin);

/**
 * @openapi
 * /api/bienestar/checkin/hoy:
 *   get:
 *     tags: [Bienestar]
 *     summary: Obtener check-in de hoy
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Check-in del día }
 *       404: { description: No hay check-in hoy }
 */
router.get("/checkin/hoy", getCheckinHoy);

/**
 * @openapi
 * /api/bienestar/checkin/historial:
 *   get:
 *     tags: [Bienestar]
 *     summary: Historial de check-ins
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema: { type: integer, default: 30 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: Lista de check-ins }
 */
router.get("/checkin/historial", getHistorial);

/**
 * @openapi
 * /api/bienestar/checkin/hoy:
 *   put:
 *     tags: [Bienestar]
 *     summary: Actualizar check-in de hoy
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado_animo: { type: string }
 *               energia: { type: integer }
 *               sueno_horas: { type: number }
 *               notas: { type: string }
 *     responses:
 *       200: { description: Check-in actualizado }
 */
router.put("/checkin/hoy", updateCheckinHoy);

/**
 * @openapi
 * /api/bienestar/estadisticas:
 *   get:
 *     tags: [Bienestar]
 *     summary: Estadísticas de check-ins
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Estadísticas y tendencia }
 */
router.get("/estadisticas", getEstadisticas);

/**
 * @openapi
 * /api/bienestar/diario:
 *   post:
 *     tags: [Bienestar]
 *     summary: Crear entrada en el diario
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contenido]
 *             properties:
 *               titulo: { type: string }
 *               contenido: { type: string }
 *               etiquetas: { type: array, items: { type: string } }
 *               es_publico: { type: boolean }
 *     responses:
 *       201: { description: Entrada creada }
 *   get:
 *     tags: [Bienestar]
 *     summary: Listar entradas del diario
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limite
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Lista de entradas }
 */
router.post("/diario", createDiario);
router.get("/diario", listDiario);
router.get("/diario/aleatorio", getDiarioAleatorio);

/**
 * @openapi
 * /api/bienestar/diario/{id}:
 *   get:
 *     tags: [Bienestar]
 *     summary: Obtener entrada del diario
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Entrada del diario }
 *   put:
 *     tags: [Bienestar]
 *     summary: Actualizar entrada del diario
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo: { type: string }
 *               contenido: { type: string }
 *               etiquetas: { type: array, items: { type: string } }
 *               es_publico: { type: boolean }
 *     responses:
 *       200: { description: Entrada actualizada }
 *   delete:
 *     tags: [Bienestar]
 *     summary: Eliminar entrada del diario
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Entrada eliminada }
 */
router.get("/diario/:id", getDiario);
router.put("/diario/:id", updateDiario);
router.delete("/diario/:id", deleteDiario);

/**
 * @openapi
 * /api/bienestar/insights:
 *   get:
 *     tags: [Bienestar]
 *     summary: Insights de bienestar
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Insights generados }
 */
router.get("/insights", getInsights);

/**
 * @openapi
 * /api/bienestar/pausa/programar:
 *   post:
 *     tags: [Bienestar]
 *     summary: Programar pausa activa
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ejercicio, duracion_minutos]
 *             properties:
 *               ejercicio: { type: string }
 *               duracion_minutos: { type: integer }
 *               programada_para: { type: string, format: date-time }
 *     responses:
 *       201: { description: Pausa programada }
 */
router.post("/pausa/programar", programarPausa);

/**
 * @openapi
 * /api/bienestar/pausa/ejercicios:
 *   get:
 *     tags: [Bienestar]
 *     summary: Listar ejercicios de pausa activa
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de ejercicios }
 */
router.get("/pausa/ejercicios", listEjercicios);

/**
 * @openapi
 * /api/bienestar/pausa/completar:
 *   post:
 *     tags: [Bienestar]
 *     summary: Marcar pausa como completada
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: integer }
 *     responses:
 *       200: { description: Pausa completada }
 */
router.post("/pausa/completar", completarPausa);

export { router as bienestarRouter };
