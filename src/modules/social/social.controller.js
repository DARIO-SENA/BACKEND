import * as socialService from './social.service.js';

// ─────────────────────────────────────────
// AMISTADES
// ─────────────────────────────────────────

export const enviarSolicitud = async (req, res) => {
  try {
    const data = await socialService.enviarSolicitud(req.usuario.id, req.body.receptor_id);
    res.status(201).json({ ok: true, data });
  } catch (err) {
    console.error('enviarSolicitud:', err.message);
    res.status(400).json({ ok: false, error: err.message });
  }
};

export const responderSolicitud = async (req, res) => {
  try {
    const data = await socialService.responderSolicitud(
      req.params.id, req.usuario.id, req.body.estado
    );
    if (!data) return res.status(404).json({ ok: false, error: 'Solicitud no encontrada' });
    res.json({ ok: true, data });
  } catch (err) {
    console.error('responderSolicitud:', err.message);
    res.status(400).json({ ok: false, error: err.message });
  }
};

export const listarAmigos = async (req, res) => {
  try {
    const data = await socialService.listarAmigos(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('listarAmigos:', err.message);
    res.status(500).json({ ok: false, error: 'Error al listar amigos' });
  }
};

export const listarSolicitudesPendientes = async (req, res) => {
  try {
    const data = await socialService.listarSolicitudesPendientes(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('listarSolicitudesPendientes:', err.message);
    res.status(500).json({ ok: false, error: 'Error al listar solicitudes' });
  }
};

export const eliminarAmigo = async (req, res) => {
  try {
    const ok = await socialService.eliminarAmigo(req.usuario.id, req.params.amigoId);
    if (!ok) return res.status(404).json({ ok: false, error: 'Amistad no encontrada' });
    res.json({ ok: true, message: 'Amigo eliminado correctamente' });
  } catch (err) {
    console.error('eliminarAmigo:', err.message);
    res.status(500).json({ ok: false, error: 'Error al eliminar amigo' });
  }
};

// ─────────────────────────────────────────
// PROYECTOS
// ─────────────────────────────────────────

export const crearProyecto = async (req, res) => {
  try {
    const data = await socialService.crearProyecto(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) {
    console.error('crearProyecto:', err.message);
    res.status(400).json({ ok: false, error: err.message });
  }
};

export const listarProyectos = async (req, res) => {
  try {
    const data = await socialService.listarProyectos(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('listarProyectos:', err.message);
    res.status(500).json({ ok: false, error: 'Error al listar proyectos' });
  }
};

export const obtenerProyecto = async (req, res) => {
  try {
    const data = await socialService.obtenerProyecto(req.params.id, req.usuario.id);
    if (!data) return res.status(404).json({ ok: false, error: 'Proyecto no encontrado' });
    res.json({ ok: true, data });
  } catch (err) {
    console.error('obtenerProyecto:', err.message);
    res.status(500).json({ ok: false, error: 'Error al obtener proyecto' });
  }
};

export const agregarMiembro = async (req, res) => {
  try {
    const data = await socialService.agregarMiembro(
      req.params.id, req.usuario.id, req.body.usuario_id, req.body.rol
    );
    res.status(201).json({ ok: true, data });
  } catch (err) {
    console.error('agregarMiembro:', err.message);
    res.status(400).json({ ok: false, error: err.message });
  }
};

export const eliminarMiembro = async (req, res) => {
  try {
    const ok = await socialService.eliminarMiembro(
      req.params.id, req.usuario.id, req.params.usuarioId
    );
    if (!ok) return res.status(404).json({ ok: false, error: 'Miembro no encontrado' });
    res.json({ ok: true, message: 'Miembro eliminado correctamente' });
  } catch (err) {
    console.error('eliminarMiembro:', err.message);
    res.status(400).json({ ok: false, error: err.message });
  }
};

// ─────────────────────────────────────────
// TAREAS COMPARTIDAS
// ─────────────────────────────────────────

export const crearTareaCompartida = async (req, res) => {
  try {
    const data = await socialService.crearTareaCompartida(
      req.usuario.id, req.params.proyectoId, req.body
    );
    res.status(201).json({ ok: true, data });
  } catch (err) {
    console.error('crearTareaCompartida:', err.message);
    res.status(400).json({ ok: false, error: err.message });
  }
};

export const listarTareasCompartidas = async (req, res) => {
  try {
    const data = await socialService.listarTareasCompartidas(
      req.params.proyectoId, req.usuario.id
    );
    res.json({ ok: true, data });
  } catch (err) {
    console.error('listarTareasCompartidas:', err.message);
    res.status(500).json({ ok: false, error: 'Error al listar tareas' });
  }
};

export const actualizarTareaCompartida = async (req, res) => {
  try {
    const data = await socialService.actualizarTareaCompartida(
      req.params.tareaId, req.usuario.id, req.body
    );
    if (!data) return res.status(404).json({ ok: false, error: 'Tarea no encontrada' });
    res.json({ ok: true, data });
  } catch (err) {
    console.error('actualizarTareaCompartida:', err.message);
    res.status(400).json({ ok: false, error: err.message });
  }
};

// ─────────────────────────────────────────
// COMENTARIOS
// ─────────────────────────────────────────

export const agregarComentario = async (req, res) => {
  try {
    const data = await socialService.agregarComentario(
      req.params.tareaId, req.usuario.id, req.body.contenido
    );
    res.status(201).json({ ok: true, data });
  } catch (err) {
    console.error('agregarComentario:', err.message);
    res.status(400).json({ ok: false, error: err.message });
  }
};

export const listarComentarios = async (req, res) => {
  try {
    const data = await socialService.listarComentarios(req.params.tareaId);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('listarComentarios:', err.message);
    res.status(500).json({ ok: false, error: 'Error al listar comentarios' });
  }
};

export const eliminarComentario = async (req, res) => {
  try {
    const ok = await socialService.eliminarComentario(
      req.params.comentarioId, req.usuario.id
    );
    if (!ok) return res.status(404).json({ ok: false, error: 'Comentario no encontrado' });
    res.json({ ok: true, message: 'Comentario eliminado correctamente' });
  } catch (err) {
    console.error('eliminarComentario:', err.message);
    res.status(500).json({ ok: false, error: 'Error al eliminar comentario' });
  }
};