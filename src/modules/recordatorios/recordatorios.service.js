// src/modules/recordatorios/recordatorios.service.js

import * as recordatorioModel from './recordatorio.model.js';
import { agregarJob, cancelarJob } from './jobs/queue.js';
import { calcularFechaReal } from '../../utils/time.utils.js';
import { AppError } from '../../utils/AppError.js';

export const listar = async (usuarioId, filtros) => {
  return recordatorioModel.encontrarTodos(usuarioId, filtros);
};

export const obtenerPorId = async (id, usuarioId) => {
  const rec = await recordatorioModel.encontrarPorId(id, usuarioId);
  if (!rec) throw new AppError('Recordatorio no encontrado', 404);
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
    throw new AppError('El título es obligatorio', 400);
  }

  if (!fechaBase) {
    throw new AppError('La fecha y hora son obligatorias', 400);
  }

  const fechaReal = calcularFechaReal(fechaBase, anticipacion_min);

  if (fechaReal <= new Date()) {
    throw new AppError('La fecha debe ser futura', 400);
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
    throw new AppError('Recordatorio no encontrado', 404);
  }

  const fechaBase = datos.fechaHora || datos.fecha_hora;
  let fechaReal;

  if (fechaBase) {
    fechaReal = calcularFechaReal(fechaBase, datos.anticipacion_min || 0);
    if (fechaReal <= new Date()) {
      throw new AppError('La fecha debe ser futura', 400);
    }
    await cancelarJob(id);
  } else {
    fechaReal = existe.fecha_hora;
  }

  const actualizado = await recordatorioModel.actualizar(id, usuarioId, {
    ...datos,
    fecha_hora: fechaReal,
  });

  if (fechaBase) {
    await agregarJob(
      {
        recordatorioId: id,
        usuarioId,
        titulo: datos.titulo || existe.titulo,
        mensaje: datos.mensaje || existe.mensaje,
      },
      fechaReal
    );
  }

  console.log(`🔄 Recordatorio ${id} actualizado`);

  return actualizado;
};

// ─────────────────────────────────────────────
// ELIMINAR
// ─────────────────────────────────────────────
export const eliminar = async (id, usuarioId) => {
  const existe = await recordatorioModel.encontrarPorId(id, usuarioId);
  if (!existe) throw new AppError('Recordatorio no encontrado', 404);

  await cancelarJob(id);
  await recordatorioModel.eliminar(id, usuarioId);
};

export const eliminarTodos = async (usuarioId) => {
  const count = await recordatorioModel.eliminarTodos(usuarioId);
  return count;
};
