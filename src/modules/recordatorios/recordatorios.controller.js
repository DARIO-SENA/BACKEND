// src/controllers/recordatorios.controller.js

import * as recordatoriosService  from './recordatorios.service.js';
import * as notificacionesService from './notificaciones.service.js';
import * as preferenciasService   from './preferencias.service.js';
// ─── HELPER ERRORES ────────────────────────────────────────

const manejarError = (res, err) => {
  if (err.status) return res.status(err.status).json({ ok: false, error: err.message });
  console.error(err.message);
  res.status(500).json({ ok: false, error: 'Error interno del servidor' });
};

// ─── RECORDATORIOS ─────────────────────────────────────────

export const listarRecordatorios = async (req, res) => {
  try {
    const { tipo, estado } = req.query;
    const data = await recordatoriosService.listar(req.usuario.id, { tipo, estado });
    res.json({ ok: true, data, total: data.length });
  } catch (err) { manejarError(res, err); }
};

export const obtenerRecordatorio = async (req, res) => {
  try {
    const data = await recordatoriosService.obtenerPorId(req.params.id, req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const crearRecordatorio = async (req, res) => {
  try {
    const data = await recordatoriosService.crear(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const actualizarRecordatorio = async (req, res) => {
  try {
    const data = await recordatoriosService.actualizar(req.params.id, req.usuario.id, req.body);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarRecordatorio = async (req, res) => {
  try {
    await recordatoriosService.eliminar(req.params.id, req.usuario.id);
    res.json({ ok: true, mensaje: 'Recordatorio eliminado' });
  } catch (err) { manejarError(res, err); }
};

// ─── NOTIFICACIONES ────────────────────────────────────────

export const listarNotificaciones = async (req, res) => {
  try {
    const soloNoLeidas = req.query.no_leidas === 'true';
    const { notificaciones, noLeidas } = await notificacionesService.listar(req.usuario.id, soloNoLeidas);
    res.json({ ok: true, data: notificaciones, no_leidas: noLeidas, total: notificaciones.length });
  } catch (err) { manejarError(res, err); }
};

export const marcarLeida = async (req, res) => {
  try {
    const data = await notificacionesService.marcarLeida(req.params.id, req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const marcarTodasLeidas = async (req, res) => {
  try {
    const total = await notificacionesService.marcarTodasLeidas(req.usuario.id);
    res.json({ ok: true, mensaje: `${total} notificaciones marcadas como leídas` });
  } catch (err) { manejarError(res, err); }
};

// ─── PREFERENCIAS ──────────────────────────────────────────

export const obtenerPreferencias = async (req, res) => {
  try {
    const data = await preferenciasService.obtener(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const actualizarPreferencias = async (req, res) => {
  try {
    const data = await preferenciasService.actualizar(req.usuario.id, req.body);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};
