import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import {
  crearRutina,
  listarRutinas,
  obtenerRutina,
  actualizarRutina,
  eliminarRutina,
  listarRutinasConEstado,
  crearEjercicio,
  listarEjercicios,
  actualizarEjercicio,
  eliminarEjercicio,
  registrarEntrenamiento,
  listarHistorial,
  verProgresion,
  obtenerEstadisticas,
  sugerirPeso,
  completarSesion,
  ultimaSesionEjercicio,
  toggleRutinaGym,
  listarBiblioteca,
  asignarEjercicio,
} from './gym.controller.js';

export const gymRouter = Router();

gymRouter.use(verificarToken);

// ── Rutinas ──────────────────────────────────
gymRouter.post('/rutinas',             crearRutina);
gymRouter.get('/rutinas',              listarRutinas);
gymRouter.get('/rutinas/estado',       listarRutinasConEstado);
gymRouter.get('/rutinas/:id',          obtenerRutina);
gymRouter.put('/rutinas/:id',          actualizarRutina);
gymRouter.delete('/rutinas/:id',       eliminarRutina);

// ── Ejercicios ───────────────────────────────
gymRouter.post('/ejercicios',          crearEjercicio);
gymRouter.get('/ejercicios/:rutinaId', listarEjercicios);
gymRouter.put('/ejercicios/:id',       actualizarEjercicio);
gymRouter.delete('/ejercicios/:id',    eliminarEjercicio);

// ── Entrenamientos ───────────────────────────
gymRouter.post('/registros', registrarEntrenamiento);
gymRouter.get('/historial',  listarHistorial);

// ── Progresión ───────────────────────────────
gymRouter.get('/progresion/:ejercicioId', verProgresion);
// ── Estadísticas ───────────────────────────────
gymRouter.get('/estadisticas', obtenerEstadisticas);
// ── Sugerencia de peso ───────────────────────────────
gymRouter.get('/sugerencias/ejercicio/:ejercicioId', sugerirPeso);
// ── Última sesión ───────────────────────────────
gymRouter.get('/ultima-sesion/:ejercicioId', ultimaSesionEjercicio);
// ── Sesión completa ───────────────────────────────
gymRouter.post('/sesion/completar', completarSesion);
// ── Biblioteca de ejercicios ──────────────────────
gymRouter.get('/biblioteca', listarBiblioteca);
gymRouter.post('/ejercicios/asignar', asignarEjercicio);

// ── Toggle rutina completada ──────────────────────
gymRouter.post('/rutinas/toggle', toggleRutinaGym);