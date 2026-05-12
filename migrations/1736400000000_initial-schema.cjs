exports.up = (pgm) => {
  pgm.createExtension('citext', { ifNotExists: true });

  pgm.createType('estado_tarea', ['pendiente', 'completada', 'cancelada', 'en_progreso'], { ifNotExists: true });
  pgm.createType('prioridad_tarea', ['alta', 'media', 'baja'], { ifNotExists: true });
  pgm.createType('frecuencia_habito', ['diario', 'semanal', 'mensual'], { ifNotExists: true });

  pgm.createTable('usuarios', {
    id: 'id',
    nombre: { type: 'varchar(100)', notNull: true },
    email: { type: 'citext', unique: true, notNull: true },
    password: { type: 'varchar(255)', notNull: true },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('habitos', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    titulo: { type: 'varchar(100)', notNull: true },
    descripcion: 'text',
    frecuencia: 'frecuencia_habito',
    completado: { type: 'boolean', default: false },
    activo: { type: 'boolean', default: true },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('registros_habitos', {
    id: 'id',
    habito_id: { type: 'int', notNull: true, references: 'habitos(id)', onDelete: 'cascade' },
    completado: { type: 'boolean', default: false },
    fecha: { type: 'date', notNull: true },
  });

  pgm.createTable('categorias', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    nombre: { type: 'varchar(80)', notNull: true },
    color: { type: 'varchar(7)', default: '#7F77DD' },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('tareas', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    titulo: { type: 'varchar(100)', notNull: true },
    descripcion: 'text',
    estado: { type: 'estado_tarea', default: 'pendiente' },
    prioridad: { type: 'prioridad_tarea', default: 'media' },
    fecha_limite: 'timestamp',
    fecha_inicio: 'timestamp',
    fecha_fin: 'timestamp',
    duracion_minutos: { type: 'int', default: 30 },
    todo_el_dia: { type: 'boolean', default: false },
    es_recurrente: { type: 'boolean', default: false },
    recurrencia: 'varchar(20)',
    auto_programado: { type: 'boolean', default: false },
    categoria_id: { type: 'int', references: 'categorias(id)', onDelete: 'set null' },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('progreso', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    tipo: 'varchar(50)',
    valor: 'int',
    fecha: 'date',
  });

  pgm.addConstraint('progreso', 'progreso_unique', {
    unique: ['usuario_id', 'tipo', 'fecha'],
  });

  pgm.createTable('logros', {
    id: 'id',
    codigo: { type: 'varchar(50)', unique: true, notNull: true },
    titulo: { type: 'varchar(100)', notNull: true },
    descripcion: { type: 'text', notNull: true },
    icono: { type: 'varchar(10)', default: '🏆' },
    puntos: { type: 'int', default: 50 },
    condicion: { type: 'jsonb', notNull: true },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('logros_usuario', {
    id: 'id',
    usuario_id: { type: 'int', references: 'usuarios(id)', onDelete: 'cascade' },
    logro_id: { type: 'int', references: 'logros(id)', onDelete: 'cascade' },
    obtenido_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('logros_usuario', 'logros_usuario_unique', {
    unique: ['usuario_id', 'logro_id'],
  });

  pgm.createTable('historial_puntos', {
    id: 'id',
    usuario_id: { type: 'int', references: 'usuarios(id)', onDelete: 'cascade' },
    puntos: { type: 'int', notNull: true },
    motivo: { type: 'varchar(100)', notNull: true },
    referencia_tipo: 'varchar(20)',
    referencia_id: 'int',
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('perfil_gamificacion', {
    id: 'id',
    usuario_id: { type: 'int', unique: true, references: 'usuarios(id)', onDelete: 'cascade' },
    puntos_totales: { type: 'int', default: 0 },
    nivel: { type: 'int', default: 1 },
    xp_actual: { type: 'int', default: 0 },
    xp_siguiente: { type: 'int', default: 100 },
    racha_actual: { type: 'int', default: 0 },
    mejor_racha: { type: 'int', default: 0 },
    ultima_actividad: 'date',
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('eventos_gamificacion', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true },
    tipo: { type: 'varchar(50)', notNull: true },
    referencia_id: { type: 'int', notNull: true },
    referencia_tipo: { type: 'varchar(20)', notNull: true },
    puntos: { type: 'int', notNull: true },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('eventos_gamificacion', 'eventos_gamificacion_unique', {
    unique: ['usuario_id', 'referencia_tipo', 'referencia_id', 'tipo'],
  });

  pgm.createTable('preferencias_notificacion', {
    id: 'id',
    usuario_id: { type: 'int', unique: true, references: 'usuarios(id)', onDelete: 'cascade' },
    notificaciones_activas: { type: 'boolean', default: true },
    hora_silencio_inicio: { type: 'time', default: '22:00' },
    hora_silencio_fin: { type: 'time', default: '07:00' },
    tipo_agenda: { type: 'boolean', default: true },
    tipo_habitos: { type: 'boolean', default: true },
    tipo_manual: { type: 'boolean', default: true },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('recordatorios', {
    id: 'id',
    usuario_id: { type: 'int', references: 'usuarios(id)', onDelete: 'cascade' },
    tipo: { type: 'varchar(20)', check: "tipo IN ('agenda','habito','manual')" },
    referencia_id: 'int',
    titulo: { type: 'varchar(200)', notNull: true },
    mensaje: 'text',
    fecha_hora: { type: 'timestamp', notNull: true },
    anticipacion_min: { type: 'int', default: 0 },
    es_recurrente: { type: 'boolean', default: false },
    regla_recurrencia: 'varchar(20)',
    estado: { type: 'varchar(20)', default: 'pendiente' },
    intentos: { type: 'int', default: 0 },
    ultimo_intento: 'timestamp',
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('notificaciones', {
    id: 'id',
    usuario_id: { type: 'int', references: 'usuarios(id)', onDelete: 'cascade' },
    recordatorio_id: { type: 'int', references: 'recordatorios(id)', onDelete: 'set null' },
    titulo: { type: 'varchar(200)', notNull: true },
    mensaje: 'text',
    tipo: { type: 'varchar(20)', default: 'app' },
    leida: { type: 'boolean', default: false },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createType('nivel_dificultad', ['principiante', 'intermedio', 'avanzado'], { ifNotExists: true });

  pgm.createTable('rutinas', {
    id: 'id',
    usuario_id: { type: 'int', references: 'usuarios(id)', onDelete: 'cascade' },
    nombre: 'varchar(100)',
    descripcion: 'text',
    dificultad: { type: 'nivel_dificultad', default: 'principiante' },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('ejercicios', {
    id: 'id',
    rutina_id: { type: 'int', references: 'rutinas(id)', onDelete: 'cascade' },
    nombre: 'varchar(100)',
    grupo_muscular: 'varchar(50)',
    series_default: { type: 'int', default: 3 },
    repeticiones_default: { type: 'int', default: 10 },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('registros_entrenamiento', {
    id: 'id',
    usuario_id: { type: 'int', references: 'usuarios(id)', onDelete: 'cascade' },
    ejercicio_id: { type: 'int', references: 'ejercicios(id)', onDelete: 'cascade' },
    rutina_id: { type: 'int', references: 'rutinas(id)', onDelete: 'set null' },
    fecha: { type: 'date', default: pgm.func('current_date') },
    notas: 'text',
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('series_entrenamiento', {
    id: 'id',
    registro_id: { type: 'int', references: 'registros_entrenamiento(id)', onDelete: 'cascade' },
    numero_serie: 'int',
    repeticiones: 'int',
    peso_kg: 'numeric(5,2)',
  });

  pgm.createIndex('usuarios', 'email');
  pgm.createIndex('tareas', 'usuario_id');
  pgm.createIndex('habitos', 'usuario_id');
  pgm.createIndex('recordatorios', 'fecha_hora');
  pgm.createIndex('eventos_gamificacion', ['usuario_id', 'tipo']);
};

exports.down = (pgm) => {
  pgm.dropTable('series_entrenamiento');
  pgm.dropTable('registros_entrenamiento');
  pgm.dropTable('ejercicios');
  pgm.dropTable('rutinas');
  pgm.dropType('nivel_dificultad');
  pgm.dropTable('notificaciones');
  pgm.dropTable('recordatorios');
  pgm.dropTable('preferencias_notificacion');
  pgm.dropTable('eventos_gamificacion');
  pgm.dropTable('perfil_gamificacion');
  pgm.dropTable('historial_puntos');
  pgm.dropTable('logros_usuario');
  pgm.dropTable('logros');
  pgm.dropTable('progreso');
  pgm.dropTable('tareas');
  pgm.dropTable('categorias');
  pgm.dropTable('registros_habitos');
  pgm.dropTable('habitos');
  pgm.dropTable('usuarios');
  pgm.dropType('frecuencia_habito');
  pgm.dropType('prioridad_tarea');
  pgm.dropType('estado_tarea');
};
