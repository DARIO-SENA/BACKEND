import * as habitosService from './habitos.service.js';

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