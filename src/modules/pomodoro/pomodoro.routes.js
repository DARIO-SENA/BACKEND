import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './pomodoro.controller.js';

const router = Router();
router.use(verificarToken);

router.get('/settings',        ctrl.obtenerSettings);
router.put('/settings',        ctrl.actualizarSettings);

router.post('/sessions',       ctrl.iniciarSession);
router.get('/sessions',        ctrl.listarSessions);
router.patch('/sessions/:id/completar',    ctrl.completarSession);
router.patch('/sessions/:id/interrumpir',  ctrl.interrumpirSession);

router.get('/estadisticas',    ctrl.estadisticas);
router.get('/tareas-sugeridas', ctrl.tareasSugeridas);

export { router as pomodoroRouter };
