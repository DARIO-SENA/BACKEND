export const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.message}`);

  if (res.headersSent) return next(err);

  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    error: status === 500 ? 'Error interno del servidor' : err.message,
  });
};
