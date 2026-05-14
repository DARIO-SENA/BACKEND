exports.up = (pgm) => {
  pgm.createTable('checkins_emocionales', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    fecha: { type: 'date', notNull: true, default: pgm.func('current_date') },
    estado_animo: { type: 'varchar(50)', notNull: true },
    energia: { type: 'int' },
    sueno_horas: { type: 'numeric(4,1)' },
    notas: 'text',
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('checkins_emocionales', 'checkins_emocionales_unique', {
    unique: ['usuario_id', 'fecha'],
  });
  pgm.createIndex('checkins_emocionales', 'usuario_id');

  pgm.createTable('diario_personal', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    titulo: { type: 'varchar(200)' },
    contenido: { type: 'text', notNull: true },
    etiquetas: { type: 'jsonb', default: pgm.func("'[]'::jsonb") },
    es_publico: { type: 'boolean', default: false },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('diario_personal', 'usuario_id');

  pgm.createTable('pausas_activas', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    ejercicio: { type: 'varchar(100)', notNull: true },
    duracion_minutos: { type: 'int', notNull: true },
    programada_para: { type: 'timestamp' },
    completada: { type: 'boolean', default: false },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('pausas_activas', 'usuario_id');

  pgm.addColumns('analisis_ia', {
    cache_hasta: { type: 'timestamp' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('pausas_activas');
  pgm.dropTable('diario_personal');
  pgm.dropTable('checkins_emocionales');
  pgm.dropColumns('analisis_ia', ['cache_hasta']);
};