import pool from '../../config/db.js';
import eventBus from '../../eventBus/index.js';
import { EVENTS } from '../../eventBus/events.js';

export const obtenerSettings = async (usuarioId) => {
  const { rows } = await pool.query(
    'SELECT * FROM pomodoro_settings WHERE usuario_id = $1',
    [usuarioId]
  );
  if (rows.length > 0) return rows[0];

  const { rows: nuevo } = await pool.query(
    `INSERT INTO pomodoro_settings (usuario_id)
     VALUES ($1) RETURNING *`,
    [usuarioId]
  );
  return nuevo[0];
};

export const actualizarSettings = async (usuarioId, datos) => {
  const campos = [];
  const valores = [];
  let i = 1;

  const permitidos = [
    'duracion_foco', 'descanso_corto', 'descanso_largo',
    'intervalos_antes_descanso_largo', 'auto_iniciar_descanso', 'notificaciones_sonido',
  ];

  for (const campo of permitidos) {
    if (datos[campo] !== undefined) {
      campos.push(`${campo} = $${i++}`);
      valores.push(datos[campo]);
    }
  }

  if (campos.length === 0) return obtenerSettings(usuarioId);

  valores.push(usuarioId);
  const { rows } = await pool.query(
    `UPDATE pomodoro_settings SET ${campos.join(', ')}, actualizado_en = NOW()
     WHERE usuario_id = $${i} RETURNING *`,
    valores
  );
  return rows[0] || null;
};

export const iniciarSession = async (usuarioId, opts = {}) => {
  const { tarea_id = null, duracion_minutos = null, descanso_minutos = null } = opts || {};
  const settings = await obtenerSettings(usuarioId);

  const inicio = new Date();
  const duracion = duracion_minutos || settings.duracion_foco;
  const descanso = descanso_minutos !== null ? descanso_minutos : settings.descanso_corto;

  const { rows } = await pool.query(
    `INSERT INTO pomodoro_sessions
     (usuario_id, tarea_id, duracion_minutos, descanso_minutos, inicio_en, estado)
     VALUES ($1, $2, $3, $4, $5, 'en_curso')
     RETURNING *`,
    [usuarioId, tarea_id, duracion, descanso, inicio]
  );

  return {
    ...rows[0],
    fin_estimado: new Date(inicio.getTime() + duracion * 60000),
  };
};

export const completarSession = async (id, usuarioId) => {
  const actual = await pool.query(
    'SELECT * FROM pomodoro_sessions WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  if (actual.rows.length === 0) return null;
  if (actual.rows[0].estado !== 'en_curso') return null;

  const ahora = new Date();
  const { rows } = await pool.query(
    `UPDATE pomodoro_sessions
     SET estado = 'completada', fin_en = $1
     WHERE id = $2 AND usuario_id = $3
     RETURNING *`,
    [ahora, id, usuarioId]
  );

  eventBus.emit(EVENTS.FOCUS_SESSION_COMPLETED, {
    usuarioId,
    session: rows[0],
  });

  return rows[0];
};

export const interrumpirSession = async (id, usuarioId) => {
  const ahora = new Date();
  const { rows } = await pool.query(
    `UPDATE pomodoro_sessions
     SET estado = 'interrumpida', fin_en = $1
     WHERE id = $2 AND usuario_id = $3 AND estado = 'en_curso'
     RETURNING *`,
    [ahora, id, usuarioId]
  );
  return rows[0] || null;
};

export const listarSessions = async (usuarioId, filtros = {}) => {
  const { estado, desde, hasta, tarea_id, limite = 50 } = filtros;
  const valores = [usuarioId];
  const condiciones = ['ps.usuario_id = $1'];
  const condicionesCount = ['usuario_id = $1'];
  let i = 2;

  if (estado)    { condiciones.push(`ps.estado = $${i}`); condicionesCount.push(`estado = $${i}`); valores.push(estado); i++; }
  if (desde)     { condiciones.push(`ps.inicio_en >= $${i}`); condicionesCount.push(`inicio_en >= $${i}`); valores.push(desde); i++; }
  if (hasta)     { condiciones.push(`ps.inicio_en <= $${i}`); condicionesCount.push(`inicio_en <= $${i}`); valores.push(hasta); i++; }
  if (tarea_id)  { condiciones.push(`ps.tarea_id = $${i}`); condicionesCount.push(`tarea_id = $${i}`); valores.push(tarea_id); i++; }

  const countValores = [...valores];
  valores.push(limite);
  const { rows } = await pool.query(
    `SELECT ps.*, t.titulo AS tarea_titulo
     FROM pomodoro_sessions ps
     LEFT JOIN tareas t ON t.id = ps.tarea_id
     WHERE ${condiciones.join(' AND ')}
     ORDER BY ps.inicio_en DESC
     LIMIT $${i}::int`,
    valores
  );

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) AS total FROM pomodoro_sessions WHERE ${condicionesCount.join(' AND ')}`,
    countValores
  );

  return { data: rows, total: parseInt(countRows[0].total) };
};

export const obtenerEstadisticas = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE estado = 'completada') AS total_completados,
       COUNT(*) FILTER (WHERE estado = 'interrumpida') AS total_interrumpidos,
       COALESCE(SUM(duracion_minutos) FILTER (WHERE estado = 'completada'), 0) AS minutos_totales_foco,
       COUNT(DISTINCT DATE(inicio_en)) AS dias_activos,
       COUNT(*) FILTER (WHERE estado = 'completada' AND inicio_en >= NOW() - INTERVAL '7 days') AS completados_semana,
       COALESCE(SUM(duracion_minutos) FILTER (WHERE estado = 'completada' AND inicio_en >= NOW() - INTERVAL '7 days'), 0) AS minutos_semana,
       COALESCE(AVG(duracion_minutos) FILTER (WHERE estado = 'completada'), 0)::int AS promedio_minutos_por_session
     FROM pomodoro_sessions
     WHERE usuario_id = $1`,
    [usuarioId]
  );

  const { rows: hoy } = await pool.query(
    `SELECT COALESCE(SUM(duracion_minutos), 0) AS minutos_hoy
     FROM pomodoro_sessions
     WHERE usuario_id = $1 AND estado = 'completada'
       AND DATE(inicio_en) = CURRENT_DATE`,
    [usuarioId]
  );

  const { rows: racha } = await pool.query(
    `SELECT DATE(inicio_en) AS fecha
     FROM pomodoro_sessions
     WHERE usuario_id = $1 AND estado = 'completada'
     GROUP BY DATE(inicio_en)
     ORDER BY fecha DESC`,
    [usuarioId]
  );

  let rachaActual = 0;
  if (racha.length > 0) {
    const TZ = 'America/Bogota';
    const hoyDate = new Date().toLocaleDateString('en-CA', { timeZone: TZ });
    const ayerDate = new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: TZ });
    const primera = racha[0].fecha;
    const primeraLocal = primera instanceof Date
      ? primera.toLocaleDateString('en-CA', { timeZone: TZ })
      : String(primera).split('T')[0];
    if (primeraLocal === hoyDate || primeraLocal === ayerDate) {
      rachaActual = 1;
      for (let i = 1; i < racha.length; i++) {
        const diff = (new Date(racha[i - 1].fecha) - new Date(racha[i].fecha)) / 86400000;
        if (diff === 1) rachaActual++;
        else break;
      }
    }
  }

  return {
    ...rows[0],
    minutos_hoy: parseInt(hoy[0].minutos_hoy),
    racha_actual: rachaActual,
  };
};

export const obtenerTareasSugeridas = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT id, titulo, duracion_minutos, prioridad
     FROM tareas
     WHERE usuario_id = $1 AND estado = 'pendiente'
     ORDER BY
       CASE prioridad WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END,
       fecha_limite ASC NULLS LAST
     LIMIT 10`,
    [usuarioId]
  );
  return rows;
};
