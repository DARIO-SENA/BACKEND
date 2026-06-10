// src/modules/recordatorios/recordatorios.routes.js

import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './recordatorios.controller.js';

const router = Router();
router.use(verificarToken);

// ─── NOTIFICACIONES ────────────────────────────────────────
router.get('/notificaciones',           ctrl.listarNotificaciones);
router.put('/notificaciones/leer-todo', ctrl.marcarTodasLeidas);
router.put('/notificaciones/:id/leer',  ctrl.marcarLeida);

// ─── PREFERENCIAS ──────────────────────────────────────────
router.get('/preferencias', ctrl.obtenerPreferencias);
router.put('/preferencias', ctrl.actualizarPreferencias);

// ─── CATEGORÍAS ─────────────────────────────────────────────
router.get('/categorias',     ctrl.obtenerCategorias);
router.post('/categorias',    ctrl.crearCategoria);
router.put('/categorias/:id', ctrl.actualizarCategoria);
router.delete('/categorias/:id', ctrl.eliminarCategoria);

// ─── RECORDATORIOS ─────────────────────────────────────────
router.get('/',       ctrl.listarRecordatorios);
router.post('/',      ctrl.crearRecordatorio);

router.delete('/',    ctrl.eliminarTodosRecordatorios);

// ⚠️ SIEMPRE al final
router.get('/:id',    ctrl.obtenerRecordatorio);
router.put('/:id',    ctrl.actualizarRecordatorio);
router.delete('/:id', ctrl.eliminarRecordatorio);

export { router as recordatoriosRouter };