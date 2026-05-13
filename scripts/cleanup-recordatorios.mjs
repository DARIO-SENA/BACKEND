import 'dotenv/config';
import { colaRecordatorios } from '../src/modules/recordatorios/jobs/queue.js';
import pool from '../src/config/db.js';

const limpiar = async () => {
  try {
    console.log('⚠️  Eliminando TODOS los recordatorios pendientes...');
    const { rowCount } = await pool.query(
      "DELETE FROM recordatorios WHERE estado = 'pendiente'"
    );
    console.log(`🗑️  ${rowCount} recordatorio(s) pendiente(s) eliminados de la BD`);

    await colaRecordatorios.drain();
    console.log('🧹 Cola BullMQ drenada');

    await pool.end();
    console.log('✅ Listo');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

limpiar();
