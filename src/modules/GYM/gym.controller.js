// modulos/GYM/controller/gym.controller.js
import * as gymService from './gym.service.js';

// ─────────────────────────────────────────
// RUTINAS
// ─────────────────────────────────────────

// POST /api/gym/rutinas
export const crearRutina = async (req, res) => {
  try {
    const data = await gymService.crearRutina(req.usuario.id, req.body);
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/gym/rutinas
export const listarRutinas = async (req, res) => {
  try {
    const data = await gymService.listarRutinas(req.usuario.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/gym/rutinas/:id
export const obtenerRutina = async (req, res) => {
  try {
    const data = await gymService.obtenerRutina(req.params.id, req.usuario.id);
    if (!data) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/gym/rutinas/:id
export const actualizarRutina = async (req, res) => {
  try {
    const data = await gymService.actualizarRutina(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/gym/rutinas/:id
export const eliminarRutina = async (req, res) => {
  try {
    const ok = await gymService.eliminarRutina(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ error: 'Rutina no encontrada' });
    res.json({ message: 'Rutina eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────
// EJERCICIOS
// ─────────────────────────────────────────

// POST /api/gym/ejercicios
export const crearEjercicio = async (req, res) => {
  try {
    const data = await gymService.crearEjercicio(req.usuario.id, req.body);
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
};

// GET /api/gym/ejercicios/:rutinaId
export const listarEjercicios = async (req, res) => {
  try {
    const data = await gymService.listarEjercicios(req.params.rutinaId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/gym/ejercicios/:id
export const eliminarEjercicio = async (req, res) => {
  try {
    const ok = await gymService.eliminarEjercicio(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ error: 'Ejercicio no encontrado' });
    res.json({ message: 'Ejercicio eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/gym/ejercicios/:id
export const actualizarEjercicio = async (req, res) => {
  try {
    const data = await gymService.actualizarEjercicio(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ error: 'Ejercicio no encontrado' });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────
// REGISTROS DE ENTRENAMIENTO
// ─────────────────────────────────────────

// POST /api/gym/registros
export const registrarEntrenamiento = async (req, res) => {
  try {
    const data = await gymService.registrarEntrenamiento(req.usuario.id, req.body);
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/gym/historial
export const listarHistorial = async (req, res) => {
  try {
    const data = await gymService.listarHistorial(req.usuario.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────
// PROGRESIÓN
// ─────────────────────────────────────────

// GET /api/gym/progresion/:ejercicioId
export const verProgresion = async (req, res) => {
  try {
    const data = await gymService.verProgresion(req.usuario.id, req.params.ejercicioId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 📊 Estadísticas
export const obtenerEstadisticas = async (req, res) => {
  try {
    const data = await gymService.obtenerEstadisticas(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('obtenerEstadisticas:', err.message);
    res.status(500).json({ ok: false, error: 'Error al obtener estadísticas' });
  }
};

// 💡 Sugerencia de peso
export const sugerirPeso = async (req, res) => {
  try {
    const data = await gymService.sugerirPeso(req.usuario.id, req.params.ejercicioId);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('sugerirPeso:', err.message);
    res.status(500).json({ ok: false, error: 'Error al sugerir peso' });
  }
};