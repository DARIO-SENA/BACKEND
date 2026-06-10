exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE habitos
    ADD COLUMN IF NOT EXISTS categoria_id INT REFERENCES categorias_habitos(id) ON DELETE SET NULL;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE habitos
    DROP COLUMN IF EXISTS categoria_id;
  `);
};
