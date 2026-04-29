import express from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as agendaCtrl from './agenda.controller.js';
import * as tareaCtrl  from '../tareas/tareas.controller.js';

const router = express.Router();

router.use(verificarToken);

router.get('/dia',            agendaCtrl.obtenerAgendaDia);
router.get('/estadisticas',   agendaCtrl.obtenerEstadisticas);

router.get('/categorias',        tareaCtrl.obtenerCategorias);
router.post('/categorias',       tareaCtrl.crearCategoria);
router.delete('/categorias/:id', tareaCtrl.eliminarCategoria);

export { router as agendaRouter };