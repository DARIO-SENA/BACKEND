import { manejarError } from '../../utils/error.handler.js';
import * as service from './lectura.service.js';

export const initTables = async (req, res) => {
  try {
    await service.initLecturaTables();
    res.json({ ok: true, mensaje: 'Tablas de lectura inicializadas' });
  } catch (err) { manejarError(res, err); }
};

export const listarLibros = async (req, res) => {
  try {
    const libros = await service.obtenerLibros(req.usuario.id, req.query);
    res.json({ ok: true, data: libros });
  } catch (err) { manejarError(res, err); }
};

export const detallePlan = async (req, res) => {
  try {
    const detalle = await service.obtenerPlanDetalle(req.params.id, req.usuario.id);
    if (!detalle) return res.status(404).json({ ok: false, error: 'Plan no encontrado' });
    res.json({ ok: true, data: detalle });
  } catch (err) { manejarError(res, err); }
};

export const obtenerLibro = async (req, res) => {
  try {
    const libro = await service.obtenerLibro(req.params.id, req.usuario.id);
    if (!libro) return res.status(404).json({ ok: false, error: 'Libro no encontrado' });
    res.json({ ok: true, data: libro });
  } catch (err) { manejarError(res, err); }
};

export const crearLibro = async (req, res) => {
  try {
    const libro = await service.crearLibro(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data: libro });
  } catch (err) { manejarError(res, err); }
};

export const actualizarLibro = async (req, res) => {
  try {
    const libro = await service.actualizarLibro(req.params.id, req.usuario.id, req.body);
    if (!libro) return res.status(404).json({ ok: false, error: 'Libro no encontrado' });
    res.json({ ok: true, data: libro });
  } catch (err) { manejarError(res, err); }
};

export const eliminarLibro = async (req, res) => {
  try {
    await service.eliminarLibro(req.params.id, req.usuario.id);
    res.json({ ok: true });
  } catch (err) { manejarError(res, err); }
};

export const listarRegistros = async (req, res) => {
  try {
    const registros = await service.obtenerRegistros(req.params.libroId, req.usuario.id);
    res.json({ ok: true, data: registros });
  } catch (err) { manejarError(res, err); }
};

export const crearRegistro = async (req, res) => {
  try {
    const registro = await service.crearRegistro(req.usuario.id, { ...req.body, libro_id: req.params.libroId });
    res.status(201).json({ ok: true, data: registro });
  } catch (err) { manejarError(res, err); }
};

export const eliminarRegistro = async (req, res) => {
  try {
    await service.eliminarRegistro(req.params.id, req.params.libroId, req.usuario.id);
    res.json({ ok: true });
  } catch (err) { manejarError(res, err); }
};

export const toggleDia = async (req, res) => {
  try {
    const result = await service.toggleDiaLectura(req.usuario.id, req.body);
    res.json({ ok: true, data: result });
  } catch (err) { manejarError(res, err); }
};

export const listarPlanes = async (req, res) => {
  try {
    const planes = await service.obtenerPlanes(req.usuario.id);
    res.json({ ok: true, data: planes });
  } catch (err) { manejarError(res, err); }
};

export const crearPlan = async (req, res) => {
  try {
    const plan = await service.crearPlan(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data: plan });
  } catch (err) { manejarError(res, err); }
};

export const actualizarPlan = async (req, res) => {
  try {
    const plan = await service.actualizarPlan(req.params.id, req.usuario.id, req.body);
    if (!plan) return res.status(404).json({ ok: false, error: 'Plan no encontrado' });
    res.json({ ok: true, data: plan });
  } catch (err) { manejarError(res, err); }
};

export const eliminarPlan = async (req, res) => {
  try {
    await service.eliminarPlan(req.params.id, req.usuario.id);
    res.json({ ok: true });
  } catch (err) { manejarError(res, err); }
};

export const dashboard = async (req, res) => {
  try {
    const data = await service.obtenerDashboard(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};
