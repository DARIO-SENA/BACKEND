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

  console.log('----------------------------------\n');
};