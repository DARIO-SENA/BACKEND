import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../src/app.js";

let token;
const usuario_id = 999;

beforeAll(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
  token = jwt.sign({ id: usuario_id, email: "test@test.com", nombre: "Test" }, process.env.JWT_SECRET, { expiresIn: "1h" });
});

describe("GET /api/health", () => {
  it("debe retornar estado del servidor", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok");
    expect(res.body).toHaveProperty("timestamp");
  });
});

describe("Check-in endpoints", () => {
  it("POST /api/bienestar/checkin - requiere auth", async () => {
    const res = await request(app)
      .post("/api/bienestar/checkin")
      .send({ estado_animo: "feliz", energia: 8 });
    expect(res.status).toBe(401);
  });

  it("GET /api/bienestar/pausa/ejercicios - requiere auth", async () => {
    const res = await request(app).get("/api/bienestar/pausa/ejercicios");
    expect(res.status).toBe(401);
  });
});

describe("Diario endpoints - auth protection", () => {
  it("POST /api/bienestar/diario - requiere auth", async () => {
    const res = await request(app)
      .post("/api/bienestar/diario")
      .send({ titulo: "Test", contenido: "Contenido" });
    expect(res.status).toBe(401);
  });

  it("GET /api/bienestar/diario - requiere auth", async () => {
    const res = await request(app).get("/api/bienestar/diario");
    expect(res.status).toBe(401);
  });
});

describe("Insights endpoints - auth protection", () => {
  it("GET /api/bienestar/insights - requiere auth", async () => {
    const res = await request(app).get("/api/bienestar/insights");
    expect(res.status).toBe(401);
  });
});

describe("Pausas endpoints - auth protection", () => {
  it("POST /api/bienestar/pausa/programar - requiere auth", async () => {
    const res = await request(app)
      .post("/api/bienestar/pausa/programar")
      .send({ ejercicio: "Estiramiento", duracion_minutos: 5 });
    expect(res.status).toBe(401);
  });

  it("GET /api/bienestar/pausa/ejercicios - requiere auth", async () => {
    const res = await request(app).get("/api/bienestar/pausa/ejercicios");
    expect(res.status).toBe(401);
  });
});

describe("GET / - raíz", () => {
  it("debe retornar mensaje de bienvenida", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("mensaje");
  });
});