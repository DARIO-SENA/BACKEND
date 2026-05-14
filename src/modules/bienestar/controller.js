import { manejarError } from "../../utils/error.handler.js";
import * as bienestarService from "./service.js";

export const createCheckin = async (req, res) => {
  try {
    const data = await bienestarService.crearCheckin(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const getCheckinHoy = async (req, res) => {
  try {
    const data = await bienestarService.obtenerCheckinHoy(req.usuario.id);
    if (!data) return res.status(404).json({ ok: false, error: "No hay check-in hoy" });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const getHistorial = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 30;
    const offset = parseInt(req.query.offset) || 0;
    const data = await bienestarService.obtenerHistorial(req.usuario.id, limite, offset);
    res.json({ ok: true, data, total: data.length });
  } catch (err) { manejarError(res, err); }
};

export const updateCheckinHoy = async (req, res) => {
  try {
    const data = await bienestarService.actualizarCheckinHoy(req.usuario.id, req.body);
    if (!data) return res.status(404).json({ ok: false, error: "No hay check-in hoy" });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const getEstadisticas = async (req, res) => {
  try {
    const data = await bienestarService.obtenerEstadisticas(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const createDiario = async (req, res) => {
  try {
    const data = await bienestarService.crearDiario(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const listDiario = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const result = await bienestarService.listarDiario(req.usuario.id, pagina, limite);
    res.json({ ok: true, ...result });
  } catch (err) { manejarError(res, err); }
};

export const getDiario = async (req, res) => {
  try {
    const data = await bienestarService.obtenerDiario(req.params.id, req.usuario.id);
    if (!data) return res.status(404).json({ ok: false, error: "Entrada no encontrada" });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const updateDiario = async (req, res) => {
  try {
    const data = await bienestarService.actualizarDiario(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ ok: false, error: "Entrada no encontrada" });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const deleteDiario = async (req, res) => {
  try {
    const ok = await bienestarService.eliminarDiario(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ ok: false, error: "Entrada no encontrada" });
    res.json({ ok: true, mensaje: "Entrada eliminada correctamente" });
  } catch (err) { manejarError(res, err); }
};

export const getDiarioAleatorio = async (req, res) => {
  try {
    const data = await bienestarService.obtenerDiarioAleatorio(req.usuario.id);
    if (!data) return res.status(404).json({ ok: false, error: "No hay entradas en el diario" });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const getInsights = async (req, res) => {
  try {
    const data = await bienestarService.obtenerInsights(req.usuario.id);
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const programarPausa = async (req, res) => {
  try {
    const data = await bienestarService.programarPausa(req.usuario.id, req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const listEjercicios = async (req, res) => {
  const ejercicios = [
    { id: 1, nombre: "Estiramiento de cuello", duracion: 2 },
    { id: 2, nombre: "Respiración profunda", duracion: 3 },
    { id: 3, nombre: "Caminata corta", duracion: 5 },
    { id: 4, nombre: "Estiramiento de brazos", duracion: 2 },
    { id: 5, nombre: "Ejercicio de ojos (20-20-20)", duracion: 1 },
    { id: 6, nombre: "Flexión de piernas", duracion: 3 },
  ];
  res.json({ ok: true, data: ejercicios, total: ejercicios.length });
};

export const completarPausa = async (req, res) => {
  try {
    const data = await bienestarService.completarPausa(req.body.id, req.usuario.id);
    if (!data) return res.status(404).json({ ok: false, error: "Pausa no encontrada" });
    res.json({ ok: true, data });
  } catch (err) { manejarError(res, err); }
};

export const healthCheck = async (_req, res) => {
  const estado = { db: "ok", redis: "ok", timestamp: new Date().toISOString() };
  try {
    await bienestarService.verificarConexionDB();
  } catch {
    estado.db = "error";
  }
  try {
    const { getRedisClient } = await import("../../config/redis.js");
    const redis = getRedisClient();
    await redis.ping();
  } catch {
    estado.redis = "error";
  }
  const statusCode = estado.db === "ok" ? 200 : 503;
  res.status(statusCode).json({ ok: statusCode === 200, data: estado });
};
