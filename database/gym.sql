-- =============================================
-- MÓDULO GYM - DARIO
-- =============================================

-- ─── TIPOS ENUM ──────────────────────────────

DO $$ BEGIN
    CREATE TYPE nivel_dificultad AS ENUM ('principiante', 'intermedio', 'avanzado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ─── RUTINAS ─────────────────────────────────

CREATE TABLE IF NOT EXISTS rutinas (
    id             SERIAL PRIMARY KEY,
    usuario_id     INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre         VARCHAR(100) NOT NULL,
    descripcion    TEXT,
    dificultad     nivel_dificultad DEFAULT 'principiante',
    creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── EJERCICIOS ──────────────────────────────

CREATE TABLE IF NOT EXISTS ejercicios (
    id                    SERIAL PRIMARY KEY,
    rutina_id             INT NOT NULL REFERENCES rutinas(id) ON DELETE CASCADE,
    nombre                VARCHAR(100) NOT NULL,
    grupo_muscular        VARCHAR(50),
    series_default        INT DEFAULT 3,
    repeticiones_default  INT DEFAULT 10,
    creado_en             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── REGISTROS DE ENTRENAMIENTO ──────────────

CREATE TABLE IF NOT EXISTS registros_entrenamiento (
    id           SERIAL PRIMARY KEY,
    usuario_id   INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ejercicio_id INT NOT NULL REFERENCES ejercicios(id) ON DELETE CASCADE,
    rutina_id    INT REFERENCES rutinas(id) ON DELETE SET NULL,
    fecha        DATE DEFAULT CURRENT_DATE,
    notas        TEXT,
    creado_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── SERIES DE CADA ENTRENAMIENTO ────────────

CREATE TABLE IF NOT EXISTS series_entrenamiento (
    id           SERIAL PRIMARY KEY,
    registro_id  INT NOT NULL REFERENCES registros_entrenamiento(id) ON DELETE CASCADE,
    numero_serie INT NOT NULL,
    repeticiones INT NOT NULL,
    peso_kg      NUMERIC(5,2) NOT NULL
);

-- ─── ÍNDICES ─────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_rutinas_usuario_id      ON rutinas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ejercicios_rutina_id    ON ejercicios(rutina_id);
CREATE INDEX IF NOT EXISTS idx_registros_usuario_id    ON registros_entrenamiento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_registros_ejercicio_id  ON registros_entrenamiento(ejercicio_id);
CREATE INDEX IF NOT EXISTS idx_registros_fecha         ON registros_entrenamiento(fecha);
CREATE INDEX IF NOT EXISTS idx_series_registro_id      ON series_entrenamiento(registro_id);

-- ─── TRIGGER updated_at ───────────────────────

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_rutinas_updated'
    ) THEN
        CREATE TRIGGER trigger_rutinas_updated
        BEFORE UPDATE ON rutinas
        FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
    END IF;
END $$;