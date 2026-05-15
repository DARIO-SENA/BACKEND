--
-- PostgreSQL database dump
--

\restrict qx7QFmP5tWhJHS0AqHQTxwyQdswyW0WHva4eVYd1gftZhHggydCqVa2XBwdWuJk

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: estado_tarea; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_tarea AS ENUM (
    'pendiente',
    'completada',
    'cancelada',
    'en_progreso'
);


--
-- Name: frecuencia_habito; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.frecuencia_habito AS ENUM (
    'diario',
    'semanal',
    'mensual'
);


--
-- Name: nivel_dificultad; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.nivel_dificultad AS ENUM (
    'principiante',
    'intermedio',
    'avanzado'
);


--
-- Name: prioridad_tarea; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.prioridad_tarea AS ENUM (
    'alta',
    'media',
    'baja'
);


--
-- Name: actualizar_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.actualizar_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: amistades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.amistades (
    id integer NOT NULL,
    solicitante_id integer NOT NULL,
    receptor_id integer NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: amistades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.amistades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: amistades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.amistades_id_seq OWNED BY public.amistades.id;


--
-- Name: analisis_ia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analisis_ia (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    entrada jsonb,
    resultado jsonb,
    modelo character varying(50) DEFAULT 'gpt-4o-mini'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cache_hasta timestamp without time zone
);


--
-- Name: analisis_ia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.analisis_ia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: analisis_ia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.analisis_ia_id_seq OWNED BY public.analisis_ia.id;


--
-- Name: bloques_tiempo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bloques_tiempo (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: bloques_tiempo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bloques_tiempo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bloques_tiempo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bloques_tiempo_id_seq OWNED BY public.bloques_tiempo.id;


--
-- Name: categorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categorias (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    nombre character varying(80) NOT NULL,
    color character varying(7) DEFAULT '#7F77DD'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- Name: checkins_emocionales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checkins_emocionales (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    estado_animo character varying(50) NOT NULL,
    energia integer,
    sueno_horas numeric(4,1),
    notas text,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: checkins_emocionales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.checkins_emocionales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: checkins_emocionales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.checkins_emocionales_id_seq OWNED BY public.checkins_emocionales.id;


--
-- Name: comentarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comentarios (
    id integer NOT NULL,
    tarea_id integer NOT NULL,
    usuario_id integer NOT NULL,
    contenido text NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: comentarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comentarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comentarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comentarios_id_seq OWNED BY public.comentarios.id;


--
-- Name: conversaciones_ia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversaciones_ia (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    mensaje text NOT NULL,
    respuesta text NOT NULL,
    herramientas_usadas jsonb,
    tokens_usados integer DEFAULT 0,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: conversaciones_ia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversaciones_ia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversaciones_ia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversaciones_ia_id_seq OWNED BY public.conversaciones_ia.id;


--
-- Name: diario_personal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diario_personal (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    titulo character varying(200),
    contenido text NOT NULL,
    etiquetas jsonb DEFAULT '[]'::jsonb,
    es_publico boolean DEFAULT false,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: diario_personal_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.diario_personal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: diario_personal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.diario_personal_id_seq OWNED BY public.diario_personal.id;


--
-- Name: ejercicios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ejercicios (
    id integer NOT NULL,
    rutina_id integer,
    nombre character varying(100),
    grupo_muscular character varying(50),
    series_default integer DEFAULT 3,
    repeticiones_default integer DEFAULT 10,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: ejercicios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ejercicios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ejercicios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ejercicios_id_seq OWNED BY public.ejercicios.id;


--
-- Name: eventos_gamificacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.eventos_gamificacion (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    referencia_id integer NOT NULL,
    referencia_tipo character varying(20) NOT NULL,
    puntos integer NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: eventos_gamificacion_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.eventos_gamificacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: eventos_gamificacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.eventos_gamificacion_id_seq OWNED BY public.eventos_gamificacion.id;


--
-- Name: finanzas_categorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finanzas_categorias (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo character varying(10) NOT NULL,
    icono character varying(50),
    color character varying(7),
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT finanzas_categorias_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['ingreso'::character varying, 'gasto'::character varying])::text[])))
);


--
-- Name: finanzas_categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finanzas_categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finanzas_categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finanzas_categorias_id_seq OWNED BY public.finanzas_categorias.id;


--
-- Name: finanzas_cuentas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finanzas_cuentas (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo character varying(20) NOT NULL,
    saldo_inicial numeric(12,2) DEFAULT 0,
    moneda character varying(3) DEFAULT 'BOB'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT finanzas_cuentas_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['efectivo'::character varying, 'banco'::character varying, 'tarjeta_credito'::character varying, 'ahorro'::character varying])::text[])))
);


--
-- Name: finanzas_cuentas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finanzas_cuentas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finanzas_cuentas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finanzas_cuentas_id_seq OWNED BY public.finanzas_cuentas.id;


--
-- Name: finanzas_deudas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finanzas_deudas (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    monto_total numeric(12,2) NOT NULL,
    monto_pagado numeric(12,2) DEFAULT 0,
    cuota_mensual numeric(12,2) DEFAULT 0,
    tasa_interes numeric(5,2) DEFAULT 0,
    fecha_inicio date,
    fecha_vencimiento date,
    acreedor character varying(150),
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT finanzas_deudas_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'pagando'::character varying, 'completada'::character varying])::text[])))
);


--
-- Name: finanzas_deudas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finanzas_deudas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finanzas_deudas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finanzas_deudas_id_seq OWNED BY public.finanzas_deudas.id;


--
-- Name: finanzas_metas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finanzas_metas (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    monto_objetivo numeric(12,2) NOT NULL,
    monto_actual numeric(12,2) DEFAULT 0,
    fecha_limite date,
    estado character varying(20) DEFAULT 'en_progreso'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT finanzas_metas_estado_check CHECK (((estado)::text = ANY ((ARRAY['en_progreso'::character varying, 'completada'::character varying, 'fallida'::character varying])::text[])))
);


--
-- Name: finanzas_metas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finanzas_metas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finanzas_metas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finanzas_metas_id_seq OWNED BY public.finanzas_metas.id;


--
-- Name: finanzas_presupuestos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finanzas_presupuestos (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    categoria_id integer NOT NULL,
    mes integer NOT NULL,
    anio integer NOT NULL,
    limite numeric(12,2) NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT finanzas_presupuestos_mes_check CHECK (((mes >= 1) AND (mes <= 12)))
);


--
-- Name: finanzas_presupuestos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finanzas_presupuestos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finanzas_presupuestos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finanzas_presupuestos_id_seq OWNED BY public.finanzas_presupuestos.id;


--
-- Name: finanzas_transacciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finanzas_transacciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    categoria_id integer,
    cuenta_id integer,
    tipo character varying(15) NOT NULL,
    monto numeric(12,2) NOT NULL,
    descripcion text,
    fecha date NOT NULL,
    es_recurrente boolean DEFAULT false,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT finanzas_transacciones_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['ingreso'::character varying, 'gasto'::character varying, 'transferencia'::character varying])::text[])))
);


--
-- Name: finanzas_transacciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finanzas_transacciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finanzas_transacciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finanzas_transacciones_id_seq OWNED BY public.finanzas_transacciones.id;


--
-- Name: habitos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.habitos (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    titulo character varying(100) NOT NULL,
    descripcion text,
    frecuencia public.frecuencia_habito,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completado boolean DEFAULT false
);


--
-- Name: habitos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.habitos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: habitos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.habitos_id_seq OWNED BY public.habitos.id;


--
-- Name: historial_puntos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historial_puntos (
    id integer NOT NULL,
    usuario_id integer,
    puntos integer NOT NULL,
    motivo character varying(100) NOT NULL,
    referencia_tipo character varying(20),
    referencia_id integer,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: historial_puntos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.historial_puntos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: historial_puntos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.historial_puntos_id_seq OWNED BY public.historial_puntos.id;


--
-- Name: logros; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logros (
    id integer NOT NULL,
    codigo character varying(50) NOT NULL,
    titulo character varying(100) NOT NULL,
    descripcion text NOT NULL,
    icono character varying(10) DEFAULT '🏆'::character varying,
    puntos integer DEFAULT 50,
    condicion jsonb NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: logros_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.logros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: logros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.logros_id_seq OWNED BY public.logros.id;


--
-- Name: logros_usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logros_usuario (
    id integer NOT NULL,
    usuario_id integer,
    logro_id integer,
    obtenido_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: logros_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.logros_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: logros_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.logros_usuario_id_seq OWNED BY public.logros_usuario.id;


--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notificaciones (
    id integer NOT NULL,
    usuario_id integer,
    recordatorio_id integer,
    titulo character varying(200) NOT NULL,
    mensaje text,
    tipo character varying(20) DEFAULT 'app'::character varying,
    leida boolean DEFAULT false,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notificaciones_tipo_check CHECK (((tipo)::text = ANY (ARRAY[('app'::character varying)::text, ('push'::character varying)::text, ('email'::character varying)::text, ('ia'::character varying)::text])))
);


--
-- Name: notificaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notificaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notificaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notificaciones_id_seq OWNED BY public.notificaciones.id;


--
-- Name: pausas_activas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pausas_activas (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    ejercicio character varying(100) NOT NULL,
    duracion_minutos integer NOT NULL,
    programada_para timestamp without time zone,
    completada boolean DEFAULT false,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: pausas_activas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pausas_activas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pausas_activas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pausas_activas_id_seq OWNED BY public.pausas_activas.id;


--
-- Name: perfil_gamificacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.perfil_gamificacion (
    id integer NOT NULL,
    usuario_id integer,
    puntos_totales integer DEFAULT 0,
    nivel integer DEFAULT 1,
    xp_actual integer DEFAULT 0,
    xp_siguiente integer DEFAULT 100,
    racha_actual integer DEFAULT 0,
    mejor_racha integer DEFAULT 0,
    ultima_actividad date,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: perfil_gamificacion_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.perfil_gamificacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: perfil_gamificacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.perfil_gamificacion_id_seq OWNED BY public.perfil_gamificacion.id;


--
-- Name: pgmigrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pgmigrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


--
-- Name: pgmigrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pgmigrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pgmigrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pgmigrations_id_seq OWNED BY public.pgmigrations.id;


--
-- Name: pomodoro_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pomodoro_sessions (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    tarea_id integer,
    duracion_minutos integer NOT NULL,
    descanso_minutos integer DEFAULT 5,
    intervalo_numero integer DEFAULT 1,
    estado character varying(20) DEFAULT 'completada'::character varying,
    inicio_en timestamp without time zone NOT NULL,
    fin_en timestamp without time zone,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: pomodoro_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pomodoro_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pomodoro_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pomodoro_sessions_id_seq OWNED BY public.pomodoro_sessions.id;


--
-- Name: pomodoro_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pomodoro_settings (
    usuario_id integer NOT NULL,
    duracion_foco integer DEFAULT 25,
    descanso_corto integer DEFAULT 5,
    descanso_largo integer DEFAULT 15,
    intervalos_antes_descanso_largo integer DEFAULT 4,
    auto_iniciar_descanso boolean DEFAULT false,
    notificaciones_sonido boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: preferencias_notificacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preferencias_notificacion (
    id integer NOT NULL,
    usuario_id integer,
    notificaciones_activas boolean DEFAULT true,
    hora_silencio_inicio time without time zone DEFAULT '22:00:00'::time without time zone,
    hora_silencio_fin time without time zone DEFAULT '07:00:00'::time without time zone,
    tipo_agenda boolean DEFAULT true,
    tipo_habitos boolean DEFAULT true,
    tipo_manual boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: preferencias_notificacion_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.preferencias_notificacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: preferencias_notificacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.preferencias_notificacion_id_seq OWNED BY public.preferencias_notificacion.id;


--
-- Name: progreso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.progreso (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    tipo character varying(50),
    valor integer,
    fecha date
);


--
-- Name: progreso_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.progreso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: progreso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.progreso_id_seq OWNED BY public.progreso.id;


--
-- Name: proyecto_miembros; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyecto_miembros (
    id integer NOT NULL,
    proyecto_id integer NOT NULL,
    usuario_id integer NOT NULL,
    rol character varying(20) DEFAULT 'miembro'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: proyecto_miembros_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proyecto_miembros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proyecto_miembros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proyecto_miembros_id_seq OWNED BY public.proyecto_miembros.id;


--
-- Name: proyectos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proyectos (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    creador_id integer NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: proyectos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proyectos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proyectos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proyectos_id_seq OWNED BY public.proyectos.id;


--
-- Name: recordatorios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recordatorios (
    id integer NOT NULL,
    usuario_id integer,
    tipo character varying(20) NOT NULL,
    referencia_id integer,
    titulo character varying(200) NOT NULL,
    mensaje text,
    fecha_hora timestamp without time zone NOT NULL,
    anticipacion_min integer DEFAULT 0,
    es_recurrente boolean DEFAULT false,
    regla_recurrencia character varying(20),
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    intentos integer DEFAULT 0,
    ultimo_intento timestamp without time zone,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT recordatorios_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'enviado'::character varying, 'cancelado'::character varying, 'fallido'::character varying])::text[]))),
    CONSTRAINT recordatorios_regla_recurrencia_check CHECK (((regla_recurrencia)::text = ANY ((ARRAY['diario'::character varying, 'semanal'::character varying, 'mensual'::character varying, NULL::character varying])::text[]))),
    CONSTRAINT recordatorios_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['agenda'::character varying, 'habito'::character varying, 'manual'::character varying])::text[])))
);


--
-- Name: recordatorios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recordatorios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recordatorios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recordatorios_id_seq OWNED BY public.recordatorios.id;


--
-- Name: registros_entrenamiento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registros_entrenamiento (
    id integer NOT NULL,
    usuario_id integer,
    ejercicio_id integer,
    rutina_id integer,
    fecha date DEFAULT CURRENT_DATE,
    notas text,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: registros_entrenamiento_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registros_entrenamiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registros_entrenamiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registros_entrenamiento_id_seq OWNED BY public.registros_entrenamiento.id;


--
-- Name: registros_habitos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registros_habitos (
    id integer NOT NULL,
    habito_id integer NOT NULL,
    completado boolean DEFAULT false,
    fecha date NOT NULL
);


--
-- Name: registros_habitos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registros_habitos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registros_habitos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registros_habitos_id_seq OWNED BY public.registros_habitos.id;


--
-- Name: rutinas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rutinas (
    id integer NOT NULL,
    usuario_id integer,
    nombre character varying(100),
    descripcion text,
    dificultad public.nivel_dificultad DEFAULT 'principiante'::public.nivel_dificultad,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: rutinas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rutinas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rutinas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rutinas_id_seq OWNED BY public.rutinas.id;


--
-- Name: series_entrenamiento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.series_entrenamiento (
    id integer NOT NULL,
    registro_id integer,
    numero_serie integer,
    repeticiones integer,
    peso_kg numeric(5,2)
);


--
-- Name: series_entrenamiento_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.series_entrenamiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: series_entrenamiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.series_entrenamiento_id_seq OWNED BY public.series_entrenamiento.id;


--
-- Name: sugerencias_ia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sugerencias_ia (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    titulo character varying(200) NOT NULL,
    descripcion text,
    metadata jsonb,
    leida boolean DEFAULT false,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: sugerencias_ia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sugerencias_ia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sugerencias_ia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sugerencias_ia_id_seq OWNED BY public.sugerencias_ia.id;


--
-- Name: tareas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tareas (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    titulo character varying(100) NOT NULL,
    descripcion text,
    estado public.estado_tarea DEFAULT 'pendiente'::public.estado_tarea,
    prioridad public.prioridad_tarea DEFAULT 'media'::public.prioridad_tarea,
    fecha_limite timestamp without time zone,
    fecha_inicio timestamp without time zone,
    fecha_fin timestamp without time zone,
    duracion_minutos integer DEFAULT 30,
    todo_el_dia boolean DEFAULT false,
    es_recurrente boolean DEFAULT false,
    recurrencia character varying(20),
    auto_programado boolean DEFAULT false,
    categoria_id integer,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tareas_recurrencia_check CHECK (((recurrencia)::text = ANY ((ARRAY['diario'::character varying, 'semanal'::character varying, 'mensual'::character varying])::text[])))
);


--
-- Name: tareas_compartidas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tareas_compartidas (
    id integer NOT NULL,
    proyecto_id integer NOT NULL,
    creado_por integer NOT NULL,
    asignado_a integer,
    titulo character varying(200) NOT NULL,
    descripcion text,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    prioridad character varying(10) DEFAULT 'media'::character varying,
    fecha_limite timestamp without time zone,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: tareas_compartidas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tareas_compartidas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tareas_compartidas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tareas_compartidas_id_seq OWNED BY public.tareas_compartidas.id;


--
-- Name: tareas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tareas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tareas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tareas_id_seq OWNED BY public.tareas.id;


--
-- Name: usuario_gamificacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario_gamificacion (
    usuario_id integer NOT NULL,
    xp integer DEFAULT 0,
    nivel integer DEFAULT 1,
    streak integer DEFAULT 0,
    ultimo_registro timestamp without time zone
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email public.citext NOT NULL,
    password character varying(255) NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    google_id character varying(255),
    google_access_token text,
    google_refresh_token text,
    google_token_expiry timestamp without time zone
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: amistades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.amistades ALTER COLUMN id SET DEFAULT nextval('public.amistades_id_seq'::regclass);


--
-- Name: analisis_ia id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analisis_ia ALTER COLUMN id SET DEFAULT nextval('public.analisis_ia_id_seq'::regclass);


--
-- Name: bloques_tiempo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bloques_tiempo ALTER COLUMN id SET DEFAULT nextval('public.bloques_tiempo_id_seq'::regclass);


--
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- Name: checkins_emocionales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkins_emocionales ALTER COLUMN id SET DEFAULT nextval('public.checkins_emocionales_id_seq'::regclass);


--
-- Name: comentarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios ALTER COLUMN id SET DEFAULT nextval('public.comentarios_id_seq'::regclass);


--
-- Name: conversaciones_ia id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversaciones_ia ALTER COLUMN id SET DEFAULT nextval('public.conversaciones_ia_id_seq'::regclass);


--
-- Name: diario_personal id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diario_personal ALTER COLUMN id SET DEFAULT nextval('public.diario_personal_id_seq'::regclass);


--
-- Name: ejercicios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ejercicios ALTER COLUMN id SET DEFAULT nextval('public.ejercicios_id_seq'::regclass);


--
-- Name: eventos_gamificacion id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos_gamificacion ALTER COLUMN id SET DEFAULT nextval('public.eventos_gamificacion_id_seq'::regclass);


--
-- Name: finanzas_categorias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_categorias ALTER COLUMN id SET DEFAULT nextval('public.finanzas_categorias_id_seq'::regclass);


--
-- Name: finanzas_cuentas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_cuentas ALTER COLUMN id SET DEFAULT nextval('public.finanzas_cuentas_id_seq'::regclass);


--
-- Name: finanzas_deudas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_deudas ALTER COLUMN id SET DEFAULT nextval('public.finanzas_deudas_id_seq'::regclass);


--
-- Name: finanzas_metas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_metas ALTER COLUMN id SET DEFAULT nextval('public.finanzas_metas_id_seq'::regclass);


--
-- Name: finanzas_presupuestos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_presupuestos ALTER COLUMN id SET DEFAULT nextval('public.finanzas_presupuestos_id_seq'::regclass);


--
-- Name: finanzas_transacciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_transacciones ALTER COLUMN id SET DEFAULT nextval('public.finanzas_transacciones_id_seq'::regclass);


--
-- Name: habitos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habitos ALTER COLUMN id SET DEFAULT nextval('public.habitos_id_seq'::regclass);


--
-- Name: historial_puntos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_puntos ALTER COLUMN id SET DEFAULT nextval('public.historial_puntos_id_seq'::regclass);


--
-- Name: logros id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logros ALTER COLUMN id SET DEFAULT nextval('public.logros_id_seq'::regclass);


--
-- Name: logros_usuario id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logros_usuario ALTER COLUMN id SET DEFAULT nextval('public.logros_usuario_id_seq'::regclass);


--
-- Name: notificaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones ALTER COLUMN id SET DEFAULT nextval('public.notificaciones_id_seq'::regclass);


--
-- Name: pausas_activas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pausas_activas ALTER COLUMN id SET DEFAULT nextval('public.pausas_activas_id_seq'::regclass);


--
-- Name: perfil_gamificacion id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perfil_gamificacion ALTER COLUMN id SET DEFAULT nextval('public.perfil_gamificacion_id_seq'::regclass);


--
-- Name: pgmigrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pgmigrations ALTER COLUMN id SET DEFAULT nextval('public.pgmigrations_id_seq'::regclass);


--
-- Name: pomodoro_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pomodoro_sessions ALTER COLUMN id SET DEFAULT nextval('public.pomodoro_sessions_id_seq'::regclass);


--
-- Name: preferencias_notificacion id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferencias_notificacion ALTER COLUMN id SET DEFAULT nextval('public.preferencias_notificacion_id_seq'::regclass);


--
-- Name: progreso id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progreso ALTER COLUMN id SET DEFAULT nextval('public.progreso_id_seq'::regclass);


--
-- Name: proyecto_miembros id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyecto_miembros ALTER COLUMN id SET DEFAULT nextval('public.proyecto_miembros_id_seq'::regclass);


--
-- Name: proyectos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyectos ALTER COLUMN id SET DEFAULT nextval('public.proyectos_id_seq'::regclass);


--
-- Name: recordatorios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recordatorios ALTER COLUMN id SET DEFAULT nextval('public.recordatorios_id_seq'::regclass);


--
-- Name: registros_entrenamiento id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_entrenamiento ALTER COLUMN id SET DEFAULT nextval('public.registros_entrenamiento_id_seq'::regclass);


--
-- Name: registros_habitos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_habitos ALTER COLUMN id SET DEFAULT nextval('public.registros_habitos_id_seq'::regclass);


--
-- Name: rutinas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutinas ALTER COLUMN id SET DEFAULT nextval('public.rutinas_id_seq'::regclass);


--
-- Name: series_entrenamiento id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.series_entrenamiento ALTER COLUMN id SET DEFAULT nextval('public.series_entrenamiento_id_seq'::regclass);


--
-- Name: sugerencias_ia id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sugerencias_ia ALTER COLUMN id SET DEFAULT nextval('public.sugerencias_ia_id_seq'::regclass);


--
-- Name: tareas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas ALTER COLUMN id SET DEFAULT nextval('public.tareas_id_seq'::regclass);


--
-- Name: tareas_compartidas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas_compartidas ALTER COLUMN id SET DEFAULT nextval('public.tareas_compartidas_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: amistades amistades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT amistades_pkey PRIMARY KEY (id);


--
-- Name: amistades amistades_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT amistades_unique UNIQUE (solicitante_id, receptor_id);


--
-- Name: analisis_ia analisis_ia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analisis_ia
    ADD CONSTRAINT analisis_ia_pkey PRIMARY KEY (id);


--
-- Name: bloques_tiempo bloques_tiempo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bloques_tiempo
    ADD CONSTRAINT bloques_tiempo_pkey PRIMARY KEY (id);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: checkins_emocionales checkins_emocionales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkins_emocionales
    ADD CONSTRAINT checkins_emocionales_pkey PRIMARY KEY (id);


--
-- Name: checkins_emocionales checkins_emocionales_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkins_emocionales
    ADD CONSTRAINT checkins_emocionales_unique UNIQUE (usuario_id, fecha);


--
-- Name: comentarios comentarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_pkey PRIMARY KEY (id);


--
-- Name: conversaciones_ia conversaciones_ia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversaciones_ia
    ADD CONSTRAINT conversaciones_ia_pkey PRIMARY KEY (id);


--
-- Name: diario_personal diario_personal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diario_personal
    ADD CONSTRAINT diario_personal_pkey PRIMARY KEY (id);


--
-- Name: ejercicios ejercicios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ejercicios
    ADD CONSTRAINT ejercicios_pkey PRIMARY KEY (id);


--
-- Name: eventos_gamificacion eventos_gamificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos_gamificacion
    ADD CONSTRAINT eventos_gamificacion_pkey PRIMARY KEY (id);


--
-- Name: eventos_gamificacion eventos_gamificacion_usuario_id_referencia_tipo_referencia__key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.eventos_gamificacion
    ADD CONSTRAINT eventos_gamificacion_usuario_id_referencia_tipo_referencia__key UNIQUE (usuario_id, referencia_tipo, referencia_id, tipo);


--
-- Name: finanzas_categorias finanzas_categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_categorias
    ADD CONSTRAINT finanzas_categorias_pkey PRIMARY KEY (id);


--
-- Name: finanzas_cuentas finanzas_cuentas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_cuentas
    ADD CONSTRAINT finanzas_cuentas_pkey PRIMARY KEY (id);


--
-- Name: finanzas_deudas finanzas_deudas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_deudas
    ADD CONSTRAINT finanzas_deudas_pkey PRIMARY KEY (id);


--
-- Name: finanzas_metas finanzas_metas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_metas
    ADD CONSTRAINT finanzas_metas_pkey PRIMARY KEY (id);


--
-- Name: finanzas_presupuestos finanzas_presupuestos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_presupuestos
    ADD CONSTRAINT finanzas_presupuestos_pkey PRIMARY KEY (id);


--
-- Name: finanzas_presupuestos finanzas_presupuestos_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_presupuestos
    ADD CONSTRAINT finanzas_presupuestos_unique UNIQUE (usuario_id, categoria_id, mes, anio);


--
-- Name: finanzas_transacciones finanzas_transacciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_transacciones
    ADD CONSTRAINT finanzas_transacciones_pkey PRIMARY KEY (id);


--
-- Name: habitos habitos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habitos
    ADD CONSTRAINT habitos_pkey PRIMARY KEY (id);


--
-- Name: historial_puntos historial_puntos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_puntos
    ADD CONSTRAINT historial_puntos_pkey PRIMARY KEY (id);


--
-- Name: logros logros_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logros
    ADD CONSTRAINT logros_codigo_key UNIQUE (codigo);


--
-- Name: logros logros_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logros
    ADD CONSTRAINT logros_pkey PRIMARY KEY (id);


--
-- Name: logros_usuario logros_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logros_usuario
    ADD CONSTRAINT logros_usuario_pkey PRIMARY KEY (id);


--
-- Name: logros_usuario logros_usuario_usuario_id_logro_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logros_usuario
    ADD CONSTRAINT logros_usuario_usuario_id_logro_id_key UNIQUE (usuario_id, logro_id);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);


--
-- Name: pausas_activas pausas_activas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pausas_activas
    ADD CONSTRAINT pausas_activas_pkey PRIMARY KEY (id);


--
-- Name: perfil_gamificacion perfil_gamificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perfil_gamificacion
    ADD CONSTRAINT perfil_gamificacion_pkey PRIMARY KEY (id);


--
-- Name: perfil_gamificacion perfil_gamificacion_usuario_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perfil_gamificacion
    ADD CONSTRAINT perfil_gamificacion_usuario_id_key UNIQUE (usuario_id);


--
-- Name: pgmigrations pgmigrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pgmigrations
    ADD CONSTRAINT pgmigrations_pkey PRIMARY KEY (id);


--
-- Name: pomodoro_sessions pomodoro_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pomodoro_sessions
    ADD CONSTRAINT pomodoro_sessions_pkey PRIMARY KEY (id);


--
-- Name: pomodoro_settings pomodoro_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pomodoro_settings
    ADD CONSTRAINT pomodoro_settings_pkey PRIMARY KEY (usuario_id);


--
-- Name: preferencias_notificacion preferencias_notificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferencias_notificacion
    ADD CONSTRAINT preferencias_notificacion_pkey PRIMARY KEY (id);


--
-- Name: preferencias_notificacion preferencias_notificacion_usuario_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferencias_notificacion
    ADD CONSTRAINT preferencias_notificacion_usuario_id_key UNIQUE (usuario_id);


--
-- Name: progreso progreso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progreso
    ADD CONSTRAINT progreso_pkey PRIMARY KEY (id);


--
-- Name: progreso progreso_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progreso
    ADD CONSTRAINT progreso_unique UNIQUE (usuario_id, tipo, fecha);


--
-- Name: proyecto_miembros proyecto_miembros_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyecto_miembros
    ADD CONSTRAINT proyecto_miembros_pkey PRIMARY KEY (id);


--
-- Name: proyecto_miembros proyecto_miembros_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyecto_miembros
    ADD CONSTRAINT proyecto_miembros_unique UNIQUE (proyecto_id, usuario_id);


--
-- Name: proyectos proyectos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_pkey PRIMARY KEY (id);


--
-- Name: recordatorios recordatorios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recordatorios
    ADD CONSTRAINT recordatorios_pkey PRIMARY KEY (id);


--
-- Name: registros_entrenamiento registros_entrenamiento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_entrenamiento
    ADD CONSTRAINT registros_entrenamiento_pkey PRIMARY KEY (id);


--
-- Name: registros_habitos registros_habitos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_habitos
    ADD CONSTRAINT registros_habitos_pkey PRIMARY KEY (id);


--
-- Name: rutinas rutinas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutinas
    ADD CONSTRAINT rutinas_pkey PRIMARY KEY (id);


--
-- Name: series_entrenamiento series_entrenamiento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.series_entrenamiento
    ADD CONSTRAINT series_entrenamiento_pkey PRIMARY KEY (id);


--
-- Name: sugerencias_ia sugerencias_ia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sugerencias_ia
    ADD CONSTRAINT sugerencias_ia_pkey PRIMARY KEY (id);


--
-- Name: tareas_compartidas tareas_compartidas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas_compartidas
    ADD CONSTRAINT tareas_compartidas_pkey PRIMARY KEY (id);


--
-- Name: tareas tareas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_pkey PRIMARY KEY (id);


--
-- Name: usuario_gamificacion usuario_gamificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_gamificacion
    ADD CONSTRAINT usuario_gamificacion_pkey PRIMARY KEY (usuario_id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: checkins_emocionales_usuario_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX checkins_emocionales_usuario_id_index ON public.checkins_emocionales USING btree (usuario_id);


--
-- Name: diario_personal_usuario_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX diario_personal_usuario_id_index ON public.diario_personal USING btree (usuario_id);


--
-- Name: finanzas_categorias_usuario_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX finanzas_categorias_usuario_id_index ON public.finanzas_categorias USING btree (usuario_id);


--
-- Name: finanzas_cuentas_usuario_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX finanzas_cuentas_usuario_id_index ON public.finanzas_cuentas USING btree (usuario_id);


--
-- Name: finanzas_deudas_usuario_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX finanzas_deudas_usuario_id_index ON public.finanzas_deudas USING btree (usuario_id);


--
-- Name: finanzas_metas_usuario_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX finanzas_metas_usuario_id_index ON public.finanzas_metas USING btree (usuario_id);


--
-- Name: finanzas_presupuestos_usuario_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX finanzas_presupuestos_usuario_id_index ON public.finanzas_presupuestos USING btree (usuario_id);


--
-- Name: finanzas_transacciones_categoria_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX finanzas_transacciones_categoria_id_index ON public.finanzas_transacciones USING btree (categoria_id);


--
-- Name: finanzas_transacciones_cuenta_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX finanzas_transacciones_cuenta_id_index ON public.finanzas_transacciones USING btree (cuenta_id);


--
-- Name: finanzas_transacciones_fecha_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX finanzas_transacciones_fecha_index ON public.finanzas_transacciones USING btree (fecha);


--
-- Name: finanzas_transacciones_usuario_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX finanzas_transacciones_usuario_id_index ON public.finanzas_transacciones USING btree (usuario_id);


--
-- Name: idx_analisis_ia_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analisis_ia_tipo ON public.analisis_ia USING btree (tipo);


--
-- Name: idx_analisis_ia_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analisis_ia_usuario ON public.analisis_ia USING btree (usuario_id);


--
-- Name: idx_categorias_usuario_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categorias_usuario_id ON public.categorias USING btree (usuario_id);


--
-- Name: idx_conversaciones_ia_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversaciones_ia_usuario ON public.conversaciones_ia USING btree (usuario_id);


--
-- Name: idx_habitos_usuario_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_habitos_usuario_id ON public.habitos USING btree (usuario_id);


--
-- Name: idx_historial_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_historial_usuario ON public.historial_puntos USING btree (usuario_id);


--
-- Name: idx_logros_usuario_uid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logros_usuario_uid ON public.logros_usuario USING btree (usuario_id);


--
-- Name: idx_notificaciones_leida; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notificaciones_leida ON public.notificaciones USING btree (leida);


--
-- Name: idx_notificaciones_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notificaciones_usuario ON public.notificaciones USING btree (usuario_id);


--
-- Name: idx_perfil_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_perfil_usuario ON public.perfil_gamificacion USING btree (usuario_id);


--
-- Name: idx_perfil_puntos; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_perfil_puntos ON public.perfil_gamificacion USING btree (puntos_totales DESC);


--
-- Name: idx_recordatorios_estado; Type: INDEX; Schema: public; Owner: --
--
-- Name: idx_recordatorios_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recordatorios_estado ON public.recordatorios USING btree (estado);


--
-- Name: idx_recordatorios_fecha_hora; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recordatorios_fecha_hora ON public.recordatorios USING btree (fecha_hora);


--
-- Name: idx_recordatorios_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recordatorios_usuario ON public.recordatorios USING btree (usuario_id);


--
-- Name: idx_registros_fecha; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registros_fecha ON public.registros_habitos USING btree (fecha);


--
-- Name: idx_registros_habito_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registros_habito_id ON public.registros_habitos USING btree (habito_id);


--
-- Name: idx_sugerencias_ia_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sugerencias_ia_usuario ON public.sugerencias_ia USING btree (usuario_id);


--
-- Name: idx_tareas_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tareas_estado ON public.tareas USING btree (estado);


--
-- Name: idx_tareas_fecha_inicio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tareas_fecha_inicio ON public.tareas USING btree (fecha_inicio);


--
-- Name: idx_tareas_fecha_limite; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tareas_fecha_limite ON public.tareas USING btree (fecha_limite);


--
-- Name: idx_tareas_prioridad; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tareas_prioridad ON public.tareas USING btree (prioridad);


--
-- Name: idx_tareas_usuario_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tareas_usuario_id ON public.tareas USING btree (usuario_id);


--
-- Name: idx_usuarios_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_email ON public.usuarios USING btree (email);


--
-- Name: pausas_activas_usuario_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pausas_activas_usuario_id_index ON public.pausas_activas USING btree (usuario_id);


--
-- Name: pomodoro_sessions_inicio_en_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pomodoro_sessions_inicio_en_index ON public.pomodoro_sessions USING btree (inicio_en);


--
-- Name: pomodoro_sessions_tarea_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pomodoro_sessions_tarea_id_index ON public.pomodoro_sessions USING btree (tarea_id);


--
-- Name: pomodoro_sessions_usuario_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pomodoro_sessions_usuario_id_index ON public.pomodoro_sessions USING btree (usuario_id);


--
-- Name: uniq_notificacion_recordatorio; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uniq_notificacion_recordatorio ON public.notificaciones USING btree (recordatorio_id, usuario_id);


--
-- Name: unique_evento_gamificacion; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_evento_gamificacion ON public.eventos_gamificacion USING btree (usuario_id, tipo, referencia_tipo, referencia_id);


--
-- Name: categorias trigger_categorias_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_categorias_updated BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- Name: habitos trigger_habitos_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_habitos_updated BEFORE UPDATE ON public.habitos FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- Name: perfil_gamificacion trigger_perfil_actualizado; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_perfil_actualizado BEFORE UPDATE ON public.perfil_gamificacion FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: preferencias_notificacion trigger_preferencias_actualizado; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_preferencias_actualizado BEFORE UPDATE ON public.preferencias_notificacion FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: recordatorios trigger_recordatorios_actualizado; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_recordatorios_actualizado BEFORE UPDATE ON public.recordatorios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: tareas trigger_tareas_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_tareas_updated BEFORE UPDATE ON public.tareas FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- Name: usuarios trigger_usuarios_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_usuarios_updated BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- Name: amistades amistades_receptor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT amistades_receptor_id_fkey FOREIGN KEY (receptor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: amistades amistades_solicitante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT amistades_solicitante_id_fkey FOREIGN KEY (solicitante_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: analisis_ia analisis_ia_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analisis_ia
    ADD CONSTRAINT analisis_ia_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: bloques_tiempo bloques_tiempo_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bloques_tiempo
    ADD CONSTRAINT bloques_tiempo_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: categorias categorias_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: checkins_emocionales checkins_emocionales_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkins_emocionales
    ADD CONSTRAINT checkins_emocionales_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: comentarios comentarios_tarea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tareas_compartidas(id) ON DELETE CASCADE;


--
-- Name: comentarios comentarios_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: conversaciones_ia conversaciones_ia_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversaciones_ia
    ADD CONSTRAINT conversaciones_ia_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: diario_personal diario_personal_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diario_personal
    ADD CONSTRAINT diario_personal_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: ejercicios ejercicios_rutina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ejercicios
    ADD CONSTRAINT ejercicios_rutina_id_fkey FOREIGN KEY (rutina_id) REFERENCES public.rutinas(id) ON DELETE CASCADE;


--
-- Name: finanzas_categorias finanzas_categorias_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_categorias
    ADD CONSTRAINT finanzas_categorias_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: finanzas_cuentas finanzas_cuentas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_cuentas
    ADD CONSTRAINT finanzas_cuentas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: finanzas_deudas finanzas_deudas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_deudas
    ADD CONSTRAINT finanzas_deudas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: finanzas_metas finanzas_metas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_metas
    ADD CONSTRAINT finanzas_metas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: finanzas_presupuestos finanzas_presupuestos_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_presupuestos
    ADD CONSTRAINT finanzas_presupuestos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.finanzas_categorias(id) ON DELETE CASCADE;


--
-- Name: finanzas_presupuestos finanzas_presupuestos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_presupuestos
    ADD CONSTRAINT finanzas_presupuestos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: finanzas_transacciones finanzas_transacciones_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_transacciones
    ADD CONSTRAINT finanzas_transacciones_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.finanzas_categorias(id) ON DELETE SET NULL;


--
-- Name: finanzas_transacciones finanzas_transacciones_cuenta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_transacciones
    ADD CONSTRAINT finanzas_transacciones_cuenta_id_fkey FOREIGN KEY (cuenta_id) REFERENCES public.finanzas_cuentas(id) ON DELETE SET NULL;


--
-- Name: finanzas_transacciones finanzas_transacciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finanzas_transacciones
    ADD CONSTRAINT finanzas_transacciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: tareas fk_tareas_categoria; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT fk_tareas_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;


--
-- Name: habitos habitos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habitos
    ADD CONSTRAINT habitos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: historial_puntos historial_puntos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_puntos
    ADD CONSTRAINT historial_puntos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: logros_usuario logros_usuario_logro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logros_usuario
    ADD CONSTRAINT logros_usuario_logro_id_fkey FOREIGN KEY (logro_id) REFERENCES public.logros(id) ON DELETE CASCADE;


--
-- Name: logros_usuario logros_usuario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logros_usuario
    ADD CONSTRAINT logros_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: notificaciones notificaciones_recordatorio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_recordatorio_id_fkey FOREIGN KEY (recordatorio_id) REFERENCES public.recordatorios(id) ON DELETE SET NULL;


--
-- Name: notificaciones notificaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: pausas_activas pausas_activas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pausas_activas
    ADD CONSTRAINT pausas_activas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: perfil_gamificacion perfil_gamificacion_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.perfil_gamificacion
    ADD CONSTRAINT perfil_gamificacion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: pomodoro_sessions pomodoro_sessions_tarea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pomodoro_sessions
    ADD CONSTRAINT pomodoro_sessions_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tareas(id) ON DELETE SET NULL;


--
-- Name: pomodoro_sessions pomodoro_sessions_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pomodoro_sessions
    ADD CONSTRAINT pomodoro_sessions_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: pomodoro_settings pomodoro_settings_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pomodoro_settings
    ADD CONSTRAINT pomodoro_settings_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: preferencias_notificacion preferencias_notificacion_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferencias_notificacion
    ADD CONSTRAINT preferencias_notificacion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: progreso progreso_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progreso
    ADD CONSTRAINT progreso_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: proyecto_miembros proyecto_miembros_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyecto_miembros
    ADD CONSTRAINT proyecto_miembros_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: proyecto_miembros proyecto_miembros_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyecto_miembros
    ADD CONSTRAINT proyecto_miembros_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: proyectos proyectos_creador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_creador_id_fkey FOREIGN KEY (creador_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: recordatorios recordatorios_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recordatorios
    ADD CONSTRAINT recordatorios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: registros_entrenamiento registros_entrenamiento_ejercicio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_entrenamiento
    ADD CONSTRAINT registros_entrenamiento_ejercicio_id_fkey FOREIGN KEY (ejercicio_id) REFERENCES public.ejercicios(id) ON DELETE CASCADE;


--
-- Name: registros_entrenamiento registros_entrenamiento_rutina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_entrenamiento
    ADD CONSTRAINT registros_entrenamiento_rutina_id_fkey FOREIGN KEY (rutina_id) REFERENCES public.rutinas(id) ON DELETE SET NULL;


--
-- Name: registros_entrenamiento registros_entrenamiento_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_entrenamiento
    ADD CONSTRAINT registros_entrenamiento_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: registros_habitos registros_habitos_habito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_habitos
    ADD CONSTRAINT registros_habitos_habito_id_fkey FOREIGN KEY (habito_id) REFERENCES public.habitos(id) ON DELETE CASCADE;


--
-- Name: rutinas rutinas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutinas
    ADD CONSTRAINT rutinas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: series_entrenamiento series_entrenamiento_registro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.series_entrenamiento
    ADD CONSTRAINT series_entrenamiento_registro_id_fkey FOREIGN KEY (registro_id) REFERENCES public.registros_entrenamiento(id) ON DELETE CASCADE;


--
-- Name: sugerencias_ia sugerencias_ia_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sugerencias_ia
    ADD CONSTRAINT sugerencias_ia_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: tareas_compartidas tareas_compartidas_asignado_a_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas_compartidas
    ADD CONSTRAINT tareas_compartidas_asignado_a_fkey FOREIGN KEY (asignado_a) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: tareas_compartidas tareas_compartidas_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas_compartidas
    ADD CONSTRAINT tareas_compartidas_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: tareas_compartidas tareas_compartidas_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas_compartidas
    ADD CONSTRAINT tareas_compartidas_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: tareas tareas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: metas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metas (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    descripcion text,
    categoria character varying(50) DEFAULT 'personal'::character varying,
    progreso numeric(5,2) DEFAULT 0,
    fecha_inicio date,
    fecha_fin date,
    estado character varying(20) DEFAULT 'en_progreso'::character varying,
    es_borrador boolean DEFAULT false,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE public.metas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.metas_id_seq OWNED BY public.metas.id;

ALTER TABLE ONLY public.metas ALTER COLUMN id SET DEFAULT nextval('public.metas_id_seq'::regclass);

ALTER TABLE ONLY public.metas
    ADD CONSTRAINT metas_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.metas
    ADD CONSTRAINT metas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;

CREATE INDEX public.metas_usuario_id_idx ON public.metas USING btree (usuario_id);

--
-- Name: key_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.key_results (
    id integer NOT NULL,
    meta_id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    descripcion text,
    progreso numeric(5,2) DEFAULT 0,
    orden integer DEFAULT 0,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE public.key_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.key_results_id_seq OWNED BY public.key_results.id;

ALTER TABLE ONLY public.key_results ALTER COLUMN id SET DEFAULT nextval('public.key_results_id_seq'::regclass);

ALTER TABLE ONLY public.key_results
    ADD CONSTRAINT key_results_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.key_results
    ADD CONSTRAINT key_results_meta_id_fkey FOREIGN KEY (meta_id) REFERENCES public.metas(id) ON DELETE CASCADE;

CREATE INDEX public.key_results_meta_id_idx ON public.key_results USING btree (meta_id);

--
-- Name: meta_progreso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meta_progreso (
    id integer NOT NULL,
    meta_id integer NOT NULL,
    progreso numeric(5,2) NOT NULL,
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE public.meta_progreso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.meta_progreso_id_seq OWNED BY public.meta_progreso.id;

ALTER TABLE ONLY public.meta_progreso ALTER COLUMN id SET DEFAULT nextval('public.meta_progreso_id_seq'::regclass);

ALTER TABLE ONLY public.meta_progreso
    ADD CONSTRAINT meta_progreso_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.meta_progreso
    ADD CONSTRAINT meta_progreso_meta_id_fkey FOREIGN KEY (meta_id) REFERENCES public.metas(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.meta_progreso
    ADD CONSTRAINT meta_progreso_unique UNIQUE (meta_id, fecha);

CREATE INDEX public.meta_progreso_meta_id_idx ON public.meta_progreso USING btree (meta_id);

--
-- PostgreSQL database dump complete
--

\unrestrict qx7QFmP5tWhJHS0AqHQTxwyQdswyW0WHva4eVYd1gftZhHggydCqVa2XBwdWuJk

