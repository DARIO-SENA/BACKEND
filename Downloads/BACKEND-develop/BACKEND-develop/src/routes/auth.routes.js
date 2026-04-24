import { Router } from 'express';
import { registrar, iniciarSesion } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', registrar);
router.post('/login',    iniciarSesion);

export { router as authRouter };