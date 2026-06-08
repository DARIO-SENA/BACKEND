import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { tool } from 'langchain/tools';
import { LLM_MODEL } from '../../config/openai.js';
import * as tareasService from '../tareas/tareas.service.js';
import * as analyticsService from '../analytics/analytics.service.js';
import * as gamificacionService from '../gamificacion/gamificacion.service.js';
import * as gymService from '../gym/gym.service.js';
import * as habitosService from '../habitos/habitos.service.js';
import pool from '../../config/db.js';

const crearTools = (usuarioId) => [
  tool(
    async () => JSON.stringify(await tareasService.obtenerEstadisticas(usuarioId)),
    {
      name: 'get_task_stats',
      description: 'Obtiene estadisticas de tareas del usuario (pendientes, completadas, vencidas)',
    }
  ),
  tool(
    async () => JSON.stringify(await analyticsService.obtenerRacha(usuarioId)),
    {
      name: 'get_habit_streak',
      description: 'Obtiene la racha actual y mejor racha del usuario',
    }
  ),
  tool(
    async () => JSON.stringify(await gymService.obtenerEstadisticas(usuarioId)),
    {
      name: 'get_gym_stats',
      description: 'Obtiene estadisticas de entrenamiento del usuario',
    }
  ),
  tool(
    async () => JSON.stringify(await gamificacionService.obtenerPerfil(usuarioId)),
    {
      name: 'get_gamification_profile',
      description: 'Obtiene el perfil de gamificacion (nivel, XP, puntos, racha, logros)',
    }
  ),
  tool(
    async () => {
      const hoy = new Date().toISOString().split('T')[0];
      return JSON.stringify(await tareasService.obtenerAgendaDia(usuarioId, hoy));
    },
    {
      name: 'get_agenda_today',
      description: 'Obtiene la agenda del dia de hoy del usuario',
    }
  ),
  tool(
    async () => JSON.stringify(await analyticsService.generarReporte(usuarioId)),
    {
      name: 'get_weekly_report',
      description: 'Obtiene el reporte semanal completo del usuario',
    }
  ),
  tool(
    async (input) => {
      const datos = JSON.parse(input);
      return JSON.stringify(await tareasService.crearTarea(usuarioId, datos));
    },
    {
      name: 'create_task',
      description: 'Crea una nueva tarea. Input: JSON con titulo, descripcion, prioridad (alta/media/baja), fecha_limite',
    }
  ),
  tool(
    async () => JSON.stringify(await habitosService.listarHabitos(usuarioId)),
    {
      name: 'get_habits',
      description: 'Lista todos los habitos del usuario',
    }
  ),
  tool(
    async () => JSON.stringify(await gamificacionService.obtenerLeaderboard(usuarioId, 'total', 10)),
    {
      name: 'get_leaderboard',
      description: 'Obtiene el top 10 del leaderboard de gamificacion',
    }
  ),
  tool(
    async () => {
      const { rows } = await pool.query('SELECT id, nombre, email FROM usuarios WHERE id = $1', [usuarioId]);
      return JSON.stringify(rows[0]);
    },
    {
      name: 'get_user_info',
      description: 'Obtiene informacion basica del usuario (nombre, email)',
    }
  ),
];

export const crearAgente = async (usuarioId, mensaje, historial = []) => {
  const model = new ChatOpenAI({
    model: LLM_MODEL,
    temperature: 0.3,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const tools = crearTools(usuarioId);

  const agent = createReactAgent({ llm: model, tools });

  const result = await agent.invoke({
    messages: [
      ...historial,
      { role: 'human', content: mensaje },
    ],
  });

  const ultimoMensaje = result.messages[result.messages.length - 1];
  const herramientas = new Set();
  for (const m of result.messages) {
    if (m.tool_calls) {
      for (const tc of m.tool_calls) {
        herramientas.add(tc.name);
      }
    }
  }
  return {
    respuesta: ultimoMensaje.content,
    herramientas_usadas: [...herramientas],
  };
};
