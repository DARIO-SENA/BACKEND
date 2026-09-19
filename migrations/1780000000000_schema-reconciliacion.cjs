exports.up = (pgm) => {
  pgm.sql(`
    -- ─────────────────────────────────────────────
    -- 1) FUNCIÓN Y TRIGGERS DE actualizado_en
    -- ─────────────────────────────────────────────
    CREATE OR REPLACE FUNCTION actualizar_timestamp()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.actualizado_en = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$;

    -- ─────────────────────────────────────────────
    -- 2) COLUMNAS FALTANTES EN MIGRACIONES EXISTENTES
    -- ─────────────────────────────────────────────
    ALTER TABLE categorias ADD COLUMN IF NOT EXISTS icono VARCHAR(10) DEFAULT '';
    ALTER TABLE categorias ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'tarea';

    ALTER TABLE tareas ADD COLUMN IF NOT EXISTS dias_semana JSONB DEFAULT '[]';
    ALTER TABLE tareas ADD COLUMN IF NOT EXISTS icono VARCHAR(10) DEFAULT '';

    ALTER TABLE habitos ADD COLUMN IF NOT EXISTS dias_semana JSONB DEFAULT '[]';
    ALTER TABLE habitos ADD COLUMN IF NOT EXISTS categoria VARCHAR(50);
    ALTER TABLE habitos ADD COLUMN IF NOT EXISTS hora_programada TIME;
    ALTER TABLE habitos ADD COLUMN IF NOT EXISTS auto_programado BOOLEAN DEFAULT false;

    ALTER TABLE recordatorios ADD COLUMN IF NOT EXISTS icono VARCHAR(10) DEFAULT '';
    ALTER TABLE recordatorios ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL;

    ALTER TABLE rutinas ADD COLUMN IF NOT EXISTS dias_semana JSONB DEFAULT '[]';

    ALTER TABLE bloques_tiempo ADD COLUMN IF NOT EXISTS auto_programado BOOLEAN DEFAULT false;

    ALTER TABLE registros_entrenamiento ADD COLUMN IF NOT EXISTS duracion_segundos INTEGER;
    ALTER TABLE registros_entrenamiento ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    ALTER TABLE series_entrenamiento ADD COLUMN IF NOT EXISTS rpe NUMERIC(2,1);

    ALTER TABLE ejercicios ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    ALTER TABLE amistades ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    ALTER TABLE eventos_gamificacion ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    ALTER TABLE comentarios ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    ALTER TABLE pomodoro_sessions ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS usuario VARCHAR(50);
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);

    -- ─────────────────────────────────────────────
    -- 3) TABLAS FALTANTES (dump / runtime / seed)
    -- ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS plantillas_dia (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
      activo BOOLEAN DEFAULT true,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(usuario_id, dia_semana)
    );

    CREATE TABLE IF NOT EXISTS plantillas_bloques (
      id SERIAL PRIMARY KEY,
      plantilla_id INTEGER NOT NULL REFERENCES plantillas_dia(id) ON DELETE CASCADE,
      titulo VARCHAR(200) NOT NULL,
      hora_inicio TIME NOT NULL,
      hora_fin TIME NOT NULL,
      tipo VARCHAR(20) DEFAULT 'tarea',
      prioridad VARCHAR(10) DEFAULT 'media',
      orden INTEGER DEFAULT 0,
      gimnasio_rutina_id INTEGER REFERENCES rutinas(id) ON DELETE SET NULL,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

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

    CREATE TABLE IF NOT EXISTS registros_rutinas (
      id SERIAL PRIMARY KEY,
      rutina_id INTEGER NOT NULL REFERENCES rutinas(id) ON DELETE CASCADE,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      fecha DATE NOT NULL,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(rutina_id, usuario_id, fecha)
    );

    CREATE TABLE IF NOT EXISTS usuario_gamificacion (
      usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
      xp INTEGER DEFAULT 0,
      nivel INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 0,
      ultimo_registro TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lectura_libros (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      titulo VARCHAR(255) NOT NULL,
      autor VARCHAR(255) DEFAULT '',
      paginas_totales INTEGER DEFAULT 0,
      paginas_leidas INTEGER DEFAULT 0,
      estado VARCHAR(20) DEFAULT 'sin_leer'
        CHECK (estado IN ('sin_leer','leyendo','completado','abandonado')),
      portada TEXT DEFAULT '',
      genero VARCHAR(100) DEFAULT '',
      etiquetas TEXT[] DEFAULT '{}',
      notas TEXT DEFAULT '',
      citas JSONB DEFAULT '[]',
      puntuacion INTEGER DEFAULT 0,
      fecha_inicio DATE,
      fecha_fin DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lectura_registros (
      id SERIAL PRIMARY KEY,
      libro_id INTEGER NOT NULL REFERENCES lectura_libros(id) ON DELETE CASCADE,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      paginas_leidas INTEGER DEFAULT 0,
      fecha DATE NOT NULL DEFAULT CURRENT_DATE,
      duracion_minutos INTEGER,
      notas TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lectura_planes (
      id SERIAL PRIMARY KEY,
      libro_id INTEGER NOT NULL REFERENCES lectura_libros(id) ON DELETE CASCADE,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      fecha_inicio DATE NOT NULL,
      fecha_fin DATE NOT NULL,
      dias_lectura JSONB DEFAULT '[1,2,3,4,5]',
      paginas_por_dia DECIMAL(10,2) DEFAULT 0,
      completado BOOLEAN DEFAULT FALSE,
      habito_id INTEGER REFERENCES habitos(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

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

    -- ─────────────────────────────────────────────
    -- 4) INDEX FALTANTES
    -- ─────────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_categorias_usuario_id ON categorias(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias(tipo);
    CREATE INDEX IF NOT EXISTS idx_habitos_categoria_id ON habitos(categoria_id);
    CREATE INDEX IF NOT EXISTS idx_lectura_registros_fecha ON lectura_registros(usuario_id, fecha);
    CREATE INDEX IF NOT EXISTS idx_plantillas_bloques_plantilla ON plantillas_bloques(plantilla_id);
    CREATE INDEX IF NOT EXISTS idx_registros_rutinas_usuario_fecha ON registros_rutinas(usuario_id, fecha);

    -- ─────────────────────────────────────────────
    -- 5) TRIGGERS actualizado_en (como en el dump)
    -- ─────────────────────────────────────────────
    DROP TRIGGER IF EXISTS trigger_amistades_updated ON amistades;
    CREATE TRIGGER trigger_amistades_updated BEFORE UPDATE ON amistades FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_bloques_tiempo_updated ON bloques_tiempo;
    CREATE TRIGGER trigger_bloques_tiempo_updated BEFORE UPDATE ON bloques_tiempo FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_categorias_updated ON categorias;
    CREATE TRIGGER trigger_categorias_updated BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_checkins_emocionales_updated ON checkins_emocionales;
    CREATE TRIGGER trigger_checkins_emocionales_updated BEFORE UPDATE ON checkins_emocionales FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_comentarios_updated ON comentarios;
    CREATE TRIGGER trigger_comentarios_updated BEFORE UPDATE ON comentarios FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_diario_personal_updated ON diario_personal;
    CREATE TRIGGER trigger_diario_personal_updated BEFORE UPDATE ON diario_personal FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_ejercicios_updated ON ejercicios;
    CREATE TRIGGER trigger_ejercicios_updated BEFORE UPDATE ON ejercicios FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_eventos_gamificacion_updated ON eventos_gamificacion;
    CREATE TRIGGER trigger_eventos_gamificacion_updated BEFORE UPDATE ON eventos_gamificacion FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_finanzas_categorias_updated ON finanzas_categorias;
    CREATE TRIGGER trigger_finanzas_categorias_updated BEFORE UPDATE ON finanzas_categorias FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_finanzas_cuentas_updated ON finanzas_cuentas;
    CREATE TRIGGER trigger_finanzas_cuentas_updated BEFORE UPDATE ON finanzas_cuentas FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_finanzas_deudas_updated ON finanzas_deudas;
    CREATE TRIGGER trigger_finanzas_deudas_updated BEFORE UPDATE ON finanzas_deudas FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_finanzas_metas_updated ON finanzas_metas;
    CREATE TRIGGER trigger_finanzas_metas_updated BEFORE UPDATE ON finanzas_metas FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_finanzas_presupuestos_updated ON finanzas_presupuestos;
    CREATE TRIGGER trigger_finanzas_presupuestos_updated BEFORE UPDATE ON finanzas_presupuestos FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_finanzas_transacciones_updated ON finanzas_transacciones;
    CREATE TRIGGER trigger_finanzas_transacciones_updated BEFORE UPDATE ON finanzas_transacciones FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_habitos_updated ON habitos;
    CREATE TRIGGER trigger_habitos_updated BEFORE UPDATE ON habitos FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_key_results_updated ON key_results;
    CREATE TRIGGER trigger_key_results_updated BEFORE UPDATE ON key_results FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_metas_updated ON metas;
    CREATE TRIGGER trigger_metas_updated BEFORE UPDATE ON metas FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_pomodoro_sessions_updated ON pomodoro_sessions;
    CREATE TRIGGER trigger_pomodoro_sessions_updated BEFORE UPDATE ON pomodoro_sessions FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_registros_entrenamiento_updated ON registros_entrenamiento;
    CREATE TRIGGER trigger_registros_entrenamiento_updated BEFORE UPDATE ON registros_entrenamiento FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_rutinas_updated ON rutinas;
    CREATE TRIGGER trigger_rutinas_updated BEFORE UPDATE ON rutinas FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_tareas_updated ON tareas;
    CREATE TRIGGER trigger_tareas_updated BEFORE UPDATE ON tareas FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

    DROP TRIGGER IF EXISTS trigger_usuarios_updated ON usuarios;
    CREATE TRIGGER trigger_usuarios_updated BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TRIGGER IF EXISTS trigger_amistades_updated ON amistades;
    DROP TRIGGER IF EXISTS trigger_bloques_tiempo_updated ON bloques_tiempo;
    DROP TRIGGER IF EXISTS trigger_categorias_updated ON categorias;
    DROP TRIGGER IF EXISTS trigger_checkins_emocionales_updated ON checkins_emocionales;
    DROP TRIGGER IF EXISTS trigger_comentarios_updated ON comentarios;
    DROP TRIGGER IF EXISTS trigger_diario_personal_updated ON diario_personal;
    DROP TRIGGER IF EXISTS trigger_ejercicios_updated ON ejercicios;
    DROP TRIGGER IF EXISTS trigger_eventos_gamificacion_updated ON eventos_gamificacion;
    DROP TRIGGER IF EXISTS trigger_finanzas_categorias_updated ON finanzas_categorias;
    DROP TRIGGER IF EXISTS trigger_finanzas_cuentas_updated ON finanzas_cuentas;
    DROP TRIGGER IF EXISTS trigger_finanzas_deudas_updated ON finanzas_deudas;
    DROP TRIGGER IF EXISTS trigger_finanzas_metas_updated ON finanzas_metas;
    DROP TRIGGER IF EXISTS trigger_finanzas_presupuestos_updated ON finanzas_presupuestos;
    DROP TRIGGER IF EXISTS trigger_finanzas_transacciones_updated ON finanzas_transacciones;
    DROP TRIGGER IF EXISTS trigger_habitos_updated ON habitos;
    DROP TRIGGER IF EXISTS trigger_key_results_updated ON key_results;
    DROP TRIGGER IF EXISTS trigger_metas_updated ON metas;
    DROP TRIGGER IF EXISTS trigger_pomodoro_sessions_updated ON pomodoro_sessions;
    DROP TRIGGER IF EXISTS trigger_registros_entrenamiento_updated ON registros_entrenamiento;
    DROP TRIGGER IF EXISTS trigger_rutinas_updated ON rutinas;
    DROP TRIGGER IF EXISTS trigger_tareas_updated ON tareas;
    DROP TRIGGER IF EXISTS trigger_usuarios_updated ON usuarios;
  `);
};