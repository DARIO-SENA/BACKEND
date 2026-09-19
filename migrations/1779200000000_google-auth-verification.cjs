exports.up = (pgm) => {
  pgm.addColumns('usuarios', {
    verification_code: { type: 'varchar(6)' },
    verification_code_expires_at: { type: 'timestamp' },
    auth_provider: { type: 'varchar(20)', default: 'local' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('usuarios', ['verification_code', 'verification_code_expires_at', 'auth_provider']);
};
