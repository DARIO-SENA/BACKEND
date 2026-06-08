exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE ejercicios
    ADD COLUMN IF NOT EXISTS descanso INT DEFAULT 90,
    ADD COLUMN IF NOT EXISTS duracion_segundos INT DEFAULT 60;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE ejercicios
    DROP COLUMN IF EXISTS descanso,
    DROP COLUMN IF EXISTS duracion_segundos;
  `);
};
