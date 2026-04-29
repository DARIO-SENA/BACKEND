import * as tareasService from './tareas.service.js';

const manejarError = (res, error) => {
  console.error(error);
  if (
    error.message.includes('obligatorio') ||
    error.message.includes('inválido') ||
    error.message.includes('No hay campos')
  ) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Error interno del servidor' });
};

export const obtenerTareas = async (req, res) => {
  try {
    const tareas = await tareasService.obtenerTareas(req.usuario.id, req.query);
    res.json(tareas);
  } catch (error) { manejarError(res, error); }
};

export const obtenerTareaPorId = async (req, res) => {
  try {
    const tarea = await tareasService.obtenerTareaPorId(req.params.id, req.usuario.id);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(tarea);
  } catch (error) { manejarError(res, error); }
};

export const crearTarea = async (req, res) => {
  try {
    const tarea = await tareasService.crearTarea(req.usuario.id, req.body);
    res.status(201).json(tarea);
  } catch (error) { manejarError(res, error); }
};

export const crearYProgramar = async (req, res) => {
  try {
    const tarea = await tareasService.crearTarea(req.usuario.id, req.body);
    const tareaFinal = await tareasService.programarYObtener(req.usuario.id, tarea);
    res.status(201).json(tareaFinal);
  } catch (error) { manejarError(res, error); }
};

export const actualizarTarea = async (req, res) => {
  try {
    const tarea = await tareasService.actualizarTarea(req.params.id, req.usuario.id, req.body);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada o sin cambios' });
    res.json(tarea);
  } catch (error) { manejarError(res, error); }
};

export const eliminarTarea = async (req, res) => {
  try {
    const eliminada = await tareasService.eliminarTarea(req.params.id, req.usuario.id);
    if (!eliminada) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ mensaje: 'Tarea eliminada correctamente' });
  } catch (error) { manejarError(res, error); }
};

export const cambiarEstado = async (req, res) => {
  try {
    const tarea = await tareasService.cambiarEstado(req.params.id, req.usuario.id, req.body.estado);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(tarea);
  } catch (error) { manejarError(res, error); }
};

export const obtenerAgendaDia = async (req, res) => {
  try {
    if (!req.query.fecha) return res.status(400).json({ error: 'Fecha requerida' });
    const agenda = await tareasService.obtenerAgendaDia(req.usuario.id, req.query.fecha);
    res.json(agenda);
  } catch (error) { manejarError(res, error); }
};

export const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await tareasService.obtenerEstadisticas(req.usuario.id);
    res.json(stats);
  } catch (error) { manejarError(res, error); }
};

export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await tareasService.obtenerCategorias(req.usuario.id);
    res.json(categorias);
  } catch (error) { manejarError(res, error); }
};

export const crearCategoria = async (req, res) => {
  try {
    const { nombre, color } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
    const categoria = await tareasService.crearCategoria(req.usuario.id, nombre, color);
    res.status(201).json(categoria);
  } catch (error) { manejarError(res, error); }
};

export const eliminarCategoria = async (req, res) => {
  try {
    const eliminada = await tareasService.eliminarCategoria(req.params.id, req.usuario.id);
    if (!eliminada) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) { manejarError(res, error); }
};