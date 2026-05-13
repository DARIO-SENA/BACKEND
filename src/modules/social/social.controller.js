import { manejarError } from '../../utils/error.handler.js';
import * as socialService from './social.service.js';

const validarId = (id) => {
  const n = parseInt(id, 10);
  if (isNaN(n) || n < 1) throw new Error('ID inválido');
  return n;
};

export const enviarSolicitud = async (req, res) => {
  try {
    validarId(req.body.receptor_id);
    const data = await socialService.enviarSolicitud(req.usuario.id, req.body.receptor_id);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const responderSolicitud = async (req, res) => {
  try {
    const data = await socialService.responderSolicitud(
      validarId(req.params.id), req.usuario.id, req.body.estado
    );
    if (!data) return res.status(404).json({ ok: false, error: 'Solicitud no encontrada' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const listarAmigos = async (req, res) => {
  try {
    const data = await socialService.listarAmigos(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const listarSolicitudesPendientes = async (req, res) => {
  try {
    const data = await socialService.listarSolicitudesPendientes(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarAmigo = async (req, res) => {
  try {
    const ok = await socialService.eliminarAmigo(req.usuario.id, validarId(req.params.amigoId));
    if (!ok) return res.status(404).json({ ok: false, error: 'Amistad no encontrada' });
    res.json({ ok: true, mensaje: 'Amigo eliminado correctamente' });
  } catch (err) { manejarError(res, err); }
};

export const crearProyecto = async (req, res) => {
  try {
    const data = await socialService.crearProyecto(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const listarProyectos = async (req, res) => {
  try {
    const data = await socialService.listarProyectos(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const obtenerProyecto = async (req, res) => {
  try {
    const data = await socialService.obtenerProyecto(validarId(req.params.id), req.usuario.id);
    if (!data) return res.status(404).json({ ok: false, error: 'Proyecto no encontrado' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const agregarMiembro = async (req, res) => {
  try {
    validarId(req.body.usuario_id);
    const data = await socialService.agregarMiembro(
      validarId(req.params.id), req.usuario.id, req.body.usuario_id, req.body.rol
    );
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarMiembro = async (req, res) => {
  try {
    const ok = await socialService.eliminarMiembro(
      validarId(req.params.id), req.usuario.id, validarId(req.params.usuarioId)
    );
    if (!ok) return res.status(404).json({ ok: false, error: 'Miembro no encontrado' });
    res.json({ ok: true, mensaje: 'Miembro eliminado correctamente' });
  } catch (err) { manejarError(res, err); }
};

export const crearTareaCompartida = async (req, res) => {
  try {
    const data = await socialService.crearTareaCompartida(
      req.usuario.id, validarId(req.params.proyectoId), req.body
    );
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const listarTareasCompartidas = async (req, res) => {
  try {
    const data = await socialService.listarTareasCompartidas(
      validarId(req.params.proyectoId), req.usuario.id
    );
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const actualizarTareaCompartida = async (req, res) => {
  try {
    const data = await socialService.actualizarTareaCompartida(
      validarId(req.params.tareaId), req.usuario.id, req.body
    );
    if (!data) return res.status(404).json({ ok: false, error: 'Tarea no encontrada' });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const agregarComentario = async (req, res) => {
  try {
    const data = await socialService.agregarComentario(
      validarId(req.params.tareaId), req.usuario.id, req.body.contenido
    );
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const listarComentarios = async (req, res) => {
  try {
    const data = await socialService.listarComentarios(validarId(req.params.tareaId));
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const eliminarComentario = async (req, res) => {
  try {
    const ok = await socialService.eliminarComentario(
      validarId(req.params.comentarioId), req.usuario.id
    );
    if (!ok) return res.status(404).json({ ok: false, error: 'Comentario no encontrado' });
    res.json({ ok: true, mensaje: 'Comentario eliminado correctamente' });
  } catch (err) { manejarError(res, err); }
};
