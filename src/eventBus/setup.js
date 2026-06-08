import logger from '../config/logger.js';

logger.info('[EventBus] Inicializando listeners...');

import './listeners/gamificacion.listener.js';
import './listeners/metas.listener.js';

logger.info('[EventBus] Listeners cargados correctamente');
