import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './metas.controller.js';

const router = Router();
router.use(verificarToken);

/**
 * @openapi
 * /api/metas:
 *   post:
 *     tags: [Metas/OKRs]
 *     summary: Crear una nueva meta
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo]
 *             properties:
 *               titulo: { type: string }
 *               descripcion: { type: string }
 *               categoria: { type: string, default: personal }
 *               fecha_inicio: { type: string, format: date }
 *               fecha_fin: { type: string, format: date }
 *               es_borrador: { type: boolean, default: false }
 *     responses:
 *       201: { description: Meta creada }
 *   get:
 *     tags: [Metas/OKRs]
 *     summary: Listar metas
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema: { type: string }
 *       - in: query
 *         name: categoria
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lista de metas }
 */
router.post('/', ctrl.crearMeta);
router.get('/', ctrl.obtenerMetas);

/**
 * @openapi
 * /api/metas/dashboard:
 *   get:
 *     tags: [Metas/OKRs]
 *     summary: Dashboard de metas
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard }
 */
router.get('/dashboard', ctrl.obtenerDashboard);

/**
 * @openapi
 * /api/metas/timeline:
 *   get:
 *     tags: [Metas/OKRs]
 *     summary: Timeline de metas agrupadas por mes
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Timeline }
 */
router.get('/timeline', ctrl.obtenerTimeline);

/**
 * @openapi
 * /api/metas/{id}:
 *   get:
 *     tags: [Metas/OKRs]
 *     summary: Obtener meta por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Meta }
 *   put:
 *     tags: [Metas/OKRs]
 *     summary: Actualizar meta
 *     security: [{ bearerAuth: [] }]
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
 *               descripcion: { type: string }
 *               categoria: { type: string }
 *               fecha_inicio: { type: string, format: date }
 *               fecha_fin: { type: string, format: date }
 *               estado: { type: string, enum: [en_progreso, completada, cancelada] }
 *               es_borrador: { type: boolean }
 *     responses:
 *       200: { description: Meta actualizada }
 *   delete:
 *     tags: [Metas/OKRs]
 *     summary: Eliminar meta
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Meta eliminada }
 */
router.get('/:id', ctrl.obtenerMetaPorId);
router.put('/:id', ctrl.actualizarMeta);
router.delete('/:id', ctrl.eliminarMeta);

/**
 * @openapi
 * /api/metas/{metaId}/krs:
 *   post:
 *     tags: [Metas/OKRs]
 *     summary: Crear Key Result en una meta
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: metaId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo]
 *             properties:
 *               titulo: { type: string }
 *               descripcion: { type: string }
 *               orden: { type: integer }
 *     responses:
 *       201: { description: KR creado }
 *   get:
 *     tags: [Metas/OKRs]
 *     summary: Listar KRs de una meta
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: metaId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de KRs }
 */
router.post('/plan-semanal', ctrl.planSemanal);
router.post('/:metaId/krs', ctrl.crearKeyResult);
router.get('/:metaId/krs', ctrl.obtenerKeyResults);

/**
 * @openapi
 * /api/metas/{metaId}/krs/{krId}:
 *   put:
 *     tags: [Metas/OKRs]
 *     summary: Actualizar Key Result
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: metaId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: krId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo: { type: string }
 *               descripcion: { type: string }
 *               progreso: { type: number }
 *               orden: { type: integer }
 *     responses:
 *       200: { description: KR actualizado }
 */
router.put('/:metaId/krs/:krId', ctrl.actualizarKeyResult);

/**
 * @openapi
 * /api/metas/{metaId}/krs/{krId}/progreso:
 *   patch:
 *     tags: [Metas/OKRs]
 *     summary: Actualizar progreso de un KR y recalcular meta
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: metaId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: krId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [progreso]
 *             properties:
 *               progreso: { type: number, minimum: 0, maximum: 100 }
 *     responses:
 *       200: { description: Progreso actualizado }
 */
router.patch('/:metaId/krs/:krId/progreso', ctrl.actualizarProgresoKR);

/**
 * @openapi
 * /api/metas/{metaId}/descomponer-ia:
 *   post:
 *     tags: [Metas/OKRs]
 *     summary: Descomponer meta en KRs usando IA
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: metaId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Meta descompuesta }
 */
router.post('/:metaId/descomponer-ia', ctrl.descomponerConIA);

/**
 * @openapi
 * /api/metas/plan-semanal:
 *   post:
 *     tags: [Metas/OKRs]
 *     summary: Generar plan semanal de tareas desde una meta
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [metaId]
 *             properties:
 *               metaId: { type: integer }
 *               fecha_fin: { type: string, format: date }
 *     responses:
 *       201: { description: Tareas creadas }
 */
export { router as metasRouter };
