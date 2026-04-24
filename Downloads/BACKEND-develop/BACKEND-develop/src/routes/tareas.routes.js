import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/tareas.controller.js';

const router = express.Router();

// 🔐 proteger todas las rutas
router.use(verificarToken);

// 📋 CRUD tareas
router.get('/',             ctrl.obtenerTareas);
router.get('/:id',          ctrl.obtenerTareaPorId);
router.post('/',            ctrl.crearTarea);
router.put('/:id',          ctrl.actualizarTarea);
router.delete('/:id',       ctrl.eliminarTarea);
router.patch('/:id/estado', ctrl.cambiarEstado);

export { router as tareasRouter };