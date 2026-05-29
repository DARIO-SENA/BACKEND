export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({
      campo: i.path.join('.'),
      mensaje: i.message,
    }));
    return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errors });
  }
  req.body = result.data;
  next();
};
