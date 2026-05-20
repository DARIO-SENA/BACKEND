exports.up = (pgm) => {
  pgm.addColumns('usuarios', {
    email_semanal_activo: { type: 'boolean', default: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('usuarios', ['email_semanal_activo']);
};
