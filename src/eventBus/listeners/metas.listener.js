import eventBus from '../index.js';
import { EVENTS } from '../events.js';
import * as metasService from '../../modules/metas/metas.service.js';

eventBus.on(EVENTS.TASK_DONE, async ({ usuarioId, tarea }) => {
  try {
    await metasService.procesarTareaDone(usuarioId, tarea);
  } catch (err) {
    console.error('[EventBus-Metas] Error en TASK_DONE:', err.message);
  }
});
