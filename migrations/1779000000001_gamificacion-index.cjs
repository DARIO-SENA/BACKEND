exports.up = (pgm) => {
  pgm.createIndex('perfil_gamificacion', 'puntos_totales', {
    name: 'idx_perfil_puntos',
    method: 'btree',
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('perfil_gamificacion', 'puntos_totales', {
    name: 'idx_perfil_puntos',
  });
};
