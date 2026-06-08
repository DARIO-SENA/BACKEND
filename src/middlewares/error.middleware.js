import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, status: err.status });

  if (res.headersSent) return next(err);

  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    error: status === 500 ? 'Error interno del servidor' : err.message,
  });
};
