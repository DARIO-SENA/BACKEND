import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './lectura.controller.js';

const router = Router();
router.use(verificarToken);

router.get('/init', ctrl.initTables);
router.get('/dashboard', ctrl.dashboard);
router.get('/stats', ctrl.stats);

// Timer
router.post('/timer/iniciar', ctrl.iniciarTimer);
router.post('/timer/detener', ctrl.detenerTimer);
router.post('/timer/pausar', ctrl.pausarTimer);
router.post('/timer/reanudar', ctrl.reanudarTimer);
router.get('/timer/estado', ctrl.timerEstado);

// Libros
router.get('/libros', ctrl.listarLibros);
router.post('/libros', ctrl.crearLibro);
router.get('/libros/:id', ctrl.obtenerLibro);
router.put('/libros/:id', ctrl.actualizarLibro);
router.delete('/libros/:id', ctrl.eliminarLibro);

// Notas y citas por libro
router.get('/libros/:libroId/notas', ctrl.obtenerNotas);
router.put('/libros/:libroId/notas', ctrl.guardarNotas);
router.post('/libros/:libroId/citas', ctrl.agregarCita);
router.delete('/libros/:libroId/citas/:citaId', ctrl.eliminarCita);

// Registros
router.get('/libros/:libroId/registros', ctrl.listarRegistros);
router.post('/libros/:libroId/registros', ctrl.crearRegistro);
router.delete('/libros/:libroId/registros/:id', ctrl.eliminarRegistro);

router.post('/registros/toggle', ctrl.toggleDia);

// Planes
router.get('/planes', ctrl.listarPlanes);
router.post('/planes', ctrl.crearPlan);
router.get('/planes/:id', ctrl.detallePlan);
router.put('/planes/:id', ctrl.actualizarPlan);
router.post('/planes/:id/recalcular', ctrl.recalcularPlan);
router.delete('/planes/:id', ctrl.eliminarPlan);

// Metas de lectura
router.get('/metas', ctrl.listarMetas);
router.post('/metas', ctrl.crearMeta);
router.delete('/metas/:id', ctrl.eliminarMeta);
router.post('/metas/recalcular', ctrl.recalcularMetas);

export { router as lecturaRouter };
