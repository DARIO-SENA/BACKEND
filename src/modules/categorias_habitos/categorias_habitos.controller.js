import { manejarError } from '../../utils/error.handler.js';
import * as categoriasService from './categorias_habitos.service.js';

export const listarCategorias = async (req, res) => {
  try {
    const data = await categoriasService.listarCategorias(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const crearCategoria = async (req, res) => {
  try {
    const data = await categoriasService.crearCategoria(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const actualizarCategoria = async (req, res) => {
  try {
    const data = await categoriasService.actualizarCategoria(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarCategoria = async (req, res) => {
  try {
    const ok = await categoriasService.eliminarCategoria(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    res.json({ ok: true, mensaje: 'Categoría eliminada' });
  } catch (err) { manejarError(res, err); }
};
