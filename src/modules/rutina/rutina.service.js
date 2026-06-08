import pool from '../../config/db.js';

export const initTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS plantillas_dia (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
      activo BOOLEAN DEFAULT true,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(usuario_id, dia_semana)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS plantillas_bloques (
      id SERIAL PRIMARY KEY,
      plantilla_id INTEGER NOT NULL REFERENCES plantillas_dia(id) ON DELETE CASCADE,
      titulo VARCHAR(200) NOT NULL,
      hora_inicio TIME NOT NULL,
      hora_fin TIME NOT NULL,
      tipo VARCHAR(20) DEFAULT 'tarea',
      prioridad VARCHAR(10) DEFAULT 'media',
      orden INTEGER DEFAULT 0,
      gimnasio_rutina_id INTEGER REFERENCES rutinas(id) ON DELETE SET NULL,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

export const obtenerDiaCompleto = async (usuarioId, fecha) => {
  const inicioStr = `${fecha} 00:00:00`;
  const finStr = `${fecha} 23:59:59`;
  const diaSemana = (new Date(fecha + 'T12:00:00').getUTCDay() + 6) % 7;

  const [tareasRes, habitosRes, bloquesRes, recordatoriosRes, plantillaDia, rutinasPendientes, lecturaRes] = await Promise.all([
    pool.query(
      `SELECT t.*, c.nombre AS categoria_nombre, c.color AS categoria_color
       FROM tareas t
       LEFT JOIN categorias c ON t.categoria_id = c.id
       WHERE t.usuario_id = $1 AND t.estado != 'cancelada'
         AND (
           (t.fecha_inicio >= $2::timestamp AND t.fecha_inicio <= $3::timestamp)
           OR (t.todo_el_dia = true AND t.fecha_limite::date = $4::date)
            OR (t.fecha_inicio IS NULL)
         )
       ORDER BY t.fecha_inicio ASC NULLS LAST`,
      [usuarioId, inicioStr, finStr, fecha]
    ),
    pool.query(
      `SELECT h.*,
              CASE WHEN rh.id IS NOT NULL THEN true ELSE false END AS completado_hoy
       FROM habitos h
       LEFT JOIN registros_habitos rh ON rh.habito_id = h.id AND rh.fecha = $1::date
       WHERE h.usuario_id = $2
         AND (h.dias_semana IS NULL OR h.dias_semana = '[]'::jsonb OR h.dias_semana @> to_jsonb($3::int))
       ORDER BY h.titulo ASC`,
      [fecha, usuarioId, diaSemana]
    ),
    pool.query(
      `SELECT * FROM bloques_tiempo
       WHERE usuario_id = $1 AND activo = true
       ORDER BY hora_inicio ASC`,
      [usuarioId]
    ),
    pool.query(
      `SELECT id, titulo, fecha_hora, tipo
       FROM recordatorios
       WHERE usuario_id = $1
         AND fecha_hora::date = $2::date
         AND fecha_hora > NOW()
       ORDER BY fecha_hora ASC`,
      [usuarioId, fecha]
    ),
    pool.query(
      `SELECT pb.*, r.nombre AS rutina_nombre
       FROM plantillas_dia pd
       JOIN plantillas_bloques pb ON pb.plantilla_id = pd.id
       LEFT JOIN rutinas r ON r.id = pb.gimnasio_rutina_id
       WHERE pd.usuario_id = $1 AND pd.dia_semana = $2 AND pd.activo = true`,
      [usuarioId, diaSemana]
    ),
    pool.query(
      `SELECT r.id, r.nombre, r.dias_semana,
              CASE WHEN rr.id IS NOT NULL THEN true ELSE false END AS completado_hoy
       FROM rutinas r
       LEFT JOIN registros_rutinas rr ON rr.rutina_id = r.id AND rr.fecha = $4::date
       WHERE r.usuario_id = $1
         AND r.dias_semana IS NOT NULL
         AND r.dias_semana::jsonb @> to_jsonb(($2)::int)
         AND r.id NOT IN (
           SELECT pb.gimnasio_rutina_id
           FROM plantillas_dia pd
           JOIN plantillas_bloques pb ON pb.plantilla_id = pd.id
           WHERE pd.usuario_id = $1 AND pd.dia_semana = $3 AND pb.tipo = 'gimnasio' AND pb.gimnasio_rutina_id IS NOT NULL
         )
        ORDER BY r.nombre`,
      [usuarioId, diaSemana + 1, diaSemana, fecha]
    ),
    pool.query(
      `SELECT p.id AS plan_id, p.libro_id, p.paginas_por_dia, p.habito_id,
               l.titulo AS libro_titulo, l.paginas_totales, l.paginas_leidas,
               COALESCE(lr.paginas_leidas, 0) AS leidas_hoy,
               CASE WHEN lr.id IS NOT NULL THEN true ELSE false END AS completado_hoy
        FROM lectura_planes p
        JOIN lectura_libros l ON l.id = p.libro_id
        LEFT JOIN lectura_registros lr ON lr.libro_id = p.libro_id AND lr.usuario_id = p.usuario_id AND lr.fecha = $2::date
        WHERE p.usuario_id = $1
          AND p.completado = false
          AND $2::date >= p.fecha_inicio
          AND $2::date <= p.fecha_fin
          AND p.dias_lectura @> to_jsonb($3::int)
        ORDER BY l.titulo`,
      [usuarioId, fecha, (diaSemana + 1) % 7]
    ),
  ]);

  const gimnasioBloques = plantillaDia.rows.filter(b => b.tipo === 'gimnasio');
  const plantillaHabitos = plantillaDia.rows.filter(b => b.tipo === 'habito');
  const plantillaBloquesFijos = plantillaDia.rows.filter(b => b.tipo === 'bloque');

  return {
    fecha,
    tareas: tareasRes.rows,
    habitos: habitosRes.rows,
    bloques: bloquesRes.rows,
    recordatorios: recordatoriosRes.rows,
    gimnasio: gimnasioBloques,
    plantilla_habitos: plantillaHabitos,
    plantilla_bloques_fijos: plantillaBloquesFijos,
    habitos_programados: habitosRes.rows.filter(h => h.hora_programada),
    rutinas_pendientes: rutinasPendientes.rows,
    lectura_hoy: lecturaRes.rows,
  };
};

export const obtenerSemanaCompleta = async (usuarioId, fechaInicio) => {
  const inicioDate = new Date(fechaInicio + 'T12:00:00');
  const finDate = new Date(inicioDate);
  finDate.setUTCDate(finDate.getUTCDate() + 7);
  const inicioStr = `${fechaInicio} 00:00:00`;
  const finStr = `${finDate.toISOString().split('T')[0]} 00:00:00`;

  const [tareasRes, habitosRes, bloquesRes, recordatoriosRes, plantillasRes, rutinasPendientes] = await Promise.all([
    pool.query(
      `SELECT t.*, c.nombre AS categoria_nombre, c.color AS categoria_color,
              EXTRACT(DOW FROM t.fecha_inicio) AS dia_semana,
              EXTRACT(HOUR FROM t.fecha_inicio) AS hora
       FROM tareas t
       LEFT JOIN categorias c ON t.categoria_id = c.id
       WHERE t.usuario_id = $1
         AND t.estado != 'cancelada'
         AND (
           (t.fecha_inicio >= $2::timestamp AND t.fecha_inicio < $3::timestamp)
           OR (t.todo_el_dia = true AND t.fecha_limite::date >= $4::date AND t.fecha_limite::date < $5::date)
            OR (t.fecha_inicio IS NULL)
         )
       ORDER BY t.fecha_inicio ASC`,
      [usuarioId, inicioStr, finStr, fechaInicio, finDate.toISOString().split('T')[0]]
    ),
    pool.query(
      `SELECT h.*
       FROM habitos h
       WHERE h.usuario_id = $1
       ORDER BY h.titulo ASC`,
      [usuarioId]
    ),
    pool.query(
      `SELECT * FROM bloques_tiempo
       WHERE usuario_id = $1 AND activo = true
       ORDER BY hora_inicio ASC`,
      [usuarioId]
    ),
    pool.query(
      `SELECT id, titulo, fecha_hora, tipo
       FROM recordatorios
       WHERE usuario_id = $1
         AND fecha_hora::date >= $2::date
         AND fecha_hora::date < $3::date
         AND fecha_hora > NOW()
       ORDER BY fecha_hora ASC`,
      [usuarioId, fechaInicio, finDate.toISOString().split('T')[0]]
    ),
    pool.query(
      `SELECT pb.*, r.nombre AS rutina_nombre, pd.dia_semana
        FROM plantillas_dia pd
        JOIN plantillas_bloques pb ON pb.plantilla_id = pd.id
        LEFT JOIN rutinas r ON r.id = pb.gimnasio_rutina_id
        WHERE pd.usuario_id = $1 AND pd.activo = true
        ORDER BY pd.dia_semana, pb.hora_inicio`,
      [usuarioId]
    ),
    pool.query(
      `SELECT r.id, r.nombre, r.dias_semana
       FROM rutinas r
       WHERE r.usuario_id = $1
         AND r.dias_semana IS NOT NULL
         AND r.dias_semana::jsonb <> '[]'::jsonb
         AND r.id NOT IN (
           SELECT pb.gimnasio_rutina_id
           FROM plantillas_dia pd
           JOIN plantillas_bloques pb ON pb.plantilla_id = pd.id
           WHERE pd.usuario_id = $1 AND pb.tipo = 'gimnasio' AND pb.gimnasio_rutina_id IS NOT NULL
         )
       ORDER BY r.nombre`,
      [usuarioId]
    ),
  ]);

  const semana = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  tareasRes.rows.forEach(t => {
    const dia = parseInt(t.dia_semana);
    if (semana[dia]) semana[dia].push(t);
  });

  const gimnasio = plantillasRes.rows.filter(b => b.tipo === 'gimnasio');
  const plantillaHabitos = plantillasRes.rows.filter(b => b.tipo === 'habito');
  const plantillaBloquesFijos = plantillasRes.rows.filter(b => b.tipo === 'bloque');

  const rutinasPendientesPorDia = {};
  for (let d = 0; d < 7; d++) {
    rutinasPendientesPorDia[d] = rutinasPendientes.rows.filter(r =>
      r.dias_semana && r.dias_semana.includes(d + 1)
    );
  }

  return {
    fecha_inicio: fechaInicio,
    tareas: tareasRes.rows,
    tareas_por_dia: semana,
    habitos: habitosRes.rows,
    bloques: bloquesRes.rows,
    recordatorios: recordatoriosRes.rows,
    gimnasio,
    plantilla_habitos: plantillaHabitos,
    plantilla_bloques_fijos: plantillaBloquesFijos,
    total_tareas: tareasRes.rows.length,
    total_habitos: habitosRes.rows.length,
    rutinas_pendientes: rutinasPendientesPorDia,
  };
};

export const completarHabito = async (usuarioId, habitoId, fecha) => {
  const existing = await pool.query(
    `SELECT id FROM registros_habitos
     WHERE habito_id = $1 AND fecha = $2::date`,
    [habitoId, fecha]
  );

  if (existing.rows.length > 0) {
    await pool.query('DELETE FROM registros_habitos WHERE id = $1', [existing.rows[0].id]);
    return { completado: false };
  }

  await pool.query(
    `INSERT INTO registros_habitos (habito_id, fecha) VALUES ($1, $2::date)`,
    [habitoId, fecha]
  );

  return { completado: true };
};

export const obtenerPlantillas = async (usuarioId) => {
  const { rows: dias } = await pool.query(
    `SELECT pd.*,
            COALESCE(
              json_agg(pb ORDER BY pb.hora_inicio ASC) FILTER (WHERE pb.id IS NOT NULL),
              '[]'::json
            ) AS bloques
     FROM plantillas_dia pd
     LEFT JOIN plantillas_bloques pb ON pb.plantilla_id = pd.id
     WHERE pd.usuario_id = $1
     GROUP BY pd.id
     ORDER BY pd.dia_semana ASC`,
    [usuarioId]
  );
  return dias;
};

export const guardarPlantillaDia = async (usuarioId, diaSemana, bloques) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [plantilla] } = await client.query(
      `INSERT INTO plantillas_dia (usuario_id, dia_semana)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id, dia_semana)
       DO UPDATE SET activo = true
       RETURNING id`,
      [usuarioId, diaSemana]
    );

    await client.query('DELETE FROM plantillas_bloques WHERE plantilla_id = $1', [plantilla.id]);

    if (bloques && bloques.length > 0) {
      const values = [];
      const params = [];
      let i = 1;
      for (const b of bloques) {
        const gimnId = b.gimnasio_rutina_id ? parseInt(b.gimnasio_rutina_id) : null;
        values.push(`($${i}, $${i+1}, $${i+2}::time, $${i+3}::time, $${i+4}, $${i+5}, $${i+6}, $${i+7})`);
        params.push(plantilla.id, b.titulo, b.hora_inicio, b.hora_fin, b.tipo || 'tarea', b.prioridad || 'media', b.orden || 0, gimnId);
        i += 8;
      }
      await client.query(
        `INSERT INTO plantillas_bloques (plantilla_id, titulo, hora_inicio, hora_fin, tipo, prioridad, orden, gimnasio_rutina_id)
         VALUES ${values.join(', ')}`,
        params
      );
    }
    await client.query('COMMIT');
    return obtenerPlantillas(usuarioId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const eliminarPlantillaDia = async (usuarioId, diaSemana) => {
  await pool.query(
    `DELETE FROM plantillas_dia WHERE usuario_id = $1 AND dia_semana = $2`,
    [usuarioId, diaSemana]
  );
  return true;
};

export const eliminarBloquePlantilla = async (usuarioId, bloqueId) => {
  await pool.query(
    `DELETE FROM plantillas_bloques WHERE id = $1 AND plantilla_id IN (
      SELECT id FROM plantillas_dia WHERE usuario_id = $2
    )`,
    [bloqueId, usuarioId]
  );
  return true;
};

export const eliminarTodosBloquesPlantilla = async (usuarioId) => {
  const { rowCount } = await pool.query(
    `DELETE FROM plantillas_bloques WHERE plantilla_id IN (
      SELECT id FROM plantillas_dia WHERE usuario_id = $1
    )`,
    [usuarioId]
  );
  return rowCount;
};

export const limpiarSemana = async (usuarioId) => {
  const tareas = await pool.query(
    `DELETE FROM tareas WHERE usuario_id = $1 AND auto_programado = true RETURNING id`,
    [usuarioId]
  );
  const habitos = await pool.query(
    `DELETE FROM habitos WHERE usuario_id = $1 AND auto_programado = true RETURNING id`,
    [usuarioId]
  );
  const bloques = await pool.query(
    `DELETE FROM bloques_tiempo WHERE usuario_id = $1 AND auto_programado = true RETURNING id`,
    [usuarioId]
  );
  return {
    tareasEliminadas: tareas.rowCount,
    habitosEliminados: habitos.rowCount,
    bloquesEliminados: bloques.rowCount,
  };
};

const aplicarSemanaUna = async (usuarioId, fechaInicio) => {
  const plantillas = await pool.query(
    `SELECT pd.dia_semana, pb.*
     FROM plantillas_dia pd
     JOIN plantillas_bloques pb ON pb.plantilla_id = pd.id
     WHERE pd.usuario_id = $1 AND pd.activo = true
     ORDER BY pd.dia_semana, pb.hora_inicio`,
    [usuarioId]
  );

  const weekEnd = new Date(fechaInicio + 'T23:59:59');
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const weekEndStr = weekEnd.toISOString().split('T')[0] + ' 23:59:59';

  await pool.query(
    `DELETE FROM tareas WHERE usuario_id = $1 AND auto_programado = true AND fecha_inicio >= $2::timestamp AND fecha_inicio <= $3::timestamp`,
    [usuarioId, fechaInicio + ' 00:00:00', weekEndStr]
  );

  const creadas = [];
  for (const bloque of plantillas.rows) {
    const diaOffset = parseInt(bloque.dia_semana);
    const fechaDate = new Date(fechaInicio + 'T12:00:00');
    fechaDate.setUTCDate(fechaDate.getUTCDate() + diaOffset);
    const diaStr = fechaDate.toISOString().split('T')[0];

    const fechaInicioStr = `${diaStr} ${bloque.hora_inicio}`;
    const fechaFinStr = `${diaStr} ${bloque.hora_fin}`;
    const duracion = (new Date(fechaFinStr) - new Date(fechaInicioStr)) / 60000;

    const tipo = bloque.tipo || 'tarea';

    if (tipo === 'gimnasio') continue;

    if (tipo === 'tarea') {
      const desc = `De ${bloque.hora_inicio} a ${bloque.hora_fin}`;
      const { rows: [tarea] } = await pool.query(
        `INSERT INTO tareas (usuario_id, titulo, descripcion, prioridad, duracion_minutos, fecha_inicio, fecha_fin, auto_programado)
         VALUES ($1, $2, $3, $4, $5, $6::timestamp, $7::timestamp, true)
         RETURNING *`,
        [usuarioId, bloque.titulo, desc, bloque.prioridad, duracion, fechaInicioStr, fechaFinStr]
      );
      creadas.push(tarea);
    }
  }

  return creadas;
};

export const aplicarSemana = async (usuarioId, fechaInicio, semanas = 1) => {
  if (semanas === -1) semanas = 52;

  await pool.query(
    `DELETE FROM habitos WHERE usuario_id = $1 AND auto_programado = true`,
    [usuarioId]
  );
  await pool.query(
    `DELETE FROM bloques_tiempo WHERE usuario_id = $1 AND auto_programado = true`,
    [usuarioId]
  );

  const todas = [];
  let fechaActual = new Date(fechaInicio + 'T12:00:00');
  for (let s = 0; s < semanas; s++) {
    const diaStr = fechaActual.toISOString().split('T')[0];
    const creadas = await aplicarSemanaUna(usuarioId, diaStr);
    todas.push(...creadas);
    fechaActual.setUTCDate(fechaActual.getUTCDate() + 7);
  }

  // Crear hábitos y bloques fijos una sola vez (no por semana)
  const plantillas = await pool.query(
    `SELECT pd.dia_semana, pb.*
     FROM plantillas_dia pd
     JOIN plantillas_bloques pb ON pb.plantilla_id = pd.id
     WHERE pd.usuario_id = $1 AND pd.activo = true
     ORDER BY pd.dia_semana, pb.hora_inicio`,
    [usuarioId]
  );

  const habitosCreados = [];
  const bloquesCreados = [];
  const seenHabito = new Set();
  const seenBloque = new Set();
  for (const bloque of plantillas.rows) {
    const tipo = bloque.tipo || 'tarea';
    if (tipo === 'gimnasio') continue;
    if (tipo === 'habito' && !seenHabito.has(bloque.titulo)) {
      seenHabito.add(bloque.titulo);
      const { rows: existentes } = await pool.query(
        'SELECT id FROM habitos WHERE usuario_id = $1 AND titulo = $2',
        [usuarioId, bloque.titulo]
      );
      if (existentes.length === 0) {
        const { rows: [habito] } = await pool.query(
          `INSERT INTO habitos (usuario_id, titulo, descripcion, frecuencia, auto_programado)
           VALUES ($1, $2, $3, $4, true)
           RETURNING *`,
          [usuarioId, bloque.titulo, `De ${bloque.hora_inicio} a ${bloque.hora_fin}`, 'diario']
        );
        habitosCreados.push(habito);
      }
    }
    if (tipo === 'bloque' && !seenBloque.has(bloque.titulo)) {
      seenBloque.add(bloque.titulo);
      const { rows: [bloqueFijo] } = await pool.query(
        `INSERT INTO bloques_tiempo (usuario_id, nombre, hora_inicio, hora_fin, auto_programado)
         VALUES ($1, $2, $3, $4, true)
         RETURNING *`,
        [usuarioId, bloque.titulo, bloque.hora_inicio, bloque.hora_fin]
      );
      bloquesCreados.push(bloqueFijo);
    }
  }

  return { creadas: todas.length, tareas: todas, habitos: habitosCreados, bloques: bloquesCreados };
};
