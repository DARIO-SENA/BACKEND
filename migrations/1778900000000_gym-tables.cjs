exports.up = (pgm) => {
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
};

exports.down = (pgm) => {
  pgm.dropTable('series_entrenamiento');
  pgm.dropTable('registros_entrenamiento');
  pgm.dropTable('ejercicios');
  pgm.dropTable('rutinas');
  pgm.dropType('nivel_dificultad', { ifExists: true });
};
