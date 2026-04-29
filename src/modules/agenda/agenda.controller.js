import * as agendaService from './agenda.service.js';
import * as tareasService from '../tareas/tareas.service.js';

export const obtenerAgendaDia = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
    const tareas = await tareasService.obtenerAgendaDia(req.usuario.id, fecha);
    res.json({ ok: true, fecha, data: tareas, total: tareas.length });
  } catch (err) {
    console.error('obtenerAgendaDia:', err.message);
    res.status(500).json({ ok: false, error: 'Error al obtener la agenda del día' });
  }
};

export const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await tareasService.obtenerEstadisticas(req.usuario.id);
    res.json({ ok: true, data: stats });
  } catch (err) {
    console.error('obtenerEstadisticas ERROR:', err); // ← cambiar err.message por err
    res.status(500).json({ ok: false, error: 'Error al obtener estadísticas' });
  }
};

export const programarAutomatico = async (req, res) => {
  try {
    const tareas = await tareasService.obtenerTareas(req.usuario.id, { estado: 'pendiente' });
    const sinFecha = tareas.filter((t) => !t.fecha_inicio);
    if (sinFecha.length === 0) {
      return res.json({ ok: true, mensaje: 'No hay tareas pendientes sin fecha para programar', data: [] });
    }
    const resultado = await agendaService.programarTareasAutomaticamente(req.usuario.id, sinFecha);
    res.json({ ok: true, data: resultado, total_programadas: resultado.filter((r) => r.programada).length });
  } catch (err) {
    console.error('programarAutomatico:', err.message);
    res.status(500).json({ ok: false, error: 'Error en el auto-scheduling' });
  }
};

export const reagendarVencidas = async (req, res) => {
  try {
    const resultado = await agendaService.sugerirReagendamiento(req.usuario.id);
    res.json({ ok: true, data: resultado, total: resultado.length });
  } catch (err) {
    console.error('reagendarVencidas:', err.message);
    res.status(500).json({ ok: false, error: 'Error al reagendar tareas' });
  }
};