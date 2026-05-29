import { manejarError } from '../../utils/error.handler.js';
import * as habitosService from './habitos.service.js';

export const crearHabito = async (req, res) => {
  try {
    const data = await habitosService.crearHabito(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const listarHabitos = async (req, res) => {
  try {
    const { limite, pagina } = req.query;
    const result = await habitosService.listarHabitos(req.usuario.id, limite, pagina);
    res.json({ ok: true, data: result.data, total: result.total });
  } catch (err) { manejarError(res, err); }
};

export const actualizarHabito = async (req, res) => {
  try {
    const data = await habitosService.actualizarHabito(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ ok: false, error: 'Hábito no encontrado' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarHabito = async (req, res) => {
  try {
    const ok = await habitosService.eliminarHabito(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ ok: false, error: 'Hábito no encontrado' });
    res.json({ ok: true, mensaje: 'Hábito eliminado' });
  } catch (err) { manejarError(res, err); }
};

export const eliminarTodos = async (req, res) => {
  try {
    const count = await habitosService.eliminarTodos(req.usuario.id);
    res.json({ ok: true, mensaje: `${count} hábitos eliminados` });
  } catch (err) { manejarError(res, err); }
};

export const cambiarEstado = async (req, res) => {
  try {
    const habito = await habitosService.cambiarEstadoHabito(
      req.params.id,
      req.usuario.id,
      req.body.estado
    );
    if (!habito) return res.status(404).json({ ok: false, error: 'Hábito no encontrado' });
    res.json({ ok: true, data: habito });
  } catch (error) { manejarError(res, error); }
};
