import pkg from 'pg';
const { Client } = pkg;

const USER_ID = 43;
const START = new Date('2026-03-08');
const END = new Date('2026-06-08');

function toDate(d) {
  return d.toISOString().slice(0, 10);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dateRange(start, end) {
  const dates = [];
  const d = new Date(start);
  while (d <= end) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function isWeekend(d) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function isWeekday(d) {
  return !isWeekend(d);
}

const allDays = dateRange(START, END);
const weekdays = allDays.filter(isWeekday);
const weekends = allDays.filter(isWeekend);

// ============ DB SETUP ============
const c = new Client({ connectionString: 'postgres://postgres:postgres@localhost:5432/DARIO' });
await c.connect();

try {
  console.log('Conectado. Limpiando datos existentes del usuario...');

  // Delete in FK-safe order
  await c.query('DELETE FROM series_entrenamiento WHERE registro_id IN (SELECT id FROM registros_entrenamiento WHERE usuario_id = $1)', [USER_ID]);
  await c.query('DELETE FROM registros_entrenamiento WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM ejercicios WHERE rutina_id IN (SELECT id FROM rutinas WHERE usuario_id = $1)', [USER_ID]);
  await c.query('DELETE FROM rutinas WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM registros_rutinas WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM registros_habitos WHERE habito_id IN (SELECT id FROM habitos WHERE usuario_id = $1)', [USER_ID]);
  await c.query('DELETE FROM habitos WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM lectura_registros WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM lectura_planes WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM lectura_metas WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM lectura_libros WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM comentarios WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM tareas_compartidas WHERE creado_por = $1 OR asignado_a = $1', [USER_ID]);
  await c.query('DELETE FROM proyecto_miembros WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM proyectos WHERE creador_id = $1', [USER_ID]);
  await c.query('DELETE FROM bloques_rutina WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM plantillas_bloques WHERE plantilla_id IN (SELECT id FROM plantillas_dia WHERE usuario_id = $1)', [USER_ID]);
  await c.query('DELETE FROM plantillas_dia WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM plantillas_rutina WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM tareas WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM metas WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM categorias WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM checkins_emocionales WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM diario_personal WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM pomodoro_sessions WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM bloques_tiempo WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM recordatorios WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM notificaciones WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM conversaciones_ia WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM analisis_ia WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM sugerencias_ia WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM pausas_activas WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM progreso WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM eventos_gamificacion WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM historial_puntos WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM logros_usuario WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM perfil_gamificacion WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM usuario_gamificacion WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM preferencias_notificacion WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM pomodoro_settings WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM finanzas_presupuestos WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM finanzas_transacciones WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM finanzas_deudas WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM finanzas_metas WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM finanzas_cuentas WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM finanzas_categorias WHERE usuario_id = $1', [USER_ID]);
  await c.query('DELETE FROM amistades WHERE solicitante_id = $1 OR receptor_id = $1', [USER_ID]);

  console.log('Limpiado. Insertando datos...');

  // ========================
  // 1. CATEGORÍAS
  // ========================
  const cats = [
    { nombre: 'Trabajo', color: '#4F46E5' },
    { nombre: 'Salud', color: '#10B981' },
    { nombre: 'Estudio', color: '#F59E0B' },
    { nombre: 'Personal', color: '#EC4899' },
    { nombre: 'Finanzas', color: '#8B5CF6' },
    { nombre: 'Proyectos', color: '#06B6D4' },
  ];
  const catResult = [];
  for (const cat of cats) {
    const r = await c.query(
      `INSERT INTO categorias (usuario_id, nombre, color, creado_en, actualizado_en)
       VALUES ($1,$2,$3,$4,$4) RETURNING id`,
      [USER_ID, cat.nombre, cat.color, START]
    );
    catResult.push(r.rows[0].id);
  }
  const [catTrabajo, catSalud, catEstudio, catPersonal, catFinanzas, catProyectos] = catResult;
  console.log('  Categorias insertadas');

  // ========================
  // 2. METAS (OKRs)
  // ========================
  const metasDef = [
    {
      titulo: 'Mejorar condición física',
      descripcion: 'Correr 5K y dominar calistenia básica',
      categoria: 'salud',
      fecha_inicio: '2026-03-01',
      fecha_fin: '2026-06-30',
      estado: 'en_progreso',
      krs: [
        { titulo: 'Correr 3 veces por semana', progreso: 65 },
        { titulo: 'Hacer 20 flexiones seguidas', progreso: 80 },
        { titulo: 'Bajar a 75kg', progreso: 40 },
      ],
    },
    {
      titulo: 'Leer 12 libros este semestre',
      descripcion: 'Meta de lectura para crecer profesional y personalmente',
      categoria: 'educacion',
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-07-01',
      estado: 'en_progreso',
      krs: [
        { titulo: 'Leer 2 libros al mes', progreso: 50 },
        { titulo: 'Terminar 6 libros para junio', progreso: 83 },
        { titulo: 'Escribir resúmenes de cada libro', progreso: 33 },
      ],
    },
    {
      titulo: 'Ahorrar para viaje de fin de año',
      descripcion: 'Ahorrar $1500 para viajar a la playa en diciembre',
      categoria: 'finanzas',
      fecha_inicio: '2026-03-01',
      fecha_fin: '2026-12-01',
      estado: 'en_progreso',
      krs: [
        { titulo: 'Ahorrar $200/mes', progreso: 60 },
        { titulo: 'Reducir gastos hormiga', progreso: 45 },
        { titulo: 'Crear fondo de emergencia de $500', progreso: 80 },
      ],
    },
    {
      titulo: 'Mejorar habilidades de programación',
      descripcion: 'Dominar React y aprender backend con Node.js',
      categoria: 'educacion',
      fecha_inicio: '2026-02-01',
      fecha_fin: '2026-08-01',
      estado: 'en_progreso',
      krs: [
        { titulo: 'Completar curso de React avanzado', progreso: 70 },
        { titulo: 'Hacer 1 proyecto completo al mes', progreso: 75 },
        { titulo: 'Conseguir certificación AWS', progreso: 10 },
      ],
    },
  ];
  const metaIds = [];
  const krIds = [];
  for (const m of metasDef) {
    const r = await c.query(
      `INSERT INTO metas (usuario_id, titulo, descripcion, categoria, progreso, fecha_inicio, fecha_fin, estado, creado_en, actualizado_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [USER_ID, m.titulo, m.descripcion, m.categoria, 0, m.fecha_inicio, m.fecha_fin, m.estado, new Date(m.fecha_inicio), new Date(m.fecha_inicio)]
    );
    const mid = r.rows[0].id;
    metaIds.push(mid);
    for (const kr of m.krs) {
      const r2 = await c.query(
        `INSERT INTO key_results (meta_id, titulo, progreso, orden, creado_en, actualizado_en)
         VALUES ($1,$2,$3,$4,$5,$5) RETURNING id`,
        [mid, kr.titulo, kr.progreso, 1, new Date(m.fecha_inicio)]
      );
      krIds.push(r2.rows[0].id);
    }
  }
  console.log('  Metas y Key Results insertados');

  // ========================
  // 3. TAREAS (~40 tareas across 3 months)
  // ========================
  const tareaTemplates = [
    { titulo: 'Preparar informe mensual', cat: catTrabajo, prioridad: 'alta' },
    { titulo: 'Revisión de código con el equipo', cat: catTrabajo, prioridad: 'alta' },
    { titulo: 'Actualizar documentación técnica', cat: catTrabajo, prioridad: 'media' },
    { titulo: 'Responder correos pendientes', cat: catTrabajo, prioridad: 'media' },
    { titulo: 'Planificar sprint semanal', cat: catTrabajo, prioridad: 'alta' },
    { titulo: 'Ir al gimnasio', cat: catSalud, prioridad: 'alta' },
    { titulo: 'Preparar comida saludable', cat: catSalud, prioridad: 'media' },
    { titulo: 'Meditación matutina', cat: catSalud, prioridad: 'baja' },
    { titulo: 'Cita médica general', cat: catSalud, prioridad: 'alta' },
    { titulo: 'Correr 5km', cat: catSalud, prioridad: 'media' },
    { titulo: 'Estudiar React avanzado', cat: catEstudio, prioridad: 'alta' },
    { titulo: 'Practicar algoritmos', cat: catEstudio, prioridad: 'media' },
    { titulo: 'Leer documentación de PostgreSQL', cat: catEstudio, prioridad: 'media' },
    { titulo: 'Curso de Node.js - Módulo 5', cat: catEstudio, prioridad: 'alta' },
    { titulo: 'Pagar facturas de servicios', cat: catPersonal, prioridad: 'alta' },
    { titulo: 'Llamar a la familia', cat: catPersonal, prioridad: 'media' },
    { titulo: 'Organizar escritorio', cat: catPersonal, prioridad: 'baja' },
    { titulo: 'Limpiar bandeja de entrada', cat: catPersonal, prioridad: 'media' },
    { titulo: 'Hacer presupuesto mensual', cat: catFinanzas, prioridad: 'alta' },
    { titulo: 'Revisar inversiones', cat: catFinanzas, prioridad: 'media' },
    { titulo: 'Avanzar proyecto personal app', cat: catProyectos, prioridad: 'alta' },
    { titulo: 'Hacer deploy de nueva feature', cat: catProyectos, prioridad: 'alta' },
    { titulo: 'Escribir tests unitarios', cat: catProyectos, prioridad: 'media' },
    { titulo: 'Revisar PRs del proyecto', cat: catProyectos, prioridad: 'media' },
  ];
  const tareaIds = [];
  const estadosTarea = ['pendiente', 'completada', 'en_progreso', 'completada', 'completada', 'completada', 'cancelada', 'pendiente', 'completada', 'pendiente'];
  for (const day of allDays) {
    if (isWeekend(day) && Math.random() > 0.2) continue;
    if (Math.random() > 0.55) continue;
    const tpl = pick(tareaTemplates);
    const est = pick(estadosTarea);
    const inicio = new Date(day);
    inicio.setHours(randomInt(8, 18), randomInt(0, 59));
    const fecFin = est === 'completada' ? new Date(inicio.getTime() + randomInt(30, 120) * 60000) : null;
    const duracion = randomInt(30, 120);
    const r = await c.query(
      `INSERT INTO tareas (usuario_id, titulo, descripcion, estado, prioridad, fecha_limite, fecha_inicio, fecha_fin, duracion_minutos, categoria_id, creado_en, actualizado_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11) RETURNING id`,
      [USER_ID, tpl.titulo, `Tarea: ${tpl.titulo}`, est, tpl.prioridad, null, inicio, fecFin, duracion, tpl.cat, day]
    );
    tareaIds.push(r.rows[0].id);
  }
  console.log(`  ${tareaIds.length} Tareas insertadas`);

  // ========================
  // 4. HÁBITOS
  // ========================
  const habitosDef = [
    // dias_semana: 0=Lun 1=Mar 2=Mie 3=Jue 4=Vie 5=Sab 6=Dom
    { titulo: 'Meditar 10 min', descripcion: 'Meditación mindfulness', frecuencia: 'diario', categoria: 'salud', dias: [0,1,2,3,4,5,6], hora: '07:00' },
    { titulo: 'Leer 30 min', descripcion: 'Lectura diaria', frecuencia: 'diario', categoria: 'educacion', dias: [0,1,2,3,4,5,6], hora: '21:00' },
    { titulo: 'Ejercicio', descripcion: 'Gimnasio o correr', frecuencia: 'diario', categoria: 'salud', dias: [0,1,2,3,4], hora: '18:00' },
    { titulo: 'Beber 2L agua', descripcion: 'Hidratación', frecuencia: 'diario', categoria: 'salud', dias: [0,1,2,3,4,5,6], hora: '08:00' },
    { titulo: 'Escribir diario', descripcion: 'Journaling nocturno', frecuencia: 'diario', categoria: 'personal', dias: [0,1,2,3,4,5,6], hora: '22:00' },
    { titulo: 'Estudiar inglés', descripcion: 'Duolingo o lectura', frecuencia: 'diario', categoria: 'educacion', dias: [0,1,2,3,4], hora: '07:30' },
    { titulo: 'Revisar finanzas', descripcion: 'Revisión semanal de gastos', frecuencia: 'semanal', categoria: 'finanzas', dias: [5], hora: '10:00' },
    { titulo: 'Llamar a familia', descripcion: 'Llamada semanal', frecuencia: 'semanal', categoria: 'personal', dias: [6], hora: '15:00' },
  ];
  const habitoIds = [];
  for (const h of habitosDef) {
    const r = await c.query(
      `INSERT INTO habitos (usuario_id, titulo, descripcion, frecuencia, categoria, dias_semana, hora_programada, creado_en, actualizado_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8) RETURNING id`,
      [USER_ID, h.titulo, h.descripcion, h.frecuencia, h.categoria, JSON.stringify(h.dias), h.hora, START]
    );
    habitoIds.push(r.rows[0].id);
  }
  console.log('  Hábitos insertados');

  // ========================
  // 5. REGISTROS DE HÁBITOS (~70% completado rate)
  // ========================
  let regHabCount = 0;
  for (const hid of habitoIds) {
    // get habito info for frequency
    const hInfo = await c.query('SELECT frecuencia, titulo FROM habitos WHERE id = $1', [hid]);
    const freq = hInfo.rows[0].frecuencia;
    const daysToCheck = freq === 'diario' ? allDays : freq === 'semanal' ? weekends.length > 0 ? weekends : allDays.filter(d => d.getDay() === 6) : allDays;
    for (const d of daysToCheck) {
      if (freq === 'semanal' && d.getDay() !== 6) continue;
      const completed = Math.random() < 0.72;
      await c.query(
        `INSERT INTO registros_habitos (habito_id, completado, fecha) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [hid, completed, toDate(d)]
      );
      regHabCount++;
    }
  }
  console.log(`  ${regHabCount} Registros de hábitos insertados`);

  // ========================
  // 6. RUTINAS (Gimnasio)
  // ========================
  const rutinasDef = [
    { nombre: 'Push (Pecho, Hombros, Tríceps)', descripcion: 'Empuje', dificultad: 'intermedio', dias: [1, 4] },
    { nombre: 'Pull (Espalda, Bíceps)', descripcion: 'Tracción', dificultad: 'intermedio', dias: [2, 5] },
    { nombre: 'Piernas', descripcion: 'Quadriceps, femorales, glúteos', dificultad: 'intermedio', dias: [3] },
  ];
  const rutinaIds = [];
  const allEjercicios = [];
  for (const rd of rutinasDef) {
    const r = await c.query(
      `INSERT INTO rutinas (usuario_id, nombre, descripcion, dificultad, dias_semana, creado_en, actualizado_en)
       VALUES ($1,$2,$3,$4,$5,$6,$6) RETURNING id`,
      [USER_ID, rd.nombre, rd.descripcion, rd.dificultad, JSON.stringify(rd.dias), START]
    );
    const rid = r.rows[0].id;
    rutinaIds.push(rid);
  }

  // Ejercicios for each routine
  const grupoPorRutina = [
    // Push
    [
      { nombre: 'Press banca', musculo: 'Pecho' },
      { nombre: 'Press militar', musculo: 'Hombros' },
      { nombre: 'Aperturas mancuernas', musculo: 'Pecho' },
      { nombre: 'Fondos tríceps', musculo: 'Tríceps' },
      { nombre: 'Vuelos laterales', musculo: 'Hombros' },
    ],
    // Pull
    [
      { nombre: 'Dominadas', musculo: 'Espalda' },
      { nombre: 'Remo barra', musculo: 'Espalda' },
      { nombre: 'Curl bíceps', musculo: 'Bíceps' },
      { nombre: 'Remo mancuerna', musculo: 'Espalda' },
      { nombre: 'Face pull', musculo: 'Hombros' },
    ],
    // Piernas
    [
      { nombre: 'Sentadilla', musculo: 'Piernas' },
      { nombre: 'Peso muerto', musculo: 'Espalda' },
      { nombre: 'Extensión quadriceps', musculo: 'Piernas' },
      { nombre: 'Curl femoral', musculo: 'Piernas' },
      { nombre: 'Elevación talones', musculo: 'Piernas' },
    ],
  ];

  for (let ri = 0; ri < rutinaIds.length; ri++) {
    for (const ej of grupoPorRutina[ri]) {
      await c.query(
        `INSERT INTO ejercicios (rutina_id, nombre, grupo_muscular, series_default, repeticiones_default)
         VALUES ($1,$2,$3,$4,$5)`,
        [rutinaIds[ri], ej.nombre, ej.musculo, randomInt(3, 4), randomInt(8, 15)]
      );
    }
  }
  console.log('  Rutinas y ejercicios insertados');

  // ========================
  // 7. REGISTROS DE ENTRENAMIENTO + SERIES
  // ========================
  for (const d of allDays) {
    if (isWeekend(d) && Math.random() > 0.15) continue;
    // ~40% of weekdays have workout
    if (Math.random() > 0.38) continue;
    const rutina = pick(rutinaIds);
    const ejercs = await c.query('SELECT id FROM ejercicios WHERE rutina_id = $1', [rutina]);
    for (const ej of ejercs.rows) {
      const dStr = toDate(d);
      const r = await c.query(
        `INSERT INTO registros_entrenamiento (usuario_id, ejercicio_id, rutina_id, fecha, duracion_segundos, creado_en)
         VALUES ($1,$2,$3,$4,$5,$6::timestamp) RETURNING id`,
        [USER_ID, ej.id, rutina, dStr, randomInt(1800, 3600), dStr]
      );
      const regId = r.rows[0].id;
      const nSeries = randomInt(3, 4);
      for (let s = 1; s <= nSeries; s++) {
        await c.query(
          `INSERT INTO series_entrenamiento (registro_id, numero_serie, repeticiones, peso_kg, rpe)
           VALUES ($1,$2,$3,$4,$5)`,
          [regId, s, randomInt(8, 15), randomFloat(20, 80), randomFloat(5, 9, 1)]
        );
      }
    }
  }
  console.log('  Registros de entrenamiento + series insertados');

  // ========================
  // 8. LECTURA - LIBROS
  // ========================
  const libros = [
    { titulo: 'Atomic Habits', autor: 'James Clear', paginas: 320, genero: 'Autoayuda' },
    { titulo: 'Deep Work', autor: 'Cal Newport', paginas: 296, genero: 'Productividad' },
    { titulo: 'Clean Code', autor: 'Robert C. Martin', paginas: 464, genero: 'Programación' },
    { titulo: 'El Alquimista', autor: 'Paulo Coelho', paginas: 192, genero: 'Ficción' },
    { titulo: 'The Pragmatic Programmer', autor: 'Andy Hunt', paginas: 352, genero: 'Programación' },
    { titulo: 'Hábitos Atómicos (español)', autor: 'James Clear', paginas: 336, genero: 'Autoayuda' },
  ];
  const libroIds = [];
  for (const lib of libros) {
    const estado = Math.random() > 0.5 ? 'leyendo' : 'sin_leer';
    const pagLeidas = estado === 'leyendo' ? randomInt(30, lib.paginas - 30) : 0;
    const r = await c.query(
      `INSERT INTO lectura_libros (usuario_id, titulo, autor, paginas_totales, paginas_leidas, estado, genero, etiquetas, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9) RETURNING id`,
      [USER_ID, lib.titulo, lib.autor, lib.paginas, pagLeidas, estado, lib.genero, `{${lib.genero}}`, START]
    );
    libroIds.push(r.rows[0].id);
  }
  console.log('  Libros insertados');

  // ========================
  // 9. LECTURA - REGISTROS
  // ========================
  for (const lid of libroIds) {
    const libro = await c.query('SELECT paginas_totales FROM lectura_libros WHERE id = $1', [lid]);
    const total = libro.rows[0].paginas_totales;
    const sessionDays = allDays.filter(() => Math.random() < 0.08);
    let acum = 0;
    for (const d of sessionDays) {
      const pag = randomInt(5, 25);
      acum += pag;
      await c.query(
        `INSERT INTO lectura_registros (libro_id, usuario_id, paginas_leidas, fecha, duracion_minutos)
         VALUES ($1,$2,$3,$4,$5)`,
        [lid, USER_ID, pag, toDate(d), randomInt(15, 60)]
      );
    }
    // Update total pages read
    await c.query('UPDATE lectura_libros SET paginas_leidas = $1 WHERE id = $2', [Math.min(acum, total), lid]);
  }
  console.log('  Registros de lectura insertados');

  // ========================
  // 10. LECTURA - METAS
  // ========================
  await c.query(
    `INSERT INTO lectura_metas (usuario_id, tipo, objetivo, periodo, anio, mes, progreso)
     VALUES ($1,'libros',2,'mensual',2026,3,1)`,
    [USER_ID]
  );
  await c.query(
    `INSERT INTO lectura_metas (usuario_id, tipo, objetivo, periodo, anio, mes, progreso)
     VALUES ($1,'libros',2,'mensual',2026,4,2)`,
    [USER_ID]
  );
  await c.query(
    `INSERT INTO lectura_metas (usuario_id, tipo, objetivo, periodo, anio, mes, progreso)
     VALUES ($1,'libros',2,'mensual',2026,5,1)`,
    [USER_ID]
  );
  await c.query(
    `INSERT INTO lectura_metas (usuario_id, tipo, objetivo, periodo, anio, progreso)
     VALUES ($1,'libros',12,'anual',2026,4)`,
    [USER_ID]
  );
  console.log('  Metas de lectura insertadas');

  // ========================
  // 11. LECTURA - PLANES
  // ========================
  for (const lid of libroIds) {
    if (Math.random() > 0.5) continue;
    const start = new Date(START.getTime() + randomInt(0, 30) * 86400000);
    const end = new Date(start.getTime() + randomInt(20, 60) * 86400000);
    const pag = await c.query('SELECT paginas_totales FROM lectura_libros WHERE id = $1', [lid]);
    const pagxDia = Math.ceil(pag.rows[0].paginas_totales / Math.ceil((end - start) / 86400000));
    await c.query(
      `INSERT INTO lectura_planes (libro_id, usuario_id, fecha_inicio, fecha_fin, paginas_por_dia, completado)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [lid, USER_ID, toDate(start), toDate(end), pagxDia, false]
    );
  }
  console.log('  Planes de lectura insertados');

  // ========================
  // 12. CHECK-INS EMOCIONALES (daily)
  // ========================
  const estadosAnimo = ['feliz', 'tranquilo', 'energico', 'cansado', 'estresado', 'motivado', 'neutral'];
  for (const d of allDays) {
    await c.query(
      `INSERT INTO checkins_emocionales (usuario_id, fecha, estado_animo, energia, sueno_horas)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (usuario_id, fecha) DO NOTHING`,
      [USER_ID, toDate(d), pick(estadosAnimo), randomInt(3, 10), randomFloat(5, 9, 1)]
    );
  }
  console.log('  Check-ins emocionales insertados');

  // ========================
  // 13. DIARIO PERSONAL
  // ========================
  const entradasDiario = [
    { tit: 'Inicio del reto de ejercicio', tag: 'salud' },
    { tit: 'Reflexión del mes', tag: 'personal' },
    { tit: 'Avances en el proyecto', tag: 'trabajo' },
    { tit: 'Ideas para mejorar hábitos', tag: 'habitos' },
    { tit: 'Qué aprendí esta semana', tag: 'aprendizaje' },
    { tit: 'Planificación del próximo mes', tag: 'planificacion' },
    { tit: 'Gratitud diaria', tag: 'personal' },
  ];
  for (let i = 0; i < 30; i++) {
    const d = allDays[randomInt(0, allDays.length - 1)];
    const entry = pick(entradasDiario);
    await c.query(
      `INSERT INTO diario_personal (usuario_id, titulo, contenido, etiquetas, creado_en, actualizado_en)
       VALUES ($1,$2,$3,$4,$5,$5)`,
      [USER_ID, entry.tit + ' - ' + toDate(d), `Hoy fue un día productivo. ${entry.tit}. Seguir mejorando cada día.`, JSON.stringify([entry.tag]), d]
    );
  }
  console.log('  Entradas de diario insertadas');

  // ========================
  // 14. POMODORO SESSIONS
  // ========================
  for (let i = 0; i < 80; i++) {
    const d = pick(weekdays);
    const inicio = new Date(d);
    inicio.setHours(randomInt(8, 20), randomInt(0, 59));
    const fin = new Date(inicio.getTime() + 25 * 60000);
    const tareaId = tareaIds.length > 0 ? pick(tareaIds) : null;
    await c.query(
      `INSERT INTO pomodoro_sessions (usuario_id, tarea_id, duracion_minutos, intervalo_numero, estado, inicio_en, fin_en)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [USER_ID, tareaId, 25, randomInt(1, 4), 'completada', inicio, fin]
    );
  }
  console.log('  Sesiones Pomodoro insertadas');

  // ========================
  // 15. POMODORO SETTINGS
  // ========================
  await c.query(
    `INSERT INTO pomodoro_settings (usuario_id) VALUES ($1) ON CONFLICT (usuario_id) DO NOTHING`,
    [USER_ID]
  );
  console.log('  Pomodoro settings insertados');

  // ========================
  // 16. FINANZAS - CATEGORÍAS
  // ========================
  const finCatIngDef = [
    { nombre: 'Salario', icono: '💰', color: '#10B981' },
    { nombre: 'Freelance', icono: '💻', color: '#3B82F6' },
    { nombre: 'Inversiones', icono: '📈', color: '#8B5CF6' },
  ];
  const finCatGastoDef = [
    { nombre: 'Alimentación', icono: '🍽️', color: '#F59E0B' },
    { nombre: 'Transporte', icono: '🚌', color: '#EF4444' },
    { nombre: 'Servicios', icono: '💡', color: '#EC4899' },
    { nombre: 'Entretenimiento', icono: '🎬', color: '#06B6D4' },
    { nombre: 'Salud', icono: '🏥', color: '#10B981' },
    { nombre: 'Educación', icono: '📚', color: '#6366F1' },
  ];

  for (const fcd of finCatIngDef) {
    await c.query(
      `INSERT INTO finanzas_categorias (usuario_id, nombre, tipo, icono, color) VALUES ($1,$2,'ingreso',$3,$4)`,
      [USER_ID, fcd.nombre, fcd.icono, fcd.color]
    );
  }
  for (const fcd of finCatGastoDef) {
    await c.query(
      `INSERT INTO finanzas_categorias (usuario_id, nombre, tipo, icono, color) VALUES ($1,$2,'gasto',$3,$4)`,
      [USER_ID, fcd.nombre, fcd.icono, fcd.color]
    );
  }
  console.log('  Categorías financieras insertadas');

  // ========================
  // 17. FINANZAS - CUENTAS
  // ========================
  const cuentas = [
    { nombre: 'Cuenta Principal', tipo: 'banco', saldo: 5000, moneda: 'BOB' },
    { nombre: 'Efectivo', tipo: 'efectivo', saldo: 800, moneda: 'BOB' },
    { nombre: 'Ahorros', tipo: 'ahorro', saldo: 3000, moneda: 'BOB' },
  ];
  for (const ct of cuentas) {
    await c.query(
      `INSERT INTO finanzas_cuentas (usuario_id, nombre, tipo, saldo_inicial, moneda) VALUES ($1,$2,$3,$4,$5)`,
      [USER_ID, ct.nombre, ct.tipo, ct.saldo, ct.moneda]
    );
  }
  console.log('  Cuentas financieras insertadas');

  // ========================
  // 18. FINANZAS - TRANSACCIONES
  // ========================
  const finCats = await c.query(
    `SELECT id, nombre, tipo FROM finanzas_categorias WHERE usuario_id = $1`,
    [USER_ID]
  );
  const finCuentas = await c.query(
    `SELECT id FROM finanzas_cuentas WHERE usuario_id = $1`,
    [USER_ID]
  );
  const ingCats = finCats.rows.filter(r => r.tipo === 'ingreso');
  const gastoCats = finCats.rows.filter(r => r.tipo === 'gasto');

  // Monthly salary
  for (let month = 3; month <= 5; month++) {
    await c.query(
      `INSERT INTO finanzas_transacciones (usuario_id, categoria_id, cuenta_id, tipo, monto, descripcion, fecha)
       VALUES ($1,$2,$3,'ingreso',3500,'Salario mensual',$4)`,
      [USER_ID, ingCats[0].id, finCuentas.rows[0].id, `2026-${String(month).padStart(2, '0')}-01`]
    );
    // Freelance income
    await c.query(
      `INSERT INTO finanzas_transacciones (usuario_id, categoria_id, cuenta_id, tipo, monto, descripcion, fecha)
       VALUES ($1,$2,$3,'ingreso',$4,'Proyecto freelance',$5)`,
      [USER_ID, ingCats[1].id, finCuentas.rows[0].id, randomInt(300, 1000), `2026-${String(month).padStart(2, '0')}-15`]
    );
  }

  // Daily/weekly expenses
  for (const d of allDays) {
    if (isWeekend(d) && Math.random() > 0.4) continue;
    if (Math.random() > 0.25) continue;
    const gc = pick(gastoCats);
    const amounts = {
      'Alimentación': [15, 80],
      'Transporte': [5, 30],
      'Servicios': [50, 300],
      'Entretenimiento': [20, 100],
      'Salud': [30, 150],
      'Educación': [50, 200],
    };
    const [minA, maxA] = amounts[gc.nombre] || [10, 100];
    await c.query(
      `INSERT INTO finanzas_transacciones (usuario_id, categoria_id, cuenta_id, tipo, monto, descripcion, fecha)
       VALUES ($1,$2,$3,'gasto',$4,$5,$6)`,
      [USER_ID, gc.id, finCuentas.rows[0].id, randomFloat(minA, maxA), `Gasto en ${gc.nombre}`, toDate(d)]
    );
  }
  console.log('  Transacciones financieras insertadas');

  // ========================
  // 19. FINANZAS - DEUDAS
  // ========================
  await c.query(
    `INSERT INTO finanzas_deudas (usuario_id, nombre, monto_total, monto_pagado, cuota_mensual, tasa_interes, fecha_inicio, fecha_vencimiento, estado)
     VALUES ($1,'Tarjeta de crédito',3000,1800,300,3.5,'2026-01-01','2026-12-31','pagando')`,
    [USER_ID]
  );
  await c.query(
    `INSERT INTO finanzas_deudas (usuario_id, nombre, monto_total, monto_pagado, cuota_mensual, fecha_inicio, fecha_vencimiento, estado)
     VALUES ($1,'Préstamo personal',2000,500,200,'2026-02-01','2026-10-01','pagando')`,
    [USER_ID]
  );
  console.log('  Deudas insertadas');

  // ========================
  // 20. FINANZAS - METAS
  // ========================
  await c.query(
    `INSERT INTO finanzas_metas (usuario_id, nombre, monto_objetivo, monto_actual, fecha_limite, estado)
     VALUES ($1,'Viaje a la playa',1500,600,'2026-12-01','en_progreso')`,
    [USER_ID]
  );
  await c.query(
    `INSERT INTO finanzas_metas (usuario_id, nombre, monto_objetivo, monto_actual, fecha_limite, estado)
     VALUES ($1,'Fondo de emergencia',5000,2000,'2026-12-31','en_progreso')`,
    [USER_ID]
  );
  await c.query(
    `INSERT INTO finanzas_metas (usuario_id, nombre, monto_objetivo, monto_actual, fecha_limite, estado)
     VALUES ($1,'Laptop nueva',8000,1000,'2026-09-01','en_progreso')`,
    [USER_ID]
  );
  console.log('  Metas financieras insertadas');

  // ========================
  // 21. FINANZAS - PRESUPUESTOS
  // ========================
  for (let mes = 3; mes <= 5; mes++) {
    for (const gc of gastoCats) {
      const limits = { 'Alimentación': 1500, 'Transporte': 400, 'Servicios': 600, 'Entretenimiento': 300, 'Salud': 400, 'Educación': 500 };
      await c.query(
        `INSERT INTO finanzas_presupuestos (usuario_id, categoria_id, mes, anio, limite)
         VALUES ($1,$2,$3,2026,$4)`,
        [USER_ID, gc.id, mes, limits[gc.nombre] || 500]
      );
    }
  }
  console.log('  Presupuestos insertados');

  // ========================
  // 22. BLOQUES DE TIEMPO (routine schedule)
  // ========================
  const timeBlocks = [
    { nombre: 'Trabajo profundo', inicio: '08:00', fin: '12:00' },
    { nombre: 'Almuerzo', inicio: '12:00', fin: '13:00' },
    { nombre: 'Tareas ligeras', inicio: '13:00', fin: '15:00' },
    { nombre: 'Estudio', inicio: '19:00', fin: '21:00' },
    { nombre: 'Gimnasio', inicio: '17:00', fin: '18:30' },
  ];
  for (const tb of timeBlocks) {
    await c.query(
      `INSERT INTO bloques_tiempo (usuario_id, nombre, hora_inicio, hora_fin, activo)
       VALUES ($1,$2,$3,$4,true)`,
      [USER_ID, tb.nombre, tb.inicio, tb.fin]
    );
  }
  console.log('  Bloques de tiempo insertados');

  // ========================
  // 23. BLOQUES_RUTINA (daily executed blocks)
  // ========================
  for (const d of allDays) {
    if (Math.random() > 0.2) continue;
    const blocks = ['Trabajo', 'Estudio', 'Ejercicio', 'Lectura'];
    const nb = pick(blocks);
    const hi = randomInt(8, 18);
    const hf = hi + randomInt(1, 3);
    await c.query(
      `INSERT INTO bloques_rutina (usuario_id, fecha, nombre, hora_inicio, hora_fin, completado)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [USER_ID, toDate(d), nb, `${String(hi).padStart(2, '0')}:00`, `${String(hf).padStart(2, '0')}:00`, Math.random() > 0.2]
    );
  }
  console.log('  Bloques de rutina insertados');

  // ========================
  // 24. PLANTILLAS DÍA + BLOQUES
  // ========================
  for (let day = 0; day <= 6; day++) {
    if (day === 0 || day === 6) continue; // skip weekends
    const r = await c.query(
      `INSERT INTO plantillas_dia (usuario_id, dia_semana) VALUES ($1,$2) RETURNING id`,
      [USER_ID, day]
    );
    const pid = r.rows[0].id;
    const dayBlocks = [
      { titulo: 'Trabajo profundo', inicio: '08:00', fin: '12:00' },
      { titulo: 'Almuerzo', inicio: '12:00', fin: '13:00' },
      { titulo: 'Tareas administrativas', inicio: '13:00', fin: '15:00' },
    ];
    if (day === 1 || day === 3 || day === 5) {
      dayBlocks.push({ titulo: 'Gimnasio', inicio: '17:00', fin: '18:30' });
    }
    for (let o = 0; o < dayBlocks.length; o++) {
      await c.query(
        `INSERT INTO plantillas_bloques (plantilla_id, titulo, hora_inicio, hora_fin, prioridad, orden)
         VALUES ($1,$2,$3,$4,'media',$5)`,
        [pid, dayBlocks[o].titulo, dayBlocks[o].inicio, dayBlocks[o].fin, o]
      );
    }
  }
  console.log('  Plantillas de día insertadas');

  // ========================
  // 25. PLANTILLAS RUTINA
  // ========================
  for (let day = 0; day <= 6; day++) {
    if (day === 0 || day === 6) continue;
    await c.query(
      `INSERT INTO plantillas_rutina (usuario_id, dia_semana, nombre, hora_inicio, hora_fin, tipo, prioridad)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [USER_ID, day, `Bloque ${day}`, '09:00', '11:00', 'tarea', 'media']
    );
  }
  console.log('  Plantillas de rutina insertadas');

  // ========================
  // 26. RECORDATORIOS
  // ========================
  const reminderTypes = ['agenda', 'habito', 'manual', 'whatsapp'];
  for (let i = 0; i < 20; i++) {
    const d = pick(allDays);
    d.setHours(randomInt(8, 20), randomInt(0, 59));
    await c.query(
      `INSERT INTO recordatorios (usuario_id, tipo, titulo, mensaje, fecha_hora, estado)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [USER_ID, pick(reminderTypes), `Recordatorio ${i + 1}`, `Mensaje de recordatorio ${i + 1}`, d, 'pendiente']
    );
  }
  console.log('  Recordatorios insertados');

  // ========================
  // 27. NOTIFICACIONES
  // ========================
  for (let i = 0; i < 30; i++) {
    const d = pick(allDays);
    await c.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, leida, creado_en)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [USER_ID, `Notificación ${i + 1}`, `Mensaje de notificación ${i + 1}`, pick(['app', 'push', 'email']), Math.random() > 0.3, d]
    );
  }
  console.log('  Notificaciones insertadas');

  // ========================
  // 28. CONVERSACIONES IA
  // ========================
  const mensajes = [
    [ '¿Cómo puedo mejorar mi productividad?', 'Te recomiendo usar la técnica Pomodoro y bloques de tiempo...' ],
    [ 'Organiza mi día', 'Claro, basado en tu rutina típica, aquí tienes un plan...' ],
    [ '¿Qué hábitos debería priorizar?', 'Basado en tu progreso, meditar y hacer ejercicio son los que más impacto tienen...' ],
    [ 'Análisis de mi semana', 'Esta semana completaste 85% de tus tareas. Buen trabajo...' ],
    [ '¿Cómo van mis finanzas?', 'Tus gastos de este mes están dentro del presupuesto en un 90%...' ],
  ];
  for (const [msg, resp] of mensajes) {
    await c.query(
      `INSERT INTO conversaciones_ia (usuario_id, mensaje, respuesta, tokens_usados)
       VALUES ($1,$2,$3,$4)`,
      [USER_ID, msg, resp, randomInt(100, 500)]
    );
  }
  console.log('  Conversaciones IA insertadas');

  // ========================
  // 29. ANÁLISIS IA
  // ========================
  const analisisTipos = ['productividad', 'habitos', 'finanzas', 'estado_animo'];
  for (const tipo of analisisTipos) {
    await c.query(
      `INSERT INTO analisis_ia (usuario_id, tipo, entrada, resultado, modelo)
       VALUES ($1,$2,$3,$4,'gpt-4o-mini')`,
      [USER_ID, tipo, JSON.stringify({ periodo: 'ultimo_mes' }), JSON.stringify({ resumen: `Análisis de ${tipo} completado`, puntuacion: randomInt(60, 100) })]
    );
  }
  console.log('  Análisis IA insertados');

  // ========================
  // 30. SUGERENCIAS IA
  // ========================
  const sugerencias = [
    { tipo: 'habito', tit: 'Agregar lectura nocturna', desc: 'Leer 15 min antes de dormir mejora el sueño' },
    { tipo: 'productividad', tit: 'Bloque anti-distracciones', desc: 'Programa 2h de trabajo profundo sin celular' },
    { tipo: 'salud', tit: 'Pausas activas cada hora', desc: 'Levantarte y estirar cada 60 min mejora tu postura' },
  ];
  for (const s of sugerencias) {
    await c.query(
      `INSERT INTO sugerencias_ia (usuario_id, tipo, titulo, descripcion, leida)
       VALUES ($1,$2,$3,$4,$5)`,
      [USER_ID, s.tipo, s.tit, s.desc, Math.random() > 0.5]
    );
  }
  console.log('  Sugerencias IA insertadas');

  // ========================
  // 31. PAUSAS ACTIVAS
  // ========================
  const pausas = ['Estiramiento de cuello', 'Caminata 5 min', 'Ejercicios de espalda', 'Rotación de hombros', 'Sentadillas'];
  for (let i = 0; i < 15; i++) {
    const d = pick(weekdays);
    d.setHours(randomInt(9, 17), 0);
    await c.query(
      `INSERT INTO pausas_activas (usuario_id, ejercicio, duracion_minutos, programada_para, completada)
       VALUES ($1,$2,$3,$4,$5)`,
      [USER_ID, pick(pausas), 5, d, Math.random() > 0.3]
    );
  }
  console.log('  Pausas activas insertadas');

  // ========================
  // 32. PROGRESO (daily)
  // ========================
  for (const d of allDays) {
    await c.query(
      `INSERT INTO progreso (usuario_id, tipo, valor, fecha) VALUES ($1,$2,$3,$4) ON CONFLICT (usuario_id, tipo, fecha) DO NOTHING`,
      [USER_ID, 'tareas_completadas', randomInt(0, 8), toDate(d)]
    );
    await c.query(
      `INSERT INTO progreso (usuario_id, tipo, valor, fecha) VALUES ($1,$2,$3,$4) ON CONFLICT (usuario_id, tipo, fecha) DO NOTHING`,
      [USER_ID, 'puntos_dia', randomInt(10, 100), toDate(d)]
    );
    await c.query(
      `INSERT INTO progreso (usuario_id, tipo, valor, fecha) VALUES ($1,$2,$3,$4) ON CONFLICT (usuario_id, tipo, fecha) DO NOTHING`,
      [USER_ID, 'habitos_completados', randomInt(0, 6), toDate(d)]
    );
  }
  console.log('  Progreso diario insertado');

  // ========================
  // 33. GAMIFICACIÓN - PERFIL
  // ========================
  await c.query(
    `INSERT INTO perfil_gamificacion (usuario_id, puntos_totales, nivel, xp_actual, xp_siguiente, racha_actual, mejor_racha, ultima_actividad)
     VALUES ($1,4850,8,340,500,12,21,$2)`,
    [USER_ID, END]
  );
  await c.query(
    `INSERT INTO usuario_gamificacion (usuario_id, xp, nivel, streak, ultimo_registro)
     VALUES ($1,4850,8,12,$2)`,
    [USER_ID, END]
  );
  console.log('  Perfil gamificación insertado');

  // ========================
  // 34. GAMIFICACIÓN - LOGROS USUARIO (unlock some achievements)
  // ========================
  const logros = await c.query('SELECT id, codigo FROM logros');
  const unlockable = ['primeros_pasos', 'productivo', 'dedicacion', 'prioridades', 'creador_habitos', 'planificador', 'madrugador', 'consistente'];
  for (const lr of logros.rows) {
    if (unlockable.includes(lr.codigo)) {
      await c.query(
        `INSERT INTO logros_usuario (usuario_id, logro_id, obtenido_en) VALUES ($1,$2,$3)`,
        [USER_ID, lr.id, new Date(START.getTime() + randomInt(5, 60) * 86400000)]
      );
    }
  }
  console.log('  Logros de usuario insertados');

  // ========================
  // 35. GAMIFICACIÓN - EVENTOS + HISTORIAL PUNTOS
  // ========================
  for (let i = 0; i < 50; i++) {
    const d = pick(allDays);
    await c.query(
      `INSERT INTO eventos_gamificacion (usuario_id, tipo, referencia_id, referencia_tipo, puntos, creado_en)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [USER_ID, pick(['tarea_completada', 'habito_completado', 'racha_logro', 'meta_avance']), i + 1, pick(['tarea', 'habito', 'progreso']), randomInt(10, 50), d]
    );
    await c.query(
      `INSERT INTO historial_puntos (usuario_id, puntos, motivo, referencia_tipo, referencia_id, creado_en)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [USER_ID, randomInt(5, 30), pick(['Completar tarea', 'Racha de hábito', 'Logro desbloqueado', 'Meta avanzada']), pick(['tarea', 'habito', 'logro', 'meta']), i + 1, d]
    );
  }
  console.log('  Eventos e historial de puntos insertados');

  // ========================
  // 36. PREFERENCIAS NOTIFICACIÓN
  // ========================
  await c.query(
    `INSERT INTO preferencias_notificacion (usuario_id) VALUES ($1) ON CONFLICT (usuario_id) DO NOTHING`,
    [USER_ID]
  );
  console.log('  Preferencias de notificación insertadas');

  // ========================
  // 37. META PROGRESO
  // ========================
  for (const mid of metaIds) {
    for (let i = 1; i <= 6; i++) {
      await c.query(
        `INSERT INTO meta_progreso (meta_id, progreso, fecha) VALUES ($1,$2,$3)`,
        [mid, randomFloat(0, 100), new Date(2026, 2 + i, 1)]
      );
    }
  }
  console.log('  Meta progreso insertado');

  console.log('\n✅ SEED COMPLETADO EXITOSAMENTE');

} catch (err) {
  console.error('ERROR:', err.message);
  throw err;
} finally {
  await c.end();
}
