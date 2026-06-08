import { manejarError } from '../../utils/error.handler.js';
import * as authService from './auth.service.js';

export const registrar = async (req, res) => {
  try {
    const datos = await authService.registrarUsuario(req.body);
    res.status(201).json({ ok: true, data: datos });
  } catch (error) { manejarError(res, error); }
};

export const iniciarSesion = async (req, res) => {
  try {
    const datos = await authService.iniciarSesionUsuario(req.body);
    res.json({ ok: true, data: datos });
  } catch (err) { manejarError(res, err); }
};

export const googleSignIn = async (req, res) => {
  try {
    const datos = await authService.verificarGoogleToken(req.body);
    res.json({ ok: true, data: datos });
  } catch (err) { manejarError(res, err); }
};

export const actualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const datos = await authService.actualizarPerfilUsuario(usuarioId, req.body, avatarUrl);
    res.json({ ok: true, data: datos });
  } catch (err) { manejarError(res, err); }
};
