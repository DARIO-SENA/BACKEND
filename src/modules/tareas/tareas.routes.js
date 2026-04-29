import express from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './tareas.controller.js';

const router = express.Router();

router.use(verificarToken);

router.get('/',             ctrl.obtenerTareas);
router.get('/:id',          ctrl.obtenerTareaPorId);
router.post('/',            ctrl.crearTarea);
router.put('/:id',          ctrl.actualizarTarea);
router.delete('/:id',       ctrl.eliminarTarea);
router.patch('/:id/estado', ctrl.cambiarEstado);

export { router as tareasRouter };