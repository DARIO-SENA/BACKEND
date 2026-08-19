import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { tool } from 'langchain/tools';
import { LLM_MODEL } from '../../config/openai.js';
import * as tareasService from '../tareas/tareas.service.js';
import * as analyticsService from '../analytics/analytics.service.js';
import * as gamificacionService from '../gamificacion/gamificacion.service.js';
import * as gymService from '../gym/gym.service.js';
import * as habitosService from '../habitos/habitos.service.js';
import * as metasService from '../metas/metas.service.js';
import * as bienestarService from '../bienestar/bienestar.service.js';
import pool from '../../config/db.js';

const crearTools = (usuarioId) => [
  // ─── TAREAS ─────────────────────────────────────
  tool(
    async () => JSON.stringify(await tareasService.obtenerEstadisticas(usuarioId)),
    {
      name: 'get_task_stats',
      description: 'Obtiene estadisticas de tareas del usuario (pendientes, completadas, vencidas)',
    }
  ),
  tool(
    async (input) => {
      const id = JSON.parse(input).id;
      return JSON.stringify(await tareasService.obtenerTareaPorId(id, usuarioId) || { error: 'No encontrada' });
    },
    {
      name: 'get_task_by_id',
      description: 'Obtiene una tarea especifica por su ID. Input: {"id": number}',
    }
  ),
  tool(
    async (input) => {
      const datos = JSON.parse(input);
      return JSON.stringify(await tareasService.crearTarea(usuarioId, datos));
    },
    {
      name: 'create_task',
      description: 'Crea una nueva tarea. Input: JSON con titulo, descripcion, prioridad (alta/media/baja), fecha_limite (ISO), duracion_minutos, categoria_id',
    }
  ),
  tool(
    async (input) => {
      const { id, ...datos } = JSON.parse(input);
      return JSON.stringify(await tareasService.actualizarTarea(id, usuarioId, datos) || { error: 'No encontrada' });
    },
    {
      name: 'update_task',
      description: 'Actualiza una tarea existente. Input: JSON con id, y campos a actualizar (titulo, descripcion, estado, prioridad, fecha_limite)',
    }
  ),
  tool(
    async (input) => {
      const id = JSON.parse(input).id;
      await tareasService.eliminarTarea(id, usuarioId);
      return JSON.stringify({ ok: true });
    },
    {
      name: 'delete_task',
      description: 'Elimina una tarea por su ID. Input: {"id": number}',
    }
  ),
  tool(
    async () => {
      const hoy = new Date().toISOString().split('T')[0];
      return JSON.stringify(await tareasService.obtenerAgendaDia(usuarioId, hoy));
    },
    {
      name: 'get_agenda_today',
      description: 'Obtiene la agenda del dia de hoy del usuario (tareas programadas)',
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
    async () => JSON.stringify(await analyticsService.obtenerRacha(usuarioId)),
    {
      name: 'get_habit_streak',
      description: 'Obtiene la racha actual y mejor racha del usuario',
    }
  ),

  // ─── HABITOS ────────────────────────────────────
  tool(
    async () => JSON.stringify(await habitosService.listarHabitos(usuarioId)),
    {
      name: 'get_habits',
      description: 'Lista todos los habitos del usuario con su frecuencia y estado',
    }
  ),
  tool(
    async (input) => {
      const datos = JSON.parse(input);
      return JSON.stringify(await habitosService.crearHabito(usuarioId, datos));
    },
    {
      name: 'create_habit',
      description: 'Crea un nuevo habito. Input: JSON con titulo, descripcion, frecuencia (diario/semanal/mensual)',
    }
  ),
  tool(
    async (input) => {
      const { id, completado } = JSON.parse(input);
      const estado = completado !== false ? 'completada' : 'pendiente';
      return JSON.stringify(await habitosService.cambiarEstadoHabito(id, usuarioId, estado) || { error: 'No encontrado' });
    },
    {
      name: 'toggle_habit',
      description: 'Marca o desmarca un habito como completado hoy. Input: {"id": number, "completado": boolean (true=marcar, false=desmarcar)}',
    }
  ),

  // ─── GIMNASIO ───────────────────────────────────
  tool(
    async () => JSON.stringify(await gymService.obtenerEstadisticas(usuarioId)),
    {
      name: 'get_gym_stats',
      description: 'Obtiene estadisticas de entrenamiento del usuario',
    }
  ),
  tool(
    async () => JSON.stringify(await gymService.listarRutinas(usuarioId)),
    {
      name: 'get_gym_routines',
      description: 'Lista todas las rutinas de entrenamiento del usuario',
    }
  ),
  tool(
    async () => JSON.stringify(await gymService.listarBibliotecaEjercicios(usuarioId)),
    {
      name: 'get_exercise_library',
      description: 'Lista todos los ejercicios en la biblioteca del usuario',
    }
  ),
  tool(
    async (input) => {
      const datos = JSON.parse(input);
      return JSON.stringify(await gymService.crearRutina(usuarioId, datos));
    },
    {
      name: 'create_workout_routine',
      description: 'Crea una nueva rutina de entrenamiento. Input: JSON con nombre, descripcion, dificultad (principiante/intermedio/avanzado), dias_semana (array 1-7)',
    }
  ),
  tool(
    async (input) => {
      const body = JSON.parse(input);
      return JSON.stringify(await gymService.completarSesion(usuarioId, body));
    },
    {
      name: 'log_workout_session',
      description: 'Guarda una sesion de entrenamiento completa con multiples ejercicios. Input: JSON con rutina_id (opcional), fecha (YYYY-MM-DD, opcional), duracion_minutos (opcional), ejercicios (array de { ejercicio_id, series: [{ numero_serie, repeticiones, peso_kg }] })',
    }
  ),

  // ─── METAS / OKRs ───────────────────────────────
  tool(
    async () => JSON.stringify(await metasService.obtenerMetas(usuarioId)),
    {
      name: 'get_goals',
      description: 'Obtiene todas las metas/OKRs del usuario con sus Key Results',
    }
  ),
  tool(
    async (input) => {
      const datos = JSON.parse(input);
      return JSON.stringify(await metasService.crearMeta(usuarioId, datos));
    },
    {
      name: 'create_goal',
      description: 'Crea una nueva meta/OKR. Input: JSON con titulo, descripcion, categoria (personal/profesional/salud), fecha_fin (ISO)',
    }
  ),
  tool(
    async (input) => {
      const { metaId, titulo } = JSON.parse(input);
      return JSON.stringify(await metasService.crearKeyResult(metaId, usuarioId, { titulo }));
    },
    {
      name: 'create_key_result',
      description: 'Crea un Key Result para una meta. Input: {"metaId": number, "titulo": "string"}',
    }
  ),

  // ─── BIENESTAR ──────────────────────────────────
  tool(
    async () => JSON.stringify(await bienestarService.obtenerCheckinHoy(usuarioId) || { mensaje: 'No hay checkin hoy' }),
    {
      name: 'get_mood_today',
      description: 'Obtiene el check-in emocional de hoy del usuario',
    }
  ),
  tool(
    async (input) => {
      const datos = JSON.parse(input);
      return JSON.stringify(await bienestarService.crearCheckin(usuarioId, { estado_animo: datos.estado_animo, notas: datos.notas || '', energia: datos.energia || null, sueno_horas: datos.sueno_horas || null }));
    },
    {
      name: 'save_mood',
      description: 'Guarda el estado de animo del usuario. Input: {"estado_animo": "muy_bien"|"bien"|"neutral"|"mal"|"muy_mal", "notas": "string" (opcional), "energia": 1-10 (opcional), "sueno_horas": number (opcional)}',
    }
  ),

  // ─── POMODORO ───────────────────────────────────
  tool(
    async () => {
      const { rows } = await pool.query(
        'SELECT COUNT(*) AS total, COALESCE(SUM(duracion_minutos), 0) AS total_minutos FROM pomodoro_sessions WHERE usuario_id = $1',
        [usuarioId]
      );
      return JSON.stringify(rows[0]);
    },
    {
      name: 'get_pomodoro_stats',
      description: 'Obtiene estadisticas de sesiones pomodoro del usuario',
    }
  ),

  // ─── LECTURA ────────────────────────────────────
  tool(
    async () => {
      const { rows } = await pool.query(
        'SELECT COUNT(*) AS total_libros, COALESCE(SUM(paginas_leidas), 0) AS paginas, COALESCE(SUM(minutos_lectura), 0) AS minutos FROM lectura_progreso WHERE usuario_id = $1',
        [usuarioId]
      );
      return JSON.stringify(rows[0] || { total_libros: 0, paginas: 0, minutos: 0 });
    },
    {
      name: 'get_reading_stats',
      description: 'Obtiene estadisticas de lectura del usuario (libros, paginas, minutos)',
    }
  ),

  // ─── FINANZAS ───────────────────────────────────
  tool(
    async () => {
      const { rows } = await pool.query(
        `SELECT COUNT(*) AS total_transacciones,
                COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) AS ingresos,
                COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END), 0) AS gastos
         FROM finanzas_transacciones WHERE usuario_id = $1`,
        [usuarioId]
      );
      return JSON.stringify(rows[0]);
    },
    {
      name: 'get_finance_summary',
      description: 'Obtiene resumen financiero del usuario (transacciones, ingresos, gastos)',
    }
  ),

  // ─── GAMIFICACION ───────────────────────────────
  tool(
    async () => JSON.stringify(await gamificacionService.obtenerPerfil(usuarioId)),
    {
      name: 'get_gamification_profile',
      description: 'Obtiene el perfil de gamificacion (nivel, XP, puntos, racha, logros)',
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
    async () => JSON.stringify(await gamificacionService.obtenerLogrosUsuario(usuarioId)),
    {
      name: 'get_achievements',
      description: 'Obtiene la lista de logros/achievements del usuario',
    }
  ),

  // ─── USUARIO ────────────────────────────────────
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
