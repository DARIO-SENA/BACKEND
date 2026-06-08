export const success = (res, { data = null, message = 'Operación exitosa', status = 200, meta } = {}) => {
  const body = { ok: true, message, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};

export const created = (res, { data = null, message = 'Recurso creado exitosamente' } = {}) =>
  success(res, { data, message, status: 201 });

export const paginated = (res, { data = [], total, page, limit, message = 'Listado obtenido' } = {}) =>
  success(res, {
    data,
    message,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
