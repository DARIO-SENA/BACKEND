// src/modules/gamificacion/gamificacion.controller.js

import * as gamificacionService from './gamificacion.service.js';

const manejarError = (res, err) => {
  console.error(err.message);
  if (err.status) return res.status(err.status).json({ ok: false, error: err.message });
  res.status(500).json({ ok: false, error: 'Error interno del servidor' });
};

// GET /api/gamificacion/perfil
export const obtenerPerfil = async (req, res) => {
  try {
    const data = await gamificacionService.obtenerPerfil(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

// GET /api/gamificacion/logros
export const obtenerLogros = async (req, res) => {
  try {
    const data = await gamificacionService.obtenerLogrosUsuario(req.usuario.id);
    const obtenidos = data.filter(l => l.obtenido);
    const bloqueados = data.filter(l => !l.obtenido);
    res.json({ ok: true, data: { obtenidos, bloqueados, total: data.length, total_obtenidos: obtenidos.length } });
  } catch (err) { manejarError(res, err); }
};

// GET /api/gamificacion/leaderboard?tipo=total&limite=10
export const obtenerLeaderboard = async (req, res) => {
  try {
    const { tipo = 'total', limite = 10 } = req.query;
    const tiposValidos = ['total', 'semanal', 'mensual'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ ok: false, error: `Tipo inválido. Usa: ${tiposValidos.join(', ')}` });
    }
    const ranking = await gamificacionService.obtenerLeaderboard(req.usuario.id, tipo, parseInt(limite));
    const posicion = await gamificacionService.obtenerPosicionUsuario(req.usuario.id);
    res.json({ ok: true, data: ranking, mi_posicion: posicion, tipo, total: ranking.length });
  } catch (err) { manejarError(res, err); }
};

// GET /api/gamificacion/historial
export const obtenerHistorial = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 20;
    const data = await gamificacionService.obtenerHistorialPuntos(req.usuario.id, limite);
    res.json({ ok: true, data, total: data.length });
  } catch (err) { manejarError(res, err); }
};

// POST /api/gamificacion/tarea-completada
// Llamar este endpoint cada vez que el frontend marca una tarea como completada
export const tareaCompletada = async (req, res) => {
  try {
    const { tarea_id, prioridad = 'media' } = req.body;
    if (!tarea_id) return res.status(400).json({ ok: false, error: 'tarea_id es obligatorio' });
    const resultado = await gamificacionService.procesarTareaCompletada(req.usuario.id, { id: tarea_id, prioridad });
    res.json({ ok: true, data: resultado });
  } catch (err) { manejarError(res, err); }
};

// POST /api/gamificacion/habito-completado
// Llamar este endpoint cada vez que el frontend marca un hábito como completado
export const habitoCompletado = async (req, res) => {
  try {
    const { habito_id } = req.body;
    if (!habito_id) return res.status(400).json({ ok: false, error: 'habito_id es obligatorio' });
    const resultado = await gamificacionService.procesarHabitoCompletado(req.usuario.id, habito_id);
    res.json({ ok: true, data: resultado });
  } catch (err) { manejarError(res, err); }
};
