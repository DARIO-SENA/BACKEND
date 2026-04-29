// src/services/recordatorios.service.js

import * as recordatorioModel from './recordatorio.model.js';
import { agregarJob, cancelarJob } from './jobs/queue.js';
import { calcularFechaReal } from '../../utils/time.utils.js';

export const listar = async (usuarioId, filtros) => {
  return recordatorioModel.encontrarTodos(usuarioId, filtros);
};

export const obtenerPorId = async (id, usuarioId) => {
  const rec = await recordatorioModel.encontrarPorId(id, usuarioId);
  if (!rec) throw { status: 404, message: 'Recordatorio no encontrado' };
  return rec;
};

// ─────────────────────────────────────────────
// CREAR (CORREGIDO)
// ─────────────────────────────────────────────
export const crear = async (usuarioId, datos) => {
  const {
    titulo,
    fechaHora,
    fecha_hora,
    anticipacion_min = 0
  } = datos;

  // 🔥 normalización única de fecha
  const fechaBase = fechaHora || fecha_hora;

  if (!titulo) {
    throw { status: 400, message: 'El título es obligatorio' };
  }

  if (!fechaBase) {
    throw { status: 400, message: 'La fecha y hora son obligatorias' };
  }

  const fechaReal = calcularFechaReal(fechaBase, anticipacion_min);

  if (fechaReal <= new Date()) {
    throw { status: 400, message: 'La fecha debe ser futura' };
  }

  const recordatorio = await recordatorioModel.insertar(usuarioId, {
    ...datos,
    fecha_hora: fechaReal,
  });

  await agregarJob(
    {
      recordatorioId: recordatorio.id,
      usuarioId,
      titulo,
      mensaje: datos.mensaje,
    },
    fechaReal
  );

  return recordatorio;
};

// ─────────────────────────────────────────────
// ACTUALIZAR (CORREGIDO)
// ─────────────────────────────────────────────
export const actualizar = async (id, usuarioId, datos) => {
  const existe = await recordatorioModel.encontrarPorId(id, usuarioId);
  if (!existe) {
    throw { status: 404, message: 'Recordatorio no encontrado' };
  }

  const fechaBase = datos.fechaHora || datos.fecha_hora;

  const fechaReal = calcularFechaReal(
    fechaBase,
    datos.anticipacion_min || 0
  );

  if (fechaReal <= new Date()) {
    throw { status: 400, message: 'La fecha debe ser futura' };
  }

  await cancelarJob(id);

  const actualizado = await recordatorioModel.actualizar(id, usuarioId, {
    ...datos,
    fecha_hora: fechaReal,
  });

  await agregarJob(
    {
      recordatorioId: id,
      usuarioId,
      titulo: datos.titulo || existe.titulo,
      mensaje: datos.mensaje || existe.mensaje,
    },
    fechaReal
  );

  console.log(`🔄 Recordatorio ${id} actualizado y reprogramado`);

  return actualizado;
};

// ─────────────────────────────────────────────
// ELIMINAR
// ─────────────────────────────────────────────
export const eliminar = async (id, usuarioId) => {
  const existe = await recordatorioModel.encontrarPorId(id, usuarioId);
  if (!existe) throw { status: 404, message: 'Recordatorio no encontrado' };

  await cancelarJob(id);
  await recordatorioModel.eliminar(id, usuarioId);
};
