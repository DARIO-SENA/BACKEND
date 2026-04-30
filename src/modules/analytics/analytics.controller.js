import * as analyticsService from './analytics.service.js';

// 📊 Dashboard principal
export const obtenerDashboard = async (req, res) => {
  try {
    const data = await analyticsService.obtenerDashboard(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('obtenerDashboard:', err.message);
    res.status(500).json({ ok: false, error: 'Error al obtener dashboard' });
  }
};

// 📈 Productividad semanal
export const obtenerProductividadSemanal = async (req, res) => {
  try {
    const data = await analyticsService.obtenerProductividadSemanal(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('obtenerProductividadSemanal:', err.message);
    res.status(500).json({ ok: false, error: 'Error al obtener productividad semanal' });
  }
};

// 📅 Productividad por día
export const obtenerProductividadPorDia = async (req, res) => {
  try {
    const data = await analyticsService.obtenerProductividadPorDia(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('obtenerProductividadPorDia:', err.message);
    res.status(500).json({ ok: false, error: 'Error al obtener productividad por día' });
  }
};

// 🏷️ Tareas por categoría
export const obtenerTareasPorCategoria = async (req, res) => {
  try {
    const data = await analyticsService.obtenerTareasPorCategoria(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('obtenerTareasPorCategoria:', err.message);
    res.status(500).json({ ok: false, error: 'Error al obtener tareas por categoría' });
  }
};

// 🔥 Racha actual
export const obtenerRacha = async (req, res) => {
  try {
    const data = await analyticsService.obtenerRacha(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('obtenerRacha:', err.message);
    res.status(500).json({ ok: false, error: 'Error al obtener racha' });
  }
};

// 💾 Guardar progreso
export const guardarProgreso = async (req, res) => {
  try {
    const { tipo, valor } = req.body;
    if (!tipo || valor === undefined) {
      return res.status(400).json({ ok: false, error: 'tipo y valor son requeridos' });
    }
    const data = await analyticsService.guardarProgreso(req.usuario.id, tipo, valor);
    res.status(201).json({ ok: true, data });
  } catch (err) {
    console.error('guardarProgreso:', err.message);
    res.status(500).json({ ok: false, error: 'Error al guardar progreso' });
  }
};