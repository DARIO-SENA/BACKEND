// src/modules/integraciones/integraciones.service.js
import crypto from 'crypto';
import pool from '../../config/db.js';
import jwt from 'jsonwebtoken';

const generarPasswordAleatorio = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ─── GOOGLE OAUTH ─────────────────────────────────────────

// Buscar usuario por email o crearlo si no existe
export const buscarOCrearUsuarioGoogle = async (perfil) => {
  const { email, displayName, id: googleId } = perfil;

  // 1. Buscar si ya existe
  const existente = await pool.query(
    `SELECT * FROM usuarios WHERE email = $1`,
    [email]
  );

  if (existente.rows.length > 0) {
    return existente.rows[0];
  }

  // 2. Si no existe, crearlo con password aleatorio (solo Google OAuth)
  const passwordAleatorio = generarPasswordAleatorio();
  const nuevo = await pool.query(
    `INSERT INTO usuarios (nombre, email, password, google_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [displayName, email, passwordAleatorio, googleId]
  );

  return nuevo.rows[0];
};

// Generar JWT para el usuario
export const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─── GOOGLE CALENDAR ──────────────────────────────────────

// Guardar tokens de Google Calendar del usuario
export const guardarTokensGoogle = async (usuarioId, tokens) => {
  await pool.query(
    `UPDATE usuarios
     SET google_access_token = $1,
         google_refresh_token = $2,
         google_token_expiry = $3
     WHERE id = $4`,
    [tokens.access_token, tokens.refresh_token, tokens.expiry_date, usuarioId]
  );
};

// Obtener tokens de Google Calendar del usuario
export const obtenerTokensGoogle = async (usuarioId) => {
  const result = await pool.query(
    `SELECT google_access_token, google_refresh_token, google_token_expiry
     FROM usuarios WHERE id = $1`,
    [usuarioId]
  );
  return result.rows[0] || null;
};