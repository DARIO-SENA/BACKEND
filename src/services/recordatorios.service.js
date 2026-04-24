// src/services/recordatorios.service.js

import * as recordatorioModel from '../models/recordatorio.model.js';
import { agregarJob, cancelarJob } from './jobs/queue.js';
import { calcularFechaReal } from '../utils/time.utils.js';

export const listar = async (usuarioId, filtros) => {
  return recordatorioModel.encontrarTodos(usuarioId, filtros);
};

export const obtenerPorId = async (id, usuarioId) => {
  const rec = await recordatorioModel.encontrarPorId(id, usuarioId);
  if (!rec) throw { status: 404, message: 'Recordatorio no encontrado' };
  return rec;
};

export const crear = async (usuarioId, datos) => {
  const { titulo, fecha_hora, anticipacion_min = 0 } = datos;
  if (!titulo)     throw { status: 400, message: 'El título es obligatorio' };
  if (!fecha_hora) throw { status: 400, message: 'La fecha y hora son obligatorias' };

  const fechaReal = calcularFechaReal(fecha_hora, anticipacion_min);
  if (fechaReal <= new Date()) throw { status: 400, message: 'La fecha debe ser futura' };

  const recordatorio = await recordatorioModel.insertar(usuarioId, {
    ...datos,
    fecha_hora: fechaReal,
  });

  await agregarJob(
    { recordatorioId: recordatorio.id, usuarioId, titulo, mensaje: datos.mensaje },
    fechaReal
  );

  return recordatorio;
};

export const actualizar = async (id, usuarioId, datos) => {
  const existe = await recordatorioModel.encontrarPorId(id, usuarioId);
  if (!existe) throw { status: 404, message: 'Recordatorio no encontrado' };

  const fechaReal = calcularFechaReal(datos.fecha_hora, datos.anticipacion_min || 0);

  // Cancelar job anterior y reprogramar
  await cancelarJob(id);

  const actualizado = await recordatorioModel.actualizar(id, usuarioId, {
    ...datos,
    fecha_hora: fechaReal,
  });

  await agregarJob(
    { recordatorioId: id, usuarioId, titulo: datos.titulo, mensaje: datos.mensaje },
    fechaReal
  );

  return actualizado;
};

export const eliminar = async (id, usuarioId) => {
  const existe = await recordatorioModel.encontrarPorId(id, usuarioId);
  if (!existe) throw { status: 404, message: 'Recordatorio no encontrado' };

  await cancelarJob(id);
  await recordatorioModel.eliminar(id, usuarioId);
};
