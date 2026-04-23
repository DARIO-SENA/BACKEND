-- Database: DARIO

-- DROP DATABASE IF EXISTS "DARIO";

CREATE DATABASE "DARIO"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Colombia.1252'
    LC_CTYPE = 'Spanish_Colombia.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;


	-- =============================================
-- SCHEMA OPTIMIZADO - DARIO (PRO)
-- Ejecutar una sola vez
-- =============================================

-- ─── EXTENSIONES ─────────────────────────────
-- Para emails case-insensitive
CREATE EXTENSION IF NOT EXISTS citext;

-- ─── TIPOS ENUM (más robusto que strings) ────

DO $$ BEGIN
    CREATE TYPE estado_tarea AS ENUM ('pendiente', 'completada', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prioridad_tarea AS ENUM ('alta', 'media', 'baja');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE frecuencia_habito AS ENUM ('diario', 'semanal', 'mensual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ─── USUARIOS ────────────────────────────────

CREATE TABLE IF NOT EXISTS usuarios (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    email          CITEXT UNIQUE NOT NULL,
    password       VARCHAR(255) NOT NULL,
    creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── HÁBITOS ────────────────────────────────

CREATE TABLE IF NOT EXISTS habitos (
    id             SERIAL PRIMARY KEY,
    usuario_id     INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo         VARCHAR(100) NOT NULL,
    descripcion    TEXT,
    frecuencia     frecuencia_habito,
    creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registros_habitos (
    id           SERIAL PRIMARY KEY,
    habito_id    INT NOT NULL REFERENCES habitos(id) ON DELETE CASCADE,
    completado   BOOLEAN DEFAULT false,
    fecha        DATE NOT NULL
);

-- ─── TAREAS ────────────────────────────────

CREATE TABLE IF NOT EXISTS tareas (
    id               SERIAL PRIMARY KEY,
    usuario_id       INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo           VARCHAR(100) NOT NULL,
    descripcion      TEXT,
    estado           estado_tarea DEFAULT 'pendiente',
    prioridad        prioridad_tarea DEFAULT 'media',
    fecha_limite     TIMESTAMP,
    fecha_inicio     TIMESTAMP,
    fecha_fin        TIMESTAMP,
    duracion_minutos INT DEFAULT 30,
    todo_el_dia      BOOLEAN DEFAULT FALSE,
    es_recurrente    BOOLEAN DEFAULT FALSE,
    recurrencia      VARCHAR(20) CHECK (recurrencia IN ('diario', 'semanal', 'mensual')),
    auto_programado  BOOLEAN DEFAULT FALSE,
    categoria_id     INT,
    creado_en        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── CATEGORÍAS ────────────────────────────

CREATE TABLE IF NOT EXISTS categorias (
    id             SERIAL PRIMARY KEY,
    usuario_id     INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre         VARCHAR(80) NOT NULL,
    color          VARCHAR(7) DEFAULT '#7F77DD',
    creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relación después de definir categorias
ALTER TABLE tareas
    ADD CONSTRAINT fk_tareas_categoria
    FOREIGN KEY (categoria_id)
    REFERENCES categorias(id)
    ON DELETE SET NULL;

-- ─── PROGRESO ──────────────────────────────

CREATE TABLE IF NOT EXISTS progreso (
    id         SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo       VARCHAR(50),
    valor      INT,
    fecha      DATE
);

-- ─── ÍNDICES (CRÍTICOS PARA PERFORMANCE) ────

-- Usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Hábitos
CREATE INDEX IF NOT EXISTS idx_habitos_usuario_id ON habitos(usuario_id);

-- Registros de hábitos
CREATE INDEX IF NOT EXISTS idx_registros_habito_id ON registros_habitos(habito_id);
CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros_habitos(fecha);

-- Tareas
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_id ON tareas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_prioridad ON tareas(prioridad);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_inicio ON tareas(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_limite ON tareas(fecha_limite);

-- Categorías
CREATE INDEX IF NOT EXISTS idx_categorias_usuario_id ON categorias(usuario_id);

-- ─── TRIGGER GLOBAL updated_at ─────────────

CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a múltiples tablas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_usuarios_updated'
    ) THEN
        CREATE TRIGGER trigger_usuarios_updated
        BEFORE UPDATE ON usuarios
        FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_habitos_updated'
    ) THEN
        CREATE TRIGGER trigger_habitos_updated
        BEFORE UPDATE ON habitos
        FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_tareas_updated'
    ) THEN
        CREATE TRIGGER trigger_tareas_updated
        BEFORE UPDATE ON tareas
        FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_categorias_updated'
    ) THEN
        CREATE TRIGGER trigger_categorias_updated
        BEFORE UPDATE ON categorias
        FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
    END IF;
END $$;