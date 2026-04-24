// src/services/preferencias.service.js

import * as preferenciaModel from '../models/preferencia.model.js';

export const obtener = async (usuarioId) => {
  const prefs = await preferenciaModel.encontrarPorUsuario(usuarioId);

  // Si no existen, crear con valores por defecto
  if (!prefs) {
    return preferenciaModel.upsert(usuarioId, {});
  }
  return prefs;
};

export const actualizar = async (usuarioId, datos) => {
  return preferenciaModel.upsert(usuarioId, datos);
};
