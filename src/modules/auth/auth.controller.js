import { registrarUsuario, iniciarSesionUsuario } from './auth.service.js';

export const registrar = async (req, res) => {
  try {
    const datos = await registrarUsuario(req.body);
    res.status(201).json(datos);
  } catch (error) {
    console.error("ERROR REGISTER:", error);
    if (error.message.includes("existe")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const iniciarSesion = async (req, res) => {
  try {
    const datos = await iniciarSesionUsuario(req.body);
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};