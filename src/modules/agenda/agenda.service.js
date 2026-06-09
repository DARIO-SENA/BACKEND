import pool from '../../config/db.js';

const BLOQUES_BLOQUEADOS = {
  descanso_nocturno: { inicio: 23, fin: 7 },
  almuerzo:          { inicio: 12, fin: 13 },
};

const obtenerBloquesOcupados = async (usuarioId, desde, hasta) => {
  const { rows } = await pool.query(
    `SELECT fecha_inicio, fecha_fin, duracion_minutos
     FROM tareas
     WHERE usuario_id = $1
       AND fecha_inicio IS NOT NULL
       AND estado NOT IN ('cancelada', 'completada')
       AND fecha_inicio >= $2
       AND fecha_inicio <= $3`,
    [usuarioId, desde, hasta]
  );
  return rows;
};

const estaEnBloqueBloqueado = (hora) => {
  const { descanso_nocturno, almuerzo } = BLOQUES_BLOQUEADOS;
  if (hora >= descanso_nocturno.inicio || hora < descanso_nocturno.fin) return true;
  if (hora >= almuerzo.inicio && hora < almuerzo.fin) return true;
  return false;
};

export const encontrarSlotLibre = (bloquesOcupados, duracionMin, fechaBase) => {
  const inicio = new Date(fechaBase);
  inicio.setMinutes(0, 0, 0);

  const ahora = new Date();
  if (inicio.toDateString() === ahora.toDateString()) {
    inicio.setHours(ahora.getHours() + 1, 0, 0, 0);
  } else {
    inicio.setHours(8, 0, 0, 0);
  }

  for (let i = 0; i < 48; i++) {
    const candidatoInicio = new Date(inicio.getTime() + i * 30 * 60 * 1000);
    const candidatoFin    = new Date(candidatoInicio.getTime() + duracionMin * 60 * 1000);
    const hora = candidatoInicio.getHours();

    if (estaEnBloqueBloqueado(hora)) continue;

    const hayConflicto = bloquesOcupados.some((bloque) => {
      const bInicio = new Date(bloque.fecha_inicio);
      const bFin    = bloque.fecha_fin
        ? new Date(bloque.fecha_fin)
        : new Date(bInicio.getTime() + bloque.duracion_minutos * 60 * 1000);
      return candidatoInicio < bFin && candidatoFin > bInicio;
    });

    if (!hayConflicto) {
      return { fecha_inicio: candidatoInicio, fecha_fin: candidatoFin };
    }
  }
  return null;
};

export const programarTareasAutomaticamente = async (usuarioId, tareas) => {
  const hoy    = new Date();
  const en7dias = new Date(hoy);
  en7dias.setDate(en7dias.getDate() + 7);

  const bloquesOcupados = await obtenerBloquesOcupados(usuarioId, hoy, en7dias);
  const resultado = [];

  const ordenadas = [...tareas].sort((a, b) => {
    const orden = { alta: 0, media: 1, baja: 2 };
    return orden[a.prioridad] - orden[b.prioridad];
  });

  for (const tarea of ordenadas) {
    const slot = encontrarSlotLibre(bloquesOcupados, tarea.duracion_minutos || 30, hoy);

    if (slot) {
      bloquesOcupados.push({
        fecha_inicio:     slot.fecha_inicio,
        fecha_fin:        slot.fecha_fin,
        duracion_minutos: tarea.duracion_minutos || 30,
      });

      resultado.push({
        tarea_id:     tarea.id,
        fecha_inicio: slot.fecha_inicio,
        fecha_fin:    slot.fecha_fin,
        programada:   true,
      });

      await pool.query(
        `UPDATE tareas
         SET fecha_inicio = $1, fecha_fin = $2, auto_programado = true
         WHERE id = $3 AND usuario_id = $4`,
        [slot.fecha_inicio, slot.fecha_fin, tarea.id, usuarioId]
      );
    } else {
      resultado.push({
        tarea_id:  tarea.id,
        programada: false,
        razon:     'Sin slots disponibles en los próximos 7 días',
      });
    }
  }
  return resultado;
};

export const sugerirReagendamiento = async (usuarioId) => {
  const { rows: vencidas } = await pool.query(
    `SELECT * FROM tareas
     WHERE usuario_id = $1
       AND estado = 'pendiente'
       AND fecha_inicio < NOW()
     ORDER BY prioridad, fecha_limite ASC`,
    [usuarioId]
  );
  if (vencidas.length === 0) return [];
  return programarTareasAutomaticamente(usuarioId, vencidas);
};

// ─── BLOQUES DE TIEMPO PERSONALIZADOS ────────────────────

export const obtenerBloques = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT * FROM bloques_tiempo 
     WHERE usuario_id = $1 AND activo = true
     ORDER BY hora_inicio ASC`,
    [usuarioId]
  );
  return rows;
};

export const crearBloque = async (usuarioId, data) => {
  const { nombre, hora_inicio, hora_fin } = data;
  if (!nombre || !nombre.trim()) throw new AppError('Nombre requerido', 400);
  if (!hora_inicio || !/^\d{2}:\d{2}$/.test(hora_inicio)) throw new AppError('hora_inicio debe ser HH:MM', 400);
  if (!hora_fin || !/^\d{2}:\d{2}$/.test(hora_fin)) throw new AppError('hora_fin debe ser HH:MM', 400);
  const { rows } = await pool.query(
    `INSERT INTO bloques_tiempo (usuario_id, nombre, hora_inicio, hora_fin)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [usuarioId, nombre.trim(), hora_inicio, hora_fin]
  );
  return rows[0];
};

export const actualizarBloque = async (id, usuarioId, data) => {
  const { nombre, hora_inicio, hora_fin, activo } = data;
  const { rows } = await pool.query(
    `UPDATE bloques_tiempo 
     SET nombre = COALESCE($1, nombre),
         hora_inicio = COALESCE($2, hora_inicio),
         hora_fin = COALESCE($3, hora_fin),
         activo = COALESCE($4, activo)
     WHERE id = $5 AND usuario_id = $6
     RETURNING *`,
    [nombre, hora_inicio, hora_fin, activo, id, usuarioId]
  );
  return rows[0] || null;
};

export const eliminarBloque = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    `DELETE FROM bloques_tiempo WHERE id = $1 AND usuario_id = $2`,
    [id, usuarioId]
  );
  return rowCount > 0;
};

// ─── VISTA SEMANAL MEJORADA ───────────────────────────────
export const obtenerVistaSemanal = async (usuarioId, fechaInicio) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 7);

  const { rows } = await pool.query(
    `SELECT 
       t.*,
       c.nombre AS categoria_nombre,
       c.color AS categoria_color,
       EXTRACT(DOW FROM t.fecha_inicio) AS dia_semana,
       EXTRACT(HOUR FROM t.fecha_inicio) AS hora
     FROM tareas t
     LEFT JOIN categorias c ON t.categoria_id = c.id
     WHERE t.usuario_id = $1
       AND t.fecha_inicio >= $2
       AND t.fecha_inicio < $3
       AND t.estado != 'cancelada'
     ORDER BY t.fecha_inicio ASC`,
    [usuarioId, inicio, fin]
  );

  // Agrupar por día
  const semana = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []};
  rows.forEach(tarea => {
    const dia = parseInt(tarea.dia_semana);
    semana[dia].push(tarea);
  });

  return {
    fecha_inicio: inicio,
    fecha_fin: fin,
    dias: semana,
    total: rows.length
  };
};