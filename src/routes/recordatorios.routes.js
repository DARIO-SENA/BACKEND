// src/routes/recordatorios.routes.js

import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/recordatorios.controller.js';

const router = Router();
router.use(verificarToken);

// ─── NOTIFICACIONES ────────────────────────────────────────
router.get('/notificaciones',           ctrl.listarNotificaciones);
router.put('/notificaciones/leer-todo', ctrl.marcarTodasLeidas);
router.put('/notificaciones/:id/leer',  ctrl.marcarLeida);

// ─── PREFERENCIAS ──────────────────────────────────────────
router.get('/preferencias', ctrl.obtenerPreferencias);
router.put('/preferencias', ctrl.actualizarPreferencias);

// ─── RECORDATORIOS ─────────────────────────────────────────
router.get('/',       ctrl.listarRecordatorios);
router.post('/',      ctrl.crearRecordatorio);

// ⚠️ SIEMPRE al final
router.get('/:id',    ctrl.obtenerRecordatorio);
router.put('/:id',    ctrl.actualizarRecordatorio);
router.delete('/:id', ctrl.eliminarRecordatorio);

export { router as recordatoriosRouter };