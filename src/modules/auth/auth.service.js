import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { AppError } from '../../utils/AppError.js';
import { registerSchema, loginSchema } from '../../validation/index.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const obtenerPerfil = async (usuarioId) => {
  const { rows } = await pool.query(
    'SELECT id, usuario, nombre, email, telefono, creado_en FROM usuarios WHERE id = $1',
    [usuarioId]
  );
  if (rows.length === 0) throw new AppError('Usuario no encontrado', 404);
  return rows[0];
};

export const registrarUsuario = async ({ usuario, nombre, email, telefono, password }) => {
  const parsed = registerSchema.safeParse({ usuario, nombre, email, telefono, password });
  if (!parsed.success) {
    const msg = parsed.error.issues[0].message;
    throw new AppError(msg, 400);
  }

  const existe = await pool.query(
    'SELECT id FROM usuarios WHERE email = $1',
    [email]
  );

  if (existe.rows.length > 0) {
    throw new AppError('Error al registrar usuario', 409);
  }

  const hasheada = await bcrypt.hash(password, 10);

  const { rows } = await pool.query(
    `INSERT INTO usuarios (usuario, nombre, email, telefono, password)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, usuario, nombre, email, telefono, creado_en`,
    [usuario || null, nombre, email, telefono || null, hasheada]
  );

  return rows[0];
};

export const iniciarSesionUsuario = async ({ email, password }) => {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const { rows } = await pool.query(
    'SELECT * FROM usuarios WHERE email = $1',
    [email]
  );

  const usuario = rows[0];
  if (!usuario) throw new AppError('Credenciales inválidas', 401);

  const valida = await bcrypt.compare(password, usuario.password);
  if (!valida) throw new AppError('Credenciales inválidas', 401);

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email
    }
  };
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export const autenticarConGoogle = async (credential) => {
  if (!GOOGLE_CLIENT_ID) throw new AppError('Google auth no configurado', 503);

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError('Credencial de Google inválida', 401);
  }

  const { sub: googleId, email, name } = payload;

  const { rows: existentes } = await pool.query(
    'SELECT * FROM usuarios WHERE google_id = $1 OR email = $2',
    [googleId, email]
  );

  let usuario = existentes[0];

  if (usuario) {
    if (!usuario.google_id) {
      await pool.query(
        'UPDATE usuarios SET google_id = $1 WHERE id = $2',
        [googleId, usuario.id]
      );
    }
  } else {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, google_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email`,
      [name || email.split('@')[0], email, 'google_oauth', googleId]
    );
    usuario = rows[0];
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email
    }
  };
};

export const actualizarPerfil = async (usuarioId, datos) => {
  const campos = [];
  const valores = [];
  let idx = 1;

  const permitidos = ['nombre', 'email', 'telefono', 'usuario'];
  for (const campo of permitidos) {
    if (datos[campo] !== undefined) {
      campos.push(`${campo} = $${idx++}`);
      valores.push(datos[campo]);
    }
  }

  if (campos.length === 0) throw new AppError('No hay campos para actualizar', 400);

  valores.push(usuarioId);
  const { rows } = await pool.query(
    `UPDATE usuarios SET ${campos.join(', ')} WHERE id = $${idx}
     RETURNING id, usuario, nombre, email, telefono, creado_en`,
    valores
  );

  return rows[0];
};