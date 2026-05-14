import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

vi.mock('../src/config/db.js', () => ({
  default: { query: vi.fn() },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('hashed_password')),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mocked_token'),
  },
}));

let mockPool;
let registrarUsuario;
let iniciarSesionUsuario;

beforeAll(async () => {
  mockPool = (await import('../src/config/db.js')).default;
  const mod = await import('../src/modules/auth/auth.service.js');
  registrarUsuario = mod.registrarUsuario;
  iniciarSesionUsuario = mod.iniciarSesionUsuario;
});

describe('auth.service - registrarUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe registrar un usuario con datos válidos', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Test', email: 'test@test.com', creado_en: new Date() }] });

    const result = await registrarUsuario({ nombre: 'Test', email: 'test@test.com', password: '123456' });
    expect(result.id).toBe(1);
    expect(result.email).toBe('test@test.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
  });

  it('debe rechazar email inválido', async () => {
    await expect(registrarUsuario({ nombre: 'Test', email: 'invalido', password: '123456' }))
      .rejects.toThrow('Formato de email inválido');
  });

  it('debe rechazar password corta', async () => {
    await expect(registrarUsuario({ nombre: 'Test', email: 'test@test.com', password: '123' }))
      .rejects.toThrow('6 caracteres');
  });

  it('debe rechazar nombre vacío', async () => {
    await expect(registrarUsuario({ nombre: '', email: 'test@test.com', password: '123456' }))
      .rejects.toThrow('Nombre requerido');
  });

  it('debe rechazar email duplicado con 409', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: 99 }] });
    await expect(registrarUsuario({ nombre: 'Test', email: 'dup@test.com', password: '123456' }))
      .rejects.toMatchObject({ status: 409 });
  });
});

describe('auth.service - iniciarSesionUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar token con credenciales válidas', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: 1, nombre: 'Test', email: 'test@test.com', password: 'hashed' }],
    });
    bcrypt.compare.mockResolvedValueOnce(true);

    const result = await iniciarSesionUsuario({ email: 'test@test.com', password: '123456' });
    expect(result.token).toBe('mocked_token');
    expect(result.usuario.email).toBe('test@test.com');
    expect(jwt.sign).toHaveBeenCalled();
  });

  it('debe rechazar password incorrecto con 401', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: 1, nombre: 'Test', email: 'test@test.com', password: 'hashed' }],
    });
    bcrypt.compare.mockResolvedValueOnce(false);

    await expect(iniciarSesionUsuario({ email: 'test@test.com', password: 'wrong' }))
      .rejects.toMatchObject({ status: 401 });
  });

  it('debe rechazar email inexistente con 401', async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [] });
    await expect(iniciarSesionUsuario({ email: 'noexiste@test.com', password: '123456' }))
      .rejects.toMatchObject({ status: 401 });
  });
});
