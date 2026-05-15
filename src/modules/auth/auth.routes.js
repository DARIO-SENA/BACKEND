import { Router } from 'express';
import * as ctrl from './auth.controller.js';

const router = Router();

router.post('/register', ctrl.registrar);
router.post('/login',    ctrl.iniciarSesion);

export { router as authRouter };