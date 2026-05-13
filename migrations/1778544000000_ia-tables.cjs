exports.up = (pgm) => {
  pgm.createTable('analisis_ia', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    tipo: { type: 'varchar(50)', notNull: true },
    entrada: { type: 'jsonb' },
    resultado: { type: 'jsonb' },
    modelo: { type: 'varchar(50)', default: 'gpt-4o-mini' },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('sugerencias_ia', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    tipo: { type: 'varchar(50)', notNull: true },
    titulo: { type: 'varchar(200)', notNull: true },
    descripcion: 'text',
    metadata: { type: 'jsonb' },
    leida: { type: 'boolean', default: false },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('conversaciones_ia', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    mensaje: { type: 'text', notNull: true },
    respuesta: { type: 'text', notNull: true },
    herramientas_usadas: { type: 'jsonb' },
    tokens_usados: { type: 'int', default: 0 },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('analisis_ia', 'usuario_id');
  pgm.createIndex('analisis_ia', 'tipo');
  pgm.createIndex('sugerencias_ia', 'usuario_id');
  pgm.createIndex('conversaciones_ia', 'usuario_id');
};

exports.down = (pgm) => {
  pgm.dropTable('conversaciones_ia');
  pgm.dropTable('sugerencias_ia');
  pgm.dropTable('analisis_ia');
};
