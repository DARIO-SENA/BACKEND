import request from "supertest";
import app from "../src/app.js";

describe("GET /api/health", () => {
  it("debe retornar estado del servidor", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("db");
    expect(res.body).toHaveProperty("redis");
    expect(res.body).toHaveProperty("timestamp");
  });
});

describe("Check-in endpoints", () => {
  const usuario_id = 999;

  it("POST /api/bienestar/checkin - debe crear check-in", async () => {
    const res = await request(app)
      .post("/api/bienestar/checkin")
      .send({ usuario_id, estado_animo: "feliz", energia: 8, sueno_horas: 7.5 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.estado_animo).toBe("feliz");
  });

  it("POST /api/bienestar/checkin - debe actualizar si ya existe hoy (upsert)", async () => {
    const res = await request(app)
      .post("/api/bienestar/checkin")
      .send({ usuario_id, estado_animo: "energético", energia: 9, sueno_horas: 8 });
    expect(res.status).toBe(201);
    expect(res.body.estado_animo).toBe("energético");
  });

  it("GET /api/bienestar/checkin/hoy - debe retornar check-in de hoy", async () => {
    const res = await request(app).get(`/api/bienestar/checkin/hoy?usuario_id=${usuario_id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("estado_animo");
  });

  it("GET /api/bienestar/checkin/hoy - debe dar 404 si no hay", async () => {
    const res = await request(app).get("/api/bienestar/checkin/hoy?usuario_id=99999");
    expect(res.status).toBe(404);
  });

  it("GET /api/bienestar/checkin/historial - debe listar historial", async () => {
    const res = await request(app).get(`/api/bienestar/checkin/historial?usuario_id=${usuario_id}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("PUT /api/bienestar/checkin/hoy - debe actualizar check-in de hoy", async () => {
    const res = await request(app)
      .put("/api/bienestar/checkin/hoy")
      .send({ usuario_id, energia: 7 });
    expect(res.status).toBe(200);
    expect(res.body.energia).toBe(7);
  });

  it("PUT /api/bienestar/checkin/hoy - debe dar 404 si no existe", async () => {
    const res = await request(app)
      .put("/api/bienestar/checkin/hoy")
      .send({ usuario_id: 99999, energia: 5 });
    expect(res.status).toBe(404);
  });

  it("GET /api/bienestar/estadisticas - debe retornar estadísticas", async () => {
    const res = await request(app).get(`/api/bienestar/estadisticas?usuario_id=${usuario_id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("promedio_energia");
    expect(res.body).toHaveProperty("tendencia");
  });
});

describe("Diario endpoints", () => {
  const usuario_id = 999;
  let diarioId;

  it("POST /api/bienestar/diario - debe crear entrada", async () => {
    const res = await request(app)
      .post("/api/bienestar/diario")
      .send({ usuario_id, titulo: "Test", contenido: "Contenido de prueba" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    diarioId = res.body.id;
  });

  it("GET /api/bienestar/diario - debe listar paginado", async () => {
    const res = await request(app).get(`/api/bienestar/diario?usuario_id=${usuario_id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("pagina");
  });

  it("GET /api/bienestar/diario/:id - debe retornar entrada por id", async () => {
    const res = await request(app).get(`/api/bienestar/diario/${diarioId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(diarioId);
  });

  it("GET /api/bienestar/diario/:id - debe dar 404 si no existe", async () => {
    const res = await request(app).get("/api/bienestar/diario/999999");
    expect(res.status).toBe(404);
  });

  it("PUT /api/bienestar/diario/:id - debe actualizar entrada", async () => {
    const res = await request(app)
      .put(`/api/bienestar/diario/${diarioId}`)
      .send({ titulo: "Actualizado" });
    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe("Actualizado");
  });

  it("DELETE /api/bienestar/diario/:id - debe eliminar entrada", async () => {
    const res = await request(app).delete(`/api/bienestar/diario/${diarioId}`);
    expect(res.status).toBe(204);
  });

  it("GET /api/bienestar/diario/aleatorio - debe retornar entrada aleatoria", async () => {
    const res = await request(app).get(`/api/bienestar/diario/aleatorio?usuario_id=${usuario_id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("contenido");
  });

  it("GET /api/bienestar/diario/aleatorio - debe dar 404 si no hay entradas", async () => {
    const res = await request(app).get("/api/bienestar/diario/aleatorio?usuario_id=99999");
    expect(res.status).toBe(404);
  });
});

describe("Insights endpoints", () => {
  it("GET /api/bienestar/insights - debe retornar insights", async () => {
    const res = await request(app).get("/api/bienestar/insights?usuario_id=999");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("resumen");
    expect(res.body).toHaveProperty("observaciones");
  });
});

describe("Pausas endpoints", () => {
  it("POST /api/bienestar/pausa/programar - debe programar pausa", async () => {
    const res = await request(app)
      .post("/api/bienestar/pausa/programar")
      .send({ usuario_id: 999, ejercicio: "Estiramiento", duracion_minutos: 5 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("GET /api/bienestar/pausa/ejercicios - debe listar ejercicios", async () => {
    const res = await request(app).get("/api/bienestar/pausa/ejercicios");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/bienestar/pausa/completar - debe completar pausa", async () => {
    const creada = await request(app)
      .post("/api/bienestar/pausa/programar")
      .send({ usuario_id: 999, ejercicio: "Test", duracion_minutos: 3 });
    const res = await request(app)
      .post("/api/bienestar/pausa/completar")
      .send({ id: creada.body.id });
    expect(res.status).toBe(200);
    expect(res.body.completada).toBe(true);
  });

  it("POST /api/bienestar/pausa/completar - debe dar 404 si no existe", async () => {
    const res = await request(app)
      .post("/api/bienestar/pausa/completar")
      .send({ id: 999999 });
    expect(res.status).toBe(404);
  });
});

describe("GET / - raíz", () => {
  it("debe retornar mensaje de bienvenida", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("API funcionando");
  });
});
