import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit
} from "../controllers/habits.controller.js";

const router = Router();

// Crear hábito
router.post("/", verifyToken, createHabit);

// Obtener hábitos del usuario
router.get("/", verifyToken, getHabits);

// Actualizar hábito
router.put("/:id", verifyToken, updateHabit);

// Eliminar hábito
router.delete("/:id", verifyToken, deleteHabit);

export default router;