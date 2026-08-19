import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import pool from '../src/config/db.js';
import logger from '../src/config/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIGRATIONS_TABLE = '_migrations';
const FULL_DB_MIGRATION = '001_full_db';

async function isFreshDatabase() {
  try {
    const { rows } = await pool.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios'`
    );
    return rows.length === 0;
  } catch {
    return true;
  }
}

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "${MIGRATIONS_TABLE}" (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

async function isApplied(name) {
  const { rows } = await pool.query(
    `SELECT 1 FROM "${MIGRATIONS_TABLE}" WHERE name = $1`,
    [name]
  );
  return rows.length > 0;
}

async function markApplied(name) {
  await pool.query(
    `INSERT INTO "${MIGRATIONS_TABLE}" (name) VALUES ($1) ON CONFLICT DO NOTHING`,
    [name]
  );
}

async function runSingleMigration(m) {
  if (await isApplied(m.name)) return;

  const sqlPath = join(__dirname, m.file);
  const sql = readFileSync(sqlPath, 'utf-8');

  logger.info(`Migracion ${m.name} — ejecutando...`);
  await pool.query(sql);
  await markApplied(m.name);
  logger.info(`Migracion ${m.name} — aplicada`);
}

export async function runMigrations() {
  logger.info('Ejecutando migraciones de base de datos...');

  try {
    await ensureMigrationsTable();
  } catch (err) {
    logger.error('Error creando tabla de migraciones:', err.message);
    return;
  }

  if (await isFreshDatabase()) {
    logger.info('Base de datos vacia — aplicando esquema completo');
    try {
      await runSingleMigration({ file: 'DARIODB.sql', name: FULL_DB_MIGRATION });
    } catch (err) {
      logger.error(`${FULL_DB_MIGRATION} — ERROR: ${err.message}`);
    }
  } else {
    logger.info('Base de datos existente — omitiendo esquema completo');
  }

  // Tablas dinámicas (rutina, gym, lectura) y migraciones adicionales
  const dynamicMigrations = [
    {
      name: '002_rutina_tables',
      sql: `
        CREATE TABLE IF NOT EXISTS plantillas_rutina (
          id SERIAL PRIMARY KEY,
          usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
          dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
          nombre VARCHAR(200),
          hora_inicio TIME NOT NULL,
          hora_fin TIME NOT NULL,
          tipo VARCHAR(50) DEFAULT 'tarea',
          prioridad VARCHAR(20) DEFAULT 'media',
          creado_en TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS bloques_rutina (
          id SERIAL PRIMARY KEY,
          usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
          fecha DATE NOT NULL,
          nombre VARCHAR(200) NOT NULL,
          hora_inicio TIME NOT NULL,
          hora_fin TIME NOT NULL,
          tipo VARCHAR(50) DEFAULT 'tarea',
          prioridad VARCHAR(20) DEFAULT 'media',
          completado BOOLEAN DEFAULT FALSE,
          creado_en TIMESTAMP DEFAULT NOW()
        );
      `
    },
    {
      name: '003_gym_tables',
      sql: `
        CREATE TABLE IF NOT EXISTS gimnasio_rutinas (
          id SERIAL PRIMARY KEY,
          usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
          nombre VARCHAR(200) NOT NULL,
          descripcion TEXT DEFAULT '',
          dificultad VARCHAR(50) DEFAULT 'principiante',
          activa BOOLEAN DEFAULT TRUE,
          creado_en TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS ejercicios (
          id SERIAL PRIMARY KEY,
          rutina_id INTEGER NOT NULL REFERENCES gimnasio_rutinas(id) ON DELETE CASCADE,
          nombre VARCHAR(200) NOT NULL,
          grupo_muscular VARCHAR(100) DEFAULT '',
          series_default INTEGER DEFAULT 3,
          repeticiones_default INTEGER DEFAULT 10,
          peso DECIMAL(10,2) DEFAULT 0,
          descanso INTEGER DEFAULT 90,
          instrucciones TEXT DEFAULT '',
          orden INTEGER DEFAULT 0,
          creado_en TIMESTAMP DEFAULT NOW()
        );
      `
    },
    {
      name: '004_lectura_tables',
      sql: `
        CREATE TABLE IF NOT EXISTS lectura_libros (
          id SERIAL PRIMARY KEY,
          usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
          titulo VARCHAR(300) NOT NULL,
          autor VARCHAR(200) DEFAULT '',
          paginas_totales INTEGER DEFAULT 0,
          paginas_actuales INTEGER DEFAULT 0,
          estado VARCHAR(50) DEFAULT 'pendiente',
          creado_en TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS lectura_planes (
          id SERIAL PRIMARY KEY,
          usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
          libro_id INTEGER NOT NULL REFERENCES lectura_libros(id) ON DELETE CASCADE,
          paginas_por_dia INTEGER DEFAULT 10,
          dias_semana INTEGER[] DEFAULT '{}',
          activo BOOLEAN DEFAULT TRUE,
          creado_en TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS lectura_registros (
          id SERIAL PRIMARY KEY,
          plan_id INTEGER NOT NULL REFERENCES lectura_planes(id) ON DELETE CASCADE,
          libro_id INTEGER NOT NULL REFERENCES lectura_libros(id) ON DELETE CASCADE,
          fecha DATE NOT NULL DEFAULT CURRENT_DATE,
          paginas_leidas INTEGER DEFAULT 0,
          creado_en TIMESTAMP DEFAULT NOW()
        );
      `
    },
    {
      name: '005_lectura_plan_id_habitos',
      sql: `
        ALTER TABLE habitos
        ADD COLUMN IF NOT EXISTS lectura_plan_id INTEGER REFERENCES lectura_planes(id) ON DELETE SET NULL
      `
    },
    {
      name: '006_usuarios_usuario_telefono',
      sql: `
        ALTER TABLE usuarios
        ADD COLUMN IF NOT EXISTS usuario VARCHAR(50),
        ADD COLUMN IF NOT EXISTS telefono VARCHAR(20)
      `
    },
    {
      name: '007_lectura_mejoras',
      sql: `
        ALTER TABLE lectura_libros
        ADD COLUMN IF NOT EXISTS genero VARCHAR(100) DEFAULT '',
        ADD COLUMN IF NOT EXISTS etiquetas TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS notas TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS citas JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS puntuacion INTEGER DEFAULT 0 CHECK (puntuacion >= 0 AND puntuacion <= 5);

        CREATE TABLE IF NOT EXISTS lectura_metas (
          id SERIAL PRIMARY KEY,
          usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
          tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('libros', 'paginas', 'dias')),
          objetivo INTEGER NOT NULL,
          periodo VARCHAR(20) NOT NULL CHECK (periodo IN ('mensual', 'anual')),
          anio INTEGER NOT NULL,
          mes INTEGER,
          progreso INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    },
    {
      name: '008_rutinas_dias_semana',
      sql: `
        ALTER TABLE rutinas
        ADD COLUMN IF NOT EXISTS dias_semana JSONB DEFAULT '[]'::jsonb;
      `
    },
    {
      name: '009_tareas_dias_semana',
      sql: `
        ALTER TABLE tareas
        ADD COLUMN IF NOT EXISTS dias_semana JSONB DEFAULT '[]'::jsonb;
      `
    },
    {
      name: '010_tareas_icono_categorias_icono',
      sql: `
        ALTER TABLE tareas
        ADD COLUMN IF NOT EXISTS icono VARCHAR(10) DEFAULT '';
        ALTER TABLE categorias
        ADD COLUMN IF NOT EXISTS icono VARCHAR(10) DEFAULT '';
      `
    },
    {
      name: '011_recordatorios_icono_categoria',
      sql: `
        ALTER TABLE recordatorios
        ADD COLUMN IF NOT EXISTS icono VARCHAR(10) DEFAULT '',
        ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL;
      `
    },
    {
      name: '012_gym_tables_actualizado_en',
      sql: `
        ALTER TABLE registros_entrenamiento
        ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE ejercicios
        ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `
    },
    {
      name: '008_lectura_columnas_sync',
      sql: `
        DO $$
        BEGIN
          -- Renombrar paginas_actuales -> paginas_leidas si existe
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lectura_libros' AND column_name='paginas_actuales') THEN
            ALTER TABLE lectura_libros RENAME COLUMN paginas_actuales TO paginas_leidas;
          ELSE
            ALTER TABLE lectura_libros ADD COLUMN IF NOT EXISTS paginas_leidas INTEGER DEFAULT 0;
          END IF;
          -- Asegurar todas las columnas modernas
          ALTER TABLE lectura_libros ADD COLUMN IF NOT EXISTS portada TEXT DEFAULT '';
          ALTER TABLE lectura_libros ADD COLUMN IF NOT EXISTS genero VARCHAR(100) DEFAULT '';
          ALTER TABLE lectura_libros ADD COLUMN IF NOT EXISTS etiquetas TEXT[] DEFAULT '{}';
          ALTER TABLE lectura_libros ADD COLUMN IF NOT EXISTS notas TEXT DEFAULT '';
          ALTER TABLE lectura_libros ADD COLUMN IF NOT EXISTS citas JSONB DEFAULT '[]';
          ALTER TABLE lectura_libros ADD COLUMN IF NOT EXISTS puntuacion INTEGER DEFAULT 0;
          ALTER TABLE lectura_libros ADD COLUMN IF NOT EXISTS fecha_inicio DATE;
          ALTER TABLE lectura_libros ADD COLUMN IF NOT EXISTS fecha_fin DATE;
          ALTER TABLE lectura_libros ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
          ALTER TABLE lectura_libros ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
          -- Migrar estado si viene de migracion vieja
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lectura_libros' AND column_name='estado' AND character_maximum_length > 20) THEN
            ALTER TABLE lectura_libros ALTER COLUMN estado TYPE VARCHAR(20);
          END IF;
          UPDATE lectura_libros SET estado = 'sin_leer' WHERE estado = 'pendiente';
          -- lectura_planes: asegurar columnas modernas
          ALTER TABLE lectura_planes ADD COLUMN IF NOT EXISTS fecha_inicio DATE;
          ALTER TABLE lectura_planes ADD COLUMN IF NOT EXISTS fecha_fin DATE;
          ALTER TABLE lectura_planes ADD COLUMN IF NOT EXISTS completado BOOLEAN DEFAULT FALSE;
          ALTER TABLE lectura_planes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
          ALTER TABLE lectura_planes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lectura_planes' AND column_name='dias_semana') THEN
            ALTER TABLE lectura_planes RENAME COLUMN dias_semana TO dias_lectura;
            ALTER TABLE lectura_planes ALTER COLUMN dias_lectura TYPE JSONB USING to_jsonb(dias_semana);
          END IF;
          -- lectura_registros: plan_id ya no es requerido (solo si existe)
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lectura_registros' AND column_name='plan_id') THEN
            ALTER TABLE lectura_registros ALTER COLUMN plan_id DROP NOT NULL;
          END IF;
          ALTER TABLE lectura_registros ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE;
          ALTER TABLE lectura_registros ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER;
          ALTER TABLE lectura_registros ADD COLUMN IF NOT EXISTS notas TEXT DEFAULT '';
          ALTER TABLE lectura_registros ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
        END;
        $$;
      `
    },
    {
      name: '013_amistades_actualizado_en',
      sql: `
        ALTER TABLE amistades
        ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `
    },
    {
      name: '014_categorias_tipo',
      sql: `
        ALTER TABLE categorias
        ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'tarea';
        CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias(tipo);
      `
    },
    {
      name: '015_libros_puntuacion_1_10',
      sql: `
        ALTER TABLE lectura_libros DROP CONSTRAINT IF EXISTS lectura_libros_puntuacion_check;
        ALTER TABLE lectura_libros ADD CONSTRAINT lectura_libros_puntuacion_check CHECK (puntuacion >= 0 AND puntuacion <= 10);
      `
    },
  ];

  for (const m of dynamicMigrations) {
    try {
      if (!(await isApplied(m.name))) {
        logger.info(`Migracion ${m.name} — ejecutando...`);
        await pool.query(m.sql);
        await markApplied(m.name);
        logger.info(`Migracion ${m.name} — aplicada`);
      }
    } catch (err) {
      logger.error(`${m.name} — ERROR: ${err.message}`);
    }
  }

  logger.info('Migraciones completadas');
}

export async function runNodePgMigrations() {
  logger.info('Ejecutando migraciones node-pg-migrate...');
  try {
    execSync('npx node-pg-migrate up', {
      cwd: join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env },
    });
    logger.info('Migraciones node-pg-migrate completadas');
  } catch (err) {
    logger.error('Error ejecutando migraciones node-pg-migrate:', err.message);
  }
}
