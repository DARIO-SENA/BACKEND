import { manejarError } from '../../utils/error.handler.js';
import { registrarUsuario, iniciarSesionUsuario } from './auth.service.js';

export const registrar = async (req, res) => {
  try {
    const datos = await registrarUsuario(req.body);
    res.status(201).json({ ok: true, data: datos });
  } catch (error) { manejarError(res, error); }
};

export const iniciarSesion = async (req, res) => {
  try {
    const datos = await iniciarSesionUsuario(req.body);
    res.json({ ok: true, data: datos });
  } catch (err) { manejarError(res, err); }
};