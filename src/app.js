import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { authRouter }    from './routes/auth.routes.js';
import { habitosRouter } from './routes/habitos.routes.js';
import { tareasRouter }  from './routes/tareas.routes.js';
import { agendaRouter }  from './routes/agenda.routes.js';
import { recordatoriosRouter } from './routes/recordatorios.routes.js';
import { iniciarScheduler } from './services/jobs/scheduler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',    authRouter);
app.use('/api/habitos', habitosRouter);
app.use('/api/tareas',  tareasRouter);
app.use('/api/agenda',  agendaRouter);
app.use('/api/recordatorios', recordatoriosRouter);

app.get('/', (_req, res) => {
  res.json({ ok: true, mensaje: 'API DARIO funcionando' });
});

app.use((req, res) => {
  console.log("Ruta no encontrada:", req.method, req.url);
  res.status(404).json({ error: "Ruta no encontrada" });
});



export { app };