import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './lectura.controller.js';

const router = Router();
router.use(verificarToken);

router.get('/init', ctrl.initTables);
router.get('/dashboard', ctrl.dashboard);

router.get('/libros', ctrl.listarLibros);
router.post('/libros', ctrl.crearLibro);
router.get('/libros/:id', ctrl.obtenerLibro);
router.put('/libros/:id', ctrl.actualizarLibro);
router.delete('/libros/:id', ctrl.eliminarLibro);

router.get('/libros/:libroId/registros', ctrl.listarRegistros);
router.post('/libros/:libroId/registros', ctrl.crearRegistro);
router.delete('/libros/:libroId/registros/:id', ctrl.eliminarRegistro);

router.post('/registros/toggle', ctrl.toggleDia);

router.get('/planes', ctrl.listarPlanes);
router.post('/planes', ctrl.crearPlan);
router.get('/planes/:id', ctrl.detallePlan);
router.put('/planes/:id', ctrl.actualizarPlan);
router.delete('/planes/:id', ctrl.eliminarPlan);

export { router as lecturaRouter };
