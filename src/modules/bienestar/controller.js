import { manejarError } from "../../utils/error.handler.js";
import * as bienestarService from "./service.js";

export const createCheckin = async (req, res) => {
  try {
    const data = await bienestarService.crearCheckin(req.usuario.id, req.body);
    res.status(201).json(data);
  } catch (err) { manejarError(res, err); }
};

export const getCheckinHoy = async (req, res) => {
  try {
    const data = await bienestarService.obtenerCheckinHoy(req.usuario.id);
    if (!data) return res.status(404).json({ error: "No hay check-in hoy" });
    res.json(data);
  } catch (err) { manejarError(res, err); }
};

export const getHistorial = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 30;
    const offset = parseInt(req.query.offset) || 0;
    const data = await bienestarService.obtenerHistorial(req.usuario.id, limite, offset);
    res.json(data);
  } catch (err) { manejarError(res, err); }
};

export const updateCheckinHoy = async (req, res) => {
  try {
    const data = await bienestarService.actualizarCheckinHoy(req.usuario.id, req.body);
    if (!data) return res.status(404).json({ error: "No hay check-in hoy" });
    res.json(data);
  } catch (err) { manejarError(res, err); }
};

export const getEstadisticas = async (req, res) => {
  try {
    const data = await bienestarService.obtenerEstadisticas(req.usuario.id);
    res.json(data);
  } catch (err) { manejarError(res, err); }
};

export const createDiario = async (req, res) => {
  try {
    const data = await bienestarService.crearEntradaDiario(req.usuario.id, req.body);
    res.status(201).json(data);
  } catch (err) { manejarError(res, err); }
};

export const listDiario = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const data = await bienestarService.listarDiario(req.usuario.id, pagina, limite);
    res.json(data);
  } catch (err) { manejarError(res, err); }
};

export const getDiario = async (req, res) => {
  try {
    const data = await bienestarService.obtenerEntradaDiario(req.params.id, req.usuario.id);
    if (!data) return res.status(404).json({ error: "Entrada no encontrada" });
    res.json(data);
  } catch (err) { manejarError(res, err); }
};

export const updateDiario = async (req, res) => {
  try {
    const data = await bienestarService.actualizarEntradaDiario(req.params.id, req.usuario.id, req.body);
    if (!data) return res.status(404).json({ error: "Entrada no encontrada" });
    res.json(data);
  } catch (err) { manejarError(res, err); }
};

export const deleteDiario = async (req, res) => {
  try {
    const ok = await bienestarService.eliminarEntradaDiario(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ error: "Entrada no encontrada" });
    res.status(204).send();
  } catch (err) { manejarError(res, err); }
};

export const getDiarioAleatorio = async (req, res) => {
  try {
    const data = await bienestarService.obtenerEntradaDiarioAleatoria(req.usuario.id);
    if (!data) return res.status(404).json({ error: "No hay entradas en el diario" });
    res.json(data);
  } catch (err) { manejarError(res, err); }
};

export const getInsights = async (req, res) => {
  try {
    const data = await bienestarService.obtenerInsights(req.usuario.id);
    res.json(data);
  } catch (err) { manejarError(res, err); }
};

export const programarPausa = async (req, res) => {
  try {
    const data = await bienestarService.programarPausaActiva(req.usuario.id, req.body);
    res.status(201).json(data);
  } catch (err) { manejarError(res, err); }
};

export const listEjercicios = async (_req, res) => {
  res.json(bienestarService.listarEjercicios());
};

export const completarPausa = async (req, res) => {
  try {
    const data = await bienestarService.completarPausaActiva(req.body.id, req.usuario.id);
    if (!data) return res.status(404).json({ error: "Pausa no encontrada" });
    res.json(data);
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
  res.status(statusCode).json(estado);
};
