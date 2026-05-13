import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';

let token;

beforeAll(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  token = jwt.sign({ id: 1, email: 'test@test.com', nombre: 'Test' }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

describe('Habitos Module - Auth protection', () => {
  const endpoints = [
    ['GET', '/api/habitos'],
    ['POST', '/api/habitos'],
    ['PUT', '/api/habitos/1'],
    ['PATCH', '/api/habitos/1/estado'],
    ['DELETE', '/api/habitos/1'],
  ];

  it.each(endpoints)('%s %s returns 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});

describe('Tareas Module - Auth protection', () => {
  const endpoints = [
    ['GET', '/api/tareas'],
    ['POST', '/api/tareas'],
    ['PUT', '/api/tareas/1'],
    ['DELETE', '/api/tareas/1'],
    ['PATCH', '/api/tareas/1/estado'],
  ];

  it.each(endpoints)('%s %s returns 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});

describe('Agenda Module - Auth protection', () => {
  const endpoints = [
    ['GET', '/api/agenda/dia'],
    ['GET', '/api/agenda/semanal'],
    ['POST', '/api/agenda/programar'],
    ['GET', '/api/agenda/bloques'],
    ['POST', '/api/agenda/bloques'],
  ];

  it.each(endpoints)('%s %s returns 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});

describe('Pomodoro Module - Auth protection', () => {
  const endpoints = [
    ['GET', '/api/pomodoro/settings'],
    ['PUT', '/api/pomodoro/settings'],
    ['POST', '/api/pomodoro/sessions'],
    ['GET', '/api/pomodoro/sessions'],
  ];

  it.each(endpoints)('%s %s returns 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});

describe('Gym Module - Auth protection', () => {
  const endpoints = [
    ['POST', '/api/gym/rutinas'],
    ['GET', '/api/gym/rutinas'],
    ['GET', '/api/gym/rutinas/1'],
    ['PUT', '/api/gym/rutinas/1'],
    ['DELETE', '/api/gym/rutinas/1'],
  ];

  it.each(endpoints)('%s %s returns 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});

describe('Social Module - Auth protection', () => {
  const endpoints = [
    ['POST', '/api/social/amigos/solicitud'],
    ['GET', '/api/social/amigos'],
    ['POST', '/api/social/proyectos'],
    ['GET', '/api/social/proyectos'],
  ];

  it.each(endpoints)('%s %s returns 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});

describe('Finanzas Module - Auth protection', () => {
  const endpoints = [
    ['GET', '/api/finanzas/cuentas'],
    ['POST', '/api/finanzas/cuentas'],
    ['GET', '/api/finanzas/transacciones'],
    ['POST', '/api/finanzas/transacciones'],
    ['GET', '/api/finanzas/presupuestos'],
    ['GET', '/api/finanzas/metas'],
    ['GET', '/api/finanzas/deudas'],
  ];

  it.each(endpoints)('%s %s returns 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});

describe('Analytics Module - Auth protection', () => {
  const endpoints = [
    ['GET', '/api/analytics/dashboard'],
    ['GET', '/api/analytics/semanal'],
    ['GET', '/api/analytics/categorias'],
    ['GET', '/api/analytics/racha'],
  ];

  it.each(endpoints)('%s %s returns 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});