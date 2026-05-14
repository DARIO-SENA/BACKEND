import { manejarError } from '../../utils/error.handler.js';
import * as service from './finanzas.service.js';

// ─── CATEGORIAS ─────────────────────────────────────────────────

export const listarCategorias = async (req, res) => {
  try {
    const data = await service.listarCategorias(req.usuario.id, req.query.tipo);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const crearCategoria = async (req, res) => {
  try {
    const data = await service.crearCategoria(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const actualizarCategoria = async (req, res) => {
  try {
    const data = await service.actualizarCategoria(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarCategoria = async (req, res) => {
  try {
    const ok = await service.eliminarCategoria(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    res.json({ ok: true, mensaje: 'Categoría eliminada' });
  } catch (err) { manejarError(res, err); }
};

// ─── CUENTAS ────────────────────────────────────────────────────

export const listarCuentas = async (req, res) => {
  try {
    const data = await service.listarCuentas(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const obtenerCuenta = async (req, res) => {
  try {
    const data = await service.obtenerCuenta(req.params.id, req.usuario.id);
    if (!data) return res.status(404).json({ ok: false, error: 'Cuenta no encontrada' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const crearCuenta = async (req, res) => {
  try {
    const data = await service.crearCuenta(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const actualizarCuenta = async (req, res) => {
  try {
    const data = await service.actualizarCuenta(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ ok: false, error: 'Cuenta no encontrada' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarCuenta = async (req, res) => {
  try {
    const ok = await service.eliminarCuenta(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ ok: false, error: 'Cuenta no encontrada' });
    res.json({ ok: true, mensaje: 'Cuenta eliminada' });
  } catch (err) { manejarError(res, err); }
};

// ─── TRANSACCIONES ──────────────────────────────────────────────

export const listarTransacciones = async (req, res) => {
  try {
    const data = await service.listarTransacciones(req.usuario.id, req.query);
    res.json({ ok: true, ...data });
  } catch (err) { manejarError(res, err); }
};

export const crearTransaccion = async (req, res) => {
  try {
    const data = await service.crearTransaccion(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const actualizarTransaccion = async (req, res) => {
  try {
    const data = await service.actualizarTransaccion(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ ok: false, error: 'Transacción no encontrada' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarTransaccion = async (req, res) => {
  try {
    const ok = await service.eliminarTransaccion(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ ok: false, error: 'Transacción no encontrada' });
    res.json({ ok: true, mensaje: 'Transacción eliminada' });
  } catch (err) { manejarError(res, err); }
};

// ─── TRANSFERENCIAS ─────────────────────────────────────────────

export const crearTransferencia = async (req, res) => {
  try {
    const data = await service.crearTransferencia(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

// ─── PRESUPUESTOS ───────────────────────────────────────────────

export const listarPresupuestos = async (req, res) => {
  try {
    const data = await service.listarPresupuestos(req.usuario.id, req.query.mes, req.query.anio);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const crearPresupuesto = async (req, res) => {
  try {
    const data = await service.crearPresupuesto(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const actualizarPresupuesto = async (req, res) => {
  try {
    const data = await service.actualizarPresupuesto(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ ok: false, error: 'Presupuesto no encontrado' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarPresupuesto = async (req, res) => {
  try {
    const ok = await service.eliminarPresupuesto(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ ok: false, error: 'Presupuesto no encontrado' });
    res.json({ ok: true, mensaje: 'Presupuesto eliminado' });
  } catch (err) { manejarError(res, err); }
};

// ─── METAS ──────────────────────────────────────────────────────

export const listarMetas = async (req, res) => {
  try {
    const data = await service.listarMetas(req.usuario.id, req.query.estado);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const crearMeta = async (req, res) => {
  try {
    const data = await service.crearMeta(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const actualizarMeta = async (req, res) => {
  try {
    const data = await service.actualizarMeta(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ ok: false, error: 'Meta no encontrada' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarMeta = async (req, res) => {
  try {
    const ok = await service.eliminarMeta(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ ok: false, error: 'Meta no encontrada' });
    res.json({ ok: true, mensaje: 'Meta eliminada' });
  } catch (err) { manejarError(res, err); }
};

export const aportarMeta = async (req, res) => {
  try {
    const data = await service.aportarMeta(req.params.id, req.usuario.id, req.body.monto);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

// ─── DEUDAS ─────────────────────────────────────────────────────

export const listarDeudas = async (req, res) => {
  try {
    const data = await service.listarDeudas(req.usuario.id, req.query.estado);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const crearDeuda = async (req, res) => {
  try {
    const data = await service.crearDeuda(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const actualizarDeuda = async (req, res) => {
  try {
    const data = await service.actualizarDeuda(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ ok: false, error: 'Deuda no encontrada' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarDeuda = async (req, res) => {
  try {
    const ok = await service.eliminarDeuda(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ ok: false, error: 'Deuda no encontrada' });
    res.json({ ok: true, mensaje: 'Deuda eliminada' });
  } catch (err) { manejarError(res, err); }
};

export const pagarDeuda = async (req, res) => {
  try {
    const data = await service.pagarDeuda(req.params.id, req.usuario.id, req.body.monto);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

// ─── RESUMEN ────────────────────────────────────────────────────

export const resumenMensual = async (req, res) => {
  try {
    const data = await service.resumenMensual(req.usuario.id, req.query.mes, req.query.anio);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const dashboard = async (req, res) => {
  try {
    const data = await service.dashboard(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};
