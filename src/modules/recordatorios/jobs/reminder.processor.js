// src/workers/reminder.processor.js

import { Worker } from 'bullmq';
import { redisConfig } from '../../../config/redis.js';
import pool from '../../../config/db.js'

// ─── PROCESADOR ─────────────────────────────
const procesarRecordatorio = async (job) => {
  console.log("📩 JOB RECIBIDO EN WORKER:", job.name);
  console.log("📦 DATA:", job.data);

  const { recordatorioId, usuarioId, titulo, mensaje } = job.data;

  try {
    // 1. Validar estado del recordatorio
    const { rows } = await pool.query(
      'SELECT * FROM recordatorios WHERE id = $1 AND estado = $2',
      [recordatorioId, 'pendiente']
    );

    if (rows.length === 0) {
      console.log("⛔ Recordatorio ya no pendiente:", recordatorioId);
      return;
    }

    // ─────────────────────────────────────────
    // 2. 🔥 IDPOTENCIA: evitar duplicados
    // ─────────────────────────────────────────
    const check = await pool.query(
      `SELECT 1 FROM notificaciones 
       WHERE recordatorio_id = $1 AND usuario_id = $2`,
      [recordatorioId, usuarioId]
    );

    if (check.rows.length > 0) {
      console.log("⚠️ Notificación ya existe, se evita duplicado:", recordatorioId);
      return;
    }

    // 3. Insertar notificación
    await pool.query(
      `INSERT INTO notificaciones (usuario_id, recordatorio_id, titulo, mensaje, tipo)
       VALUES ($1, $2, $3, $4, 'app')`,
      [usuarioId, recordatorioId, titulo, mensaje || titulo]
    );

    // 4. Marcar como enviado
    await pool.query(
      `UPDATE recordatorios
       SET estado = 'enviado',
           ultimo_intento = NOW(),
           intentos = intentos + 1
       WHERE id = $1`,
      [recordatorioId]
    );

    console.log("✅ PROCESADO:", recordatorioId);

  } catch (error) {
    console.error("💥 ERROR EN WORKER:", error);
  }
};

// ─── WORKER ────────────────────────────────
const worker = new Worker(
  'recordatorios',
  procesarRecordatorio,
  {
    connection: redisConfig,
    concurrency: 5,
  }
);

// ─── EVENTOS IMPORTANTES ───────────────────
worker.on('ready', () => {
  console.log("🚀 WORKER CONECTADO A REDIS Y LISTO");
});

worker.on('active', (job) => {
  console.log("⚡ EJECUTANDO JOB:", job.id);
});

worker.on('completed', (job) => {
  console.log("🎯 JOB COMPLETADO:", job.id);
});

worker.on('failed', (job, err) => {
  console.error("❌ JOB FALLÓ:", job?.id, err.message);
});

worker.on('error', (err) => {
  console.error("💥 ERROR WORKER:", err);
});

export default worker;