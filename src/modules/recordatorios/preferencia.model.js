// src/modules/recordatorios/preferencia.model.js
import pool from '../../config/db.js';

export const encontrarPorUsuario = async (usuarioId) => {
  const { rows } = await pool.query(
    'SELECT * FROM preferencias_notificacion WHERE usuario_id = $1',
    [usuarioId]
  );
  return rows[0] || null;
};

export const upsert = async (usuarioId, datos) => {
  const {
    notificaciones_activas = true,
    hora_silencio_inicio = '22:00',
    hora_silencio_fin = '07:00',
    tipo_agenda = true,
    tipo_habitos = true,
    tipo_manual = true,
  } = datos;

  const { rows } = await pool.query(
    `INSERT INTO preferencias_notificacion
     (usuario_id, notificaciones_activas, hora_silencio_inicio,
      hora_silencio_fin, tipo_agenda, tipo_habitos, tipo_manual)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (usuario_id) DO UPDATE SET
       notificaciones_activas = EXCLUDED.notificaciones_activas,
       hora_silencio_inicio   = EXCLUDED.hora_silencio_inicio,
       hora_silencio_fin      = EXCLUDED.hora_silencio_fin,
       tipo_agenda            = EXCLUDED.tipo_agenda,
       tipo_habitos           = EXCLUDED.tipo_habitos,
       tipo_manual            = EXCLUDED.tipo_manual
     RETURNING *`,
    [usuarioId, notificaciones_activas, hora_silencio_inicio,
     hora_silencio_fin, tipo_agenda, tipo_habitos, tipo_manual]
  );
  return rows[0];
};
