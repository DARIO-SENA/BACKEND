import * as habitosService from './habitos.service.js';
import * as gamificacionService from '../gamificacion/gamificacion.service.js';

export const crearHabito = async (req, res) => {
  try {
    const data = await habitosService.crearHabito(req.usuario.id, req.body);
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const listarHabitos = async (req, res) => {
  try {
    const data = await habitosService.listarHabitos(req.usuario.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const actualizarHabito = async (req, res) => {
  try {
    const data = await habitosService.actualizarHabito(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ error: 'Hábito no encontrado' });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const eliminarHabito = async (req, res) => {
  try {
    const ok = await habitosService.eliminarHabito(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ error: 'Hábito no encontrado' });
    res.json({ message: 'Hábito eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const cambiarEstado = async (req, res) => {
  try {
    const habito = await habitosService.cambiarEstadoHabito(
      req.params.id,
      req.usuario.id,
      req.body.estado
    );

    if (!habito) {
      return res.status(404).json({ error: 'Hábito no encontrado' });
    }

    // SOLO gamificación si se completa
    if (req.body.estado === 'completada') {
      await gamificacionService.procesarHabitoCompletado(
        req.usuario.id,
        habito
      );
    }

    res.json(habito);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};