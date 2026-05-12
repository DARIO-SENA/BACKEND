import { registrarUsuario, iniciarSesionUsuario } from './auth.service.js';

export const registrar = async (req, res) => {
  try {
    const datos = await registrarUsuario(req.body);
    res.status(201).json(datos);
  } catch (error) {
    console.error("ERROR REGISTER:", error.message);
    const status = error.status || 500;
    res.status(status).json({ error: error.message });
  }
};

export const iniciarSesion = async (req, res) => {
  try {
    const datos = await iniciarSesionUsuario(req.body);
    res.json(datos);
  } catch (err) {
    console.error("ERROR LOGIN:", err.message);
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
};