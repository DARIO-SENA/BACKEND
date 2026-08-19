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

export const obtenerPerfil = async (req, res) => {
  try {
    const data = await authService.obtenerPerfil(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const autenticarConGoogle = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ ok: false, error: 'Credencial requerida' });
    const data = await authService.autenticarConGoogle(credential);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const actualizarPerfil = async (req, res) => {
  try {
    const data = await authService.actualizarPerfil(req.usuario.id, req.body);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};