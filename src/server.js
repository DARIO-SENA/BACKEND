import 'dotenv/config';

import { app } from "./app.js";
import './services/jobs/reminder.processor.js';

const PORT = process.env.PORT || 3000;

import { imprimirRutas } from './utils/routes.logger.js';

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  imprimirRutas();
});

