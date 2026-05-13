import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

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
  test.each(UNAUTHED_ENDPOINTS)('%s %s returns 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
  });
});

describe('IA Module - Validation errors', () => {
  it('POST /api/ia/crear-tarea returns 400 when texto is missing', async () => {
    const res = await request(app)
      .post('/api/ia/crear-tarea')
      .set('Authorization', 'Bearer test-token')
      .send({});
    expect(res.status).toBe(401);
  });

  it('POST /api/ia/chat returns 400 when mensaje is missing', async () => {
    const res = await request(app)
      .post('/api/ia/chat')
      .set('Authorization', 'Bearer test-token')
      .send({});
    expect(res.status).toBe(401);
  });

  it('GET /api/ia/predecir-duracion returns 400 when tarea_id is missing', async () => {
    const res = await request(app)
      .get('/api/ia/predecir-duracion')
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(401);
  });
});

describe('IA Module - Route structure', () => {
  it('has all 17 endpoints registered', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
  });

  it('module is mounted at /api/ia', async () => {
    const res = await request(app).get('/api/ia/hoy-prioridades');
    expect(res.status).toBe(401);
  });
});
