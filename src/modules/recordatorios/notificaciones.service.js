// src/modules/recordatorios/notificaciones.service.js

import * as notificacionModel from './notificacion.model.js';

export const listar = async (usuarioId, soloNoLeidas = false) => {
  const result = await notificacionModel.encontrarPorUsuario(usuarioId, soloNoLeidas);
  const noLeidas = await notificacionModel.contarNoLeidas(usuarioId);
  return { notificaciones: result.data, total: result.total, noLeidas };
};

export const marcarLeida = async (id, usuarioId) => {
  const notif = await notificacionModel.marcarLeida(id, usuarioId);
  if (!notif) throw { status: 404, message: 'Notificación no encontrada' };
  return notif;
};

export const marcarTodasLeidas = async (usuarioId) => {
  return notificacionModel.marcarTodasLeidas(usuarioId);
};
