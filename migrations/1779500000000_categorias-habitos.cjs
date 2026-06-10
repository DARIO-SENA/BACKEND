exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS categorias_habitos (
      id SERIAL PRIMARY KEY,
      usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      nombre VARCHAR(50) NOT NULL,
      icono VARCHAR(10) DEFAULT '',
      color VARCHAR(7) DEFAULT '#b06ef3',
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS categorias_habitos`);
};
