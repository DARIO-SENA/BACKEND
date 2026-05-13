import pool from "../src/config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  console.log("🌱 Iniciando seed...");

  const schema = fs.readFileSync(
    path.join(__dirname, "..", "database", "schema.sql"),
    "utf8"
  );
  await pool.query(schema);
  console.log("✅ Schema aplicado");

  await pool.query("DELETE FROM analisis_ia");
  await pool.query("DELETE FROM pausas_activas");
  await pool.query("DELETE FROM diario_personal");
  await pool.query("DELETE FROM checkins_emocionales");
  await pool.query("DELETE FROM bloques_tiempo");

  const usuario_id = 1;

  const checkins = [
    { estado_animo: "feliz", energia: 8, sueno_horas: 7.5 },
    { estado_animo: "energético", energia: 9, sueno_horas: 8.0 },
    { estado_animo: "cansado", energia: 4, sueno_horas: 5.5 },
    { estado_animo: "neutral", energia: 6, sueno_horas: 6.0 },
    { estado_animo: "feliz", energia: 8, sueno_horas: 7.0 },
    { estado_animo: "estresado", energia: 3, sueno_horas: 4.5 },
    { estado_animo: "motivado", energia: 7, sueno_horas: 6.5 },
    { estado_animo: "triste", energia: 3, sueno_horas: 5.0 },
    { estado_animo: "feliz", energia: 9, sueno_horas: 8.0 },
    { estado_animo: "neutral", energia: 5, sueno_horas: 6.5 },
  ];
  for (let i = 0; i < checkins.length; i++) {
    const c = checkins[i];
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - (checkins.length - i));
    await pool.query(
      `INSERT INTO checkins_emocionales (usuario_id, fecha, estado_animo, energia, sueno_horas)
       VALUES ($1, $2::date, $3, $4, $5)`,
      [usuario_id, fecha.toISOString().split("T")[0], c.estado_animo, c.energia, c.sueno_horas]
    );
  }
  console.log(`✅ ${checkins.length} check-ins creados`);

  const entradasDiario = [
    { titulo: "Primer día", contenido: "Hoy fue un gran día, logré completar todas mis tareas." },
    { titulo: "Reflexión", contenido: "Necesito mejorar mi gestión del tiempo." },
    { titulo: "Logro", contenido: "Terminé el módulo de estadísticas." },
    { titulo: "Día difícil", contenido: "Tuve problemas con el despliegue." },
    { titulo: "Meta cumplida", contenido: "Corrí 5km sin parar." },
  ];
  for (const e of entradasDiario) {
    await pool.query(
      `INSERT INTO diario_personal (usuario_id, titulo, contenido, etiquetas) VALUES ($1, $2, $3, $4)`,
      [usuario_id, e.titulo, e.contenido, ["general"]]
    );
  }
  console.log(`✅ ${entradasDiario.length} entradas de diario creadas`);

  const bloques = [
    { titulo: "Bloque mañana", hora_inicio: "08:00", hora_fin: "10:00", dias: [1, 2, 3, 4, 5] },
    { titulo: "Bloque tarde", hora_inicio: "14:00", hora_fin: "16:00", dias: [1, 2, 3, 4, 5] },
  ];
  for (const b of bloques) {
    await pool.query(
      `INSERT INTO bloques_tiempo (usuario_id, titulo, hora_inicio, hora_fin, dias_semana)
       VALUES ($1, $2, $3, $4, $5)`,
      [usuario_id, b.titulo, b.hora_inicio, b.hora_fin, b.dias]
    );
  }
  console.log(`✅ ${bloques.length} bloques de tiempo creados`);

  console.log("🎉 Seed completado exitosamente");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});
