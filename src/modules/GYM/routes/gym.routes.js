// modulos/GYM/routes/gym.routes.js
import { Router } from 'express';
import { verificarToken } from '../../../middlewares/auth.middleware.js';
import {
  crearRutina,
  listarRutinas,
  obtenerRutina,
  actualizarRutina,
  eliminarRutina,
  crearEjercicio,
  listarEjercicios,
  eliminarEjercicio,
  registrarEntrenamiento,
  listarHistorial,
  verProgresion,
} from '../controller/gym.controller.js';

export const gymRouter = Router();

// Todas las rutas requieren token
gymRouter.use(verificarToken);

// ── Rutinas ──────────────────────────────────
gymRouter.post('/rutinas',         crearRutina);
gymRouter.get('/rutinas',          listarRutinas);
gymRouter.get('/rutinas/:id',      obtenerRutina);
gymRouter.put('/rutinas/:id',      actualizarRutina);
gymRouter.delete('/rutinas/:id',   eliminarRutina);

// ── Ejercicios ───────────────────────────────
gymRouter.post('/ejercicios',            crearEjercicio);
gymRouter.get('/ejercicios/:rutinaId',   listarEjercicios);
gymRouter.delete('/ejercicios/:id',      eliminarEjercicio);

// ── Entrenamientos ───────────────────────────
gymRouter.post('/registros',   registrarEntrenamiento);
gymRouter.get('/historial',    listarHistorial);

// ── Progresión ───────────────────────────────
gymRouter.get('/progresion/:ejercicioId', verProgresion);