import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger.js';
import { authRouter }          from './modules/auth/auth.routes.js';
import { habitosRouter }       from './modules/habitos/habitos.routes.js';
import { tareasRouter }        from './modules/tareas/tareas.routes.js';
import { agendaRouter }        from './modules/agenda/agenda.routes.js';
import { recordatoriosRouter } from './modules/recordatorios/recordatorios.routes.js';
import { analyticsRouter } from './modules/analytics/analytics.routes.js';
import { gymRouter } from './modules/GYM/gym.routes.js';
import { socialRouter } from './modules/social/social.routes.js';
import { gamificacionRouter } from './modules/gamificacion/gamificacion.routes.js';

const app = express();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter, authRouter);
authRouter.prefix = '/api/auth';
app.use('/api/habitos',       habitosRouter);
habitosRouter.prefix = '/api/habitos';
app.use('/api/tareas',        tareasRouter);
tareasRouter.prefix = '/api/tareas';
app.use('/api/agenda',        agendaRouter);
agendaRouter.prefix = '/api/agenda';
app.use('/api/recordatorios', recordatoriosRouter);
recordatoriosRouter.prefix = '/api/recordatorios';
app.use('/api/analytics',     analyticsRouter);
analyticsRouter.prefix = '/api/analytics';
app.use('/api/gym',           gymRouter);
gymRouter.prefix = '/api/gym';
app.use('/api/social',        socialRouter);
socialRouter.prefix = '/api/social';
app.use('/api/gamificacion', gamificacionRouter);
gamificacionRouter.prefix = '/api/gamificacion';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (_req, res) => {
  res.json({ ok: true, mensaje: 'API DARIO funcionando' });
});

export { app };
