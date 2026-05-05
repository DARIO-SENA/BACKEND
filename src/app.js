import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { authRouter }          from './modules/auth/auth.routes.js';
import { habitosRouter }       from './modules/habitos/habitos.routes.js';
import { tareasRouter }        from './modules/tareas/tareas.routes.js';
import { agendaRouter }        from './modules/agenda/agenda.routes.js';
import { recordatoriosRouter } from './modules/recordatorios/recordatorios.routes.js';
import { analyticsRouter } from './modules/analytics/analytics.routes.js';
import { gymRouter } from './modules/GYM/gym.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',          authRouter);
app.use('/api/habitos',       habitosRouter);
app.use('/api/tareas',        tareasRouter);
app.use('/api/agenda',        agendaRouter);
app.use('/api/recordatorios', recordatoriosRouter);
app.use('/api/analytics',     analyticsRouter);
app.use('/api/gym',           gymRouter);
app.get('/', (_req, res) => {
  res.json({ ok: true, mensaje: 'API PlanIt funcionando 🚀' });
});

export { app };