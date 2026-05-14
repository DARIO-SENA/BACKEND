import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { limpiarTablas } from './helpers/db.js';

afterAll(async () => {
  await limpiarTablas();
});

describe('Auth Module', () => {
  const testUser = {
    nombre: 'Test',
    email: `test_${Date.now()}@test.com`,
    password: 'Test123456',
  };

  it('POST /api/auth/register creates a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('POST /api/auth/register returns 409 for duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.ok).toBe(false);
  });

  it('POST /api/auth/login returns token with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.usuario.email).toBe(testUser.email);
  });

  it('POST /api/auth/login returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });
});
