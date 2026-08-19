import { manejarError } from '../../utils/error.handler.js';
import * as gymService from './gym.service.js';

export const crearRutina = async (req, res) => {
  try {
    const data = await gymService.crearRutina(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const listarRutinas = async (req, res) => {
  try {
    const { limite, pagina } = req.query;
    const result = await gymService.listarRutinas(req.usuario.id, limite, pagina);
    res.json({ ok: true, data: result.data, total: result.total });
  } catch (err) { manejarError(res, err); }
};

export const obtenerRutina = async (req, res) => {
  try {
    const data = await gymService.obtenerRutina(req.params.id, req.usuario.id);
    if (!data) return res.status(404).json({ ok: false, error: 'Rutina no encontrada' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const actualizarRutina = async (req, res) => {
  try {
    const data = await gymService.actualizarRutina(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ ok: false, error: 'Rutina no encontrada' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const listarRutinasConEstado = async (req, res) => {
  try {
    const data = await gymService.listarRutinasConEstado(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarRutina = async (req, res) => {
  try {
    const ok = await gymService.eliminarRutina(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ ok: false, error: 'Rutina no encontrada' });
    res.json({ ok: true, mensaje: 'Rutina eliminada' });
  } catch (err) { manejarError(res, err); }
};

export const crearEjercicio = async (req, res) => {
  try {
    const data = await gymService.crearEjercicio(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const listarEjercicios = async (req, res) => {
  try {
    const data = await gymService.listarEjercicios(req.params.rutinaId, req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarEjercicio = async (req, res) => {
  try {
    const ok = await gymService.eliminarEjercicio(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ ok: false, error: 'Ejercicio no encontrado' });
    res.json({ ok: true, mensaje: 'Ejercicio eliminado' });
  } catch (err) { manejarError(res, err); }
};

export const actualizarEjercicio = async (req, res) => {
  try {
    const data = await gymService.actualizarEjercicio(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ ok: false, error: 'Ejercicio no encontrado' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const registrarEntrenamiento = async (req, res) => {
  try {
    const data = await gymService.registrarEntrenamiento(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const listarHistorial = async (req, res) => {
  try {
    const data = await gymService.listarHistorial(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const verProgresion = async (req, res) => {
  try {
    const data = await gymService.verProgresion(req.usuario.id, req.params.ejercicioId);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const obtenerEstadisticas = async (req, res) => {
  try {
    const data = await gymService.obtenerEstadisticas(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const sugerirPeso = async (req, res) => {
  try {
    const data = await gymService.sugerirPeso(req.usuario.id, req.params.ejercicioId);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const completarSesion = async (req, res) => {
  try {
    const data = await gymService.completarSesion(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const ultimaSesionEjercicio = async (req, res) => {
  try {
    const data = await gymService.obtenerUltimaSesion(req.usuario.id, req.params.ejercicioId);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const toggleRutinaGym = async (req, res) => {
  try {
    const { rutinaId, fecha } = req.body;
    const result = await gymService.toggleRutinaGym(req.usuario.id, rutinaId, fecha || new Date().toISOString().split('T')[0]);
    res.json({ ok: true, data: result });
  } catch (err) { manejarError(res, err); }
};

export const listarBiblioteca = async (req, res) => {
  try {
    const data = await gymService.listarBibliotecaEjercicios(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const asignarEjercicio = async (req, res) => {
  try {
    const { ejercicioId, rutinaId } = req.body;
    if (!ejercicioId || !rutinaId) return res.status(400).json({ ok: false, error: 'ejercicioId y rutinaId requeridos' });
    const data = await gymService.asignarEjercicioARutina(ejercicioId, rutinaId, req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};
