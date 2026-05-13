import eventBus from '../index.js'
import { EVENTS } from '../events.js';
import * as gamificacionService from '../../modules/gamificacion/gamificacion.service.js';

eventBus.on(EVENTS.HABIT_COMPLETED, async ({ usuarioId, habitoId }) => {
  try {
    await gamificacionService.procesarHabitoCompletado(usuarioId, habitoId);
  } catch (err) {
    console.error(`[EventBus] Error en HABIT_COMPLETED:`, err.message);
  }
});

eventBus.on(EVENTS.TASK_DONE, async ({ usuarioId, tarea }) => {
  try {
    await gamificacionService.procesarTareaCompletada(usuarioId, tarea);
  } catch (err) {
    console.error(`[EventBus] Error en TASK_DONE:`, err.message);
  }
});

eventBus.on(EVENTS.FOCUS_SESSION_COMPLETED, async ({ usuarioId }) => {
  try {
    await gamificacionService.procesarFocoCompletado(usuarioId);
  } catch (err) {
    console.error(`[EventBus] Error en FOCUS_SESSION_COMPLETED:`, err.message);
  }
});
