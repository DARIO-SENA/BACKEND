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
  const hoy     = new Date();
  const en7dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);

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
         SET fecha_inicio = $1, fecha_fin = $2, auto_programada = true
         WHERE id = $3 AND usuario_id = $4`,
        [slot.fecha_inicio, slot.fecha_fin, tarea.id, usuarioId]
      );
    } else {
      resultado.push({
        tarea_id:   tarea.id,
        programada: false,
        razon:      'Sin slots disponibles en los próximos 7 días',
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