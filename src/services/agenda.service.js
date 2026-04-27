import pool from '../config/db.js';

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

// ─── CREAR TAREA RECURRENTE ───────────────────────────────
export const createRecurringTask = async (usuarioId, data) => {
  const {
    titulo, descripcion, prioridad = "media",
    fecha_inicio, duracion_minutos = 30,
    todo_el_dia = false, categoria_id,
    frecuencia, intervalo = 1, dias_semana, fecha_fin
  } = data;

  // 1. Crear la tarea base
  const { rows: tareaRows } = await pool.query(
    `INSERT INTO tareas 
      (usuario_id, titulo, descripcion, prioridad, fecha_inicio,
       duracion_minutos, todo_el_dia, es_recurrente, categoria_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,true,$8)
     RETURNING *`,
    [usuarioId, titulo, descripcion, prioridad, fecha_inicio,
     duracion_minutos, todo_el_dia, categoria_id || null]
  );

  const tarea = tareaRows[0];

  // 2. Crear la recurrencia
  const { rows: recRows } = await pool.query(
    `INSERT INTO recurrencias 
      (tarea_id, frecuencia, intervalo, dias_semana, fecha_fin)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [tarea.id, frecuencia, intervalo, dias_semana || null, fecha_fin || null]
  );

  // 3. Vincular recurrencia a la tarea
  await pool.query(
    `UPDATE tareas SET recurrencia_id = $1 WHERE id = $2`,
    [recRows[0].id, tarea.id]
  );

  // 4. Generar las tareas futuras automáticamente
  await generarTareasRecurrentes(tarea, recRows[0]);

  return { ...tarea, recurrencia: recRows[0] };
};

// ─── GENERAR TAREAS FUTURAS ───────────────────────────────
const generarTareasRecurrentes = async (tareaBase, recurrencia) => {
  const fechas = calcularFechas(recurrencia, tareaBase.fecha_inicio);

  for (const fecha of fechas) {
    await pool.query(
      `INSERT INTO tareas 
        (usuario_id, titulo, descripcion, prioridad, fecha_inicio,
         duracion_minutos, todo_el_dia, es_recurrente, categoria_id, recurrencia_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true,$8,$9)`,
      [
        tareaBase.usuario_id, tareaBase.titulo, tareaBase.descripcion,
        tareaBase.prioridad, fecha, tareaBase.duracion_minutos,
        tareaBase.todo_el_dia, tareaBase.categoria_id, recurrencia.id
      ]
    );
  }
};

// ─── CALCULAR FECHAS SEGÚN FRECUENCIA ────────────────────
const calcularFechas = (recurrencia, fechaInicio) => {
  const fechas = [];
  const inicio = new Date(fechaInicio);
  const fin = recurrencia.fecha_fin
    ? new Date(recurrencia.fecha_fin)
    : new Date(inicio.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días por defecto

  let actual = new Date(inicio);

  while (actual <= fin) {
    // Saltar la fecha de inicio (ya se creó como tarea base)
    if (actual.getTime() !== inicio.getTime()) {
      fechas.push(new Date(actual));
    }

    // Avanzar según frecuencia
    switch (recurrencia.frecuencia) {
      case 'diaria':
        actual.setDate(actual.getDate() + recurrencia.intervalo);
        break;
      case 'semanal':
        actual.setDate(actual.getDate() + (7 * recurrencia.intervalo));
        break;
      case 'mensual':
        actual.setMonth(actual.getMonth() + recurrencia.intervalo);
        break;
      default:
        return fechas;
    }
  }

  return fechas;
};

// ─── DETECTAR CONFLICTOS DE HORARIO ──────────────────────
export const detectarConflictos = async (usuarioId, fecha_inicio, duracion_minutos, excludeId = null) => {
  const fecha_fin = new Date(new Date(fecha_inicio).getTime() + duracion_minutos * 60000);

  let query = `
    SELECT * FROM tareas
    WHERE usuario_id = $1
      AND estado NOT IN ('completada', 'cancelada')
      AND fecha_inicio IS NOT NULL
      AND (
        fecha_inicio < $2
        AND (fecha_inicio + (duracion_minutos || ' minutes')::interval) > $3
      )
  `;
  const params = [usuarioId, fecha_fin, fecha_inicio];

  if (excludeId) {
    query += ` AND id != $4`;
    params.push(excludeId);
  }

  const { rows } = await pool.query(query, params);
  return rows;
};