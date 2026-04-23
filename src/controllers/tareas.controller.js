import * as tareasService from '../services/tareas.service.js';

// 🧠 Helper para manejar errores correctamente
const manejarError = (res, error) => {
  console.error(error);

  if (
    error.message.includes('obligatorio') ||
    error.message.includes('inválido') ||
    error.message.includes('No hay campos')
  ) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(500).json({ error: 'Error interno del servidor' });
};

// 📋 Obtener tareas con filtros
export const obtenerTareas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const filtros = req.query;

    const tareas = await tareasService.obtenerTareas(usuarioId, filtros);

    res.json(tareas);
  } catch (error) {
    manejarError(res, error);
  }
};

// 🔍 Obtener tarea por ID
export const obtenerTareaPorId = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;

    const tarea = await tareasService.obtenerTareaPorId(id, usuarioId);

    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json(tarea);
  } catch (error) {
    manejarError(res, error);
  }
};

// ➕ Crear tarea
export const crearTarea = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const tarea = await tareasService.crearTarea(usuarioId, req.body);

    res.status(201).json(tarea);
  } catch (error) {
    manejarError(res, error);
  }
};

// ⚙️ Crear + programar automáticamente
export const crearYProgramar = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const tarea = await tareasService.crearTarea(usuarioId, req.body);
    const tareaFinal = await tareasService.programarYObtener(usuarioId, tarea);

    res.status(201).json(tareaFinal);
  } catch (error) {
    manejarError(res, error);
  }
};

// ✏️ Actualizar tarea
export const actualizarTarea = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;

    const tarea = await tareasService.actualizarTarea(id, usuarioId, req.body);

    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada o sin cambios' });
    }

    res.json(tarea);
  } catch (error) {
    manejarError(res, error);
  }
};

// 🗑️ Eliminar tarea
export const eliminarTarea = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;

    const eliminada = await tareasService.eliminarTarea(id, usuarioId);

    if (!eliminada) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json({ mensaje: 'Tarea eliminada correctamente' });
  } catch (error) {
    manejarError(res, error);
  }
};

// 🔄 Cambiar estado
export const cambiarEstado = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;
    const { estado } = req.body;

    const tarea = await tareasService.cambiarEstado(id, usuarioId, estado);

    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json(tarea);
  } catch (error) {
    manejarError(res, error);
  }
};

// 📅 Agenda por día
export const obtenerAgendaDia = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ error: 'Fecha requerida' });
    }

    const agenda = await tareasService.obtenerAgendaDia(usuarioId, fecha);

    res.json(agenda);
  } catch (error) {
    manejarError(res, error);
  }
};

// 📊 Estadísticas
export const obtenerEstadisticas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const stats = await tareasService.obtenerEstadisticas(usuarioId);

    res.json(stats);
  } catch (error) {
    manejarError(res, error);
  }
};

// 🏷️ Categorías

export const obtenerCategorias = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const categorias = await tareasService.obtenerCategorias(usuarioId);

    res.json(categorias);
  } catch (error) {
    manejarError(res, error);
  }
};

export const crearCategoria = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { nombre, color } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'Nombre requerido' });
    }

    const categoria = await tareasService.crearCategoria(usuarioId, nombre, color);

    res.status(201).json(categoria);
  } catch (error) {
    manejarError(res, error);
  }
};

export const eliminarCategoria = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { id } = req.params;

    const eliminada = await tareasService.eliminarCategoria(id, usuarioId);

    if (!eliminada) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) {
    manejarError(res, error);
  }
};
