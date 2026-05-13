-- =============================================
-- DARIO - Full Database Schema
-- Auto-generated from information_schema
-- =============================================

CREATE EXTENSION IF NOT EXISTS citext;

DO $$ BEGIN
  CREATE TYPE "estado_tarea" AS ENUM ('pendiente', 'completada', 'cancelada', 'en_progreso');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "frecuencia_habito" AS ENUM ('diario', 'semanal', 'mensual');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "prioridad_tarea" AS ENUM ('alta', 'media', 'baja');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "amistades" (
  "id" SERIAL,
  "solicitante_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "receptor_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "estado" varchar(20) DEFAULT 'pendiente',
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  UNIQUE ((solicitante_id, receptor_id)
);

CREATE TABLE IF NOT EXISTS "analisis_ia" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "tipo" varchar(50) NOT NULL,
  "entrada" jsonb,
  "resultado" jsonb,
  "modelo" varchar(50) DEFAULT 'gpt-4o-mini',
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "bloques_tiempo" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "nombre" varchar(100) NOT NULL,
  "hora_inicio" time without time zone NOT NULL,
  "hora_fin" time without time zone NOT NULL,
  "activo" boolean DEFAULT true,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "categorias" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "nombre" varchar(80) NOT NULL,
  "color" varchar(7) DEFAULT '#7F77DD',
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "comentarios" (
  "id" SERIAL,
  "tarea_id" integer NOT NULL REFERENCES "tareas_compartidas"("id") ON DELETE CASCADE,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "contenido" text NOT NULL,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "conversaciones_ia" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "mensaje" text NOT NULL,
  "respuesta" text NOT NULL,
  "herramientas_usadas" jsonb,
  "tokens_usados" integer DEFAULT 0,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "eventos_gamificacion" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL,
  "tipo" varchar(50) NOT NULL,
  "referencia_id" integer NOT NULL,
  "referencia_tipo" varchar(20) NOT NULL,
  "puntos" integer NOT NULL,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  UNIQUE ((usuario_id, referencia_tipo, referencia_id, tipo)
);

CREATE TABLE IF NOT EXISTS "finanzas_categorias" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "nombre" varchar(100) NOT NULL,
  "tipo" varchar(10) NOT NULL,
  "icono" varchar(50),
  "color" varchar(7),
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  CONSTRAINT "finanzas_categorias_tipo_check" CHECK (((tipo)::text = ANY ((ARRAY['ingreso'::character varying, 'gasto'::character varying])::text[])))
);

CREATE TABLE IF NOT EXISTS "finanzas_cuentas" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "nombre" varchar(100) NOT NULL,
  "tipo" varchar(20) NOT NULL,
  "saldo_inicial" numeric DEFAULT 0,
  "moneda" varchar(3) DEFAULT 'BOB',
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  CONSTRAINT "finanzas_cuentas_tipo_check" CHECK (((tipo)::text = ANY ((ARRAY['efectivo'::character varying, 'banco'::character varying, 'tarjeta_credito'::character varying, 'ahorro'::character varying])::text[])))
);

CREATE TABLE IF NOT EXISTS "finanzas_deudas" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "nombre" varchar(150) NOT NULL,
  "monto_total" numeric NOT NULL,
  "monto_pagado" numeric DEFAULT 0,
  "cuota_mensual" numeric DEFAULT 0,
  "tasa_interes" numeric DEFAULT 0,
  "fecha_inicio" date,
  "fecha_vencimiento" date,
  "acreedor" varchar(150),
  "estado" varchar(20) DEFAULT 'pendiente',
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  CONSTRAINT "finanzas_deudas_estado_check" CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'pagando'::character varying, 'completada'::character varying])::text[])))
);

CREATE TABLE IF NOT EXISTS "finanzas_metas" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "nombre" varchar(150) NOT NULL,
  "monto_objetivo" numeric NOT NULL,
  "monto_actual" numeric DEFAULT 0,
  "fecha_limite" date,
  "estado" varchar(20) DEFAULT 'en_progreso',
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  CONSTRAINT "finanzas_metas_estado_check" CHECK (((estado)::text = ANY ((ARRAY['en_progreso'::character varying, 'completada'::character varying, 'fallida'::character varying])::text[])))
);

CREATE TABLE IF NOT EXISTS "finanzas_presupuestos" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "categoria_id" integer NOT NULL REFERENCES "finanzas_categorias"("id") ON DELETE CASCADE,
  "mes" integer NOT NULL,
  "anio" integer NOT NULL,
  "limite" numeric NOT NULL,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  UNIQUE ((usuario_id, categoria_id, mes, anio)
,
  CONSTRAINT "finanzas_presupuestos_mes_check" CHECK (((mes >= 1) AND (mes <= 12)))
);

CREATE TABLE IF NOT EXISTS "finanzas_transacciones" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "categoria_id" integer REFERENCES "finanzas_categorias"("id") ON DELETE SET NULL,
  "cuenta_id" integer REFERENCES "finanzas_cuentas"("id") ON DELETE SET NULL,
  "tipo" varchar(15) NOT NULL,
  "monto" numeric NOT NULL,
  "descripcion" text,
  "fecha" date NOT NULL,
  "es_recurrente" boolean DEFAULT false,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  CONSTRAINT "finanzas_transacciones_tipo_check" CHECK (((tipo)::text = ANY ((ARRAY['ingreso'::character varying, 'gasto'::character varying, 'transferencia'::character varying])::text[])))
);

CREATE TABLE IF NOT EXISTS "habitos" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "titulo" varchar(100) NOT NULL,
  "descripcion" text,
  "frecuencia" frecuencia_habito,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "completado" boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS "historial_puntos" (
  "id" SERIAL,
  "usuario_id" integer REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "puntos" integer NOT NULL,
  "motivo" varchar(100) NOT NULL,
  "referencia_tipo" varchar(20),
  "referencia_id" integer,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "logros" (
  "id" SERIAL,
  "codigo" varchar(50) NOT NULL,
  "titulo" varchar(100) NOT NULL,
  "descripcion" text NOT NULL,
  "icono" varchar(10) DEFAULT '🏆',
  "puntos" integer DEFAULT 50,
  "condicion" jsonb NOT NULL,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  UNIQUE ((codigo)
);

CREATE TABLE IF NOT EXISTS "logros_usuario" (
  "id" SERIAL,
  "usuario_id" integer REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "logro_id" integer REFERENCES "logros"("id") ON DELETE CASCADE,
  "obtenido_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  UNIQUE ((usuario_id, logro_id)
);

CREATE TABLE IF NOT EXISTS "notificaciones" (
  "id" SERIAL,
  "usuario_id" integer REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "recordatorio_id" integer REFERENCES "recordatorios"("id") ON DELETE SET NULL,
  "titulo" varchar(200) NOT NULL,
  "mensaje" text,
  "tipo" varchar(20) DEFAULT 'app',
  "leida" boolean DEFAULT false,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  CONSTRAINT "notificaciones_tipo_check" CHECK (((tipo)::text = ANY ((ARRAY['app'::character varying, 'push'::character varying, 'email'::character varying])::text[])))
);

CREATE TABLE IF NOT EXISTS "perfil_gamificacion" (
  "id" SERIAL,
  "usuario_id" integer REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "puntos_totales" integer DEFAULT 0,
  "nivel" integer DEFAULT 1,
  "xp_actual" integer DEFAULT 0,
  "xp_siguiente" integer DEFAULT 100,
  "racha_actual" integer DEFAULT 0,
  "mejor_racha" integer DEFAULT 0,
  "ultima_actividad" date,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  UNIQUE ((usuario_id)
);

CREATE TABLE IF NOT EXISTS "pomodoro_sessions" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "tarea_id" integer REFERENCES "tareas"("id") ON DELETE SET NULL,
  "duracion_minutos" integer NOT NULL,
  "descanso_minutos" integer DEFAULT 5,
  "intervalo_numero" integer DEFAULT 1,
  "estado" varchar(20) DEFAULT 'completada',
  "inicio_en" timestamp NOT NULL,
  "fin_en" timestamp,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "pomodoro_settings" (
  "usuario_id" integer NOT NULL PRIMARY KEY REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "duracion_foco" integer DEFAULT 25,
  "descanso_corto" integer DEFAULT 5,
  "descanso_largo" integer DEFAULT 15,
  "intervalos_antes_descanso_largo" integer DEFAULT 4,
  "auto_iniciar_descanso" boolean DEFAULT false,
  "notificaciones_sonido" boolean DEFAULT true,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "preferencias_notificacion" (
  "id" SERIAL,
  "usuario_id" integer REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "notificaciones_activas" boolean DEFAULT true,
  "hora_silencio_inicio" time without time zone DEFAULT '22:00:00',
  "hora_silencio_fin" time without time zone DEFAULT '07:00:00',
  "tipo_agenda" boolean DEFAULT true,
  "tipo_habitos" boolean DEFAULT true,
  "tipo_manual" boolean DEFAULT true,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  UNIQUE ((usuario_id)
);

CREATE TABLE IF NOT EXISTS "progreso" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "tipo" varchar(50),
  "valor" integer,
  "fecha" date
);

CREATE TABLE IF NOT EXISTS "proyecto_miembros" (
  "id" SERIAL,
  "proyecto_id" integer NOT NULL REFERENCES "proyectos"("id") ON DELETE CASCADE,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "rol" varchar(20) DEFAULT 'miembro',
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  UNIQUE ((proyecto_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS "proyectos" (
  "id" SERIAL,
  "nombre" varchar(100) NOT NULL,
  "descripcion" text,
  "creador_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "recordatorios" (
  "id" SERIAL,
  "usuario_id" integer REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "tipo" varchar(20) NOT NULL,
  "referencia_id" integer,
  "titulo" varchar(200) NOT NULL,
  "mensaje" text,
  "fecha_hora" timestamp NOT NULL,
  "anticipacion_min" integer DEFAULT 0,
  "es_recurrente" boolean DEFAULT false,
  "regla_recurrencia" varchar(20),
  "estado" varchar(20) DEFAULT 'pendiente',
  "intentos" integer DEFAULT 0,
  "ultimo_intento" timestamp,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  CONSTRAINT "recordatorios_tipo_check" CHECK (((tipo)::text = ANY ((ARRAY['agenda'::character varying, 'habito'::character varying, 'manual'::character varying])::text[])))
,
  CONSTRAINT "recordatorios_regla_recurrencia_check" CHECK (((regla_recurrencia)::text = ANY ((ARRAY['diario'::character varying, 'semanal'::character varying, 'mensual'::character varying, NULL::character varying])::text[])))
,
  CONSTRAINT "recordatorios_estado_check" CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'enviado'::character varying, 'cancelado'::character varying, 'fallido'::character varying])::text[])))
);

CREATE TABLE IF NOT EXISTS "registros_habitos" (
  "id" SERIAL,
  "habito_id" integer NOT NULL REFERENCES "habitos"("id") ON DELETE CASCADE,
  "completado" boolean DEFAULT false,
  "fecha" date NOT NULL
);

CREATE TABLE IF NOT EXISTS "sugerencias_ia" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "tipo" varchar(50) NOT NULL,
  "titulo" varchar(200) NOT NULL,
  "descripcion" text,
  "metadata" jsonb,
  "leida" boolean DEFAULT false,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "tareas" (
  "id" SERIAL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "titulo" varchar(100) NOT NULL,
  "descripcion" text,
  "estado" estado_tarea DEFAULT 'pendiente',
  "prioridad" prioridad_tarea DEFAULT 'media',
  "fecha_limite" timestamp,
  "fecha_inicio" timestamp,
  "fecha_fin" timestamp,
  "duracion_minutos" integer DEFAULT 30,
  "todo_el_dia" boolean DEFAULT false,
  "es_recurrente" boolean DEFAULT false,
  "recurrencia" varchar(20),
  "auto_programado" boolean DEFAULT false,
  "categoria_id" integer REFERENCES "categorias"("id") ON DELETE SET NULL,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
,
  CONSTRAINT "tareas_recurrencia_check" CHECK (((recurrencia)::text = ANY ((ARRAY['diario'::character varying, 'semanal'::character varying, 'mensual'::character varying])::text[])))
);

CREATE TABLE IF NOT EXISTS "tareas_compartidas" (
  "id" SERIAL,
  "proyecto_id" integer NOT NULL REFERENCES "proyectos"("id") ON DELETE CASCADE,
  "creado_por" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "asignado_a" integer REFERENCES "usuarios"("id") ON DELETE SET NULL,
  "titulo" varchar(200) NOT NULL,
  "descripcion" text,
  "estado" varchar(20) DEFAULT 'pendiente',
  "prioridad" varchar(10) DEFAULT 'media',
  "fecha_limite" timestamp,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "usuario_gamificacion" (
  "usuario_id" integer NOT NULL PRIMARY KEY,
  "xp" integer DEFAULT 0,
  "nivel" integer DEFAULT 1,
  "streak" integer DEFAULT 0,
  "ultimo_registro" timestamp
);

CREATE TABLE IF NOT EXISTS "usuarios" (
  "id" SERIAL,
  "nombre" varchar(100) NOT NULL,
  "email" citext NOT NULL,
  "password" varchar(255) NOT NULL,
  "creado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" timestamp DEFAULT CURRENT_TIMESTAMP,
  "google_id" varchar(255),
  "google_access_token" text,
  "google_refresh_token" text,
  "google_token_expiry" timestamp
,
  UNIQUE ((email)
);

CREATE INDEX idx_analisis_ia_tipo ON public.analisis_ia USING btree (tipo);

CREATE INDEX idx_analisis_ia_usuario ON public.analisis_ia USING btree (usuario_id);

CREATE INDEX idx_categorias_usuario_id ON public.categorias USING btree (usuario_id);

CREATE INDEX idx_conversaciones_ia_usuario ON public.conversaciones_ia USING btree (usuario_id);

CREATE INDEX finanzas_categorias_usuario_id_index ON public.finanzas_categorias USING btree (usuario_id);

CREATE INDEX finanzas_cuentas_usuario_id_index ON public.finanzas_cuentas USING btree (usuario_id);

CREATE INDEX finanzas_deudas_usuario_id_index ON public.finanzas_deudas USING btree (usuario_id);

CREATE INDEX finanzas_metas_usuario_id_index ON public.finanzas_metas USING btree (usuario_id);

CREATE INDEX finanzas_presupuestos_usuario_id_index ON public.finanzas_presupuestos USING btree (usuario_id);

CREATE INDEX finanzas_transacciones_categoria_id_index ON public.finanzas_transacciones USING btree (categoria_id);

CREATE INDEX finanzas_transacciones_cuenta_id_index ON public.finanzas_transacciones USING btree (cuenta_id);

CREATE INDEX finanzas_transacciones_fecha_index ON public.finanzas_transacciones USING btree (fecha);

CREATE INDEX finanzas_transacciones_usuario_id_index ON public.finanzas_transacciones USING btree (usuario_id);

CREATE INDEX idx_habitos_usuario_id ON public.habitos USING btree (usuario_id);

CREATE INDEX idx_historial_usuario ON public.historial_puntos USING btree (usuario_id);

CREATE INDEX idx_logros_usuario_uid ON public.logros_usuario USING btree (usuario_id);

CREATE INDEX idx_notificaciones_leida ON public.notificaciones USING btree (leida);

CREATE INDEX idx_notificaciones_usuario ON public.notificaciones USING btree (usuario_id);

CREATE INDEX idx_perfil_usuario ON public.perfil_gamificacion USING btree (usuario_id);

CREATE INDEX pomodoro_sessions_inicio_en_index ON public.pomodoro_sessions USING btree (inicio_en);

CREATE INDEX pomodoro_sessions_tarea_id_index ON public.pomodoro_sessions USING btree (tarea_id);

CREATE INDEX pomodoro_sessions_usuario_id_index ON public.pomodoro_sessions USING btree (usuario_id);

CREATE INDEX idx_recordatorios_estado ON public.recordatorios USING btree (estado);

CREATE INDEX idx_recordatorios_fecha_hora ON public.recordatorios USING btree (fecha_hora);

CREATE INDEX idx_recordatorios_usuario ON public.recordatorios USING btree (usuario_id);

CREATE INDEX idx_registros_fecha ON public.registros_habitos USING btree (fecha);

CREATE INDEX idx_registros_habito_id ON public.registros_habitos USING btree (habito_id);

CREATE INDEX idx_sugerencias_ia_usuario ON public.sugerencias_ia USING btree (usuario_id);

CREATE INDEX idx_tareas_estado ON public.tareas USING btree (estado);

CREATE INDEX idx_tareas_fecha_inicio ON public.tareas USING btree (fecha_inicio);

CREATE INDEX idx_tareas_fecha_limite ON public.tareas USING btree (fecha_limite);

CREATE INDEX idx_tareas_prioridad ON public.tareas USING btree (prioridad);

CREATE INDEX idx_tareas_usuario_id ON public.tareas USING btree (usuario_id);

CREATE INDEX idx_usuarios_email ON public.usuarios USING btree (email);

-- ─── TRIGGERS ─────────────────────────────────────

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