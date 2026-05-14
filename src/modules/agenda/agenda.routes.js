import express from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as agendaCtrl from './agenda.controller.js';
import * as tareaCtrl from '../tareas/tareas.controller.js';

const router = express.Router();

router.use(verificarToken);

// 📅 Agenda
router.get('/dia',          agendaCtrl.obtenerAgendaDia);
router.get('/estadisticas', agendaCtrl.obtenerEstadisticas);

// 📆 Vista semanal mejorada
router.get('/semanal',      agendaCtrl.obtenerVistaSemanal);

// ⚙️ Auto scheduling
router.post('/programar',   agendaCtrl.programarAutomatico);
router.post('/reagendar',   agendaCtrl.reagendarVencidas);

// 🕐 Bloques de tiempo personalizados
router.get('/bloques',          agendaCtrl.obtenerBloques);
router.post('/bloques',         agendaCtrl.crearBloque);
router.put('/bloques/:id',      agendaCtrl.actualizarBloque);
router.delete('/bloques/:id',   agendaCtrl.eliminarBloque);

// 🏷️ Categorias
router.get('/categorias',         tareaCtrl.obtenerCategorias);
router.post('/categorias',        tareaCtrl.crearCategoria);
router.put('/categorias/:id',     tareaCtrl.actualizarCategoria);
router.delete('/categorias/:id',  tareaCtrl.eliminarCategoria);

export { router as agendaRouter };