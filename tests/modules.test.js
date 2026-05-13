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
    ['DELETE', '/api/habitos/1'],
    ['POST', '/api/habitos/1/completar'],
    ['GET', '/api/habitos/hoy'],
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
    ['GET', '/api/tareas/hoy'],
    ['GET', '/api/tareas/agenda'],
  ];

  it.each(endpoints)('%s %s returns 401 without token', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});
