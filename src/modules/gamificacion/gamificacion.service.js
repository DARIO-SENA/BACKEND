// src/modules/gamificacion/gamificacion.service.js

import pool from '../../config/db.js';



// ─── CONSTANTES ────────────────────────────────────────────
const registrarEventoSiNoExiste = async (
  cliente,
  usuarioId,
  tipo,
  referenciaTipo,
  referenciaId,
  puntos
) => {
  const existe = await cliente.query(
    `SELECT 1 FROM eventos_gamificacion
     WHERE usuario_id = $1
       AND tipo = $2
       AND referencia_tipo = $3
       AND referencia_id = $4`,
    [usuarioId, tipo, referenciaTipo, referenciaId]
  );

  if (existe.rows.length > 0) {
    return false; // ya fue procesado
  }

  await cliente.query(
    `INSERT INTO eventos_gamificacion
     (usuario_id, tipo, referencia_tipo, referencia_id, puntos)
     VALUES ($1,$2,$3,$4,$5)`,
    [usuarioId, tipo, referenciaTipo, referenciaId, puntos]
  );

  return true;
};


// Puntos por acción
const PUNTOS = {
  tarea_baja:        5,
  tarea_media:       10,
  tarea_alta:        20,
  habito_completado: 15,
  racha_bonus:       5,    // bonus extra por cada día de racha
};

// XP necesaria por nivel (curva exponencial)
const calcularXpSiguienteNivel = (nivel) => Math.floor(100 * Math.pow(1.5, nivel - 1));

// ─── PERFIL ────────────────────────────────────────────────

export const obtenerOCrearPerfil = async (usuarioId) => {
  const { rows } = await pool.query(
    'SELECT * FROM perfil_gamificacion WHERE usuario_id = $1',
    [usuarioId]
  );

  if (rows.length > 0) return rows[0];

  const { rows: nuevo } = await pool.query(
    `INSERT INTO perfil_gamificacion (usuario_id, xp_siguiente)
     VALUES ($1, $2) RETURNING *`,
    [usuarioId, calcularXpSiguienteNivel(1)]
  );
  return nuevo[0];
};

export const obtenerPerfil = async (usuarioId) => {
  const perfil = await obtenerOCrearPerfil(usuarioId);
  const logros  = await obtenerLogrosUsuario(usuarioId);
  const historial = await obtenerHistorialPuntos(usuarioId, 10);

  return {
    ...perfil,
    logros_obtenidos: logros.filter(l => l.obtenido).length,
    total_logros: logros.length,
    logros,
    historial_reciente: historial,
  };
};

// ─── PUNTOS Y NIVELES ──────────────────────────────────────

export const otorgarPuntos = async (
  usuarioId,
  puntos,
  motivo,
  referenciaTipo = null,
  referenciaId = null
) => {
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');

    // 🔒 VALIDACIÓN DE EVENTO (ANTI DUPLICADO)
    if (referenciaTipo && referenciaId) {
      const esNuevo = await registrarEventoSiNoExiste(
        cliente,
        usuarioId,
        motivo,
        referenciaTipo,
        referenciaId,
        puntos
      );

      if (!esNuevo) {
        await cliente.query('ROLLBACK');
        return await obtenerOCrearPerfil(usuarioId);
      }
    }

    // 1. historial de puntos (NO es el control principal ahora)
    await cliente.query(
      `INSERT INTO historial_puntos
       (usuario_id, puntos, motivo, referencia_tipo, referencia_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [usuarioId, puntos, motivo, referenciaTipo, referenciaId]
    );

    // 2. actualizar perfil
    const { rows } = await cliente.query(
      `UPDATE perfil_gamificacion
       SET puntos_totales = puntos_totales + $1,
           xp_actual = xp_actual + $1
       WHERE usuario_id = $2
       RETURNING *`,
      [puntos, usuarioId]
    );

    let perfil = rows[0];

    // 3. niveles
    while (perfil.xp_actual >= perfil.xp_siguiente) {
      const nuevoNivel = perfil.nivel + 1;
      const xpRestante = perfil.xp_actual - perfil.xp_siguiente;
      const nuevaXpSiguiente = calcularXpSiguienteNivel(nuevoNivel);

      const { rows: actualizado } = await cliente.query(
        `UPDATE perfil_gamificacion
         SET nivel = $1,
             xp_actual = $2,
             xp_siguiente = $3
         WHERE usuario_id = $4
         RETURNING *`,
        [nuevoNivel, xpRestante, nuevaXpSiguiente, usuarioId]
      );

      perfil = actualizado[0];
    }

    await cliente.query('COMMIT');

    // 4. logros SIEMPRE después del commit
    await verificarLogros(usuarioId);

    return perfil;

  } catch (err) {
    await cliente.query('ROLLBACK');
    throw err;
  } finally {
    cliente.release();
  }
};

// ─── RACHAS ────────────────────────────────────────────────

export const actualizarRacha = async (usuarioId) => {
  const hoy = new Date().toISOString().split('T')[0];
  const perfil = await obtenerOCrearPerfil(usuarioId);

  const ultimaActividad = perfil.ultima_actividad
    ? new Date(perfil.ultima_actividad).toISOString().split('T')[0]
    : null;

  let nuevaRacha = perfil.racha_actual;

  if (ultimaActividad === hoy) {
    // Ya registró actividad hoy — no cambiar racha
    return perfil;
  }

  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const ayerStr = ayer.toISOString().split('T')[0];

  if (ultimaActividad === ayerStr) {
    // Actividad consecutiva — sumar racha
    nuevaRacha = perfil.racha_actual + 1;
  } else {
    // Se rompió la racha
    nuevaRacha = 1;
  }

  const mejorRacha = Math.max(nuevaRacha, perfil.mejor_racha);

  const { rows } = await pool.query(
    `UPDATE perfil_gamificacion
     SET racha_actual = $1, mejor_racha = $2, ultima_actividad = $3
     WHERE usuario_id = $4 RETURNING *`,
    [nuevaRacha, mejorRacha, hoy, usuarioId]
  );

  return rows[0];
};

// ─── AL COMPLETAR TAREA ────────────────────────────────────

export const procesarTareaCompletada = async (usuarioId, tarea) => {
  const puntosPrioridad =
    PUNTOS[`tarea_${tarea.prioridad}`] || PUNTOS.tarea_media;

  const perfil = await actualizarRacha(usuarioId);
  const bonusRacha =
    perfil.racha_actual > 1 ? PUNTOS.racha_bonus * perfil.racha_actual : 0;

  const totalPuntos = puntosPrioridad + bonusRacha;

  await otorgarPuntos(
    usuarioId,
    totalPuntos,
    'tarea_completada',
    'tarea',
    tarea.id
  );

  return {
    puntos_ganados: totalPuntos,
    bonus_racha: bonusRacha,
    racha_actual: perfil.racha_actual,
  };
};

// ─── AL COMPLETAR HÁBITO ───────────────────────────────────

export const procesarHabitoCompletado = async (usuarioId, habitoId) => {
  const perfil = await actualizarRacha(usuarioId);
  const bonusRacha = perfil.racha_actual > 1 ? PUNTOS.racha_bonus * perfil.racha_actual : 0;
  const totalPuntos = PUNTOS.habito_completado + bonusRacha;

  await otorgarPuntos(usuarioId, totalPuntos, 'Hábito completado', 'habito', habitoId);

  return {
    puntos_ganados: totalPuntos,
    bonus_racha: bonusRacha,
    racha_actual: perfil.racha_actual,
  };
};

// ─── LOGROS ────────────────────────────────────────────────

export const obtenerLogrosUsuario = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT l.*,
       lu.obtenido_en,
       CASE WHEN lu.usuario_id IS NOT NULL THEN true ELSE false END AS obtenido
     FROM logros l
     LEFT JOIN logros_usuario lu ON l.id = lu.logro_id AND lu.usuario_id = $1
     ORDER BY obtenido DESC, l.puntos DESC`,
    [usuarioId]
  );
  return rows;
};

export const verificarLogros = async (usuarioId) => {
  const perfil = await obtenerOCrearPerfil(usuarioId);
  const logrosYaObtenidos = await pool.query(
    'SELECT logro_id FROM logros_usuario WHERE usuario_id = $1',
    [usuarioId]
  );
  const idsObtenidos = new Set(logrosYaObtenidos.rows.map(r => r.logro_id));

  const { rows: todosLogros } = await pool.query('SELECT * FROM logros');
  const logrosNuevos = [];

  for (const logro of todosLogros) {
    if (idsObtenidos.has(logro.id)) continue;

    const condicion = logro.condicion;
    let cumplido = false;

    switch (condicion.tipo) {
      case 'tareas_completadas': {
        const { rows } = await pool.query(
          `SELECT COUNT(*) AS total FROM tareas WHERE usuario_id = $1 AND estado = 'completada'`,
          [usuarioId]
        );
        cumplido = parseInt(rows[0].total) >= condicion.valor;
        break;
      }
      case 'tareas_alta_prioridad': {
        const { rows } = await pool.query(
          `SELECT COUNT(*) AS total FROM tareas WHERE usuario_id = $1 AND estado = 'completada' AND prioridad = 'alta'`,
          [usuarioId]
        );
        cumplido = parseInt(rows[0].total) >= condicion.valor;
        break;
      }
      case 'racha_dias':
        cumplido = perfil.racha_actual >= condicion.valor;
        break;
      case 'habitos_creados': {
        const { rows } = await pool.query(
          'SELECT COUNT(*) AS total FROM habitos WHERE usuario_id = $1',
          [usuarioId]
        );
        cumplido = parseInt(rows[0].total) >= condicion.valor;
        break;
      }
      case 'nivel':
        cumplido = perfil.nivel >= condicion.valor;
        break;
      case 'puntos_totales':
        cumplido = perfil.puntos_totales >= condicion.valor;
        break;
      case 'hora_completada': {
        const { rows } = await pool.query(
          `SELECT COUNT(*) AS total FROM tareas
           WHERE usuario_id = $1 AND estado = 'completada'
           AND EXTRACT(HOUR FROM actualizado_en) < $2`,
          [usuarioId, condicion.valor]
        );
        cumplido = parseInt(rows[0].total) >= 1;
        break;
      }
    }

    if (cumplido) {
      await pool.query(
        'INSERT INTO logros_usuario (usuario_id, logro_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [usuarioId, logro.id]
      );
      // Otorgar puntos del logro
      await otorgarPuntos(usuarioId, logro.puntos, `Logro desbloqueado: ${logro.titulo}`, 'logro', logro.id);
      logrosNuevos.push(logro);
    }
  }

  return logrosNuevos;
};

// ─── LEADERBOARD ───────────────────────────────────────────

export const obtenerLeaderboard = async (usuarioId, tipo = 'total', limite = 10) => {
  let query;

  if (tipo === 'semanal') {
    query = `
      SELECT u.id, u.nombre,
        COALESCE(SUM(h.puntos), 0) AS puntos,
        pg.nivel, pg.racha_actual
      FROM usuarios u
      LEFT JOIN historial_puntos h ON h.usuario_id = u.id
        AND h.creado_en >= NOW() - INTERVAL '7 days'
      LEFT JOIN perfil_gamificacion pg ON pg.usuario_id = u.id
      GROUP BY u.id, u.nombre, pg.nivel, pg.racha_actual
      ORDER BY puntos DESC
      LIMIT $1
    `;
  } else if (tipo === 'mensual') {
    query = `
      SELECT u.id, u.nombre,
        COALESCE(SUM(h.puntos), 0) AS puntos,
        pg.nivel, pg.racha_actual
      FROM usuarios u
      LEFT JOIN historial_puntos h ON h.usuario_id = u.id
        AND h.creado_en >= NOW() - INTERVAL '30 days'
      LEFT JOIN perfil_gamificacion pg ON pg.usuario_id = u.id
      GROUP BY u.id, u.nombre, pg.nivel, pg.racha_actual
      ORDER BY puntos DESC
      LIMIT $1
    `;
  } else {
    query = `
      SELECT u.id, u.nombre,
        pg.puntos_totales AS puntos,
        pg.nivel, pg.racha_actual
      FROM usuarios u
      JOIN perfil_gamificacion pg ON pg.usuario_id = u.id
      ORDER BY pg.puntos_totales DESC
      LIMIT $1
    `;
  }

  const { rows } = await pool.query(query, [limite]);

  // Agregar posición y marcar al usuario actual
  return rows.map((row, index) => ({
  posicion: index + 1,
  id: row.id,
  nombre: row.nombre,
  puntos: Number(row.puntos) || 0,
  nivel: row.nivel || 1,
  racha_actual: row.racha_actual || 0,
  es_usuario_actual: row.id === usuarioId,
  }));
};

export const obtenerPosicionUsuario = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) + 1 AS posicion
     FROM perfil_gamificacion
     WHERE puntos_totales > (
       SELECT puntos_totales FROM perfil_gamificacion WHERE usuario_id = $1
     )`,
    [usuarioId]
  );
  return parseInt(rows[0].posicion);
};

// ─── HISTORIAL ─────────────────────────────────────────────

export const obtenerHistorialPuntos = async (usuarioId, limite = 20) => {
  const { rows } = await pool.query(
    `SELECT * FROM historial_puntos
     WHERE usuario_id = $1
     ORDER BY creado_en DESC
     LIMIT $2`,
    [usuarioId, limite]
  );
  return rows;
};
