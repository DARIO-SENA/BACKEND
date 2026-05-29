import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as ctrl from './finanzas.controller.js';

const router = Router();
router.use(verificarToken);

// ─── CATEGORIAS ─────────────────────────────────────────────────
router.get('/categorias',        ctrl.listarCategorias);
router.post('/categorias',       ctrl.crearCategoria);
router.put('/categorias/:id',    ctrl.actualizarCategoria);
router.delete('/categorias/:id', ctrl.eliminarCategoria);

// ─── CUENTAS ────────────────────────────────────────────────────
router.get('/cuentas',           ctrl.listarCuentas);
router.get('/cuentas/:id',       ctrl.obtenerCuenta);
router.post('/cuentas',          ctrl.crearCuenta);
router.put('/cuentas/:id',       ctrl.actualizarCuenta);
router.delete('/cuentas/:id',    ctrl.eliminarCuenta);

// ─── TRANSACCIONES ──────────────────────────────────────────────
router.get('/transacciones',     ctrl.listarTransacciones);
router.post('/transacciones',    ctrl.crearTransaccion);
router.put('/transacciones/:id', ctrl.actualizarTransaccion);
router.delete('/transacciones/:id', ctrl.eliminarTransaccion);

// ─── TRANSFERENCIAS ─────────────────────────────────────────────
router.post('/transferencias',   ctrl.crearTransferencia);

// ─── PRESUPUESTOS ───────────────────────────────────────────────
router.get('/presupuestos',      ctrl.listarPresupuestos);
router.post('/presupuestos',     ctrl.crearPresupuesto);
router.put('/presupuestos/:id',  ctrl.actualizarPresupuesto);
router.delete('/presupuestos/:id', ctrl.eliminarPresupuesto);

// ─── METAS ──────────────────────────────────────────────────────
router.get('/metas',             ctrl.listarMetas);
router.post('/metas',            ctrl.crearMeta);
router.delete('/metas',           ctrl.eliminarTodasMetas);
router.put('/metas/:id',         ctrl.actualizarMeta);
router.delete('/metas/:id',      ctrl.eliminarMeta);
router.post('/metas/:id/aportar', ctrl.aportarMeta);

// ─── DEUDAS ─────────────────────────────────────────────────────
router.get('/deudas',            ctrl.listarDeudas);
router.post('/deudas',           ctrl.crearDeuda);
router.put('/deudas/:id',        ctrl.actualizarDeuda);
router.delete('/deudas/:id',     ctrl.eliminarDeuda);
router.post('/deudas/:id/pagar',  ctrl.pagarDeuda);

// ─── RESUMEN ────────────────────────────────────────────────────
router.get('/resumen/mensual',   ctrl.resumenMensual);
router.get('/dashboard',         ctrl.dashboard);

export { router as finanzasRouter };
