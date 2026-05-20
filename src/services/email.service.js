import pool from '../config/db.js';
import { enviarEmail, emailConfigurado } from '../config/email.js';

const generarTemplateSemanal = (data) => {
  const { nombre, tareas_completadas, tareas_totales, habitos_completados, habitos_totales, puntos, racha, fecha_inicio, fecha_fin } = data;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body { font-family: 'Inter', Arial, sans-serif; background: #0a0a0a; color: #e0e0e0; padding: 0; margin: 0; }
.container { max-width: 560px; margin: 0 auto; padding: 32px 24px; }
.header { text-align: center; padding: 32px 0; }
.header h1 { color: #b06ef3; font-size: 24px; margin: 0; }
.header p { color: #666; font-size: 14px; margin-top: 8px; }
.card { background: #141414; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); padding: 24px; margin-bottom: 16px; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stat { background: rgba(255,255,255,0.03); border-radius: 8px; padding: 16px; text-align: center; }
.stat-value { font-size: 28px; font-weight: 700; color: #fff; }
.stat-label { font-size: 12px; color: #888; margin-top: 4px; }
.footer { text-align: center; padding: 24px 0; font-size: 12px; color: #555; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>DARIO</h1>
    <p>Tu resumen semanal de productividad</p>
  </div>
  <div class="card">
    <p style="font-size: 16px; margin: 0 0 16px 0;">Hola <strong>${nombre}</strong>,</p>
    <p style="font-size: 13px; color: #888; margin: 0 0 4px 0;">${fecha_inicio} - ${fecha_fin}</p>
  </div>
  <div class="card">
    <div class="stats">
      <div class="stat"><div class="stat-value">${tareas_completadas}/${tareas_totales}</div><div class="stat-label">Tareas Completadas</div></div>
      <div class="stat"><div class="stat-value">${habitos_completados}/${habitos_totales}</div><div class="stat-label">Hábitos Cumplidos</div></div>
      <div class="stat"><div class="stat-value">${puntos}</div><div class="stat-label">Puntos Ganados</div></div>
      <div class="stat"><div class="stat-value">${racha}</div><div class="stat-label">Racha Actual (días)</div></div>
    </div>
  </div>
  <div class="card" style="text-align: center;">
    <p style="font-size: 13px; color: #888;">Sigue así y alcanzarás todas tus metas. ¡La constancia es la clave!</p>
  </div>
  <div class="footer">
    <p>DARIO — Tu asistente de productividad personal</p>
    <p>Si no deseas recibir estos correos, desactívalo en tu perfil de DARIO.</p>
  </div>
</div>
</body>
</html>`;
};

export const generarResumenSemanal = async (usuarioId) => {
  const [usuario, stats, perfil] = await Promise.all([
    pool.query('SELECT nombre, email FROM usuarios WHERE id = $1', [usuarioId]),
    pool.query(`SELECT
      COUNT(*) FILTER (WHERE estado = 'completada') AS tareas_completadas,
      COUNT(*) AS tareas_totales
      FROM tareas WHERE usuario_id = $1
      AND actualizado_en >= NOW() - INTERVAL '7 days'`, [usuarioId]),
    pool.query(`SELECT
      COUNT(*) FILTER (WHERE completado = true) AS habitos_completados,
      COUNT(*) AS habitos_totales
      FROM habitos WHERE usuario_id = $1`, [usuarioId]),
    pool.query('SELECT puntos_totales, racha_actual FROM perfil_gamificacion WHERE usuario_id = $1', [usuarioId]),
  ]);

  const u = usuario.rows[0];
  const s = stats.rows[0];
  const h = perfil.rows[0] || { puntos_totales: 0, racha_actual: 0 };
  const hab = perfil.rows[0] || { puntos_totales: 0, racha_actual: 0 };

  const hoy = new Date();
  const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - hoy.getDay() + 1);
  const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);

  const data = {
    nombre: u.nombre,
    email: u.email,
    tareas_completadas: parseInt(s?.tareas_completadas || 0),
    tareas_totales: parseInt(s?.tareas_totales || 0),
    habitos_completados: parseInt(hab?.habitos_completados || 0),
    habitos_totales: parseInt(hab?.habitos_totales || 0),
    puntos: parseInt(h?.puntos_totales || 0),
    racha: parseInt(hab?.racha_actual || 0),
    fecha_inicio: lunes.toLocaleDateString('es-BO', { day: 'numeric', month: 'long' }),
    fecha_fin: domingo.toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' }),
  };

  const html = generarTemplateSemanal(data);
  return enviarEmail({ to: data.email, subject: `Tu resumen DARIO - ${data.fecha_inicio} a ${data.fecha_fin}`, html });
};

export const enviarResumenesPendientes = async () => {
  if (!emailConfigurado()) {
    console.log('Email no configurado. Saltando envio de resumenes semanales.');
    return;
  }
  const { rows } = await pool.query(
    `SELECT id FROM usuarios WHERE email_semanal_activo = true`
  );
  for (const r of rows) {
    try {
      await generarResumenSemanal(r.id);
      console.log(`Resumen semanal enviado a usuario ${r.id}`);
    } catch (e) {
      console.error(`Error enviando resumen a usuario ${r.id}:`, e.message);
    }
  }
};
