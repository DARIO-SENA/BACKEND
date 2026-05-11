// src/modules/integraciones/integraciones.controller.js
import * as integracionesService from './integraciones.service.js';
import { google } from 'googleapis';
import twilio from 'twilio';

// ─── GOOGLE OAUTH ─────────────────────────────────────────

// GET /api/integraciones/google
// Redirige al usuario a la pantalla de login de Google
export const iniciarGoogleAuth = (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar',
    ],
    prompt: 'consent',
  });

  res.redirect(url);
};

// GET /api/integraciones/google/callback
// Google redirige aquí después del login
export const callbackGoogle = async (req, res) => {
  try {
    const { code } = req.query;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    // 1. Intercambiar código por tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2. Obtener perfil del usuario
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: perfil } = await oauth2.userinfo.get();

    // 3. Buscar o crear usuario en la BD
    const usuario = await integracionesService.buscarOCrearUsuarioGoogle({
      email: perfil.email,
      displayName: perfil.name,
      id: perfil.id,
    });

    // 4. Guardar tokens de Google Calendar
    await integracionesService.guardarTokensGoogle(usuario.id, tokens);

    // 5. Generar JWT de la app
    const token = integracionesService.generarToken(usuario);

    // 6. Redirigir al frontend con el token
    res.redirect(`${process.env.FRONTEND_URL}/auth/google?token=${token}`);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GOOGLE CALENDAR ──────────────────────────────────────

// GET /api/integraciones/calendar/eventos
// Ver eventos del calendario de Google del usuario
export const obtenerEventosCalendar = async (req, res) => {
  try {
    const tokensGuardados = await integracionesService.obtenerTokensGoogle(req.usuario.id);

    if (!tokensGuardados?.google_access_token) {
      return res.status(401).json({ error: 'No has conectado tu Google Calendar' });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    oauth2Client.setCredentials({
      access_token: tokensGuardados.google_access_token,
      refresh_token: tokensGuardados.google_refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.json(data.events || []);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/integraciones/calendar/eventos
// Crear un evento en Google Calendar
export const crearEventoCalendar = async (req, res) => {
  try {
    const { titulo, descripcion, inicio, fin } = req.body;
    const tokensGuardados = await integracionesService.obtenerTokensGoogle(req.usuario.id);

    if (!tokensGuardados?.google_access_token) {
      return res.status(401).json({ error: 'No has conectado tu Google Calendar' });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    oauth2Client.setCredentials({
      access_token: tokensGuardados.google_access_token,
      refresh_token: tokensGuardados.google_refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const { data } = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: titulo,
        description: descripcion,
        start: { dateTime: inicio, timeZone: 'America/Bogota' },
        end: { dateTime: fin, timeZone: 'America/Bogota' },
      },
    });

    res.status(201).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ─── WHATSAPP (TWILIO) ────────────────────────────────────

// POST /api/integraciones/whatsapp/enviar
// Enviar mensaje de WhatsApp
export const enviarWhatsApp = async (req, res) => {
  try {
    const { numero, mensaje } = req.body;

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(503).json({ error: 'WhatsApp no configurado aún' });
    }

    const cliente = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const msg = await cliente.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${numero}`,
      body: mensaje,
    });

    res.json({ ok: true, sid: msg.sid });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ─── EXPORTAR PDF ─────────────────────────────────────────

// GET /api/integraciones/exportar/pdf
// Exportar estadísticas del usuario en PDF
export const exportarPDF = async (req, res) => {
  try {
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-dario.pdf');

    doc.pipe(res);

    doc.fontSize(24).text('DARIO - Reporte de Productividad', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Usuario ID: ${req.usuario.id}`);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`);
    doc.moveDown();
    doc.fontSize(16).text('Resumen', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text('Este reporte fue generado automáticamente por DARIO.');

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};