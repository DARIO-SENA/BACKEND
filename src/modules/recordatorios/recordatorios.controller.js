// src/modules/recordatorios/recordatorios.controller.js

import { manejarError } from '../../utils/error.handler.js';
import * as recordatoriosService  from './recordatorios.service.js';
import * as notificacionesService from './notificaciones.service.js';
import * as preferenciasService   from './preferencias.service.js';
import * as tareasService from '../tareas/tareas.service.js';

// ─── RECORDATORIOS ─────────────────────────────────────────

export const listarRecordatorios = async (req, res) => {
  try {
    const { tipo, estado } = req.query;
    const result = await recordatoriosService.listar(req.usuario.id, { tipo, estado });
    res.json({ ok: true, data: result.data, total: result.total });
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

export const eliminarTodosRecordatorios = async (req, res) => {
  try {
    const count = await recordatoriosService.eliminarTodos(req.usuario.id);
    res.json({ ok: true, mensaje: `${count} recordatorios eliminados` });
  } catch (err) { manejarError(res, err); }
};

// ─── NOTIFICACIONES ────────────────────────────────────────

export const listarNotificaciones = async (req, res) => {
  try {
    const soloNoLeidas = req.query.no_leidas === 'true';
    const result = await notificacionesService.listar(req.usuario.id, soloNoLeidas);
    res.json({ ok: true, data: result.notificaciones, total: result.total, no_leidas: result.noLeidas });
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

// ─── CATEGORÍAS ────────────────────────────────────────────

export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await tareasService.obtenerCategorias(req.usuario.id, 'recordatorio');
    res.json({ ok: true, data: categorias });
  } catch (err) { manejarError(res, err); }
};

export const crearCategoria = async (req, res) => {
  try {
    const { nombre, color, icono } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, error: 'Nombre requerido' });
    const categoria = await tareasService.crearCategoria(req.usuario.id, nombre, color, icono, 'recordatorio');
    res.status(201).json({ ok: true, data: categoria });
  } catch (err) { manejarError(res, err); }
};

export const actualizarCategoria = async (req, res) => {
  try {
    const { nombre, color, icono } = req.body;
    if (!nombre && !color && icono === undefined)
      return res.status(400).json({ ok: false, error: 'Nombre o color requerido' });
    const categoria = await tareasService.actualizarCategoria(req.params.id, req.usuario.id, { nombre, color, icono });
    if (!categoria) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    res.json({ ok: true, data: categoria });
  } catch (err) { manejarError(res, err); }
};

export const eliminarCategoria = async (req, res) => {
  try {
    const eliminada = await tareasService.eliminarCategoria(req.params.id, req.usuario.id);
    if (!eliminada) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    res.json({ ok: true, mensaje: 'Categoría eliminada correctamente' });
  } catch (err) { manejarError(res, err); }
};
