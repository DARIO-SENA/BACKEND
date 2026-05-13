exports.up = (pgm) => {
  pgm.createTable('pomodoro_settings', {
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    duracion_foco: { type: 'int', default: 25 },
    descanso_corto: { type: 'int', default: 5 },
    descanso_largo: { type: 'int', default: 15 },
    intervalos_antes_descanso_largo: { type: 'int', default: 4 },
    auto_iniciar_descanso: { type: 'boolean', default: false },
    notificaciones_sonido: { type: 'boolean', default: true },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('pomodoro_settings', 'pomodoro_settings_pkey', {
    primaryKey: ['usuario_id'],
  });

  pgm.createTable('pomodoro_sessions', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    tarea_id: { type: 'int', references: 'tareas(id)', onDelete: 'set null' },
    duracion_minutos: { type: 'int', notNull: true },
    descanso_minutos: { type: 'int', default: 5 },
    intervalo_numero: { type: 'int', default: 1 },
    estado: { type: 'varchar(20)', default: 'completada' },
    inicio_en: { type: 'timestamp', notNull: true },
    fin_en: 'timestamp',
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('pomodoro_sessions', 'usuario_id');
  pgm.createIndex('pomodoro_sessions', 'tarea_id');
  pgm.createIndex('pomodoro_sessions', 'inicio_en');
};

exports.down = (pgm) => {
  pgm.dropTable('pomodoro_sessions');
  pgm.dropTable('pomodoro_settings');
};
