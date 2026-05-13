import { Router } from "express";
import { verificarToken } from "../../middlewares/auth.middleware.js";
import {
  createCheckin,
  getCheckinHoy,
  getHistorial,
  updateCheckinHoy,
  getEstadisticas,
  createDiario,
  listDiario,
  getDiario,
  updateDiario,
  deleteDiario,
  getDiarioAleatorio,
  getInsights,
  programarPausa,
  listEjercicios,
  completarPausa,
  healthCheck,
} from "./controller.js";

const router = Router();

router.use(verificarToken);

router.post("/checkin", createCheckin);
router.get("/checkin/hoy", getCheckinHoy);
router.get("/checkin/historial", getHistorial);
router.put("/checkin/hoy", updateCheckinHoy);
router.get("/estadisticas", getEstadisticas);
router.post("/diario", createDiario);
router.get("/diario", listDiario);
router.get("/diario/aleatorio", getDiarioAleatorio);
router.get("/diario/:id", getDiario);
router.put("/diario/:id", updateDiario);
router.delete("/diario/:id", deleteDiario);
router.get("/insights", getInsights);
router.post("/pausa/programar", programarPausa);
router.get("/pausa/ejercicios", listEjercicios);
router.post("/pausa/completar", completarPausa);

export { router as bienestarRouter };
