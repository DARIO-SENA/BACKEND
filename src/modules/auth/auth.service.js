import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registrarUsuario = async ({ nombre, email, password }) => {
  if (!nombre || !email || !password) {
    throw new Error('Faltan campos obligatorios');
  }

  const existe = await pool.query(
    'SELECT id FROM usuarios WHERE email = $1',
    [email]
  );

  if (existe.rows.length > 0) {
    throw new Error('El usuario ya existe');
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
    throw new Error('Faltan credenciales');
  }

  const { rows } = await pool.query(
    'SELECT * FROM usuarios WHERE email = $1',
    [email]
  );

  const usuario = rows[0];
  if (!usuario) throw new Error('Usuario no encontrado');

  const valida = await bcrypt.compare(password, usuario.password);
  if (!valida) throw new Error('Contraseña incorrecta');

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
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