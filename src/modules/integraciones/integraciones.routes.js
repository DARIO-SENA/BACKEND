// src/modules/integraciones/integraciones.routes.js
import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import {
  iniciarGoogleAuth,
  callbackGoogle,
  obtenerEventosCalendar,
  crearEventoCalendar,
  enviarWhatsApp,
  exportarPDF,
} from './integraciones.controller.js';

export const integracionesRouter = Router();

// ── Google OAuth ──────────────────────────────
// Esta ruta NO lleva token porque es el inicio del login
integracionesRouter.get('/google', iniciarGoogleAuth);
integracionesRouter.get('/google/callback', callbackGoogle);

// ── Google Calendar ───────────────────────────
integracionesRouter.get('/calendar/eventos',  verificarToken, obtenerEventosCalendar);
integracionesRouter.post('/calendar/eventos', verificarToken, crearEventoCalendar);

// ── WhatsApp ──────────────────────────────────
integracionesRouter.post('/whatsapp/enviar', verificarToken, enviarWhatsApp);

// ── Exportar PDF ──────────────────────────────
integracionesRouter.get('/exportar/pdf', verificarToken, exportarPDF);