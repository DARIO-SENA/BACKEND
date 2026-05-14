import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🔒 1. Verificar si existe
  if (!authHeader) {
    return res.status(401).json({ ok: false, error: "Token requerido" });
  }

  const partes = authHeader.split(" ");
  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({ ok: false, error: "Formato de token inválido" });
  }

  const token = partes[1];

  try {
    // 🔐 3. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ ok: false, error: "Token inválido o expirado" });
  }
};