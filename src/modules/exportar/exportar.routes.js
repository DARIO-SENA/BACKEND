import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import { exportarDatos } from './exportar.controller.js';

const exportarRouter = Router();

exportarRouter.use(verificarToken);

exportarRouter.get('/datos', exportarDatos);

export { exportarRouter };
