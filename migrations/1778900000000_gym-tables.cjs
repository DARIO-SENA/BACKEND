exports.up = (pgm) => {
  pgm.sql(`
    DO $$ BEGIN
      CREATE TYPE nivel_dificultad AS ENUM ('principiante', 'intermedio', 'avanzado');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS rutinas (
      id SERIAL PRIMARY KEY,
      usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
      nombre VARCHAR(100),
      descripcion TEXT,
      dificultad nivel_dificultad DEFAULT 'principiante',
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS ejercicios (
      id SERIAL PRIMARY KEY,
      rutina_id INT REFERENCES rutinas(id) ON DELETE CASCADE,
      nombre VARCHAR(100),
      grupo_muscular VARCHAR(50),
      series_default INT DEFAULT 3,
      repeticiones_default INT DEFAULT 10,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS registros_entrenamiento (
      id SERIAL PRIMARY KEY,
      usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
      ejercicio_id INT REFERENCES ejercicios(id) ON DELETE CASCADE,
      rutina_id INT REFERENCES rutinas(id) ON DELETE SET NULL,
      fecha DATE DEFAULT CURRENT_DATE,
      notas TEXT,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS series_entrenamiento (
      id SERIAL PRIMARY KEY,
      registro_id INT REFERENCES registros_entrenamiento(id) ON DELETE CASCADE,
      numero_serie INT,
      repeticiones INT,
      peso_kg NUMERIC(5,2)
    );
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('series_entrenamiento', { ifExists: true });
  pgm.dropTable('registros_entrenamiento', { ifExists: true });
  pgm.dropTable('ejercicios', { ifExists: true });
  pgm.dropTable('rutinas', { ifExists: true });
  pgm.sql('DROP TYPE IF EXISTS nivel_dificultad');
};
