import { manejarError } from '../../utils/error.handler.js';
import * as tareasService from './tareas.service.js';

export const obtenerTareas = async (req, res) => {
  try {
    const tareas = await tareasService.obtenerTareas(req.usuario.id, req.query);
    res.json({ ok: true, data: tareas });
  } catch (error) { manejarError(res, error); }
};

export const obtenerTareaPorId = async (req, res) => {
  try {
    const tarea = await tareasService.obtenerTareaPorId(req.params.id, req.usuario.id);
    if (!tarea) return res.status(404).json({ ok: false, error: 'Tarea no encontrada' });
    res.json({ ok: true, data: tarea });
  } catch (error) { manejarError(res, error); }
};

export const crearTarea = async (req, res) => {
  try {
    const tarea = await tareasService.crearTarea(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data: tarea });
  } catch (error) { manejarError(res, error); }
};

export const crearYProgramar = async (req, res) => {
  try {
    const tarea = await tareasService.crearTarea(req.usuario.id, req.body);
    const tareaFinal = await tareasService.programarYObtener(req.usuario.id, tarea);
    res.status(201).json({ ok: true, data: tareaFinal });
  } catch (error) { manejarError(res, error); }
};

export const actualizarTarea = async (req, res) => {
  try {
    const tarea = await tareasService.actualizarTarea(req.params.id, req.usuario.id, req.body);
    if (!tarea) return res.status(404).json({ ok: false, error: 'Tarea no encontrada o sin cambios' });
    res.json({ ok: true, data: tarea });
  } catch (error) { manejarError(res, error); }
};

export const eliminarTarea = async (req, res) => {
  try {
    const eliminada = await tareasService.eliminarTarea(req.params.id, req.usuario.id);
    if (!eliminada) return res.status(404).json({ ok: false, error: 'Tarea no encontrada' });
    res.json({ ok: true, mensaje: 'Tarea eliminada correctamente' });
  } catch (error) { manejarError(res, error); }
};

export const cambiarEstado = async (req, res) => {
  try {
    const tarea = await tareasService.cambiarEstado(req.params.id, req.usuario.id, req.body.estado);
    if (!tarea) return res.status(404).json({ ok: false, error: 'Tarea no encontrada' });
    res.json({ ok: true, data: tarea });
  } catch (error) { manejarError(res, error); }
};

export const obtenerAgendaDia = async (req, res) => {
  try {
    if (!req.query.fecha) return res.status(400).json({ ok: false, error: 'Fecha requerida' });
    const agenda = await tareasService.obtenerAgendaDia(req.usuario.id, req.query.fecha);
    res.json({ ok: true, data: agenda });
  } catch (error) { manejarError(res, error); }
};

export const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await tareasService.obtenerEstadisticas(req.usuario.id);
    res.json({ ok: true, data: stats });
  } catch (error) { manejarError(res, error); }
};

export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await tareasService.obtenerCategorias(req.usuario.id);
    res.json({ ok: true, data: categorias });
  } catch (error) { manejarError(res, error); }
};

export const crearCategoria = async (req, res) => {
  try {
    const { nombre, color } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, error: 'Nombre requerido' });
    const categoria = await tareasService.crearCategoria(req.usuario.id, nombre, color);
    res.status(201).json({ ok: true, data: categoria });
  } catch (error) { manejarError(res, error); }
};

export const eliminarCategoria = async (req, res) => {
  try {
    const eliminada = await tareasService.eliminarCategoria(req.params.id, req.usuario.id);
    if (!eliminada) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    res.json({ ok: true, mensaje: 'Categoría eliminada correctamente' });
  } catch (error) { manejarError(res, error); }
};

export const actualizarCategoria = async (req, res) => {
  try {
    const { nombre, color } = req.body;
    if (!nombre && !color) return res.status(400).json({ ok: false, error: 'Nombre o color requerido' });
    const categoria = await tareasService.actualizarCategoria(req.params.id, req.usuario.id, { nombre, color });
    if (!categoria) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    res.json({ ok: true, data: categoria });
  } catch (error) { manejarError(res, error); }
};

export const programarTarea = async (req, res) => {
  try {
    const tarea = await tareasService.crearTarea(req.usuario.id, req.body);
    const tareaFinal = await tareasService.programarYObtener(req.usuario.id, tarea);
    res.status(201).json({ ok: true, data: tareaFinal });
  } catch (error) { manejarError(res, error); }
};
