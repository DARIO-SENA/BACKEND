import { manejarError } from '../../utils/error.handler.js';
import * as rutinaService from './rutina.service.js';

export const obtenerDia = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
    const data = await rutinaService.obtenerDiaCompleto(req.usuario.id, fecha);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const obtenerSemana = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
    const data = await rutinaService.obtenerSemanaCompleta(req.usuario.id, fecha);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const toggleHabito = async (req, res) => {
  try {
    const { habitoId, fecha } = req.body;
    const d = fecha || new Date().toISOString().split('T')[0];
    const result = await rutinaService.completarHabito(req.usuario.id, habitoId, d);
    res.json({ ok: true, data: result });
  } catch (err) { manejarError(res, err); }
};

export const obtenerPlantillas = async (req, res) => {
  try {
    const data = await rutinaService.obtenerPlantillas(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const guardarPlantilla = async (req, res) => {
  try {
    const { diaSemana, bloques } = req.body;
    const data = await rutinaService.guardarPlantillaDia(req.usuario.id, diaSemana, bloques);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarPlantilla = async (req, res) => {
  try {
    await rutinaService.eliminarPlantillaDia(req.usuario.id, parseInt(req.params.diaSemana));
    res.json({ ok: true });
  } catch (err) { manejarError(res, err); }
};

export const aplicarSemana = async (req, res) => {
  try {
    const fecha = req.body.fechaInicio || new Date().toISOString().split('T')[0];
    const semanas = parseInt(req.body.semanas) || 1;
    const result = await rutinaService.aplicarSemana(req.usuario.id, fecha, semanas);
    res.json({ ok: true, data: result });
  } catch (err) { manejarError(res, err); }
};

export const limpiarSemana = async (req, res) => {
  try {
    const result = await rutinaService.limpiarSemana(req.usuario.id);
    res.json({ ok: true, data: result });
  } catch (err) { manejarError(res, err); }
};

export const eliminarBloquePlantilla = async (req, res) => {
  try {
    await rutinaService.eliminarBloquePlantilla(req.usuario.id, req.params.id);
    res.json({ ok: true, mensaje: 'Bloque eliminado de la plantilla' });
  } catch (err) { manejarError(res, err); }
};

export const eliminarTodosBloquesPlantilla = async (req, res) => {
  try {
    const count = await rutinaService.eliminarTodosBloquesPlantilla(req.usuario.id);
    res.json({ ok: true, mensaje: `${count} bloques eliminados de las plantillas` });
  } catch (err) { manejarError(res, err); }
};
