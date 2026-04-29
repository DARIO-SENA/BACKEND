export const imprimirRutas = () => {
  console.log('\n🚀 ENDPOINTS ACTIVOS:\n');

  console.log('🔐 AUTH');
  console.log('POST   /api/auth/register');
  console.log('POST   /api/auth/login\n');

  console.log('📋 TAREAS');
  console.log('GET    /api/tareas');
  console.log('POST   /api/tareas');
  console.log('PUT    /api/tareas/:id');
  console.log('DELETE /api/tareas/:id\n');

  console.log('📚 HÁBITOS');
  console.log('GET    /api/habitos');
  console.log('POST   /api/habitos');
  console.log('PUT    /api/habitos/:id');
  console.log('DELETE /api/habitos/:id\n');

  console.log('📅 AGENDA');
  console.log('GET    /api/agenda');
  console.log('POST   /api/agenda');
  console.log('PUT    /api/agenda/:id');
  console.log('DELETE /api/agenda/:id\n');

  console.log('📊 ANALYTICS');
  console.log('GET    /api/analytics\n');
  console.log('GET    /api/analytics/dashboard');
  console.log('GET    /api/analytics/semanal');
  console.log('GET    /api/analytics/por-dia');
  console.log('GET    /api/analytics/categorias');
  console.log('GET    /api/analytics/racha');
  console.log('POST   /api/analytics/progreso\n');

  
  console.log('----------------------------------\n');
};