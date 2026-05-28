// src/modules/gym/gym.service.js
import pool from '../../config/db.js';
import eventBus from '../../eventBus/index.js';
import { EVENTS } from '../../eventBus/events.js';

// ─────────────────────────────────────────
// RUTINAS
// ─────────────────────────────────────────

const MAX_NOMBRE = 200;
const MAX_DESCRIPCION = 1000;
const DIFICULTADES = ['principiante', 'intermedio', 'avanzado'];

// Crear una rutina nueva
export const crearRutina = async (usuarioId, body) => {
  const { nombre, descripcion, dificultad } = body;
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0 || nombre.length > MAX_NOMBRE) {
    throw Object.assign(new Error(`Nombre requerido (máx ${MAX_NOMBRE} caracteres)`), { status: 400 });
  }
  if (descripcion && descripcion.length > MAX_DESCRIPCION) {
    throw Object.assign(new Error(`Descripción no puede exceder ${MAX_DESCRIPCION} caracteres`), { status: 400 });
  }
  if (dificultad && !DIFICULTADES.includes(dificultad)) {
    throw Object.assign(new Error(`Dificultad debe ser: ${DIFICULTADES.join(', ')}`), { status: 400 });
  }
  const result = await pool.query(
    `INSERT INTO rutinas (usuario_id, nombre, descripcion, dificultad)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [usuarioId, nombre, descripcion, dificultad || 'principiante']
  );
  return result.rows[0];
};

// Ver todas las rutinas del usuario
export const listarRutinas = async (usuarioId, limite = 50, pagina = 1) => {
  const offset = (pagina - 1) * limite;
  const result = await pool.query(
    `SELECT * FROM rutinas
     WHERE usuario_id = $1
     ORDER BY creado_en DESC
     LIMIT $2 OFFSET $3`,
    [usuarioId, limite, offset]
  );
  const { rows: [{ count }] } = await pool.query(
    'SELECT COUNT(*) FROM rutinas WHERE usuario_id = $1',
    [usuarioId]
  );
  return { data: result.rows, total: parseInt(count) };
};

// Ver una rutina específica
export const obtenerRutina = async (id, usuarioId) => {
  const result = await pool.query(
    `SELECT * FROM rutinas
     WHERE id = $1 AND usuario_id = $2`,
    [id, usuarioId]
  );
  return result.rows[0] || null;
};

// Editar una rutina
export const actualizarRutina = async (id, usuarioId, body) => {
  const actual = await pool.query(
    `SELECT * FROM rutinas WHERE id = $1 AND usuario_id = $2`,
    [id, usuarioId]
  );
  if (actual.rows.length === 0) return null;

  const r = actual.rows[0];
  const nombre = body.nombre ?? r.nombre;
  const descripcion = body.descripcion ?? r.descripcion;
  const dificultad = body.dificultad ?? r.dificultad;

  const result = await pool.query(
    `UPDATE rutinas
     SET nombre = $1, descripcion = $2, dificultad = $3, actualizado_en = NOW()
     WHERE id = $4 AND usuario_id = $5
     RETURNING *`,
    [nombre, descripcion, dificultad, id, usuarioId]
  );
  return result.rows[0] || null;
};

// Eliminar una rutina
export const eliminarRutina = async (id, usuarioId) => {
  const result = await pool.query(
    `DELETE FROM rutinas
     WHERE id = $1 AND usuario_id = $2
     RETURNING id`,
    [id, usuarioId]
  );
  return result.rowCount > 0;
};

// ─────────────────────────────────────────
// EJERCICIOS
// ─────────────────────────────────────────

// Agregar ejercicio a una rutina
export const crearEjercicio = async (usuarioId, body) => {
  const { rutina_id, nombre, grupo_muscular, series_default, repeticiones_default } = body;
  const result = await pool.query(
    `INSERT INTO ejercicios (rutina_id, nombre, grupo_muscular, series_default, repeticiones_default)
     SELECT $1, $2, $3, $4, $5
     FROM rutinas WHERE id = $1 AND usuario_id = $6
     RETURNING ejercicios.*`,
    [rutina_id, nombre, grupo_muscular, series_default || 3, repeticiones_default || 10, usuarioId]
  );
  if (result.rows.length === 0) {
    const err = new Error('Rutina no encontrada o no pertenece al usuario');
    err.status = 404;
    throw err;
  }
  return result.rows[0];
};

// Ver ejercicios de una rutina
export const listarEjercicios = async (rutinaId, usuarioId) => {
  const result = await pool.query(
    `SELECT e.* FROM ejercicios e
     JOIN rutinas r ON e.rutina_id = r.id
     WHERE e.rutina_id = $1 AND r.usuario_id = $2
     ORDER BY e.creado_en ASC`,
    [rutinaId, usuarioId]
  );
  return result.rows;
};

// Eliminar un ejercicio
export const eliminarEjercicio = async (id, usuarioId) => {
  const result = await pool.query(
    `DELETE FROM ejercicios e
     USING rutinas r
     WHERE e.id = $1 AND e.rutina_id = r.id AND r.usuario_id = $2
     RETURNING e.id`,
    [id, usuarioId]
  );
  return result.rowCount > 0;
};

// Actualizar un ejercicio
export const actualizarEjercicio = async (id, usuarioId, body) => {
  const { nombre, grupo_muscular, series_default, repeticiones_default } = body;
  const result = await pool.query(
    `UPDATE ejercicios e
     SET nombre = COALESCE($1, e.nombre),
         grupo_muscular = COALESCE($2, e.grupo_muscular),
         series_default = COALESCE($3, e.series_default),
         repeticiones_default = COALESCE($4, e.repeticiones_default)
     FROM rutinas r
     WHERE e.id = $5 AND e.rutina_id = r.id AND r.usuario_id = $6
     RETURNING e.*`,
    [nombre, grupo_muscular, series_default, repeticiones_default, id, usuarioId]
  );
  return result.rows[0] || null;
};

// ─────────────────────────────────────────
// REGISTROS DE ENTRENAMIENTO
// ─────────────────────────────────────────

// Guardar un entrenamiento con todas sus series
export const registrarEntrenamiento = async (usuarioId, body) => {
  const { ejercicio_id, rutina_id, fecha, notas, series } = body;

  const registro = await pool.query(
    `INSERT INTO registros_entrenamiento (usuario_id, ejercicio_id, rutina_id, fecha, notas)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [usuarioId, ejercicio_id, rutina_id || null, fecha || new Date(), notas || null]
  );

  const registroId = registro.rows[0].id;

  for (const serie of series) {
    await pool.query(
      `INSERT INTO series_entrenamiento (registro_id, numero_serie, repeticiones, peso_kg)
       VALUES ($1, $2, $3, $4)`,
      [registroId, serie.numero_serie, serie.repeticiones, serie.peso_kg]
    );
  }

  const seriesGuardadas = await pool.query(
    `SELECT * FROM series_entrenamiento WHERE registro_id = $1 ORDER BY numero_serie`,
    [registroId]
  );

  eventBus.emit(EVENTS.WORKOUT_LOGGED, { usuarioId, ejercicioId, rutinaId: rutina_id, series: series.length });

  return { ...registro.rows[0], series: seriesGuardadas.rows };
};

// Guardar sesión completa (múltiples ejercicios) en una transacción
export const completarSesion = async (usuarioId, body) => {
  const { rutina_id, fecha, duracion_minutos, ejercicios } = body;
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');

    const registros = [];
    let volumenTotal = 0;
    const prsDetectados = [];

    for (const ej of ejercicios) {
      const registro = await cliente.query(
        `INSERT INTO registros_entrenamiento (usuario_id, ejercicio_id, rutina_id, fecha)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [usuarioId, ej.ejercicio_id, rutina_id || null, fecha || new Date()]
      );

      const registroId = registro.rows[0].id;
      let seriesCount = 0;

      for (const serie of (ej.series || [])) {
        await cliente.query(
          `INSERT INTO series_entrenamiento (registro_id, numero_serie, repeticiones, peso_kg)
           VALUES ($1, $2, $3, $4)`,
          [registroId, serie.numero_serie || seriesCount + 1, serie.repeticiones || 0, serie.peso_kg || 0]
        );
        volumenTotal += (serie.repeticiones || 0) * (serie.peso_kg || 0);
        seriesCount++;
      }

      const seriesGuardadas = await cliente.query(
        `SELECT * FROM series_entrenamiento WHERE registro_id = $1 ORDER BY numero_serie`,
        [registroId]
      );

      registros.push({ ...registro.rows[0], series: seriesGuardadas.rows });

      // Detectar PR: comparar con peso máximo histórico
      const maxAnterior = await cliente.query(
        `SELECT COALESCE(MAX(se.peso_kg), 0) AS max_peso
         FROM registros_entrenamiento re
         JOIN series_entrenamiento se ON se.registro_id = re.id
         WHERE re.usuario_id = $1 AND re.ejercicio_id = $2 AND re.id != $3`,
        [usuarioId, ej.ejercicio_id, registroId]
      );
      const pesoMaxSeries = Math.max(...(ej.series || []).map(s => s.peso_kg || 0), 0);
      if (pesoMaxSeries > Number(maxAnterior.rows[0].max_peso) && pesoMaxSeries > 0) {
        const ejNombre = await cliente.query('SELECT nombre FROM ejercicios WHERE id = $1', [ej.ejercicio_id]);
        prsDetectados.push({ ejercicio_id: ej.ejercicio_id, nombre: ejNombre.rows[0]?.nombre || 'Ejercicio', peso: pesoMaxSeries });
      }

      eventBus.emit(EVENTS.WORKOUT_LOGGED, { usuarioId, ejercicioId: ej.ejercicio_id, rutinaId: rutina_id, series: seriesCount });
    }

    await cliente.query('COMMIT');

    return {
      registros,
      volumen_total: volumenTotal,
      total_series: registros.reduce((acc, r) => acc + (r.series?.length || 0), 0),
      duracion_minutos: duracion_minutos || null,
      prs_detectados: prsDetectados,
    };
  } catch (err) {
    await cliente.query('ROLLBACK');
    throw err;
  } finally {
    cliente.release();
  }
};

// Ver historial completo de entrenamientos
export const listarHistorial = async (usuarioId) => {
  const result = await pool.query(
    `SELECT
       re.id,
       re.fecha,
       re.notas,
       re.creado_en,
       e.nombre        AS ejercicio,
       e.grupo_muscular,
       r.nombre        AS rutina,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'serie',   se.numero_serie,
              'reps',    se.repeticiones,
              'peso_kg', se.peso_kg
            ) ORDER BY se.numero_serie
          ) FILTER (WHERE se.id IS NOT NULL),
          '[]'::json
        ) AS series
     FROM registros_entrenamiento re
     JOIN ejercicios e               ON e.id  = re.ejercicio_id
     LEFT JOIN rutinas r             ON r.id  = re.rutina_id
     LEFT JOIN series_entrenamiento se ON se.registro_id = re.id
     WHERE re.usuario_id = $1
     GROUP BY re.id, e.nombre, e.grupo_muscular, r.nombre
     ORDER BY re.fecha DESC`,
    [usuarioId]
  );
  return result.rows;
};

// ─────────────────────────────────────────
// PROGRESIÓN
// ─────────────────────────────────────────

// Ver cómo ha mejorado el peso en un ejercicio con el tiempo
export const verProgresion = async (usuarioId, ejercicioId) => {
  const result = await pool.query(
    `SELECT
       re.fecha,
       MAX(se.peso_kg)        AS peso_maximo,
       SUM(se.repeticiones)   AS repeticiones_totales,
       COUNT(se.id)           AS total_series
     FROM registros_entrenamiento re
     JOIN series_entrenamiento se ON se.registro_id = re.id
     WHERE re.usuario_id = $1 AND re.ejercicio_id = $2
     GROUP BY re.fecha
     ORDER BY re.fecha ASC`,
    [usuarioId, ejercicioId]
  );
  return result.rows;
};

// ─────────────────────────────────────────
// ESTADÍSTICAS
// ─────────────────────────────────────────

export const obtenerEstadisticas = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT
       COUNT(DISTINCT re.id)          AS total_entrenamientos,
       COUNT(DISTINCT re.ejercicio_id) AS ejercicios_distintos,
       COUNT(se.id)                   AS total_series,
       COALESCE(SUM(se.repeticiones), 0) AS total_repeticiones,
       COALESCE(MAX(se.peso_kg), 0)   AS peso_maximo,
       COUNT(DISTINCT DATE(re.fecha)) AS dias_entrenados
     FROM registros_entrenamiento re
     LEFT JOIN series_entrenamiento se ON se.registro_id = re.id
     WHERE re.usuario_id = $1`,
    [usuarioId]
  );
  return rows[0];
};

// ─────────────────────────────────────────
// ÚLTIMA SESIÓN POR EJERCICIO (progressive overload)
// ─────────────────────────────────────────

export const obtenerUltimaSesion = async (usuarioId, ejercicioId) => {
  const result = await pool.query(
    `SELECT se.numero_serie, se.repeticiones, se.peso_kg, re.fecha
     FROM registros_entrenamiento re
     JOIN series_entrenamiento se ON se.registro_id = re.id
     WHERE re.usuario_id = $1 AND re.ejercicio_id = $2
     ORDER BY re.fecha DESC, se.numero_serie ASC
     LIMIT 20`,
    [usuarioId, ejercicioId]
  );
  if (result.rows.length === 0) return null;
  return {
    fecha: result.rows[0].fecha,
    series: result.rows.map(r => ({ numero_serie: r.numero_serie, repeticiones: r.repeticiones, peso_kg: r.peso_kg })),
  };
};

// ─────────────────────────────────────────
// SUGERENCIA DE PESO AUTOMÁTICO
// ─────────────────────────────────────────

export const sugerirPeso = async (usuarioId, ejercicioId) => {
  const { rows } = await pool.query(
    `SELECT
       se.peso_kg,
       se.repeticiones,
       re.fecha
     FROM registros_entrenamiento re
     JOIN series_entrenamiento se ON se.registro_id = re.id
     WHERE re.usuario_id = $1 AND re.ejercicio_id = $2
     ORDER BY re.fecha DESC, se.numero_serie ASC
     LIMIT 10`,
    [usuarioId, ejercicioId]
  );

  if (rows.length === 0) {
    return { sugerencia: null, mensaje: 'No hay historial para este ejercicio' };
  }

  const pesos = rows.filter(r => r.peso_kg !== null).map(r => r.peso_kg);
  if (pesos.length === 0) {
    return { sugerencia: null, mensaje: 'No hay datos de peso para este ejercicio' };
  }
  const pesoMaximo = Math.max(...pesos);
  const promedioReps = rows.reduce((a, b) => a + b.repeticiones, 0) / rows.length;

  // Si el promedio de reps es mayor a 12, sugiere aumentar el peso 5%
  // Redondeo a 0.5 kg (incremento típico en pesas)
  const sugerencia = promedioReps > 12
    ? Math.round(pesoMaximo * 1.05 * 2) / 2
    : pesoMaximo;

  return {
    peso_actual: pesoMaximo,
    promedio_repeticiones: Math.round(promedioReps),
    sugerencia_peso: sugerencia,
    mensaje: promedioReps > 12
      ? `Puedes aumentar el peso a ${sugerencia} kg`
      : `Mantén el peso en ${pesoMaximo} kg`
  };
};