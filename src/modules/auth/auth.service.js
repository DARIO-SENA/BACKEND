import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registrarUsuario = async ({ nombre, email, password }) => {
  if (!nombre || !email || !password) {
    throw Object.assign(new Error('Faltan campos obligatorios'), { status: 400 });
  }
  if (nombre.length > 100) {
    throw Object.assign(new Error('El nombre es demasiado largo'), { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    throw Object.assign(new Error('Formato de email inválido'), { status: 400 });
  }
  if (password.length < 6) {
    throw Object.assign(new Error('La contraseña debe tener al menos 6 caracteres'), { status: 400 });
  }

  const existe = await pool.query(
    'SELECT id FROM usuarios WHERE email = $1',
    [email]
  );

  if (existe.rows.length > 0) {
    throw Object.assign(new Error('Error al registrar usuario'), { status: 409 });
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
  if (!email || !password) {
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