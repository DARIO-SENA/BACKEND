// modulos/GYM/service/gym.service.js
import pool from '../../config/db.js';

// ─────────────────────────────────────────
// RUTINAS
// ─────────────────────────────────────────

// Crear una rutina nueva
export const crearRutina = async (usuarioId, body) => {
  const { nombre, descripcion, dificultad } = body;
  const result = await pool.query(
    `INSERT INTO rutinas (usuario_id, nombre, descripcion, dificultad)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [usuarioId, nombre, descripcion, dificultad || 'principiante']
  );
  return result.rows[0];
};

// Ver todas las rutinas del usuario
export const listarRutinas = async (usuarioId) => {
  const result = await pool.query(
    `SELECT * FROM rutinas
     WHERE usuario_id = $1
     ORDER BY creado_en DESC`,
    [usuarioId]
  );
  return result.rows;
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
  const { nombre, descripcion, dificultad } = body;
  const result = await pool.query(
    `UPDATE rutinas
     SET nombre = $1, descripcion = $2, dificultad = $3
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
export const crearEjercicio = async (body) => {
  const { rutina_id, nombre, grupo_muscular, series_default, repeticiones_default } = body;
  const result = await pool.query(
    `INSERT INTO ejercicios (rutina_id, nombre, grupo_muscular, series_default, repeticiones_default)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [rutina_id, nombre, grupo_muscular, series_default || 3, repeticiones_default || 10]
  );
  return result.rows[0];
};

// Ver ejercicios de una rutina
export const listarEjercicios = async (rutinaId) => {
  const result = await pool.query(
    `SELECT * FROM ejercicios
     WHERE rutina_id = $1
     ORDER BY creado_en ASC`,
    [rutinaId]
  );
  return result.rows;
};

// Eliminar un ejercicio
export const eliminarEjercicio = async (id) => {
  const result = await pool.query(
    `DELETE FROM ejercicios WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rowCount > 0;
};

// ─────────────────────────────────────────
// REGISTROS DE ENTRENAMIENTO
// ─────────────────────────────────────────

// Guardar un entrenamiento con todas sus series
export const registrarEntrenamiento = async (usuarioId, body) => {
  const { ejercicio_id, rutina_id, fecha, notas, series } = body;

  // 1. Crear el registro principal
  const registro = await pool.query(
    `INSERT INTO registros_entrenamiento (usuario_id, ejercicio_id, rutina_id, fecha, notas)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [usuarioId, ejercicio_id, rutina_id || null, fecha || new Date(), notas || null]
  );

  const registroId = registro.rows[0].id;

  // 2. Guardar cada serie
  for (const serie of series) {
    await pool.query(
      `INSERT INTO series_entrenamiento (registro_id, numero_serie, repeticiones, peso_kg)
       VALUES ($1, $2, $3, $4)`,
      [registroId, serie.numero_serie, serie.repeticiones, serie.peso_kg]
    );
  }

  // 3. Devolver el registro completo con sus series
  const seriesGuardadas = await pool.query(
    `SELECT * FROM series_entrenamiento
     WHERE registro_id = $1
     ORDER BY numero_serie`,
    [registroId]
  );

  return { ...registro.rows[0], series: seriesGuardadas.rows };
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
       JSON_AGG(
         JSON_BUILD_OBJECT(
           'serie',   se.numero_serie,
           'reps',    se.repeticiones,
           'peso_kg', se.peso_kg
         ) ORDER BY se.numero_serie
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

  const pesoMaximo = Math.max(...rows.map(r => r.peso_kg));
  const promedioReps = rows.reduce((a, b) => a + b.repeticiones, 0) / rows.length;

  // Si el promedio de reps es mayor a 12, sugiere aumentar el peso 5%
  const sugerencia = promedioReps > 12
    ? Math.round(pesoMaximo * 1.05 * 2) / 2  // redondear a 0.5
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