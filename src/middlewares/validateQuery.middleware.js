import { z } from 'zod';

export const paginationSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).optional(),
});

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)');

export const monthSchema = z.coerce.number().int().min(1).max(12);
export const yearSchema = z.coerce.number().int().min(2000).max(2100);

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({
      campo: i.path.join('.'),
      mensaje: i.message,
    }));
    return res.status(400).json({ ok: false, error: 'Parámetros de consulta inválidos', detalles: errors });
  }
  req.query = result.data;
  next();
};
