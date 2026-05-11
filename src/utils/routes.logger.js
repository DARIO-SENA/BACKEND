export const imprimirRutas = () => {
  console.log('\n🚀 ENDPOINTS ACTIVOS:\n');

  console.log('🔐 AUTH');
  console.log('POST   /api/auth/register');
  console.log('POST   /api/auth/login\n');

  console.log('📋 TAREAS');
  console.log('GET    /api/tareas');
  console.log('GET    /api/tareas/:id');
  console.log('POST   /api/tareas');
  console.log('PUT    /api/tareas/:id');
  console.log('PATCH  /api/tareas/:id/estado');
  console.log('DELETE /api/tareas/:id\n');

  console.log('📚 HÁBITOS');
  console.log('GET    /api/habitos');
  console.log('POST   /api/habitos');
  console.log('PUT    /api/habitos/:id');
  console.log('DELETE /api/habitos/:id\n');

  console.log('📅 AGENDA');
  console.log('GET    /api/agenda/dia');
  console.log('GET    /api/agenda/estadisticas');
  console.log('GET    /api/agenda/categorias');
  console.log('POST   /api/agenda/categorias');
  console.log('DELETE /api/agenda/categorias/:id\n');

  console.log('🔔 RECORDATORIOS');
  console.log('GET    /api/recordatorios');
  console.log('GET    /api/recordatorios/:id');
  console.log('POST   /api/recordatorios');
  console.log('PUT    /api/recordatorios/:id');
  console.log('DELETE /api/recordatorios/:id\n');

  console.log('🔔 NOTIFICACIONES');
  console.log('GET    /api/recordatorios/notificaciones');
  console.log('PUT    /api/recordatorios/notificaciones/:id/leer');
  console.log('PUT    /api/recordatorios/notificaciones/leer-todo\n');

  console.log('⚙️  PREFERENCIAS');
  console.log('GET    /api/recordatorios/preferencias');
  console.log('PUT    /api/recordatorios/preferencias\n');

  console.log('📊 ANALYTICS');
  console.log('GET    /api/analytics/estadisticas');
  console.log('GET    /api/analytics/habitos\n');

  console.log('🏋️ GYM');
  console.log('GET    /api/gym/ejercicios');
  console.log('POST   /api/gym/ejercicios');
  console.log('PUT    /api/gym/ejercicios/:id');
  console.log('DELETE /api/gym/ejercicios/:id\n');

  console.log('\n👥 SOCIAL');
  console.log('POST   /api/social/amigos/solicitud');
  console.log('GET    /api/social/amigos');
  console.log('GET    /api/social/amigos/solicitudes');
  console.log('PATCH  /api/social/amigos/solicitud/:id');
  console.log('DELETE /api/social/amigos/:amigoId\n');

  console.log('🏗️ PROYECTOS');
  console.log('POST   /api/social/proyectos');
  console.log('GET    /api/social/proyectos');
  console.log('GET    /api/social/proyectos/:id');
  console.log('POST   /api/social/proyectos/:id/miembros');
  console.log('DELETE /api/social/proyectos/:id/miembros/:usuarioId\n');

  console.log('📋 TAREAS COMPARTIDAS');
  console.log('POST   /api/social/proyectos/:proyectoId/tareas');
  console.log('GET    /api/social/proyectos/:proyectoId/tareas');
  console.log('PUT    /api/social/proyectos/:proyectoId/tareas/:tareaId\n');

  console.log('💬 COMENTARIOS');
  console.log('POST   /api/social/tareas/:tareaId/comentarios');
  console.log('GET    /api/social/tareas/:tareaId/comentarios');
  console.log('DELETE /api/social/tareas/:tareaId/comentarios/:comentarioId\n');

  console.log('🎮 GAMIFICACIÓN');
  console.log('GET    /api/gamificacion/perfil');
  console.log('GET    /api/gamificacion/logros');
  console.log('GET    /api/gamificacion/leaderboard?tipo=total|semanal|mensual&limite=10');
  console.log('GET    /api/gamificacion/historial?limite=20');

  console.log('POST   /api/gamificacion/tarea-completada');
  console.log('POST   /api/gamificacion/habito-completado\n');

  console.log('----------------------------------\n');
};