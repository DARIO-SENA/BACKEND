exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE usuarios
    DROP COLUMN IF EXISTS avatar_url;
  `);
};
