const { crearHabitoSchema, actualizarHabitoSchema } = require('./validation/index.js');

try {
  const r = crearHabitoSchema.parse({
    titulo: 'Test habit',
    frecuencia: 'diario',
    categoria: null,
    dias_semana: [],
    hora_programada: null,
  });
  console.log('Crear schema OK:', JSON.stringify(r));
} catch (e) {
  console.error('Crear schema ERROR:', e.message);
}

try {
  const r = actualizarHabitoSchema.parse({
    titulo: 'Updated',
    dias_semana: [0, 2, 4],
    hora_programada: '14:30',
  });
  console.log('Actualizar schema OK:', JSON.stringify(r));
} catch (e) {
  console.error('Actualizar schema ERROR:', e.message);
}
