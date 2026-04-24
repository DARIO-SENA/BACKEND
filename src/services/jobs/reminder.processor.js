// src/modules/recordatorios/jobs/reminder.processor.js
// Worker independiente que procesa la cola de recordatorios


import { Worker } from 'bullmq';
import { conexionRedis } from './queue.js';
import pool from '../../config/db.js';

// ─── PROCESADOR PRINCIPAL ──────────────────────────────────

const procesarRecordatorio = async (job) => {
  const { recordatorioId, usuarioId, titulo, mensaje, tipo } = job.data;

  console.log(`Procesando recordatorio ${recordatorioId} para usuario ${usuarioId}`);

  // 1. Verificar que el recordatorio sigue pendiente
  const { rows } = await pool.query(
    'SELECT * FROM recordatorios WHERE id = $1 AND estado = $2',
    [recordatorioId, 'pendiente']
  );

  if (rows.length === 0) {
    console.log(`Recordatorio ${recordatorioId} ya no está pendiente, saltando`);
    return { saltado: true };
  }

  const recordatorio = rows[0];

  // 2. Verificar preferencias del usuario (hora de silencio)
  const { rows: prefs } = await pool.query(
    'SELECT * FROM preferencias_notificacion WHERE usuario_id = $1',
    [usuarioId]
  );

  if (prefs.length > 0) {
    const pref = prefs[0];
    if (!pref.notificaciones_activas) {
      console.log(`Usuario ${usuarioId} tiene notificaciones desactivadas`);
      return { saltado: true, razon: 'notificaciones desactivadas' };
    }

    // Verificar hora de silencio
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    const [hSilencioInicio] = pref.hora_silencio_inicio.split(':').map(Number);
    const [hSilencioFin]    = pref.hora_silencio_fin.split(':').map(Number);
    const minSilencioInicio = hSilencioInicio * 60;
    const minSilencioFin    = hSilencioFin * 60;

    const enSilencio = minSilencioInicio > minSilencioFin
      ? horaActual >= minSilencioInicio || horaActual < minSilencioFin
      : horaActual >= minSilencioInicio && horaActual < minSilencioFin;

    if (enSilencio) {
      // Reagendar para después del silencio
      console.log(`Usuario ${usuarioId} en hora de silencio, reagendando`);
      return { reagendado: true };
    }
  }

  // 3. Crear la notificación en la BD
  await pool.query(
    `INSERT INTO notificaciones (usuario_id, recordatorio_id, titulo, mensaje, tipo)
     VALUES ($1, $2, $3, $4, 'app')`,
    [usuarioId, recordatorioId, titulo, mensaje || titulo]
  );

  // 4. Marcar recordatorio como enviado
  await pool.query(
    `UPDATE recordatorios
     SET estado = 'enviado', ultimo_intento = NOW(), intentos = intentos + 1
     WHERE id = $1`,
    [recordatorioId]
  );

  // 5. Si es recurrente, crear el siguiente recordatorio
  if (recordatorio.es_recurrente && recordatorio.regla_recurrencia) {
    await crearSiguienteRecurrencia(recordatorio);
  }

  console.log(`Recordatorio ${recordatorioId} enviado exitosamente`);
  return { enviado: true };
};

// ─── RECURRENCIA ───────────────────────────────────────────

const crearSiguienteRecurrencia = async (recordatorio) => {
  const fechaActual = new Date(recordatorio.fecha_hora);
  let siguienteFecha;

  switch (recordatorio.regla_recurrencia) {
    case 'diario':
      siguienteFecha = new Date(fechaActual.setDate(fechaActual.getDate() + 1));
      break;
    case 'semanal':
      siguienteFecha = new Date(fechaActual.setDate(fechaActual.getDate() + 7));
      break;
    case 'mensual':
      siguienteFecha = new Date(fechaActual.setMonth(fechaActual.getMonth() + 1));
      break;
    default:
      return;
  }

  await pool.query(
    `INSERT INTO recordatorios
     (usuario_id, tipo, referencia_id, titulo, mensaje, fecha_hora,
      anticipacion_min, es_recurrente, regla_recurrencia)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      recordatorio.usuario_id, recordatorio.tipo, recordatorio.referencia_id,
      recordatorio.titulo, recordatorio.mensaje, siguienteFecha,
      recordatorio.anticipacion_min, true, recordatorio.regla_recurrencia,
    ]
  );
};

// ─── INICIAR WORKER ────────────────────────────────────────

const worker = new Worker('recordatorios', procesarRecordatorio, {
  connection: conexionRedis,
  concurrency: 5, // procesar 5 recordatorios en paralelo
});

worker.on('failed', async (job, err) => {
  if (job) {
    await pool.query(
      `UPDATE recordatorios
       SET estado = 'fallido', ultimo_intento = NOW(), intentos = intentos + 1
       WHERE id = $1`,
      [job.data.recordatorioId]
    );
  }
  console.error(`Job ${job?.id} falló definitivamente:`, err.message);
});

console.log('Worker de recordatorios iniciado');

export default worker;
