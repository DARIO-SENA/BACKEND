exports.up = (pgm) => {
  pgm.createTable('metas', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    titulo: { type: 'varchar(200)', notNull: true },
    descripcion: 'text',
    categoria: { type: 'varchar(50)', default: 'personal' },
    progreso: { type: 'decimal(5,2)', default: 0 },
    fecha_inicio: 'date',
    fecha_fin: 'date',
    estado: { type: 'varchar(20)', default: 'en_progreso' },
    es_borrador: { type: 'boolean', default: false },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('metas', 'usuario_id');

  pgm.createTable('key_results', {
    id: 'id',
    meta_id: { type: 'int', notNull: true, references: 'metas(id)', onDelete: 'cascade' },
    titulo: { type: 'varchar(200)', notNull: true },
    descripcion: 'text',
    progreso: { type: 'decimal(5,2)', default: 0 },
    orden: { type: 'int', default: 0 },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('key_results', 'meta_id');

  pgm.createTable('meta_progreso', {
    id: 'id',
    meta_id: { type: 'int', notNull: true, references: 'metas(id)', onDelete: 'cascade' },
    progreso: { type: 'decimal(5,2)', notNull: true },
    fecha: { type: 'date', notNull: true, default: pgm.func('current_date') },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('meta_progreso', 'meta_progreso_unique', {
    unique: ['meta_id', 'fecha'],
  });

  pgm.addColumns('tareas', {
    meta_id: { type: 'int', references: 'metas(id)', onDelete: 'set null' },
    key_result_id: { type: 'int', references: 'key_results(id)', onDelete: 'set null' },
  });

  pgm.sql(`
    INSERT INTO logros (codigo, titulo, descripcion, icono, puntos, condicion) VALUES
    ('PRIMER_META', 'Primera Meta', 'Crear tu primera meta u objetivo', '🎯', 50, '{"tipo": "metas_creadas", "valor": 1}'),
    ('META_COMPLETADA', 'Meta Cumplida', 'Completar una meta al 100%', '✅', 100, '{"tipo": "metas_completadas", "valor": 1}'),
    ('MAESTRO_OKRS', 'Maestro OKRs', 'Completar 5 Key Results', '🏆', 150, '{"tipo": "krs_completados", "valor": 5}'),
    ('META_RAPIDA', 'Meta Relámpago', 'Completar una meta en menos de 7 días', '⚡', 200, '{"tipo": "meta_rapida", "valor": 1}')
    ON CONFLICT (codigo) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumns('tareas', ['meta_id', 'key_result_id']);
  pgm.dropTable('meta_progreso');
  pgm.dropTable('key_results');
  pgm.dropTable('metas');
  pgm.sql("DELETE FROM logros WHERE codigo IN ('PRIMER_META','META_COMPLETADA','MAESTRO_OKRS','META_RAPIDA')");
};
