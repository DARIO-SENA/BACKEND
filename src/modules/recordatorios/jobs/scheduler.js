// src/services/jobs/scheduler.js
// Se llama una vez al iniciar el servidor para reprogramar recordatorios pendientes

import * as recordatorioModel from '../recordatorio.model.js';
import { agregarJob, cancelarJob } from './queue.js';

/**
 * Al iniciar el servidor, recarga todos los recordatorios
 * pendientes de la BD y los reprograma en BullMQ.
 * Esto evita perder recordatorios si el servidor se reinicia.
 */
export const iniciarScheduler = async () => {
  try {
    const pendientes = await recordatorioModel.encontrarPendientes();

    for (const rec of pendientes) {
      await cancelarJob(rec.id);
      await agregarJob(
        {
          recordatorioId: rec.id,
          usuarioId:      rec.usuario_id,
          titulo:         rec.titulo,
          mensaje:        rec.mensaje,
        },
        new Date(rec.fecha_hora)
      );
    }

    if (pendientes.length > 0) {
      console.log(`✅ ${pendientes.length} recordatorio(s) reprogramado(s)`);
    }
  } catch (err) {
    console.error('❌ Error al iniciar scheduler:', err.message);
  }
};
