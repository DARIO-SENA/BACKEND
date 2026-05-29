import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './rutina.controller.js';

const router = Router();

router.use(verificarToken);

router.get('/dia',          ctrl.obtenerDia);
router.get('/semana',       ctrl.obtenerSemana);
router.post('/habitos/toggle', ctrl.toggleHabito);

router.get('/plantillas',      ctrl.obtenerPlantillas);
router.post('/plantillas',     ctrl.guardarPlantilla);
router.delete('/plantillas/:diaSemana', ctrl.eliminarPlantilla);
router.post('/aplicar-semana', ctrl.aplicarSemana);
router.post('/limpiar-semana', ctrl.limpiarSemana);

router.delete('/plantillas/bloques',       ctrl.eliminarTodosBloquesPlantilla);
router.delete('/plantillas/bloques/:id',   ctrl.eliminarBloquePlantilla);

export { router as rutinaRouter };
