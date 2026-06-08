import pool from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

// ─── CATEGORIAS ─────────────────────────────────────────────────

export const listarCategorias = async (usuarioId, tipo) => {
  const valores = [usuarioId];
  let sql = 'SELECT * FROM finanzas_categorias WHERE usuario_id = $1';
  if (tipo) { sql += ' AND tipo = $2'; valores.push(tipo); }
  sql += ' ORDER BY tipo, nombre';
  const { rows } = await pool.query(sql, valores);
  return rows;
};

const MAX_NOMBRE = 100;
const MAX_DESCRIPCION = 500;

export const crearCategoria = async (usuarioId, data) => {
  const { nombre, tipo, icono, color } = data;
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0 || nombre.length > MAX_NOMBRE) {
    throw new AppError(`Nombre requerido (máx ${MAX_NOMBRE} caracteres)`, 400);
  }
  if (!tipo || !['ingreso', 'gasto'].includes(tipo)) {
    throw new AppError('Tipo debe ser ingreso o gasto', 400);
  }
  const { rows } = await pool.query(
    `INSERT INTO finanzas_categorias (usuario_id, nombre, tipo, icono, color)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [usuarioId, nombre, tipo, icono || null, color || null]
  );
  return rows[0];
};

export const actualizarCategoria = async (id, usuarioId, data) => {
  const campos = []; const valores = []; let i = 1;
  for (const key of ['nombre', 'tipo', 'icono', 'color']) {
    if (data[key] !== undefined) {
      campos.push(`${key} = $${i++}`);
      valores.push(data[key]);
    }
  }
  if (campos.length === 0) return null;
  valores.push(id, usuarioId);
  const { rows } = await pool.query(
    `UPDATE finanzas_categorias SET ${campos.join(', ')}, actualizado_en = CURRENT_TIMESTAMP
     WHERE id = $${i++} AND usuario_id = $${i} RETURNING *`,
    valores
  );
  return rows[0] || null;
};

export const eliminarCategoria = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM finanzas_categorias WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return rowCount > 0;
};

// ─── CUENTAS ────────────────────────────────────────────────────

export const listarCuentas = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT c.*,
       COALESCE((
         SELECT SUM(CASE WHEN t.tipo = 'ingreso' THEN t.monto ELSE 0 END)
                - SUM(CASE WHEN t.tipo IN ('gasto','transferencia') THEN t.monto ELSE 0 END)
         FROM finanzas_transacciones t WHERE t.cuenta_id = c.id
       ), 0) + c.saldo_inicial AS balance_actual
     FROM finanzas_cuentas c
     WHERE c.usuario_id = $1
     ORDER BY c.nombre`,
    [usuarioId]
  );
  return rows;
};

export const obtenerCuenta = async (id, usuarioId) => {
  const { rows } = await pool.query(
    `SELECT c.*,
       COALESCE((
         SELECT SUM(CASE WHEN t.tipo = 'ingreso' THEN t.monto ELSE 0 END)
                - SUM(CASE WHEN t.tipo IN ('gasto','transferencia') THEN t.monto ELSE 0 END)
         FROM finanzas_transacciones t WHERE t.cuenta_id = c.id
       ), 0) + c.saldo_inicial AS balance_actual
     FROM finanzas_cuentas c
     WHERE c.id = $1 AND c.usuario_id = $2`,
    [id, usuarioId]
  );
  return rows[0] || null;
};

export const crearCuenta = async (usuarioId, data) => {
  const { nombre, tipo, saldo_inicial, moneda } = data;
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0 || nombre.length > MAX_NOMBRE) {
    throw new AppError(`Nombre requerido (máx ${MAX_NOMBRE} caracteres)`, 400);
  }
  const { rows } = await pool.query(
    `INSERT INTO finanzas_cuentas (usuario_id, nombre, tipo, saldo_inicial, moneda)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [usuarioId, nombre, tipo, saldo_inicial || 0, moneda || 'BOB']
  );
  return rows[0];
};

export const actualizarCuenta = async (id, usuarioId, data) => {
  const campos = []; const valores = []; let i = 1;
  for (const key of ['nombre', 'tipo', 'saldo_inicial', 'moneda']) {
    if (data[key] !== undefined) {
      campos.push(`${key} = $${i++}`);
      valores.push(data[key]);
    }
  }
  if (campos.length === 0) return null;
  valores.push(id, usuarioId);
  const { rows } = await pool.query(
    `UPDATE finanzas_cuentas SET ${campos.join(', ')}, actualizado_en = CURRENT_TIMESTAMP
     WHERE id = $${i++} AND usuario_id = $${i} RETURNING *`,
    valores
  );
  return rows[0] || null;
};

export const eliminarCuenta = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM finanzas_cuentas WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return rowCount > 0;
};

// ─── TRANSACCIONES ──────────────────────────────────────────────

export const listarTransacciones = async (usuarioId, filtros = {}) => {
  const { categoria_id, cuenta_id, tipo, fecha_desde, fecha_hasta, limite, pagina } = filtros;
  const condiciones = ['t.usuario_id = $1'];
  const valores = [usuarioId];
  let i = 2;

  if (categoria_id) { condiciones.push(`t.categoria_id = $${i++}`); valores.push(categoria_id); }
  if (cuenta_id)    { condiciones.push(`t.cuenta_id = $${i++}`);    valores.push(cuenta_id); }
  if (tipo)         { condiciones.push(`t.tipo = $${i++}`);        valores.push(tipo); }
  if (fecha_desde)  { condiciones.push(`t.fecha >= $${i++}`);      valores.push(fecha_desde); }
  if (fecha_hasta)  { condiciones.push(`t.fecha <= $${i++}`);      valores.push(fecha_hasta); }

  const limit = Math.min(Math.max(parseInt(limite) || 50, 1), 200);
  const offset = ((parseInt(pagina) || 1) - 1) * limit;

  const { rows } = await pool.query(
    `SELECT t.*, c.nombre AS categoria_nombre, c.icono AS categoria_icono, c.color AS categoria_color,
            ct.nombre AS cuenta_nombre
     FROM finanzas_transacciones t
     LEFT JOIN finanzas_categorias c ON t.categoria_id = c.id
     LEFT JOIN finanzas_cuentas ct ON t.cuenta_id = ct.id
     WHERE ${condiciones.join(' AND ')}
     ORDER BY t.fecha DESC, t.creado_en DESC
     LIMIT $${i++} OFFSET $${i}`,
    [...valores, limit, offset]
  );

  const { rows: [{ count }] } = await pool.query(
    `SELECT COUNT(*) FROM finanzas_transacciones t WHERE ${condiciones.join(' AND ')}`,
    valores
  );

  return { data: rows, total: parseInt(count), pagina: parseInt(pagina) || 1, limite: limit };
};

export const crearTransaccion = async (usuarioId, data) => {
  const { categoria_id, cuenta_id, tipo, monto, descripcion, fecha, es_recurrente } = data;

  if (!tipo || !['ingreso', 'gasto', 'transferencia'].includes(tipo)) {
    throw new AppError('El tipo debe ser ingreso, gasto o transferencia', 400);
  }
  if (!monto || monto <= 0) {
    throw new AppError('El monto debe ser mayor a 0', 400);
  }
  if (descripcion && descripcion.length > MAX_DESCRIPCION) {
    throw new AppError(`Descripción no puede exceder ${MAX_DESCRIPCION} caracteres`, 400);
  }

  const { rows } = await pool.query(
    `INSERT INTO finanzas_transacciones (usuario_id, categoria_id, cuenta_id, tipo, monto, descripcion, fecha, es_recurrente)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [usuarioId, categoria_id || null, cuenta_id || null, tipo, monto, descripcion || null, fecha, es_recurrente || false]
  );
  return rows[0];
};

export const actualizarTransaccion = async (id, usuarioId, data) => {
  const campos = []; const valores = []; let i = 1;
  for (const key of ['categoria_id', 'cuenta_id', 'tipo', 'monto', 'descripcion', 'fecha', 'es_recurrente']) {
    if (data[key] !== undefined) {
      campos.push(`${key} = $${i++}`);
      valores.push(data[key]);
    }
  }
  if (campos.length === 0) return null;
  valores.push(id, usuarioId);
  const { rows } = await pool.query(
    `UPDATE finanzas_transacciones SET ${campos.join(', ')}, actualizado_en = CURRENT_TIMESTAMP
     WHERE id = $${i++} AND usuario_id = $${i} RETURNING *`,
    valores
  );
  return rows[0] || null;
};

export const eliminarTransaccion = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM finanzas_transacciones WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return rowCount > 0;
};

// ─── TRANSFERENCIAS ─────────────────────────────────────────────

export const crearTransferencia = async (usuarioId, data) => {
  const { cuenta_origen_id, cuenta_destino_id, monto, descripcion, fecha } = data;

  if (!cuenta_origen_id || !cuenta_destino_id) {
    throw new AppError('cuenta_origen_id y cuenta_destino_id son obligatorios', 400);
  }
  if (cuenta_origen_id === cuenta_destino_id) {
    throw new AppError('Las cuentas deben ser diferentes', 400);
  }
  if (!monto || monto <= 0) {
    throw new AppError('El monto debe ser mayor a 0', 400);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: salida } = await client.query(
      `INSERT INTO finanzas_transacciones (usuario_id, cuenta_id, tipo, monto, descripcion, fecha)
       VALUES ($1, $2, 'transferencia', $3, $4, $5) RETURNING *`,
      [usuarioId, cuenta_origen_id, monto, descripcion || `Transferencia a cuenta #${cuenta_destino_id}`, fecha || new Date()]
    );

    const { rows: entrada } = await client.query(
      `INSERT INTO finanzas_transacciones (usuario_id, cuenta_id, tipo, monto, descripcion, fecha)
       VALUES ($1, $2, 'ingreso', $3, $4, $5) RETURNING *`,
      [usuarioId, cuenta_destino_id, monto, descripcion || `Transferencia de cuenta #${cuenta_origen_id}`, fecha || new Date()]
    );

    await client.query('COMMIT');
    return { salida: salida[0], entrada: entrada[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ─── PRESUPUESTOS ─────────────────────────────────────────────

export const listarPresupuestos = async (usuarioId, mes, anio) => {
  const now = new Date();
  const m = parseInt(mes) || (now.getMonth() + 1);
  const a = parseInt(anio) || now.getFullYear();

  const sql = `SELECT p.*, c.nombre AS categoria_nombre, c.icono AS categoria_icono, c.color AS categoria_color,
                      COALESCE(g.gastado, 0) AS gastado
               FROM finanzas_presupuestos p
               JOIN finanzas_categorias c ON p.categoria_id = c.id
               LEFT JOIN (
                 SELECT categoria_id, SUM(monto) AS gastado
                 FROM finanzas_transacciones
                 WHERE usuario_id = $1 AND tipo = 'gasto'
                   AND EXTRACT(MONTH FROM fecha) = $2 AND EXTRACT(YEAR FROM fecha) = $3
                 GROUP BY categoria_id
               ) g ON p.categoria_id = g.categoria_id
               WHERE p.usuario_id = $1 AND p.mes = $2 AND p.anio = $3
               ORDER BY c.nombre`;

  const { rows } = await pool.query(sql, [usuarioId, m, a]);
  return rows;
};

export const crearPresupuesto = async (usuarioId, data) => {
  const { categoria_id, mes, anio, limite } = data;

  const existe = await pool.query(
    'SELECT id FROM finanzas_presupuestos WHERE usuario_id = $1 AND categoria_id = $2 AND mes = $3 AND anio = $4',
    [usuarioId, categoria_id, mes, anio]
  );
  if (existe.rows.length > 0) {
    throw new AppError('Ya existe un presupuesto para esta categoría en el período indicado', 409);
  }

  const { rows } = await pool.query(
    `INSERT INTO finanzas_presupuestos (usuario_id, categoria_id, mes, anio, limite)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [usuarioId, categoria_id, mes, anio, limite]
  );
  return rows[0];
};

export const actualizarPresupuesto = async (id, usuarioId, data) => {
  const campos = []; const valores = []; let i = 1;
  for (const key of ['categoria_id', 'mes', 'anio', 'limite']) {
    if (data[key] !== undefined) {
      campos.push(`${key} = $${i++}`);
      valores.push(data[key]);
    }
  }
  if (campos.length === 0) return null;
  valores.push(id, usuarioId);
  const { rows } = await pool.query(
    `UPDATE finanzas_presupuestos SET ${campos.join(', ')}, actualizado_en = CURRENT_TIMESTAMP
     WHERE id = $${i++} AND usuario_id = $${i} RETURNING *`,
    valores
  );
  return rows[0] || null;
};

export const eliminarPresupuesto = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM finanzas_presupuestos WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return rowCount > 0;
};

// ─── METAS ──────────────────────────────────────────────────────

export const listarMetas = async (usuarioId, estado) => {
  const valores = [usuarioId];
  let sql = 'SELECT * FROM finanzas_metas WHERE usuario_id = $1';
  if (estado) { sql += ' AND estado = $2'; valores.push(estado); }
  sql += ' ORDER BY creado_en DESC';
  const { rows } = await pool.query(sql, valores);
  return rows;
};

export const crearMeta = async (usuarioId, data) => {
  const { nombre, monto_objetivo, monto_actual, fecha_limite } = data;
  const { rows } = await pool.query(
    `INSERT INTO finanzas_metas (usuario_id, nombre, monto_objetivo, monto_actual, fecha_limite)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [usuarioId, nombre, monto_objetivo, monto_actual || 0, fecha_limite || null]
  );
  return rows[0];
};

export const actualizarMeta = async (id, usuarioId, data) => {
  const campos = []; const valores = []; let i = 1;
  for (const key of ['nombre', 'monto_objetivo', 'monto_actual', 'fecha_limite', 'estado']) {
    if (data[key] !== undefined) {
      campos.push(`${key} = $${i++}`);
      valores.push(data[key]);
    }
  }
  if (campos.length === 0) return null;
  valores.push(id, usuarioId);
  const { rows } = await pool.query(
    `UPDATE finanzas_metas SET ${campos.join(', ')}, actualizado_en = CURRENT_TIMESTAMP
     WHERE id = $${i++} AND usuario_id = $${i} RETURNING *`,
    valores
  );
  return rows[0] || null;
};

export const eliminarMeta = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM finanzas_metas WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return rowCount > 0;
};

export const eliminarTodasMetas = async (usuarioId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM finanzas_metas WHERE usuario_id = $1',
    [usuarioId]
  );
  return rowCount;
};

export const aportarMeta = async (id, usuarioId, monto) => {
  if (!monto || monto <= 0) {
    throw new AppError('El monto debe ser mayor a 0', 400);
  }

  const meta = await pool.query(
    'SELECT * FROM finanzas_metas WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  if (!meta.rows[0]) {
    throw new AppError('Meta no encontrada', 404);
  }

  const nuevoActual = parseFloat(meta.rows[0].monto_actual) + parseFloat(monto);
  const nuevoEstado = nuevoActual >= parseFloat(meta.rows[0].monto_objetivo) ? 'completada' : 'en_progreso';

  const { rows } = await pool.query(
    `UPDATE finanzas_metas SET monto_actual = $1, estado = $2, actualizado_en = CURRENT_TIMESTAMP
     WHERE id = $3 AND usuario_id = $4 RETURNING *`,
    [nuevoActual, nuevoEstado, id, usuarioId]
  );
  return rows[0];
};

// ─── DEUDAS ─────────────────────────────────────────────────────

export const listarDeudas = async (usuarioId, estado) => {
  const valores = [usuarioId];
  let sql = 'SELECT * FROM finanzas_deudas WHERE usuario_id = $1';
  if (estado) { sql += ' AND estado = $2'; valores.push(estado); }
  sql += ' ORDER BY creado_en DESC';
  const { rows } = await pool.query(sql, valores);
  return rows;
};

export const crearDeuda = async (usuarioId, data) => {
  const { nombre, monto_total, monto_pagado, cuota_mensual, tasa_interes, fecha_inicio, fecha_vencimiento, acreedor } = data;
  const { rows } = await pool.query(
    `INSERT INTO finanzas_deudas (usuario_id, nombre, monto_total, monto_pagado, cuota_mensual, tasa_interes, fecha_inicio, fecha_vencimiento, acreedor)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [usuarioId, nombre, monto_total, monto_pagado || 0, cuota_mensual || 0, tasa_interes || 0, fecha_inicio || null, fecha_vencimiento || null, acreedor || null]
  );
  return rows[0];
};

export const actualizarDeuda = async (id, usuarioId, data) => {
  const campos = []; const valores = []; let i = 1;
  for (const key of ['nombre', 'monto_total', 'monto_pagado', 'cuota_mensual', 'tasa_interes', 'fecha_inicio', 'fecha_vencimiento', 'acreedor', 'estado']) {
    if (data[key] !== undefined) {
      campos.push(`${key} = $${i++}`);
      valores.push(data[key]);
    }
  }
  if (campos.length === 0) return null;
  valores.push(id, usuarioId);
  const { rows } = await pool.query(
    `UPDATE finanzas_deudas SET ${campos.join(', ')}, actualizado_en = CURRENT_TIMESTAMP
     WHERE id = $${i++} AND usuario_id = $${i} RETURNING *`,
    valores
  );
  return rows[0] || null;
};

export const eliminarDeuda = async (id, usuarioId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM finanzas_deudas WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return rowCount > 0;
};

export const pagarDeuda = async (id, usuarioId, monto) => {
  if (!monto || monto <= 0) {
    throw new AppError('El monto debe ser mayor a 0', 400);
  }

  const deuda = await pool.query(
    'SELECT * FROM finanzas_deudas WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  if (!deuda.rows[0]) {
    throw new AppError('Deuda no encontrada', 404);
  }

  const nuevoPagado = parseFloat(deuda.rows[0].monto_pagado) + parseFloat(monto);
  let nuevoEstado = deuda.rows[0].estado;
  if (nuevoPagado >= parseFloat(deuda.rows[0].monto_total)) {
    nuevoEstado = 'completada';
  } else if (nuevoPagado > 0) {
    nuevoEstado = 'pagando';
  }

  const { rows } = await pool.query(
    `UPDATE finanzas_deudas SET monto_pagado = $1, estado = $2, actualizado_en = CURRENT_TIMESTAMP
     WHERE id = $3 AND usuario_id = $4 RETURNING *`,
    [nuevoPagado, nuevoEstado, id, usuarioId]
  );
  return rows[0];
};

// ─── RESUMEN ────────────────────────────────────────────────────

export const resumenMensual = async (usuarioId, mes, anio) => {
  const m = mes || new Date().getMonth() + 1;
  const a = anio || new Date().getFullYear();

  const { rows: totals } = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) AS total_ingresos,
       COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END), 0) AS total_gastos
     FROM finanzas_transacciones
     WHERE usuario_id = $1 AND EXTRACT(MONTH FROM fecha) = $2 AND EXTRACT(YEAR FROM fecha) = $3`,
    [usuarioId, m, a]
  );

  const { rows: porCategoria } = await pool.query(
    `SELECT t.categoria_id, c.nombre, c.icono, c.color, c.tipo, SUM(t.monto) AS total, COUNT(*) AS cantidad
     FROM finanzas_transacciones t
     LEFT JOIN finanzas_categorias c ON t.categoria_id = c.id
     WHERE t.usuario_id = $1 AND EXTRACT(MONTH FROM t.fecha) = $2 AND EXTRACT(YEAR FROM t.fecha) = $3
     GROUP BY t.categoria_id, c.nombre, c.icono, c.color, c.tipo
     ORDER BY total DESC`,
    [usuarioId, m, a]
  );

  const { rows: presupuestos } = await pool.query(
    `SELECT p.*, c.nombre AS categoria_nombre, c.icono AS categoria_icono,
            COALESCE(g.gastado, 0) AS gastado,
            CASE WHEN COALESCE(g.gastado, 0) > p.limite THEN 'excedido'
                 WHEN COALESCE(g.gastado, 0) >= p.limite * 0.8 THEN 'alerta'
                 ELSE 'ok' END AS estado_presupuesto
     FROM finanzas_presupuestos p
     JOIN finanzas_categorias c ON p.categoria_id = c.id
     LEFT JOIN (SELECT categoria_id, SUM(monto) AS gastado FROM finanzas_transacciones
                WHERE usuario_id = $1 AND tipo = 'gasto'
                  AND EXTRACT(MONTH FROM fecha) = $2 AND EXTRACT(YEAR FROM fecha) = $3
                GROUP BY categoria_id) g ON p.categoria_id = g.categoria_id
     WHERE p.usuario_id = $1 AND p.mes = $2 AND p.anio = $3`,
    [usuarioId, m, a]
  );

  return {
    mes: m,
    anio: a,
    total_ingresos: parseFloat(totals.total_ingresos),
    total_gastos: parseFloat(totals.total_gastos),
    balance: parseFloat(totals.total_ingresos) - parseFloat(totals.total_gastos),
    por_categoria: porCategoria,
    presupuestos,
  };
};

export const generarReporte = async (usuarioId) => {
  const [dashboardData, transacciones, presupuestos] = await Promise.all([
    dashboard(usuarioId),
    listarTransacciones(usuarioId, { limite: 100 }),
    listarPresupuestos(usuarioId),
  ]);

  return {
    generado_en: new Date().toISOString(),
    resumen: dashboardData,
    transacciones_recientes: transacciones.data?.slice(0, 50) || [],
    presupuestos,
  };
};

export const dashboard = async (usuarioId) => {
  const hoy = new Date();
  const mActual = hoy.getMonth() + 1;
  const aActual = hoy.getFullYear();
  const mesPasado = mActual === 1 ? 12 : mActual - 1;
  const anioPasado = mActual === 1 ? aActual - 1 : aActual;

  const [resumenMes, resumenAnterior, cuentas, metas, deudas] = await Promise.all([
    resumenMensual(usuarioId, mActual, aActual),
    resumenMensual(usuarioId, mesPasado, anioPasado),
    listarCuentas(usuarioId),
    listarMetas(usuarioId),
    listarDeudas(usuarioId),
  ]);

  const totalActivos = cuentas.reduce((s, c) => s + parseFloat(c.balance_actual || 0), 0);
  const totalDeudas = deudas.reduce((s, d) => s + (parseFloat(d.monto_total) - parseFloat(d.monto_pagado)), 0);
  const patrimonio = totalActivos - totalDeudas;

  const variacionIngresos = resumenAnterior.total_ingresos > 0
    ? ((resumenMes.total_ingresos - resumenAnterior.total_ingresos) / resumenAnterior.total_ingresos) * 100
    : 0;
  const variacionGastos = resumenAnterior.total_gastos > 0
    ? ((resumenMes.total_gastos - resumenAnterior.total_gastos) / resumenAnterior.total_gastos) * 100
    : 0;

  return {
    mes_actual: resumenMes,
    mes_anterior: { mes: mesPasado, anio: anioPasado, ...resumenAnterior },
    cuentas: { total: cuentas.length, saldo_total: totalActivos },
    metas: {
      total: metas.length,
      completadas: metas.filter(m => m.estado === 'completada').length,
      en_progreso: metas.filter(m => m.estado === 'en_progreso').length,
    },
    deudas: {
      total: deudas.length,
      pendientes: deudas.filter(d => d.estado !== 'completada').length,
      saldo_restante: totalDeudas,
    },
    patrimonio,
    variacion_ingresos: parseFloat(variacionIngresos.toFixed(1)),
    variacion_gastos: parseFloat(variacionGastos.toFixed(1)),
  };
};
