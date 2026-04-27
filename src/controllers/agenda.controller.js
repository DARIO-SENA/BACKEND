import * as agendaService from '../services/agenda.service.js';
import * as tareasService from '../services/tareas.service.js';

// 📅 Agenda del día
export const obtenerAgendaDia = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];

    const tareas = await tareasService.obtenerAgendaDia(req.usuario.id, fecha);

    res.json({
      ok: true,
      fecha,
      data: tareas,
      total: tareas.length
    });
  } catch (err) {
    console.error('obtenerAgendaDia:', err.message);
    res.status(500).json({ ok: false, error: 'Error al obtener la agenda del día' });
  }
};

// 📊 Estadísticas
export const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await tareasService.obtenerEstadisticas(req.usuario.id);

    res.json({ ok: true, data: stats });
  } catch (err) {
    console.error('obtenerEstadisticas:', err.message);
    res.status(500).json({ ok: false, error: 'Error al obtener estadísticas' });
  }
};

// ⚙️ Auto scheduling
export const programarAutomatico = async (req, res) => {
  try {
    const tareas = await tareasService.obtenerTareas(req.usuario.id, {
      estado: 'pendiente'
    });

    const sinFecha = tareas.filter((t) => !t.fecha_inicio);

    if (sinFecha.length === 0) {
      return res.json({
        ok: true,
        mensaje: 'No hay tareas pendientes sin fecha para programar',
        data: []
      });
    }

    const resultado = await agendaService.programarTareasAutomaticamente(
      req.usuario.id,
      sinFecha
    );

    res.json({
      ok: true,
      data: resultado,
      total_programadas: resultado.filter((r) => r.programada).length
    });
  } catch (err) {
    console.error('programarAutomatico:', err.message);
    res.status(500).json({ ok: false, error: 'Error en el auto-scheduling' });
  }
};

// 🔄 Reagendar vencidas
export const reagendarVencidas = async (req, res) => {
  try {
    const resultado = await agendaService.sugerirReagendamiento(req.usuario.id);

    res.json({
      ok: true,
      data: resultado,
      total: resultado.length
    });
  } catch (err) {
    console.error('reagendarVencidas:', err.message);
    res.status(500).json({ ok: false, error: 'Error al reagendar tareas' });
  }
};

// POST /api/agenda/recurring
export const createRecurringTask = async (req, res) => {
  try {
    const tarea = await agendaService.createRecurringTask(req.usuario.id, req.body);
    res.status(201).json({ 
      success: true, 
      data: tarea,
      message: "Tarea recurrente creada exitosamente 🔄"
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/agenda/conflicts?fecha_inicio=2026-04-27T09:00:00&duracion_minutos=60
export const detectarConflictos = async (req, res) => {
  try {
    const { fecha_inicio, duracion_minutos, excludeId } = req.query;

    if (!fecha_inicio || !duracion_minutos) {
      return res.status(400).json({ 
        success: false, 
        message: "fecha_inicio y duracion_minutos son requeridos" 
      });
    }

    const conflictos = await agendaService.detectarConflictos(
      req.usuario.id,
      fecha_inicio,
      parseInt(duracion_minutos),
      excludeId || null
    );

    res.status(200).json({ 
      success: true, 
      tieneConflictos: conflictos.length > 0,
      count: conflictos.length,
      data: conflictos
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};