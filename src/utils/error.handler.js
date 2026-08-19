import logger from '../config/logger.js';

export const manejarError = (res, err) => {
  if (err.status) return res.status(err.status).json({ ok: false, error: err.message });

  if (err.code === '23505') {
    return res.status(409).json({ ok: false, error: 'El registro ya existe (duplicado)' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ ok: false, error: 'Referencia inválida (registro relacionado no encontrado)' });
  }
  if (err.code === '23502') {
    return res.status(400).json({ ok: false, error: 'Falta un campo requerido' });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ ok: false, error: 'Formato de dato inválido' });
  }

  logger.error(err.message, { stack: err.stack, code: err.code });
  res.status(500).json({ ok: false, error: err.message });
};
