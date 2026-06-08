import crypto from 'crypto';
import { manejarError } from '../../utils/error.handler.js';
import * as integracionesService from './integraciones.service.js';
import { google } from 'googleapis';
import twilio from 'twilio';
import PDFDocument from 'pdfkit';

const oauthStateStore = new Map();
const STATE_TTL = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, ts] of oauthStateStore) {
    if (now - ts > STATE_TTL) oauthStateStore.delete(key);
  }
}, 60 * 1000).unref();

export const iniciarGoogleAuth = (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');
  oauthStateStore.set(state, Date.now());
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
    state,
    prompt: 'consent',
  });
  res.redirect(url);
};

export const callbackGoogle = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!state || !oauthStateStore.has(state)) {
      return res.status(401).json({ ok: false, error: 'State inválido. Posible ataque CSRF.' });
    }
    oauthStateStore.delete(state);
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: perfil } = await oauth2.userinfo.get();
    const usuario = await integracionesService.buscarOCrearUsuarioGoogle({
      email: perfil.email,
      displayName: perfil.name,
      id: perfil.id,
    });
    await integracionesService.guardarTokensGoogle(usuario.id, tokens);
    const token = integracionesService.generarToken(usuario);
    res.redirect(`${process.env.FRONTEND_URL}/auth/google?token=${token}`);
  } catch (err) { manejarError(res, err); }
};

const getCalendarClient = async (usuarioId) => {
  const tokens = await integracionesService.obtenerTokensGoogle(usuarioId);
  if (!tokens?.google_access_token) return null;
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
  oauth2Client.setCredentials({
    access_token: tokens.google_access_token,
    refresh_token: tokens.google_refresh_token,
    expiry_date: new Date(tokens.google_token_expiry).getTime(),
  });
  oauth2Client.on('tokens', async (nuevos) => {
    const actualizados = {};
    if (nuevos.access_token) actualizados.access_token = nuevos.access_token;
    if (nuevos.refresh_token) actualizados.refresh_token = nuevos.refresh_token;
    if (nuevos.expiry_date) actualizados.expiry_date = nuevos.expiry_date;
    if (Object.keys(actualizados).length > 0) {
      await integracionesService.guardarTokensGoogle(usuarioId, actualizados);
    }
  });
  return oauth2Client;
};

export const verificarGoogleStatus = async (req, res) => {
  try {
    const tokens = await integracionesService.obtenerTokensGoogle(req.usuario.id);
    res.json({ ok: true, data: { conectado: !!tokens?.google_access_token } });
  } catch (err) { manejarError(res, err); }
};

export const desconectarGoogle = async (req, res) => {
  try {
    await integracionesService.eliminarTokensGoogle(req.usuario.id);
    res.json({ ok: true, data: { mensaje: 'Google Calendar desconectado' } });
  } catch (err) { manejarError(res, err); }
};

export const obtenerEventosCalendar = async (req, res) => {
  try {
    const oauth2Client = await getCalendarClient(req.usuario.id);
    if (!oauth2Client) {
      return res.status(401).json({ ok: false, error: 'No has conectado tu Google Calendar' });
    }
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });
    res.json({ ok: true, data: data.events || [] });
  } catch (err) { manejarError(res, err); }
};

export const crearEventoCalendar = async (req, res) => {
  try {
    const { titulo, descripcion, inicio, fin } = req.body;
    const oauth2Client = await getCalendarClient(req.usuario.id);
    if (!oauth2Client) {
      return res.status(401).json({ ok: false, error: 'No has conectado tu Google Calendar' });
    }
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
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const enviarWhatsApp = async (req, res) => {
  try {
    const { numero, mensaje } = req.body;
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(503).json({ ok: false, error: 'WhatsApp no configurado aún' });
    }
    const cliente = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const msg = await cliente.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${numero}`,
      body: mensaje,
    });
    res.json({ ok: true, sid: msg.sid });
  } catch (err) { manejarError(res, err); }
};

export const exportarPDF = async (req, res) => {
  try {
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
  } catch (err) { manejarError(res, err); }
};
