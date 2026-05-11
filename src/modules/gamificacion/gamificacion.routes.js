// src/modules/gamificacion/gamificacion.routes.js

import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './gamificacion.controller.js';

const router = Router();
router.use(verificarToken);

// ─── PERFIL ────────────────────────────────────────────────
// GET /api/gamificacion/perfil → nivel, xp, puntos, racha, logros recientes
router.get('/perfil', ctrl.obtenerPerfil);

// ─── LOGROS ────────────────────────────────────────────────
// GET /api/gamificacion/logros → logros obtenidos y bloqueados
router.get('/logros', ctrl.obtenerLogros);

// ─── LEADERBOARD ───────────────────────────────────────────
// GET /api/gamificacion/leaderboard?tipo=total|semanal|mensual&limite=10
router.get('/leaderboard', ctrl.obtenerLeaderboard);

// ─── HISTORIAL ─────────────────────────────────────────────
// GET /api/gamificacion/historial?limite=20
router.get('/historial', ctrl.obtenerHistorial);

// ─── TRIGGERS (llamar al completar acciones) ───────────────
// POST /api/gamificacion/tarea-completada  → { tarea_id, prioridad }
// POST /api/gamificacion/habito-completado → { habito_id }
router.post('/tarea-completada',  ctrl.tareaCompletada);
router.post('/habito-completado', ctrl.habitoCompletado);

export { router as gamificacionRouter };
