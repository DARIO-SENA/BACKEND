exports.up = (pgm) => {
  pgm.createTable('bloques_tiempo', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    nombre: { type: 'varchar(100)', notNull: true },
    hora_inicio: { type: 'time', notNull: true },
    hora_fin: { type: 'time', notNull: true },
    activo: { type: 'boolean', default: true },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('amistades', {
    id: 'id',
    solicitante_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    receptor_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    estado: { type: 'varchar(20)', default: 'pendiente' },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('amistades', 'amistades_unique', {
    unique: ['solicitante_id', 'receptor_id'],
  });

  pgm.createTable('proyectos', {
    id: 'id',
    nombre: { type: 'varchar(100)', notNull: true },
    descripcion: 'text',
    creador_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('proyecto_miembros', {
    id: 'id',
    proyecto_id: { type: 'int', notNull: true, references: 'proyectos(id)', onDelete: 'cascade' },
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    rol: { type: 'varchar(20)', default: 'miembro' },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('proyecto_miembros', 'proyecto_miembros_unique', {
    unique: ['proyecto_id', 'usuario_id'],
  });

  pgm.createTable('tareas_compartidas', {
    id: 'id',
    proyecto_id: { type: 'int', notNull: true, references: 'proyectos(id)', onDelete: 'cascade' },
    creado_por: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    asignado_a: { type: 'int', references: 'usuarios(id)', onDelete: 'set null' },
    titulo: { type: 'varchar(200)', notNull: true },
    descripcion: 'text',
    estado: { type: 'varchar(20)', default: 'pendiente' },
    prioridad: { type: 'varchar(10)', default: 'media' },
    fecha_limite: 'timestamp',
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('comentarios', {
    id: 'id',
    tarea_id: { type: 'int', notNull: true, references: 'tareas_compartidas(id)', onDelete: 'cascade' },
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    contenido: { type: 'text', notNull: true },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.addColumns('usuarios', {
    google_id: { type: 'varchar(255)' },
    google_access_token: 'text',
    google_refresh_token: 'text',
    google_token_expiry: 'timestamp',
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comentarios');
  pgm.dropTable('tareas_compartidas');
  pgm.dropTable('proyecto_miembros');
  pgm.dropTable('proyectos');
  pgm.dropTable('amistades');
  pgm.dropTable('bloques_tiempo');
  pgm.dropColumns('usuarios', ['google_id', 'google_access_token', 'google_refresh_token', 'google_token_expiry']);
};
