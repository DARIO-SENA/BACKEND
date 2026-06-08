import logger from '../config/logger.js';

export const manejarError = (res, err) => {
  if (err.status) return res.status(err.status).json({ ok: false, error: err.message });
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ ok: false, error: err.message });
};
