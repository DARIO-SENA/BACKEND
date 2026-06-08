import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { registerSchema, loginSchema } from '../../validation/index.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registrarUsuario = async ({ nombre, email, password }) => {
  const parsed = registerSchema.safeParse({ nombre, email, password });
  if (!parsed.success) {
    const msg = parsed.error.issues[0].message;
    throw Object.assign(new Error(msg), { status: 400 });
  }

  const existe = await pool.query(
    'SELECT id FROM usuarios WHERE email = $1',
    [email]
  );

  if (existe.rows.length > 0) {
    throw Object.assign(new Error('El email ya está registrado'), { status: 409 });
  }

  const hasheada = await bcrypt.hash(password, 10);

  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, nombre, email, creado_en`,
    [nombre, email, hasheada]
  );

  return rows[0];
};

export const iniciarSesionUsuario = async ({ email, password }) => {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  }

  const { rows } = await pool.query(
    'SELECT * FROM usuarios WHERE email = $1',
    [email]
  );

  const usuario = rows[0];
  if (!usuario) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });

  const valida = await bcrypt.compare(password, usuario.password);
  if (!valida) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });

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

export const actualizarPerfilUsuario = async (usuarioId, { nombre }, avatarUrl) => {
  const sets = [];
  const params = [];
  let idx = 1;

  if (nombre !== undefined) {
    sets.push(`nombre = $${idx++}`);
    params.push(nombre);
  }
  if (avatarUrl !== undefined) {
    sets.push(`avatar_url = $${idx++}`);
    params.push(avatarUrl);
  }

  if (sets.length === 0) {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, avatar_url FROM usuarios WHERE id = $1',
      [usuarioId]
    );
    return rows[0];
  }

  params.push(usuarioId);
  const { rows } = await pool.query(
    `UPDATE usuarios SET ${sets.join(', ')}, actualizado_en = CURRENT_TIMESTAMP WHERE id = $${idx}
     RETURNING id, nombre, email, avatar_url`,
    params
  );

  return rows[0];
};

export const verificarGoogleToken = async ({ credential }) => {
  if (!credential) {
    throw Object.assign(new Error('Token de Google requerido'), { status: 400 });
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const googleId = payload['sub'];
  const email = payload['email'];
  const nombre = payload['name'];

  const { rows } = await pool.query(
    'SELECT * FROM usuarios WHERE google_id = $1 OR email = $2',
    [googleId, email]
  );

  let usuario = rows[0];

  if (usuario) {
    if (!usuario.google_id) {
      await pool.query(
        'UPDATE usuarios SET google_id = $1, auth_provider = $2 WHERE id = $3',
        [googleId, 'google', usuario.id]
      );
    }
  } else {
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, google_id, auth_provider)
       VALUES ($1, $2, $3, 'google')
       RETURNING id, nombre, email`,
      [nombre, email, googleId]
    );
    usuario = result.rows[0];
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
