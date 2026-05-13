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
-- EXTENSIONES
-- =============================================

CREATE EXTENSION IF NOT EXISTS citext;

-- =============================================
-- TIPOS ENUM BASE
-- =============================================

DO $$ BEGIN
    CREATE TYPE estado_tarea AS ENUM ('pendiente', 'completada', 'cancelada', 'en_progreso');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prioridad_tarea AS ENUM ('alta', 'media', 'baja');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE frecuencia_habito AS ENUM ('diario', 'semanal', 'mensual');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- USUARIOS
-- =============================================

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- HÁBITOS
-- =============================================

CREATE TABLE IF NOT EXISTS habitos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    frecuencia frecuencia_habito,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registros_habitos (
    id SERIAL PRIMARY KEY,
    habito_id INT NOT NULL REFERENCES habitos(id) ON DELETE CASCADE,
    completado BOOLEAN DEFAULT false,
    fecha DATE NOT NULL
);

-- =============================================
-- TAREAS
-- =============================================

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(80) NOT NULL,
    color VARCHAR(7) DEFAULT '#7F77DD',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado estado_tarea DEFAULT 'pendiente',
    prioridad prioridad_tarea DEFAULT 'media',
    fecha_limite TIMESTAMP,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    duracion_minutos INT DEFAULT 30,
    todo_el_dia BOOLEAN DEFAULT FALSE,
    es_recurrente BOOLEAN DEFAULT FALSE,
    recurrencia VARCHAR(20),
    auto_programado BOOLEAN DEFAULT FALSE,
    categoria_id INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tareas_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias(id) ON DELETE SET NULL
);

-- =============================================
-- PROGRESO
-- =============================================

CREATE TABLE IF NOT EXISTS progreso (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50),
    valor INT,
    fecha DATE
);

-- =============================================
-- GAMIFICACIÓN
-- =============================================

CREATE TABLE IF NOT EXISTS logros (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    icono VARCHAR(10) DEFAULT '🏆',
    puntos INT DEFAULT 50,
    condicion JSONB NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logros_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    logro_id INT REFERENCES logros(id) ON DELETE CASCADE,
    obtenido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, logro_id)
);

CREATE TABLE IF NOT EXISTS historial_puntos (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    puntos INT NOT NULL,
    motivo VARCHAR(100) NOT NULL,
    referencia_tipo VARCHAR(20),
    referencia_id INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS perfil_gamificacion (
    id SERIAL PRIMARY KEY,
    usuario_id INT UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    puntos_totales INT DEFAULT 0,
    nivel INT DEFAULT 1,
    xp_actual INT DEFAULT 0,
    xp_siguiente INT DEFAULT 100,
    racha_actual INT DEFAULT 0,
    mejor_racha INT DEFAULT 0,
    ultima_actividad DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos_gamificacion (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    referencia_id INT NOT NULL,
    referencia_tipo VARCHAR(20) NOT NULL,
    puntos INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, referencia_tipo, referencia_id, tipo)
);

-- =============================================
-- NOTIFICACIONES
-- =============================================

CREATE TABLE IF NOT EXISTS preferencias_notificacion (
    id SERIAL PRIMARY KEY,
    usuario_id INT UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    notificaciones_activas BOOLEAN DEFAULT true,
    hora_silencio_inicio TIME DEFAULT '22:00',
    hora_silencio_fin TIME DEFAULT '07:00',
    tipo_agenda BOOLEAN DEFAULT true,
    tipo_habitos BOOLEAN DEFAULT true,
    tipo_manual BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recordatorios (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) CHECK (tipo IN ('agenda','habito','manual')),
    referencia_id INT,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT,
    fecha_hora TIMESTAMP NOT NULL,
    anticipacion_min INT DEFAULT 0,
    es_recurrente BOOLEAN DEFAULT FALSE,
    regla_recurrencia VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'pendiente',
    intentos INT DEFAULT 0,
    ultimo_intento TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    recordatorio_id INT REFERENCES recordatorios(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT,
    tipo VARCHAR(20) DEFAULT 'app',
    leida BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SOCIAL MODULE
-- =============================================

CREATE TABLE IF NOT EXISTS amistades (
    id SERIAL PRIMARY KEY,
    solicitante_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    receptor_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    estado VARCHAR(20) DEFAULT 'pendiente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (solicitante_id, receptor_id)
);

CREATE TABLE IF NOT EXISTS proyectos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creador_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proyecto_miembros (
    id SERIAL PRIMARY KEY,
    proyecto_id INT NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol VARCHAR(20) DEFAULT 'miembro',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (proyecto_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS tareas_compartidas (
    id SERIAL PRIMARY KEY,
    proyecto_id INT NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    creado_por INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    asignado_a INT REFERENCES usuarios(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    estado estado_tarea DEFAULT 'pendiente',
    prioridad prioridad_tarea DEFAULT 'media',
    fecha_limite TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    tarea_id INT NOT NULL REFERENCES tareas_compartidas(id) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- GYM MODULE
-- =============================================

DO $$ BEGIN
    CREATE TYPE nivel_dificultad AS ENUM ('principiante','intermedio','avanzado');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS rutinas (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(100),
    descripcion TEXT,
    dificultad nivel_dificultad DEFAULT 'principiante',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ejercicios (
    id SERIAL PRIMARY KEY,
    rutina_id INT REFERENCES rutinas(id) ON DELETE CASCADE,
    nombre VARCHAR(100),
    grupo_muscular VARCHAR(50),
    series_default INT DEFAULT 3,
    repeticiones_default INT DEFAULT 10,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registros_entrenamiento (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    ejercicio_id INT REFERENCES ejercicios(id) ON DELETE CASCADE,
    rutina_id INT REFERENCES rutinas(id) ON DELETE SET NULL,
    fecha DATE DEFAULT CURRENT_DATE,
    notas TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS series_entrenamiento (
    id SERIAL PRIMARY KEY,
    registro_id INT REFERENCES registros_entrenamiento(id) ON DELETE CASCADE,
    numero_serie INT,
    repeticiones INT,
    peso_kg NUMERIC(5,2)
);

-- =============================================
-- IA MODULE
-- =============================================

CREATE TABLE IF NOT EXISTS analisis_ia (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    entrada JSONB,
    resultado JSONB NOT NULL,
    modelo VARCHAR(50) DEFAULT 'gpt-4o-mini',
    tokens_usados INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sugerencias_ia (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    metadata JSONB,
    aplicada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversaciones_ia (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    herramientas_usadas JSONB,
    tokens_usados INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_usuarios_updated') THEN
        CREATE TRIGGER trigger_usuarios_updated
        BEFORE UPDATE ON usuarios
        FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
    END IF;
END $$;

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_id ON tareas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_habitos_usuario_id ON habitos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_recordatorios_fecha_hora ON recordatorios(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_eventos_gamificacion ON eventos_gamificacion(usuario_id, tipo);

-- =============================================
-- MIGRACIONES PARA COLUMNAS FALTANTES
-- =============================================

-- Agregar columna completado a habitos (si no existe)
ALTER TABLE habitos ADD COLUMN IF NOT EXISTS completado BOOLEAN DEFAULT false;

-- Agregar columna activo a habitos (si no existe)
ALTER TABLE habitos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- Agregar unique constraint a progreso para upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_progreso_unique ON progreso(usuario_id, tipo, fecha);