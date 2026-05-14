import { manejarError } from '../../utils/error.handler.js';
import * as metasService from './metas.service.js';

export const crearMeta = async (req, res) => {
  try {
    const meta = await metasService.crearMeta(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data: meta });
  } catch (error) { manejarError(res, error); }
};

export const obtenerMetas = async (req, res) => {
  try {
    const metas = await metasService.obtenerMetas(req.usuario.id, req.query);
    res.json({ ok: true, data: metas, total: metas.length });
  } catch (error) { manejarError(res, error); }
};

export const obtenerMetaPorId = async (req, res) => {
  try {
    const meta = await metasService.obtenerMetaPorId(req.params.id, req.usuario.id);
    if (!meta) return res.status(404).json({ ok: false, error: 'Meta no encontrada' });
    res.json({ ok: true, data: meta });
  } catch (error) { manejarError(res, error); }
};

export const actualizarMeta = async (req, res) => {
  try {
    const meta = await metasService.actualizarMeta(req.params.id, req.usuario.id, req.body);
    if (!meta) return res.status(404).json({ ok: false, error: 'Meta no encontrada o sin cambios' });
    res.json({ ok: true, data: meta });
  } catch (error) { manejarError(res, error); }
};

export const eliminarMeta = async (req, res) => {
  try {
    const eliminada = await metasService.eliminarMeta(req.params.id, req.usuario.id);
    if (!eliminada) return res.status(404).json({ ok: false, error: 'Meta no encontrada' });
    res.json({ ok: true, mensaje: 'Meta eliminada correctamente' });
  } catch (error) { manejarError(res, error); }
};

export const crearKeyResult = async (req, res) => {
  try {
    const kr = await metasService.crearKeyResult(req.params.metaId, req.usuario.id, req.body);
    res.status(201).json({ ok: true, data: kr });
  } catch (error) { manejarError(res, error); }
};

export const obtenerKeyResults = async (req, res) => {
  try {
    const krs = await metasService.obtenerKeyResults(req.params.metaId, req.usuario.id);
    res.json({ ok: true, data: krs, total: krs.length });
  } catch (error) { manejarError(res, error); }
};

export const actualizarKeyResult = async (req, res) => {
  try {
    const kr = await metasService.actualizarKeyResult(req.params.metaId, req.params.krId, req.usuario.id, req.body);
    if (!kr) return res.status(404).json({ ok: false, error: 'Key Result no encontrado o sin cambios' });
    res.json({ ok: true, data: kr });
  } catch (error) { manejarError(res, error); }
};

export const actualizarProgresoKR = async (req, res) => {
  try {
    const { progreso } = req.body;
    if (progreso === undefined) return res.status(400).json({ ok: false, error: 'Progreso requerido' });
    const resultado = await metasService.actualizarProgresoKR(req.params.metaId, req.params.krId, req.usuario.id, progreso);
    res.json({ ok: true, data: resultado });
  } catch (error) { manejarError(res, error); }
};

export const descomponerConIA = async (req, res) => {
  try {
    const resultado = await metasService.descomponerConIA(req.usuario.id, req.params.metaId);
    res.json({ ok: true, data: resultado });
  } catch (error) { manejarError(res, error); }
};

export const planSemanal = async (req, res) => {
  try {
    const { metaId, fecha_fin } = req.body;
    if (!metaId) return res.status(400).json({ ok: false, error: 'metaId requerido' });
    const tareas = await metasService.planSemanal(req.usuario.id, metaId, fecha_fin);
    res.status(201).json({ ok: true, data: tareas, total: tareas.length });
  } catch (error) { manejarError(res, error); }
};

export const obtenerDashboard = async (req, res) => {
  try {
    const dashboard = await metasService.obtenerDashboard(req.usuario.id);
    res.json({ ok: true, data: dashboard });
  } catch (error) { manejarError(res, error); }
};

export const obtenerTimeline = async (req, res) => {
  try {
    const timeline = await metasService.obtenerTimeline(req.usuario.id);
    res.json({ ok: true, data: timeline });
  } catch (error) { manejarError(res, error); }
};
