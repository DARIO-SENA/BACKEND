import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './auth.controller.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(null, ok);
  },
});

const router = Router();

router.post('/register', ctrl.registrar);
router.post('/login',    ctrl.iniciarSesion);
router.post('/google',   ctrl.googleSignIn);
router.put('/perfil',    verificarToken, upload.single('avatar'), ctrl.actualizarPerfil);

export { router as authRouter };
