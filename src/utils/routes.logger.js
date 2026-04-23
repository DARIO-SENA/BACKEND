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
  console.log('no probada');


  console.log('----------------------------------\n');
};