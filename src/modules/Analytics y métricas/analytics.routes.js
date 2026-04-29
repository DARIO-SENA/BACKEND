import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as analyticsCtrl from '../controllers/analytics.controller.js';

const router = express.Router();

router.use(verificarToken);

// 📊 Dashboard
router.get('/dashboard',          analyticsCtrl.obtenerDashboard);

// 📈 Productividad
router.get('/semanal',            analyticsCtrl.obtenerProductividadSemanal);
router.get('/por-dia',            analyticsCtrl.obtenerProductividadPorDia);

// 🏷️ Categorías
router.get('/categorias',         analyticsCtrl.obtenerTareasPorCategoria);

// 🔥 Racha
router.get('/racha',              analyticsCtrl.obtenerRacha);

// 💾 Progreso
router.post('/progreso',          analyticsCtrl.guardarProgreso);

export { router as analyticsRouter };