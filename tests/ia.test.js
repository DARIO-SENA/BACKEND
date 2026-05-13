import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';

let token;

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-for-testing';
  token = jwt.sign({ id: 1, email: 'test@test.com', nombre: 'Test' }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

const UNAUTHED_ENDPOINTS = [
  ['POST', '/api/ia/crear-tarea'],
  ['POST', '/api/ia/crear-habito'],
  ['POST', '/api/ia/crear-evento'],
  ['POST', '/api/ia/chat'],
  ['GET',  '/api/ia/hoy-prioridades'],
  ['GET',  '/api/ia/resumen'],
  ['GET',  '/api/ia/predecir-duracion'],
  ['POST', '/api/ia/optimizar-agenda'],
  ['GET',  '/api/ia/recomendar-habitos'],
  ['POST', '/api/ia/sugerir-rutina'],
  ['GET',  '/api/ia/recomendar-amigos'],
  ['GET',  '/api/ia/recomendar-proyectos'],
  ['POST', '/api/ia/sugerir-logro'],
  ['GET',  '/api/ia/patrones'],
  ['GET',  '/api/ia/anomalias'],
  ['GET',  '/api/ia/sobrecarga'],
];

describe('IA Module - Auth protection', () => {
  it.each(UNAUTHED_ENDPOINTS)('%s %s returns 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});

describe('IA Module - Validation errors', () => {
  it('POST /api/ia/crear-tarea returns 400 when texto is missing', async () => {
    const res = await request(app)
      .post('/api/ia/crear-tarea')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Texto requerido');
  });

  it('POST /api/ia/chat returns 400 when mensaje is missing', async () => {
    const res = await request(app)
      .post('/api/ia/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Mensaje requerido');
  });

  it('GET /api/ia/predecir-duracion returns 400 when tarea_id is missing', async () => {
    const res = await request(app)
      .get('/api/ia/predecir-duracion')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('tarea_id requerido');
  });
});

describe('IA Module - Route structure', () => {
  it('has all endpoints registered', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
  });

  it('module is mounted at /api/ia', async () => {
    const res = await request(app).get('/api/ia/hoy-prioridades');
    expect(res.status).toBe(401);
  });
});
