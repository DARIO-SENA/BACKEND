import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as agendaCtrl from '../controllers/agenda.controller.js';
import * as tareaCtrl from '../controllers/tareas.controller.js';

const router = express.Router();

router.use(verificarToken);

// 📅 agenda
router.get('/dia', agendaCtrl.obtenerAgendaDia);
router.get('/estadisticas', agendaCtrl.obtenerEstadisticas);

// 🏷️ categorias
router.get('/categorias', tareaCtrl.obtenerCategorias);
router.post('/categorias', tareaCtrl.crearCategoria);
router.delete('/categorias/:id', tareaCtrl.eliminarCategoria);

export { router as agendaRouter };
