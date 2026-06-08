import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './auth.controller.js';

const router = Router();

router.post('/register', ctrl.registrar);
router.post('/login',    ctrl.iniciarSesion);
router.get('/me',        verificarToken, ctrl.obtenerPerfil);

export { router as authRouter };