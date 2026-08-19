import { manejarError } from '../../utils/error.handler.js';
import * as analyticsService from './analytics.service.js';

export const obtenerDashboard = async (req, res) => {
  try {
    const data = await analyticsService.obtenerDashboard(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const obtenerProductividadSemanal = async (req, res) => {
  try {
    const data = await analyticsService.obtenerProductividadSemanal(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const obtenerProductividadPorDia = async (req, res) => {
  try {
    const data = await analyticsService.obtenerProductividadPorDia(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const obtenerTareasPorCategoria = async (req, res) => {
  try {
    const data = await analyticsService.obtenerTareasPorCategoria(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const obtenerRacha = async (req, res) => {
  try {
    const data = await analyticsService.obtenerRacha(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const guardarProgreso = async (req, res) => {
  try {
    const { tipo, valor } = req.body;
    if (!tipo || valor === undefined) {
      return res.status(400).json({ ok: false, error: 'tipo y valor son requeridos' });
    }
    const data = await analyticsService.guardarProgreso(req.usuario.id, tipo, valor);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const generarReporte = async (req, res) => {
  try {
    const reporte = await analyticsService.generarReporte(req.usuario.id);
    res.json({ ok: true, data: reporte });
  } catch (err) { manejarError(res, err); }
};

export const obtenerAnalyticsCompletos = async (req, res) => {
  try {
    const data = await analyticsService.obtenerAnalyticsCompletos(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const obtenerAnalyticsHabitos = async (req, res) => {
  try {
    const data = await analyticsService.obtenerAnalyticsHabitos(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};
