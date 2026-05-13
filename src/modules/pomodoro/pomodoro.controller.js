import { manejarError } from '../../utils/error.handler.js';
import * as pomodoroService from './pomodoro.service.js';

export const obtenerSettings = async (req, res) => {
  try {
    const data = await pomodoroService.obtenerSettings(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const actualizarSettings = async (req, res) => {
  try {
    const data = await pomodoroService.actualizarSettings(req.usuario.id, req.body);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const iniciarSession = async (req, res) => {
  try {
    const data = await pomodoroService.iniciarSession(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const completarSession = async (req, res) => {
  try {
    const data = await pomodoroService.completarSession(req.params.id, req.usuario.id);
    if (!data) return res.status(404).json({ ok: false, error: 'Sesión no encontrada o ya finalizada' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const interrumpirSession = async (req, res) => {
  try {
    const data = await pomodoroService.interrumpirSession(req.params.id, req.usuario.id);
    if (!data) return res.status(404).json({ ok: false, error: 'Sesión no encontrada o ya finalizada' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const listarSessions = async (req, res) => {
  try {
    const data = await pomodoroService.listarSessions(req.usuario.id, req.query);
    res.json({ ok: true, data, total: data.length });
  } catch (err) { manejarError(res, err); }
};

export const estadisticas = async (req, res) => {
  try {
    const data = await pomodoroService.obtenerEstadisticas(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const tareasSugeridas = async (req, res) => {
  try {
    const data = await pomodoroService.obtenerTareasSugeridas(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};
