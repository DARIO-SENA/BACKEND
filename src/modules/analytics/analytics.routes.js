import express from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as analyticsCtrl from './analytics.controller.js';

const router = express.Router();

router.use(verificarToken);

router.get('/dashboard',  analyticsCtrl.obtenerDashboard);
router.get('/semanal',    analyticsCtrl.obtenerProductividadSemanal);
router.get('/por-dia',    analyticsCtrl.obtenerProductividadPorDia);
router.get('/categorias', analyticsCtrl.obtenerTareasPorCategoria);
router.get('/racha',      analyticsCtrl.obtenerRacha);
router.post('/progreso',  analyticsCtrl.guardarProgreso);
router.get('/reporte',     analyticsCtrl.generarReporte);
router.get('/completas',   analyticsCtrl.obtenerAnalyticsCompletos);
router.get('/habitos',     analyticsCtrl.obtenerAnalyticsHabitos);

export { router as analyticsRouter };