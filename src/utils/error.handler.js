export const manejarError = (res, err) => {
  if (err.status) return res.status(err.status).json({ ok: false, error: err.message });
  console.error(err.message);
  res.status(500).json({ ok: false, error: 'Error interno del servidor' });
};
