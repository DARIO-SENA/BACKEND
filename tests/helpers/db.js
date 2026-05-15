import pool from "../../src/config/db.js";

const tablasPorOrden = [
  "series_entrenamiento", "registros_entrenamiento", "ejercicios", "rutinas",
  "pausas_activas", "checkins_emocionales", "diario_personal",
  "analisis_ia", "conversaciones_ia", "sugerencias_ia",
  "notificaciones", "eventos_gamificacion", "historial_puntos",
  "logros_usuario", "logros",
  "comentarios", "amistades", "tareas_compartidas",
  "proyecto_miembros", "proyectos",
  "bloques_tiempo",
  "finanzas_transacciones", "finanzas_presupuestos", "finanzas_metas",
  "finanzas_deudas", "finanzas_cuentas", "finanzas_categorias",
  "categorias", "tareas",
  "habitos", "registros_habitos",
  "preferencias_notificacion", "recordatorios",
  "pomodoro_sessions", "pomodoro_settings",
  "perfil_gamificacion",
  "progreso",
  "usuarios",
];

export async function limpiarTablas() {
  for (const tabla of tablasPorOrden) {
    await pool.query(`DELETE FROM ${tabla}`);
  }
}

export async function ejecutarEnTransaccion(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await fn(client);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}
