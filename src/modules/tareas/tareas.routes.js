import express from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './tareas.controller.js';

const router = express.Router();

router.use(verificarToken);

router.get('/estadisticas',  ctrl.obtenerEstadisticas);
router.get('/agenda',        ctrl.obtenerAgendaDia);

router.get('/categorias',    ctrl.obtenerCategorias);
router.post('/categorias',   ctrl.crearCategoria);
router.put('/categorias/:id', ctrl.actualizarCategoria);
router.delete('/categorias/:id', ctrl.eliminarCategoria);

router.get('/',             ctrl.obtenerTareas);
router.get('/:id',          ctrl.obtenerTareaPorId);
router.post('/',            ctrl.crearTarea);
router.put('/:id',          ctrl.actualizarTarea);
router.delete('/',          ctrl.eliminarTodas);
router.delete('/:id',       ctrl.eliminarTarea);
router.patch('/:id/estado', ctrl.cambiarEstado);
router.post('/programar',   ctrl.programarTarea);

export { router as tareasRouter };