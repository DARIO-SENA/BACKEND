import * as agendaService from './agenda.service.js';
import * as tareasService from '../tareas/tareas.service.js';

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

// ─── BLOQUES DE TIEMPO ────────────────────────────────────

export const obtenerBloques = async (req, res) => {
  try {
    const bloques = await agendaService.obtenerBloques(req.usuario.id);
    res.json({ ok: true, data: bloques });
  } catch (err) {
    console.error('obtenerBloques:', err.message);
    res.status(500).json({ ok: false, error: 'Error al obtener bloques' });
  }
};

export const crearBloque = async (req, res) => {
  try {
    const bloque = await agendaService.crearBloque(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data: bloque });
  } catch (err) {
    console.error('crearBloque:', err.message);
    res.status(400).json({ ok: false, error: 'Error al crear bloque' });
  }
};

export const actualizarBloque = async (req, res) => {
  try {
    const bloque = await agendaService.actualizarBloque(req.params.id, req.usuario.id, req.body);
    if (!bloque) return res.status(404).json({ ok: false, error: 'Bloque no encontrado' });
    res.json({ ok: true, data: bloque });
  } catch (err) {
    console.error('actualizarBloque:', err.message);
    res.status(400).json({ ok: false, error: 'Error al actualizar bloque' });
  }
};

export const eliminarBloque = async (req, res) => {
  try {
    const eliminado = await agendaService.eliminarBloque(req.params.id, req.usuario.id);
    if (!eliminado) return res.status(404).json({ ok: false, error: 'Bloque no encontrado' });
    res.json({ ok: true, message: 'Bloque eliminado correctamente' });
  } catch (err) {
    console.error('eliminarBloque:', err.message);
    res.status(500).json({ ok: false, error: 'Error al eliminar bloque' });
  }
};

// ─── VISTA SEMANAL MEJORADA ───────────────────────────────
export const obtenerVistaSemanal = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
    const data = await agendaService.obtenerVistaSemanal(req.usuario.id, fecha);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('obtenerVistaSemanal:', err.message);
    res.status(500).json({ ok: false, error: 'Error al obtener vista semanal' });
  }
};

