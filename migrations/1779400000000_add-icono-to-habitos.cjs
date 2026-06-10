exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE habitos
    ADD COLUMN IF NOT EXISTS icono VARCHAR(10) DEFAULT '';
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE habitos
    DROP COLUMN IF EXISTS icono;
  `);
};
