import { Router } from 'express';
import multer from 'multer';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './auth.controller.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.post('/register', ctrl.registrar);
router.post('/login',    ctrl.iniciarSesion);
router.post('/google',   ctrl.autenticarConGoogle);
router.get('/me',        verificarToken, ctrl.obtenerPerfil);
router.put('/perfil',    verificarToken, upload.single('avatar'), ctrl.actualizarPerfil);

export { router as authRouter };