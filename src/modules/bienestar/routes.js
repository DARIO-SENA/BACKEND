import { Router } from "express";
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
} from "./controller.js";

const router = Router();

/**
 * @openapi
 * /api/bienestar/checkin:
 *   post:
 *     tags: [Check-in]
 *     summary: Crear o actualizar check-in emocional del día
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario_id, estado_animo]
 *             properties:
 *               usuario_id: { type: integer }
 *               estado_animo: { type: string }
 *               energia: { type: integer, minimum: 1, maximum: 10 }
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
 *     tags: [Check-in]
 *     summary: Obtener check-in de hoy
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Check-in del día }
 *       404: { description: No hay check-in hoy }
 */
router.get("/checkin/hoy", getCheckinHoy);

/**
 * @openapi
 * /api/bienestar/checkin/historial:
 *   get:
 *     tags: [Check-in]
 *     summary: Historial de check-ins
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         required: true
 *         schema: { type: integer }
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
 *     tags: [Check-in]
 *     summary: Actualizar check-in de hoy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario_id]
 *             properties:
 *               usuario_id: { type: integer }
 *               estado_animo: { type: string }
 *               energia: { type: integer }
 *               sueno_horas: { type: number }
 *               notas: { type: string }
 *     responses:
 *       200: { description: Check-in actualizado }
 *       404: { description: No hay check-in hoy }
 */
router.put("/checkin/hoy", updateCheckinHoy);

/**
 * @openapi
 * /api/bienestar/estadisticas:
 *   get:
 *     tags: [Estadísticas]
 *     summary: Obtener estadísticas de check-ins
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Estadísticas con tendencia }
 */
router.get("/estadisticas", getEstadisticas);

/**
 * @openapi
 * /api/bienestar/diario:
 *   post:
 *     tags: [Diario]
 *     summary: Crear entrada en diario personal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario_id, contenido]
 *             properties:
 *               usuario_id: { type: integer }
 *               titulo: { type: string }
 *               contenido: { type: string }
 *               etiquetas: { type: array, items: { type: string } }
 *               es_publico: { type: boolean }
 *     responses:
 *       201: { description: Entrada creada }
 */
router.post("/diario", createDiario);

/**
 * @openapi
 * /api/bienestar/diario:
 *   get:
 *     tags: [Diario]
 *     summary: Listar entradas del diario (paginado)
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: pagina
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limite
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Entradas paginadas }
 */
router.get("/diario", listDiario);

/**
 * @openapi
 * /api/bienestar/diario/aleatorio:
 *   get:
 *     tags: [Diario]
 *     summary: Obtener entrada aleatoria del diario
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Entrada aleatoria }
 *       404: { description: No hay entradas }
 */
router.get("/diario/aleatorio", getDiarioAleatorio);

/**
 * @openapi
 * /api/bienestar/diario/{id}:
 *   get:
 *     tags: [Diario]
 *     summary: Obtener entrada por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Entrada encontrada }
 *       404: { description: No encontrada }
 */
router.get("/diario/:id", getDiario);

/**
 * @openapi
 * /api/bienestar/diario/{id}:
 *   put:
 *     tags: [Diario]
 *     summary: Actualizar entrada del diario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
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
 *       404: { description: No encontrada }
 */
router.put("/diario/:id", updateDiario);

/**
 * @openapi
 * /api/bienestar/diario/{id}:
 *   delete:
 *     tags: [Diario]
 *     summary: Eliminar entrada del diario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Eliminada }
 *       404: { description: No encontrada }
 */
router.delete("/diario/:id", deleteDiario);

/**
 * @openapi
 * /api/bienestar/insights:
 *   get:
 *     tags: [Insights]
 *     summary: Obtener insights basados en check-ins
 *     parameters:
 *       - in: query
 *         name: usuario_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Insights con observaciones }
 */
router.get("/insights", getInsights);

/**
 * @openapi
 * /api/bienestar/pausa/programar:
 *   post:
 *     tags: [Pausas]
 *     summary: Programar una pausa activa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario_id, ejercicio, duracion_minutos]
 *             properties:
 *               usuario_id: { type: integer }
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
 *     tags: [Pausas]
 *     summary: Listar ejercicios disponibles para pausas activas
 *     responses:
 *       200: { description: Lista de ejercicios }
 */
router.get("/pausa/ejercicios", listEjercicios);

/**
 * @openapi
 * /api/bienestar/pausa/completar:
 *   post:
 *     tags: [Pausas]
 *     summary: Marcar pausa como completada
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
 *       404: { description: Pausa no encontrada }
 */
router.post("/pausa/completar", completarPausa);

export default router;
