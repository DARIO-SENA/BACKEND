--
-- PostgreSQL database dump
--

\restrict yHnNrbIk5cEP4ydVUit2gvybA8aqPXFvqw0QKxMVAV0iebesdmcuJ6AVrxSJdTZ

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-27 23:38:26

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
-- TOC entry 2 (class 3079 OID 32932)
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- TOC entry 5839 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- TOC entry 989 (class 1247 OID 33038)
-- Name: estado_tarea; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_tarea AS ENUM (
    'pendiente',
    'completada',
    'cancelada',
    'en_progreso'
);


ALTER TYPE public.estado_tarea OWNER TO postgres;

--
-- TOC entry 995 (class 1247 OID 33054)
-- Name: frecuencia_habito; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.frecuencia_habito AS ENUM (
    'diario',
    'semanal',
    'mensual'
);


ALTER TYPE public.frecuencia_habito OWNER TO postgres;

--
-- TOC entry 1106 (class 1247 OID 67338)
-- Name: nivel_dificultad; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nivel_dificultad AS ENUM (
    'principiante',
    'intermedio',
    'avanzado'
);


ALTER TYPE public.nivel_dificultad OWNER TO postgres;

--
-- TOC entry 992 (class 1247 OID 33046)
-- Name: prioridad_tarea; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.prioridad_tarea AS ENUM (
    'alta',
    'media',
    'baja'
);


ALTER TYPE public.prioridad_tarea OWNER TO postgres;

--
-- TOC entry 359 (class 1255 OID 33186)
-- Name: actualizar_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_timestamp() OWNER TO postgres;

--
-- TOC entry 322 (class 1255 OID 41287)
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 272 (class 1259 OID 66115)
-- Name: amistades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.amistades (
    id integer NOT NULL,
    solicitante_id integer NOT NULL,
    receptor_id integer NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.amistades OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 66114)
-- Name: amistades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.amistades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.amistades_id_seq OWNER TO postgres;

--
-- TOC entry 5840 (class 0 OID 0)
-- Dependencies: 271
-- Name: amistades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.amistades_id_seq OWNED BY public.amistades.id;


--
-- TOC entry 252 (class 1259 OID 65878)
-- Name: analisis_ia; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.analisis_ia OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 65877)
-- Name: analisis_ia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analisis_ia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analisis_ia_id_seq OWNER TO postgres;

--
-- TOC entry 5841 (class 0 OID 0)
-- Dependencies: 251
-- Name: analisis_ia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analisis_ia_id_seq OWNED BY public.analisis_ia.id;


--
-- TOC entry 270 (class 1259 OID 66095)
-- Name: bloques_tiempo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bloques_tiempo (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    auto_programado boolean DEFAULT false
);


ALTER TABLE public.bloques_tiempo OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 66094)
-- Name: bloques_tiempo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bloques_tiempo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bloques_tiempo_id_seq OWNER TO postgres;

--
-- TOC entry 5842 (class 0 OID 0)
-- Dependencies: 269
-- Name: bloques_tiempo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bloques_tiempo_id_seq OWNED BY public.bloques_tiempo.id;


--
-- TOC entry 229 (class 1259 OID 33140)
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    nombre character varying(80) NOT NULL,
    color character varying(7) DEFAULT '#7F77DD'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 33139)
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_id_seq OWNER TO postgres;

--
-- TOC entry 5843 (class 0 OID 0)
-- Dependencies: 228
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- TOC entry 285 (class 1259 OID 67272)
-- Name: checkins_emocionales; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.checkins_emocionales OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 67271)
-- Name: checkins_emocionales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checkins_emocionales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checkins_emocionales_id_seq OWNER TO postgres;

--
-- TOC entry 5844 (class 0 OID 0)
-- Dependencies: 284
-- Name: checkins_emocionales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checkins_emocionales_id_seq OWNED BY public.checkins_emocionales.id;


--
-- TOC entry 280 (class 1259 OID 66214)
-- Name: comentarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comentarios (
    id integer NOT NULL,
    tarea_id integer NOT NULL,
    usuario_id integer NOT NULL,
    contenido text NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comentarios OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 66213)
-- Name: comentarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comentarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comentarios_id_seq OWNER TO postgres;

--
-- TOC entry 5845 (class 0 OID 0)
-- Dependencies: 279
-- Name: comentarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comentarios_id_seq OWNED BY public.comentarios.id;


--
-- TOC entry 256 (class 1259 OID 65917)
-- Name: conversaciones_ia; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.conversaciones_ia OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 65916)
-- Name: conversaciones_ia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conversaciones_ia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversaciones_ia_id_seq OWNER TO postgres;

--
-- TOC entry 5846 (class 0 OID 0)
-- Dependencies: 255
-- Name: conversaciones_ia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conversaciones_ia_id_seq OWNED BY public.conversaciones_ia.id;


--
-- TOC entry 287 (class 1259 OID 67296)
-- Name: diario_personal; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.diario_personal OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 67295)
-- Name: diario_personal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diario_personal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diario_personal_id_seq OWNER TO postgres;

--
-- TOC entry 5847 (class 0 OID 0)
-- Dependencies: 286
-- Name: diario_personal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diario_personal_id_seq OWNED BY public.diario_personal.id;


--
-- TOC entry 293 (class 1259 OID 67364)
-- Name: ejercicios; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.ejercicios OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 67363)
-- Name: ejercicios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ejercicios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ejercicios_id_seq OWNER TO postgres;

--
-- TOC entry 5848 (class 0 OID 0)
-- Dependencies: 292
-- Name: ejercicios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ejercicios_id_seq OWNED BY public.ejercicios.id;


--
-- TOC entry 248 (class 1259 OID 57759)
-- Name: eventos_gamificacion; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.eventos_gamificacion OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 57758)
-- Name: eventos_gamificacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.eventos_gamificacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.eventos_gamificacion_id_seq OWNER TO postgres;

--
-- TOC entry 5849 (class 0 OID 0)
-- Dependencies: 247
-- Name: eventos_gamificacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.eventos_gamificacion_id_seq OWNED BY public.eventos_gamificacion.id;


--
-- TOC entry 258 (class 1259 OID 65941)
-- Name: finanzas_categorias; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.finanzas_categorias OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 65940)
-- Name: finanzas_categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.finanzas_categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.finanzas_categorias_id_seq OWNER TO postgres;

--
-- TOC entry 5850 (class 0 OID 0)
-- Dependencies: 257
-- Name: finanzas_categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.finanzas_categorias_id_seq OWNED BY public.finanzas_categorias.id;


--
-- TOC entry 260 (class 1259 OID 65961)
-- Name: finanzas_cuentas; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.finanzas_cuentas OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 65960)
-- Name: finanzas_cuentas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.finanzas_cuentas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.finanzas_cuentas_id_seq OWNER TO postgres;

--
-- TOC entry 5851 (class 0 OID 0)
-- Dependencies: 259
-- Name: finanzas_cuentas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.finanzas_cuentas_id_seq OWNED BY public.finanzas_cuentas.id;


--
-- TOC entry 268 (class 1259 OID 66071)
-- Name: finanzas_deudas; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.finanzas_deudas OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 66070)
-- Name: finanzas_deudas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.finanzas_deudas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.finanzas_deudas_id_seq OWNER TO postgres;

--
-- TOC entry 5852 (class 0 OID 0)
-- Dependencies: 267
-- Name: finanzas_deudas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.finanzas_deudas_id_seq OWNED BY public.finanzas_deudas.id;


--
-- TOC entry 266 (class 1259 OID 66049)
-- Name: finanzas_metas; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.finanzas_metas OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 66048)
-- Name: finanzas_metas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.finanzas_metas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.finanzas_metas_id_seq OWNER TO postgres;

--
-- TOC entry 5853 (class 0 OID 0)
-- Dependencies: 265
-- Name: finanzas_metas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.finanzas_metas_id_seq OWNED BY public.finanzas_metas.id;


--
-- TOC entry 264 (class 1259 OID 66020)
-- Name: finanzas_presupuestos; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.finanzas_presupuestos OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 66019)
-- Name: finanzas_presupuestos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.finanzas_presupuestos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.finanzas_presupuestos_id_seq OWNER TO postgres;

--
-- TOC entry 5854 (class 0 OID 0)
-- Dependencies: 263
-- Name: finanzas_presupuestos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.finanzas_presupuestos_id_seq OWNED BY public.finanzas_presupuestos.id;


--
-- TOC entry 262 (class 1259 OID 65983)
-- Name: finanzas_transacciones; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.finanzas_transacciones OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 65982)
-- Name: finanzas_transacciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.finanzas_transacciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.finanzas_transacciones_id_seq OWNER TO postgres;

--
-- TOC entry 5855 (class 0 OID 0)
-- Dependencies: 261
-- Name: finanzas_transacciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.finanzas_transacciones_id_seq OWNED BY public.finanzas_transacciones.id;


--
-- TOC entry 223 (class 1259 OID 33079)
-- Name: habitos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.habitos (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    titulo character varying(100) NOT NULL,
    descripcion text,
    frecuencia public.frecuencia_habito,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completado boolean DEFAULT false,
    auto_programado boolean DEFAULT false,
    categoria character varying(50) DEFAULT NULL::character varying,
    dias_semana jsonb DEFAULT '[]'::jsonb,
    hora_programada time without time zone
);


ALTER TABLE public.habitos OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 33078)
-- Name: habitos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.habitos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.habitos_id_seq OWNER TO postgres;

--
-- TOC entry 5856 (class 0 OID 0)
-- Dependencies: 222
-- Name: habitos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.habitos_id_seq OWNED BY public.habitos.id;


--
-- TOC entry 246 (class 1259 OID 57739)
-- Name: historial_puntos; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.historial_puntos OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 57738)
-- Name: historial_puntos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_puntos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_puntos_id_seq OWNER TO postgres;

--
-- TOC entry 5857 (class 0 OID 0)
-- Dependencies: 245
-- Name: historial_puntos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_puntos_id_seq OWNED BY public.historial_puntos.id;


--
-- TOC entry 301 (class 1259 OID 67447)
-- Name: key_results; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.key_results OWNER TO postgres;

--
-- TOC entry 300 (class 1259 OID 67446)
-- Name: key_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.key_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.key_results_id_seq OWNER TO postgres;

--
-- TOC entry 5858 (class 0 OID 0)
-- Dependencies: 300
-- Name: key_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.key_results_id_seq OWNED BY public.key_results.id;


--
-- TOC entry 242 (class 1259 OID 57699)
-- Name: logros; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.logros OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 57698)
-- Name: logros_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logros_id_seq OWNER TO postgres;

--
-- TOC entry 5859 (class 0 OID 0)
-- Dependencies: 241
-- Name: logros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logros_id_seq OWNED BY public.logros.id;


--
-- TOC entry 244 (class 1259 OID 57718)
-- Name: logros_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logros_usuario (
    id integer NOT NULL,
    usuario_id integer,
    logro_id integer,
    obtenido_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.logros_usuario OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 57717)
-- Name: logros_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logros_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logros_usuario_id_seq OWNER TO postgres;

--
-- TOC entry 5860 (class 0 OID 0)
-- Dependencies: 243
-- Name: logros_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logros_usuario_id_seq OWNED BY public.logros_usuario.id;


--
-- TOC entry 303 (class 1259 OID 67469)
-- Name: meta_progreso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meta_progreso (
    id integer NOT NULL,
    meta_id integer NOT NULL,
    progreso numeric(5,2) NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.meta_progreso OWNER TO postgres;

--
-- TOC entry 302 (class 1259 OID 67468)
-- Name: meta_progreso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meta_progreso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meta_progreso_id_seq OWNER TO postgres;

--
-- TOC entry 5861 (class 0 OID 0)
-- Dependencies: 302
-- Name: meta_progreso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meta_progreso_id_seq OWNED BY public.meta_progreso.id;


--
-- TOC entry 299 (class 1259 OID 67423)
-- Name: metas; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.metas OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 67422)
-- Name: metas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.metas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.metas_id_seq OWNER TO postgres;

--
-- TOC entry 5862 (class 0 OID 0)
-- Dependencies: 298
-- Name: metas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.metas_id_seq OWNED BY public.metas.id;


--
-- TOC entry 237 (class 1259 OID 41258)
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notificaciones OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 41257)
-- Name: notificaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notificaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificaciones_id_seq OWNER TO postgres;

--
-- TOC entry 5863 (class 0 OID 0)
-- Dependencies: 236
-- Name: notificaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notificaciones_id_seq OWNED BY public.notificaciones.id;


--
-- TOC entry 289 (class 1259 OID 67318)
-- Name: pausas_activas; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.pausas_activas OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 67317)
-- Name: pausas_activas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pausas_activas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pausas_activas_id_seq OWNER TO postgres;

--
-- TOC entry 5864 (class 0 OID 0)
-- Dependencies: 288
-- Name: pausas_activas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pausas_activas_id_seq OWNED BY public.pausas_activas.id;


--
-- TOC entry 240 (class 1259 OID 57676)
-- Name: perfil_gamificacion; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.perfil_gamificacion OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 57675)
-- Name: perfil_gamificacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.perfil_gamificacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.perfil_gamificacion_id_seq OWNER TO postgres;

--
-- TOC entry 5865 (class 0 OID 0)
-- Dependencies: 239
-- Name: perfil_gamificacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.perfil_gamificacion_id_seq OWNED BY public.perfil_gamificacion.id;


--
-- TOC entry 250 (class 1259 OID 65868)
-- Name: pgmigrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pgmigrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


ALTER TABLE public.pgmigrations OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 65867)
-- Name: pgmigrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pgmigrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pgmigrations_id_seq OWNER TO postgres;

--
-- TOC entry 5866 (class 0 OID 0)
-- Dependencies: 249
-- Name: pgmigrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pgmigrations_id_seq OWNED BY public.pgmigrations.id;


--
-- TOC entry 307 (class 1259 OID 75636)
-- Name: plantillas_bloques; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plantillas_bloques (
    id integer NOT NULL,
    plantilla_id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    tipo character varying(20) DEFAULT 'tarea'::character varying,
    prioridad character varying(10) DEFAULT 'media'::character varying,
    orden integer DEFAULT 0,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    gimnasio_rutina_id integer
);


ALTER TABLE public.plantillas_bloques OWNER TO postgres;

--
-- TOC entry 306 (class 1259 OID 75635)
-- Name: plantillas_bloques_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plantillas_bloques_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plantillas_bloques_id_seq OWNER TO postgres;

--
-- TOC entry 5867 (class 0 OID 0)
-- Dependencies: 306
-- Name: plantillas_bloques_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plantillas_bloques_id_seq OWNED BY public.plantillas_bloques.id;


--
-- TOC entry 305 (class 1259 OID 75616)
-- Name: plantillas_dia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plantillas_dia (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    dia_semana integer NOT NULL,
    activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT plantillas_dia_dia_semana_check CHECK (((dia_semana >= 0) AND (dia_semana <= 6)))
);


ALTER TABLE public.plantillas_dia OWNER TO postgres;

--
-- TOC entry 304 (class 1259 OID 75615)
-- Name: plantillas_dia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plantillas_dia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plantillas_dia_id_seq OWNER TO postgres;

--
-- TOC entry 5868 (class 0 OID 0)
-- Dependencies: 304
-- Name: plantillas_dia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plantillas_dia_id_seq OWNED BY public.plantillas_dia.id;


--
-- TOC entry 283 (class 1259 OID 66257)
-- Name: pomodoro_sessions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.pomodoro_sessions OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 66256)
-- Name: pomodoro_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pomodoro_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pomodoro_sessions_id_seq OWNER TO postgres;

--
-- TOC entry 5869 (class 0 OID 0)
-- Dependencies: 282
-- Name: pomodoro_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pomodoro_sessions_id_seq OWNED BY public.pomodoro_sessions.id;


--
-- TOC entry 281 (class 1259 OID 66237)
-- Name: pomodoro_settings; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.pomodoro_settings OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 41208)
-- Name: preferencias_notificacion; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.preferencias_notificacion OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 41207)
-- Name: preferencias_notificacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.preferencias_notificacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preferencias_notificacion_id_seq OWNER TO postgres;

--
-- TOC entry 5870 (class 0 OID 0)
-- Dependencies: 232
-- Name: preferencias_notificacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.preferencias_notificacion_id_seq OWNED BY public.preferencias_notificacion.id;


--
-- TOC entry 231 (class 1259 OID 33163)
-- Name: progreso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progreso (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    tipo character varying(50),
    valor integer,
    fecha date
);


ALTER TABLE public.progreso OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 33162)
-- Name: progreso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.progreso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.progreso_id_seq OWNER TO postgres;

--
-- TOC entry 5871 (class 0 OID 0)
-- Dependencies: 230
-- Name: progreso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.progreso_id_seq OWNED BY public.progreso.id;


--
-- TOC entry 276 (class 1259 OID 66158)
-- Name: proyecto_miembros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proyecto_miembros (
    id integer NOT NULL,
    proyecto_id integer NOT NULL,
    usuario_id integer NOT NULL,
    rol character varying(20) DEFAULT 'miembro'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.proyecto_miembros OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 66157)
-- Name: proyecto_miembros_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proyecto_miembros_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proyecto_miembros_id_seq OWNER TO postgres;

--
-- TOC entry 5872 (class 0 OID 0)
-- Dependencies: 275
-- Name: proyecto_miembros_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proyecto_miembros_id_seq OWNED BY public.proyecto_miembros.id;


--
-- TOC entry 274 (class 1259 OID 66139)
-- Name: proyectos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proyectos (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    creador_id integer NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.proyectos OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 66138)
-- Name: proyectos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proyectos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proyectos_id_seq OWNER TO postgres;

--
-- TOC entry 5873 (class 0 OID 0)
-- Dependencies: 273
-- Name: proyectos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proyectos_id_seq OWNED BY public.proyectos.id;


--
-- TOC entry 235 (class 1259 OID 41231)
-- Name: recordatorios; Type: TABLE; Schema: public; Owner: postgres
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
    CONSTRAINT recordatorios_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['agenda'::character varying, 'habito'::character varying, 'manual'::character varying, 'push'::character varying, 'whatsapp'::character varying, 'email'::character varying])::text[])))
);


ALTER TABLE public.recordatorios OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 41230)
-- Name: recordatorios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recordatorios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recordatorios_id_seq OWNER TO postgres;

--
-- TOC entry 5874 (class 0 OID 0)
-- Dependencies: 234
-- Name: recordatorios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recordatorios_id_seq OWNED BY public.recordatorios.id;


--
-- TOC entry 295 (class 1259 OID 67380)
-- Name: registros_entrenamiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registros_entrenamiento (
    id integer NOT NULL,
    usuario_id integer,
    ejercicio_id integer,
    rutina_id integer,
    fecha date DEFAULT CURRENT_DATE,
    notas text,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    duracion_segundos integer
);


ALTER TABLE public.registros_entrenamiento OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 67379)
-- Name: registros_entrenamiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registros_entrenamiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registros_entrenamiento_id_seq OWNER TO postgres;

--
-- TOC entry 5875 (class 0 OID 0)
-- Dependencies: 294
-- Name: registros_entrenamiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registros_entrenamiento_id_seq OWNED BY public.registros_entrenamiento.id;


--
-- TOC entry 225 (class 1259 OID 33098)
-- Name: registros_habitos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registros_habitos (
    id integer NOT NULL,
    habito_id integer NOT NULL,
    completado boolean DEFAULT false,
    fecha date NOT NULL
);


ALTER TABLE public.registros_habitos OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 33097)
-- Name: registros_habitos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registros_habitos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registros_habitos_id_seq OWNER TO postgres;

--
-- TOC entry 5876 (class 0 OID 0)
-- Dependencies: 224
-- Name: registros_habitos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registros_habitos_id_seq OWNED BY public.registros_habitos.id;


--
-- TOC entry 291 (class 1259 OID 67346)
-- Name: rutinas; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.rutinas OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 67345)
-- Name: rutinas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rutinas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rutinas_id_seq OWNER TO postgres;

--
-- TOC entry 5877 (class 0 OID 0)
-- Dependencies: 290
-- Name: rutinas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rutinas_id_seq OWNED BY public.rutinas.id;


--
-- TOC entry 297 (class 1259 OID 67407)
-- Name: series_entrenamiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.series_entrenamiento (
    id integer NOT NULL,
    registro_id integer,
    numero_serie integer,
    repeticiones integer,
    peso_kg numeric(5,2),
    rpe numeric(2,1)
);


ALTER TABLE public.series_entrenamiento OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 67406)
-- Name: series_entrenamiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.series_entrenamiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.series_entrenamiento_id_seq OWNER TO postgres;

--
-- TOC entry 5878 (class 0 OID 0)
-- Dependencies: 296
-- Name: series_entrenamiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.series_entrenamiento_id_seq OWNED BY public.series_entrenamiento.id;


--
-- TOC entry 254 (class 1259 OID 65897)
-- Name: sugerencias_ia; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.sugerencias_ia OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 65896)
-- Name: sugerencias_ia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sugerencias_ia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sugerencias_ia_id_seq OWNER TO postgres;

--
-- TOC entry 5879 (class 0 OID 0)
-- Dependencies: 253
-- Name: sugerencias_ia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sugerencias_ia_id_seq OWNED BY public.sugerencias_ia.id;


--
-- TOC entry 227 (class 1259 OID 33114)
-- Name: tareas; Type: TABLE; Schema: public; Owner: postgres
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
    meta_id integer,
    key_result_id integer,
    CONSTRAINT tareas_recurrencia_check CHECK (((recurrencia)::text = ANY ((ARRAY['diario'::character varying, 'semanal'::character varying, 'mensual'::character varying])::text[])))
);


ALTER TABLE public.tareas OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 66182)
-- Name: tareas_compartidas; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.tareas_compartidas OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 66181)
-- Name: tareas_compartidas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tareas_compartidas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tareas_compartidas_id_seq OWNER TO postgres;

--
-- TOC entry 5880 (class 0 OID 0)
-- Dependencies: 277
-- Name: tareas_compartidas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tareas_compartidas_id_seq OWNED BY public.tareas_compartidas.id;


--
-- TOC entry 226 (class 1259 OID 33113)
-- Name: tareas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tareas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tareas_id_seq OWNER TO postgres;

--
-- TOC entry 5881 (class 0 OID 0)
-- Dependencies: 226
-- Name: tareas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tareas_id_seq OWNED BY public.tareas.id;


--
-- TOC entry 238 (class 1259 OID 49483)
-- Name: usuario_gamificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_gamificacion (
    usuario_id integer NOT NULL,
    xp integer DEFAULT 0,
    nivel integer DEFAULT 1,
    streak integer DEFAULT 0,
    ultimo_registro timestamp without time zone
);


ALTER TABLE public.usuario_gamificacion OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 33062)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
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
    google_token_expiry timestamp without time zone,
    email_semanal_activo boolean DEFAULT false
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 33061)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 5882 (class 0 OID 0)
-- Dependencies: 220
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 5289 (class 2604 OID 66118)
-- Name: amistades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amistades ALTER COLUMN id SET DEFAULT nextval('public.amistades_id_seq'::regclass);


--
-- TOC entry 5248 (class 2604 OID 65881)
-- Name: analisis_ia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_ia ALTER COLUMN id SET DEFAULT nextval('public.analisis_ia_id_seq'::regclass);


--
-- TOC entry 5284 (class 2604 OID 66098)
-- Name: bloques_tiempo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloques_tiempo ALTER COLUMN id SET DEFAULT nextval('public.bloques_tiempo_id_seq'::regclass);


--
-- TOC entry 5200 (class 2604 OID 33143)
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- TOC entry 5318 (class 2604 OID 67275)
-- Name: checkins_emocionales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkins_emocionales ALTER COLUMN id SET DEFAULT nextval('public.checkins_emocionales_id_seq'::regclass);


--
-- TOC entry 5303 (class 2604 OID 66217)
-- Name: comentarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios ALTER COLUMN id SET DEFAULT nextval('public.comentarios_id_seq'::regclass);


--
-- TOC entry 5254 (class 2604 OID 65920)
-- Name: conversaciones_ia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversaciones_ia ALTER COLUMN id SET DEFAULT nextval('public.conversaciones_ia_id_seq'::regclass);


--
-- TOC entry 5322 (class 2604 OID 67299)
-- Name: diario_personal id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diario_personal ALTER COLUMN id SET DEFAULT nextval('public.diario_personal_id_seq'::regclass);


--
-- TOC entry 5334 (class 2604 OID 67367)
-- Name: ejercicios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ejercicios ALTER COLUMN id SET DEFAULT nextval('public.ejercicios_id_seq'::regclass);


--
-- TOC entry 5245 (class 2604 OID 57762)
-- Name: eventos_gamificacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_gamificacion ALTER COLUMN id SET DEFAULT nextval('public.eventos_gamificacion_id_seq'::regclass);


--
-- TOC entry 5257 (class 2604 OID 65944)
-- Name: finanzas_categorias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_categorias ALTER COLUMN id SET DEFAULT nextval('public.finanzas_categorias_id_seq'::regclass);


--
-- TOC entry 5260 (class 2604 OID 65964)
-- Name: finanzas_cuentas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_cuentas ALTER COLUMN id SET DEFAULT nextval('public.finanzas_cuentas_id_seq'::regclass);


--
-- TOC entry 5277 (class 2604 OID 66074)
-- Name: finanzas_deudas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_deudas ALTER COLUMN id SET DEFAULT nextval('public.finanzas_deudas_id_seq'::regclass);


--
-- TOC entry 5272 (class 2604 OID 66052)
-- Name: finanzas_metas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_metas ALTER COLUMN id SET DEFAULT nextval('public.finanzas_metas_id_seq'::regclass);


--
-- TOC entry 5269 (class 2604 OID 66023)
-- Name: finanzas_presupuestos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_presupuestos ALTER COLUMN id SET DEFAULT nextval('public.finanzas_presupuestos_id_seq'::regclass);


--
-- TOC entry 5265 (class 2604 OID 65986)
-- Name: finanzas_transacciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_transacciones ALTER COLUMN id SET DEFAULT nextval('public.finanzas_transacciones_id_seq'::regclass);


--
-- TOC entry 5182 (class 2604 OID 33082)
-- Name: habitos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habitos ALTER COLUMN id SET DEFAULT nextval('public.habitos_id_seq'::regclass);


--
-- TOC entry 5243 (class 2604 OID 57742)
-- Name: historial_puntos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_puntos ALTER COLUMN id SET DEFAULT nextval('public.historial_puntos_id_seq'::regclass);


--
-- TOC entry 5349 (class 2604 OID 67450)
-- Name: key_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.key_results ALTER COLUMN id SET DEFAULT nextval('public.key_results_id_seq'::regclass);


--
-- TOC entry 5237 (class 2604 OID 57702)
-- Name: logros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros ALTER COLUMN id SET DEFAULT nextval('public.logros_id_seq'::regclass);


--
-- TOC entry 5241 (class 2604 OID 57721)
-- Name: logros_usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros_usuario ALTER COLUMN id SET DEFAULT nextval('public.logros_usuario_id_seq'::regclass);


--
-- TOC entry 5354 (class 2604 OID 67472)
-- Name: meta_progreso id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meta_progreso ALTER COLUMN id SET DEFAULT nextval('public.meta_progreso_id_seq'::regclass);


--
-- TOC entry 5342 (class 2604 OID 67426)
-- Name: metas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metas ALTER COLUMN id SET DEFAULT nextval('public.metas_id_seq'::regclass);


--
-- TOC entry 5221 (class 2604 OID 41261)
-- Name: notificaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones ALTER COLUMN id SET DEFAULT nextval('public.notificaciones_id_seq'::regclass);


--
-- TOC entry 5327 (class 2604 OID 67321)
-- Name: pausas_activas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pausas_activas ALTER COLUMN id SET DEFAULT nextval('public.pausas_activas_id_seq'::regclass);


--
-- TOC entry 5228 (class 2604 OID 57679)
-- Name: perfil_gamificacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfil_gamificacion ALTER COLUMN id SET DEFAULT nextval('public.perfil_gamificacion_id_seq'::regclass);


--
-- TOC entry 5247 (class 2604 OID 65871)
-- Name: pgmigrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pgmigrations ALTER COLUMN id SET DEFAULT nextval('public.pgmigrations_id_seq'::regclass);


--
-- TOC entry 5360 (class 2604 OID 75639)
-- Name: plantillas_bloques id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantillas_bloques ALTER COLUMN id SET DEFAULT nextval('public.plantillas_bloques_id_seq'::regclass);


--
-- TOC entry 5357 (class 2604 OID 75619)
-- Name: plantillas_dia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantillas_dia ALTER COLUMN id SET DEFAULT nextval('public.plantillas_dia_id_seq'::regclass);


--
-- TOC entry 5313 (class 2604 OID 66260)
-- Name: pomodoro_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pomodoro_sessions ALTER COLUMN id SET DEFAULT nextval('public.pomodoro_sessions_id_seq'::regclass);


--
-- TOC entry 5205 (class 2604 OID 41211)
-- Name: preferencias_notificacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferencias_notificacion ALTER COLUMN id SET DEFAULT nextval('public.preferencias_notificacion_id_seq'::regclass);


--
-- TOC entry 5204 (class 2604 OID 33166)
-- Name: progreso id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progreso ALTER COLUMN id SET DEFAULT nextval('public.progreso_id_seq'::regclass);


--
-- TOC entry 5295 (class 2604 OID 66161)
-- Name: proyecto_miembros id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_miembros ALTER COLUMN id SET DEFAULT nextval('public.proyecto_miembros_id_seq'::regclass);


--
-- TOC entry 5292 (class 2604 OID 66142)
-- Name: proyectos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyectos ALTER COLUMN id SET DEFAULT nextval('public.proyectos_id_seq'::regclass);


--
-- TOC entry 5214 (class 2604 OID 41234)
-- Name: recordatorios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recordatorios ALTER COLUMN id SET DEFAULT nextval('public.recordatorios_id_seq'::regclass);


--
-- TOC entry 5338 (class 2604 OID 67383)
-- Name: registros_entrenamiento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_entrenamiento ALTER COLUMN id SET DEFAULT nextval('public.registros_entrenamiento_id_seq'::regclass);


--
-- TOC entry 5189 (class 2604 OID 33101)
-- Name: registros_habitos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_habitos ALTER COLUMN id SET DEFAULT nextval('public.registros_habitos_id_seq'::regclass);


--
-- TOC entry 5330 (class 2604 OID 67349)
-- Name: rutinas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rutinas ALTER COLUMN id SET DEFAULT nextval('public.rutinas_id_seq'::regclass);


--
-- TOC entry 5341 (class 2604 OID 67410)
-- Name: series_entrenamiento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.series_entrenamiento ALTER COLUMN id SET DEFAULT nextval('public.series_entrenamiento_id_seq'::regclass);


--
-- TOC entry 5251 (class 2604 OID 65900)
-- Name: sugerencias_ia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sugerencias_ia ALTER COLUMN id SET DEFAULT nextval('public.sugerencias_ia_id_seq'::regclass);


--
-- TOC entry 5191 (class 2604 OID 33117)
-- Name: tareas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas ALTER COLUMN id SET DEFAULT nextval('public.tareas_id_seq'::regclass);


--
-- TOC entry 5298 (class 2604 OID 66185)
-- Name: tareas_compartidas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas_compartidas ALTER COLUMN id SET DEFAULT nextval('public.tareas_compartidas_id_seq'::regclass);


--
-- TOC entry 5178 (class 2604 OID 33065)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 5798 (class 0 OID 66115)
-- Dependencies: 272
-- Data for Name: amistades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.amistades (id, solicitante_id, receptor_id, estado, creado_en) FROM stdin;
\.


--
-- TOC entry 5778 (class 0 OID 65878)
-- Dependencies: 252
-- Data for Name: analisis_ia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analisis_ia (id, usuario_id, tipo, entrada, resultado, modelo, creado_en, cache_hasta) FROM stdin;
1	38	insights	\N	{"resumen": "Basado en 0 check-ins recientes.", "observaciones": ["Tu promedio de sueño es bajo (<6h). Intenta descansar más.", "Tu nivel de energía promedio es bajo. Considera hacer pausas activas."], "promedio_sueno": null, "fecha_generacion": "2026-05-25T19:05:27.592Z", "promedio_energia": null, "estado_animo_frecuente": null}	gpt-4o-mini	2026-05-25 14:05:27.594962	2026-05-25 15:05:27.594962
2	41	insights	\N	{"resumen": "Basado en 0 check-ins recientes.", "observaciones": ["Tu promedio de sueño es bajo (<6h). Intenta descansar más.", "Tu nivel de energía promedio es bajo. Considera hacer pausas activas."], "promedio_sueno": null, "fecha_generacion": "2026-05-27T17:32:44.416Z", "promedio_energia": null, "estado_animo_frecuente": null}	gpt-4o-mini	2026-05-27 12:32:44.416797	2026-05-27 13:32:44.416797
3	41	insights	\N	{"resumen": "Basado en 0 check-ins recientes.", "observaciones": ["Tu promedio de sueño es bajo (<6h). Intenta descansar más.", "Tu nivel de energía promedio es bajo. Considera hacer pausas activas."], "promedio_sueno": null, "fecha_generacion": "2026-05-27T22:29:17.950Z", "promedio_energia": null, "estado_animo_frecuente": null}	gpt-4o-mini	2026-05-27 17:29:17.951128	2026-05-27 18:29:17.951128
\.


--
-- TOC entry 5796 (class 0 OID 66095)
-- Dependencies: 270
-- Data for Name: bloques_tiempo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bloques_tiempo (id, usuario_id, nombre, hora_inicio, hora_fin, activo, creado_en, actualizado_en, auto_programado) FROM stdin;
11	41	bloque	14:00:00	15:00:00	t	2026-05-27 19:29:18.854366	2026-05-27 19:29:18.854366	t
\.


--
-- TOC entry 5755 (class 0 OID 33140)
-- Dependencies: 229
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id, usuario_id, nombre, color, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5811 (class 0 OID 67272)
-- Dependencies: 285
-- Data for Name: checkins_emocionales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checkins_emocionales (id, usuario_id, fecha, estado_animo, energia, sueno_horas, notas, creado_en, actualizado_en) FROM stdin;
1	41	2026-05-27	muy_bien	10	8.0		2026-05-27 17:29:21.413739	2026-05-27 18:26:20.377046
\.


--
-- TOC entry 5806 (class 0 OID 66214)
-- Dependencies: 280
-- Data for Name: comentarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comentarios (id, tarea_id, usuario_id, contenido, creado_en) FROM stdin;
\.


--
-- TOC entry 5782 (class 0 OID 65917)
-- Dependencies: 256
-- Data for Name: conversaciones_ia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversaciones_ia (id, usuario_id, mensaje, respuesta, herramientas_usadas, tokens_usados, creado_en) FROM stdin;
\.


--
-- TOC entry 5813 (class 0 OID 67296)
-- Dependencies: 287
-- Data for Name: diario_personal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diario_personal (id, usuario_id, titulo, contenido, etiquetas, es_publico, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5819 (class 0 OID 67364)
-- Dependencies: 293
-- Data for Name: ejercicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ejercicios (id, rutina_id, nombre, grupo_muscular, series_default, repeticiones_default, creado_en) FROM stdin;
4	4	Press inclinado	Pecho	3	10	2026-05-27 13:21:47.950934
5	4	Press plano	Pecho	3	10	2026-05-27 13:21:56.109338
6	4	Fondos	Pecho	3	10	2026-05-27 13:22:09.861089
7	4	Jalon al pecho	Espalda	3	10	2026-05-27 13:22:23.195283
8	4	Pull over	Espalda	3	10	2026-05-27 13:22:32.505209
9	4	Barra T	Espalda	3	10	2026-05-27 13:22:41.376471
\.


--
-- TOC entry 5774 (class 0 OID 57759)
-- Dependencies: 248
-- Data for Name: eventos_gamificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.eventos_gamificacion (id, usuario_id, tipo, referencia_id, referencia_tipo, puntos, creado_en) FROM stdin;
1	41	Hábito completado	17	habito	15	2026-05-27 19:02:24.451636
2	41	Hábito completado	18	habito	15	2026-05-27 19:19:17.025508
\.


--
-- TOC entry 5784 (class 0 OID 65941)
-- Dependencies: 258
-- Data for Name: finanzas_categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.finanzas_categorias (id, usuario_id, nombre, tipo, icono, color, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5786 (class 0 OID 65961)
-- Dependencies: 260
-- Data for Name: finanzas_cuentas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.finanzas_cuentas (id, usuario_id, nombre, tipo, saldo_inicial, moneda, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5794 (class 0 OID 66071)
-- Dependencies: 268
-- Data for Name: finanzas_deudas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.finanzas_deudas (id, usuario_id, nombre, monto_total, monto_pagado, cuota_mensual, tasa_interes, fecha_inicio, fecha_vencimiento, acreedor, estado, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5792 (class 0 OID 66049)
-- Dependencies: 266
-- Data for Name: finanzas_metas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.finanzas_metas (id, usuario_id, nombre, monto_objetivo, monto_actual, fecha_limite, estado, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5790 (class 0 OID 66020)
-- Dependencies: 264
-- Data for Name: finanzas_presupuestos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.finanzas_presupuestos (id, usuario_id, categoria_id, mes, anio, limite, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5788 (class 0 OID 65983)
-- Dependencies: 262
-- Data for Name: finanzas_transacciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.finanzas_transacciones (id, usuario_id, categoria_id, cuenta_id, tipo, monto, descripcion, fecha, es_recurrente, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5749 (class 0 OID 33079)
-- Dependencies: 223
-- Data for Name: habitos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.habitos (id, usuario_id, titulo, descripcion, frecuencia, creado_en, actualizado_en, completado, auto_programado, categoria, dias_semana, hora_programada) FROM stdin;
23	41	habito	De 11:00:00 a 12:00:00	diario	2026-05-27 19:29:18.852945	2026-05-27 19:29:18.852945	f	t	\N	[]	\N
17	41	leer		diario	2026-05-27 19:02:05.518238	2026-05-27 19:21:01.046325	f	f	\N	[0, 1, 2, 3, 4, 5]	\N
\.


--
-- TOC entry 5772 (class 0 OID 57739)
-- Dependencies: 246
-- Data for Name: historial_puntos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_puntos (id, usuario_id, puntos, motivo, referencia_tipo, referencia_id, creado_en) FROM stdin;
6	41	15	Hábito completado	habito	17	2026-05-27 19:02:24.451636
7	41	15	Hábito completado	habito	18	2026-05-27 19:19:17.025508
\.


--
-- TOC entry 5827 (class 0 OID 67447)
-- Dependencies: 301
-- Data for Name: key_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.key_results (id, meta_id, titulo, descripcion, progreso, orden, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5768 (class 0 OID 57699)
-- Dependencies: 242
-- Data for Name: logros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logros (id, codigo, titulo, descripcion, icono, puntos, condicion, creado_en) FROM stdin;
\.


--
-- TOC entry 5770 (class 0 OID 57718)
-- Dependencies: 244
-- Data for Name: logros_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logros_usuario (id, usuario_id, logro_id, obtenido_en) FROM stdin;
\.


--
-- TOC entry 5829 (class 0 OID 67469)
-- Dependencies: 303
-- Data for Name: meta_progreso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meta_progreso (id, meta_id, progreso, fecha, creado_en) FROM stdin;
\.


--
-- TOC entry 5825 (class 0 OID 67423)
-- Dependencies: 299
-- Data for Name: metas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metas (id, usuario_id, titulo, descripcion, categoria, progreso, fecha_inicio, fecha_fin, estado, es_borrador, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5763 (class 0 OID 41258)
-- Dependencies: 237
-- Data for Name: notificaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificaciones (id, usuario_id, recordatorio_id, titulo, mensaje, tipo, leida, creado_en) FROM stdin;
38	38	\N	Buenos dias, aqui estan tus prioridades	Tienes 0 tareas para hoy. Empieza con: "ninguna"	ia	f	2026-05-27 11:22:01.707512
39	41	\N	RECORDATORIO	RECORDATORIO	app	f	2026-05-27 18:31:00.111542
\.


--
-- TOC entry 5815 (class 0 OID 67318)
-- Dependencies: 289
-- Data for Name: pausas_activas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pausas_activas (id, usuario_id, ejercicio, duracion_minutos, programada_para, completada, creado_en) FROM stdin;
1	41	Estiramiento de cuello	2	\N	f	2026-05-27 18:26:03.094112
\.


--
-- TOC entry 5766 (class 0 OID 57676)
-- Dependencies: 240
-- Data for Name: perfil_gamificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.perfil_gamificacion (id, usuario_id, puntos_totales, nivel, xp_actual, xp_siguiente, racha_actual, mejor_racha, ultima_actividad, creado_en, actualizado_en) FROM stdin;
15	38	0	1	0	100	0	0	\N	2026-05-25 14:05:04.427566	2026-05-25 14:05:04.427566
24	39	0	1	0	100	0	0	\N	2026-05-27 11:22:01.648602	2026-05-27 11:22:01.648602
25	41	30	1	30	100	1	1	2026-05-28	2026-05-27 11:23:10.375873	2026-05-27 19:19:17.025508
\.


--
-- TOC entry 5776 (class 0 OID 65868)
-- Dependencies: 250
-- Data for Name: pgmigrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pgmigrations (id, name, run_on) FROM stdin;
1	1736400000000_initial-schema	2026-05-13 10:36:06.22991
2	1778544000000_ia-tables	2026-05-13 10:36:06.234996
6	1778800000000_bienestar-tables	2026-05-13 17:22:56.40261
3	1778544000001_missing-tables	2026-05-13 10:36:07
4	1778600000000_pomodoro	2026-05-13 10:36:08
5	1778700000000_finanzas	2026-05-13 10:36:38
7	1778900000000_gym-tables	2026-05-13 17:29:53.997038
8	1779000000000_metas-okrs	2026-05-14 17:13:09.765169
9	1779000000001_gamificacion-index	2026-05-14 17:13:09.765169
10	1779100000000_email-preference	2026-05-22 11:19:02.533651
\.


--
-- TOC entry 5833 (class 0 OID 75636)
-- Dependencies: 307
-- Data for Name: plantillas_bloques; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plantillas_bloques (id, plantilla_id, titulo, hora_inicio, hora_fin, tipo, prioridad, orden, creado_en, gimnasio_rutina_id) FROM stdin;
6	4	Gimnasio	07:00:00	08:00:00	tarea	alta	0	2026-05-25 15:00:41.425789	\N
14	1	1	09:00:00	10:00:00	habito	media	0	2026-05-25 16:32:34.199306	\N
15	1	3	12:00:00	12:30:00	tarea	media	0	2026-05-25 16:32:34.199306	\N
16	1	2	13:00:00	14:00:00	tarea	media	0	2026-05-25 16:32:34.199306	\N
17	8	Reunion	09:00:00	10:00:00	tarea	media	0	2026-05-25 16:36:36.489208	\N
79	37	TAREA1	09:00:00	10:00:00	tarea	media	0	2026-05-27 19:29:10.15393	\N
80	37	habito	11:00:00	12:00:00	habito	media	0	2026-05-27 19:29:10.15393	\N
81	37	gym	13:00:00	14:00:00	gimnasio	media	0	2026-05-27 19:29:10.15393	\N
82	37	bloque	14:00:00	15:00:00	bloque	media	0	2026-05-27 19:29:10.15393	\N
\.


--
-- TOC entry 5831 (class 0 OID 75616)
-- Dependencies: 305
-- Data for Name: plantillas_dia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plantillas_dia (id, usuario_id, dia_semana, activo, creado_en) FROM stdin;
4	39	1	t	2026-05-25 15:00:41.42241
1	38	0	t	2026-05-25 14:47:33.745274
8	40	0	t	2026-05-25 16:36:36.484437
37	41	0	t	2026-05-27 19:29:10.145052
\.


--
-- TOC entry 5809 (class 0 OID 66257)
-- Dependencies: 283
-- Data for Name: pomodoro_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pomodoro_sessions (id, usuario_id, tarea_id, duracion_minutos, descanso_minutos, intervalo_numero, estado, inicio_en, fin_en, creado_en) FROM stdin;
\.


--
-- TOC entry 5807 (class 0 OID 66237)
-- Dependencies: 281
-- Data for Name: pomodoro_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pomodoro_settings (usuario_id, duracion_foco, descanso_corto, descanso_largo, intervalos_antes_descanso_largo, auto_iniciar_descanso, notificaciones_sonido, creado_en, actualizado_en) FROM stdin;
38	25	5	15	4	f	t	2026-05-25 14:05:25.798213	2026-05-25 14:05:25.798213
41	30	10	20	4	f	t	2026-05-27 12:33:11.636434	2026-05-27 18:19:15.42771
\.


--
-- TOC entry 5759 (class 0 OID 41208)
-- Dependencies: 233
-- Data for Name: preferencias_notificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preferencias_notificacion (id, usuario_id, notificaciones_activas, hora_silencio_inicio, hora_silencio_fin, tipo_agenda, tipo_habitos, tipo_manual, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5757 (class 0 OID 33163)
-- Dependencies: 231
-- Data for Name: progreso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progreso (id, usuario_id, tipo, valor, fecha) FROM stdin;
\.


--
-- TOC entry 5802 (class 0 OID 66158)
-- Dependencies: 276
-- Data for Name: proyecto_miembros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proyecto_miembros (id, proyecto_id, usuario_id, rol, creado_en) FROM stdin;
\.


--
-- TOC entry 5800 (class 0 OID 66139)
-- Dependencies: 274
-- Data for Name: proyectos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proyectos (id, nombre, descripcion, creador_id, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5761 (class 0 OID 41231)
-- Dependencies: 235
-- Data for Name: recordatorios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recordatorios (id, usuario_id, tipo, referencia_id, titulo, mensaje, fecha_hora, anticipacion_min, es_recurrente, regla_recurrencia, estado, intentos, ultimo_intento, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5821 (class 0 OID 67380)
-- Dependencies: 295
-- Data for Name: registros_entrenamiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registros_entrenamiento (id, usuario_id, ejercicio_id, rutina_id, fecha, notas, creado_en, duracion_segundos) FROM stdin;
1	41	\N	\N	2026-05-27	\N	2026-05-27 12:33:30.818547	\N
2	41	4	4	2026-05-27	\N	2026-05-27 13:24:57.276462	\N
3	41	4	4	2026-05-27	\N	2026-05-27 13:24:59.145537	\N
4	41	4	4	2026-05-27	\N	2026-05-27 13:25:00.216889	\N
5	41	4	4	2026-05-27	\N	2026-05-27 13:25:00.368057	\N
6	41	4	4	2026-05-27	\N	2026-05-27 13:25:02.883545	\N
7	41	4	4	2026-05-27	\N	2026-05-27 13:25:03.185417	\N
8	41	4	4	2026-05-27	\N	2026-05-27 13:25:10.431159	\N
9	41	4	4	2026-05-27	\N	2026-05-27 13:25:10.580061	\N
10	41	4	4	2026-05-27	\N	2026-05-27 13:35:33.628424	\N
11	41	4	4	2026-05-27	\N	2026-05-27 13:35:34.527913	\N
12	41	4	4	2026-05-27	\N	2026-05-27 13:35:35.131026	\N
15	41	4	4	2026-05-27	\N	2026-05-27 13:38:53.905185	\N
16	41	4	4	2026-05-27	\N	2026-05-27 13:40:42.135138	\N
17	41	4	4	2026-05-27	\N	2026-05-27 13:41:22.962435	\N
18	41	5	4	2026-05-27	\N	2026-05-27 13:41:22.974984	\N
19	41	6	4	2026-05-27	\N	2026-05-27 13:41:22.983453	\N
20	41	7	4	2026-05-27	\N	2026-05-27 13:41:22.991764	\N
21	41	8	4	2026-05-27	\N	2026-05-27 13:41:22.999868	\N
22	41	9	4	2026-05-27	\N	2026-05-27 13:41:23.007651	\N
\.


--
-- TOC entry 5751 (class 0 OID 33098)
-- Dependencies: 225
-- Data for Name: registros_habitos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registros_habitos (id, habito_id, completado, fecha) FROM stdin;
\.


--
-- TOC entry 5817 (class 0 OID 67346)
-- Dependencies: 291
-- Data for Name: rutinas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rutinas (id, usuario_id, nombre, descripcion, dificultad, creado_en, actualizado_en) FROM stdin;
4	41	PECHO-ESPALDA		avanzado	2026-05-27 13:19:49.030893	2026-05-27 13:19:49.030893
\.


--
-- TOC entry 5823 (class 0 OID 67407)
-- Dependencies: 297
-- Data for Name: series_entrenamiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.series_entrenamiento (id, registro_id, numero_serie, repeticiones, peso_kg, rpe) FROM stdin;
1	2	1	10	40.00	\N
2	2	2	9	40.00	\N
3	2	3	8	40.00	\N
4	3	1	10	40.00	\N
5	3	2	9	40.00	\N
6	3	3	8	40.00	\N
7	4	1	10	40.00	\N
8	4	2	9	40.00	\N
9	4	3	8	40.00	\N
10	5	1	10	40.00	\N
11	5	2	9	40.00	\N
12	5	3	8	40.00	\N
13	6	1	10	40.00	\N
14	6	2	9	40.00	\N
15	6	3	8	40.00	\N
16	7	1	10	40.00	\N
17	7	2	9	40.00	\N
18	7	3	8	40.00	\N
19	8	1	10	40.00	\N
20	8	2	9	40.00	\N
21	8	3	8	40.00	\N
22	9	1	10	40.00	\N
23	9	2	9	40.00	\N
24	9	3	8	40.00	\N
25	10	1	0	0.00	\N
26	10	2	0	0.00	\N
27	10	3	0	0.00	\N
28	11	1	0	0.00	\N
29	11	2	0	0.00	\N
30	11	3	0	0.00	\N
31	12	1	0	0.00	\N
32	12	2	0	0.00	\N
33	12	3	0	0.00	\N
35	15	1	0	0.00	\N
36	15	2	0	0.00	\N
37	15	3	0	0.00	\N
38	16	1	0	0.00	\N
39	16	2	0	0.00	\N
40	16	3	0	0.00	\N
41	17	1	0	0.00	\N
42	17	2	0	0.00	\N
43	17	3	0	0.00	\N
44	18	1	0	0.00	\N
45	18	2	0	0.00	\N
46	18	3	0	0.00	\N
47	19	1	0	0.00	\N
48	19	2	0	0.00	\N
49	19	3	0	0.00	\N
50	20	1	0	0.00	\N
51	20	2	0	0.00	\N
52	20	3	0	0.00	\N
53	21	1	0	0.00	\N
54	21	2	0	0.00	\N
55	21	3	0	0.00	\N
56	22	1	0	0.00	\N
57	22	2	0	0.00	\N
58	22	3	0	0.00	\N
\.


--
-- TOC entry 5780 (class 0 OID 65897)
-- Dependencies: 254
-- Data for Name: sugerencias_ia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sugerencias_ia (id, usuario_id, tipo, titulo, descripcion, metadata, leida, creado_en) FROM stdin;
\.


--
-- TOC entry 5753 (class 0 OID 33114)
-- Dependencies: 227
-- Data for Name: tareas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tareas (id, usuario_id, titulo, descripcion, estado, prioridad, fecha_limite, fecha_inicio, fecha_fin, duracion_minutos, todo_el_dia, es_recurrente, recurrencia, auto_programado, categoria_id, creado_en, actualizado_en, meta_id, key_result_id) FROM stdin;
94	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-05-25 09:00:00	2026-05-25 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.586823	2026-05-27 19:29:18.586823	\N	\N
95	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-06-01 09:00:00	2026-06-01 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.597093	2026-05-27 19:29:18.597093	\N	\N
96	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-06-08 09:00:00	2026-06-08 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.602403	2026-05-27 19:29:18.602403	\N	\N
97	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-06-15 09:00:00	2026-06-15 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.608359	2026-05-27 19:29:18.608359	\N	\N
98	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-06-22 09:00:00	2026-06-22 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.615638	2026-05-27 19:29:18.615638	\N	\N
99	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-06-29 09:00:00	2026-06-29 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.620633	2026-05-27 19:29:18.620633	\N	\N
100	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-07-06 09:00:00	2026-07-06 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.629224	2026-05-27 19:29:18.629224	\N	\N
101	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-07-13 09:00:00	2026-07-13 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.634546	2026-05-27 19:29:18.634546	\N	\N
102	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-07-20 09:00:00	2026-07-20 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.639703	2026-05-27 19:29:18.639703	\N	\N
103	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-07-27 09:00:00	2026-07-27 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.646974	2026-05-27 19:29:18.646974	\N	\N
104	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-08-03 09:00:00	2026-08-03 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.650545	2026-05-27 19:29:18.650545	\N	\N
105	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-08-10 09:00:00	2026-08-10 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.656357	2026-05-27 19:29:18.656357	\N	\N
106	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-08-17 09:00:00	2026-08-17 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.6641	2026-05-27 19:29:18.6641	\N	\N
107	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-08-24 09:00:00	2026-08-24 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.668242	2026-05-27 19:29:18.668242	\N	\N
108	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-08-31 09:00:00	2026-08-31 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.672194	2026-05-27 19:29:18.672194	\N	\N
109	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-09-07 09:00:00	2026-09-07 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.678813	2026-05-27 19:29:18.678813	\N	\N
10	39	Gimnasio	De 07:00:00 a 08:00:00	pendiente	alta	\N	2026-05-26 07:00:00	2026-05-26 08:00:00	60	f	f	\N	t	\N	2026-05-25 15:06:46.504974	2026-05-25 15:06:46.504974	\N	\N
43	40	Reunion	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-05-25 09:00:00	2026-05-25 10:00:00	60	f	f	\N	t	\N	2026-05-25 16:36:36.509514	2026-05-25 16:36:36.509514	\N	\N
110	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-09-14 09:00:00	2026-09-14 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.684325	2026-05-27 19:29:18.684325	\N	\N
111	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-09-21 09:00:00	2026-09-21 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.688398	2026-05-27 19:29:18.688398	\N	\N
112	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-09-28 09:00:00	2026-09-28 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.696685	2026-05-27 19:29:18.696685	\N	\N
113	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-10-05 09:00:00	2026-10-05 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.701386	2026-05-27 19:29:18.701386	\N	\N
114	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-10-12 09:00:00	2026-10-12 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.705274	2026-05-27 19:29:18.705274	\N	\N
115	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-10-19 09:00:00	2026-10-19 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.71214	2026-05-27 19:29:18.71214	\N	\N
116	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-10-26 09:00:00	2026-10-26 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.716521	2026-05-27 19:29:18.716521	\N	\N
117	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-11-02 09:00:00	2026-11-02 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.720177	2026-05-27 19:29:18.720177	\N	\N
118	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-11-09 09:00:00	2026-11-09 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.725013	2026-05-27 19:29:18.725013	\N	\N
119	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-11-16 09:00:00	2026-11-16 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.732132	2026-05-27 19:29:18.732132	\N	\N
120	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-11-23 09:00:00	2026-11-23 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.735473	2026-05-27 19:29:18.735473	\N	\N
121	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-11-30 09:00:00	2026-11-30 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.73906	2026-05-27 19:29:18.73906	\N	\N
122	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-12-07 09:00:00	2026-12-07 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.746795	2026-05-27 19:29:18.746795	\N	\N
123	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-12-14 09:00:00	2026-12-14 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.751068	2026-05-27 19:29:18.751068	\N	\N
124	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-12-21 09:00:00	2026-12-21 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.755921	2026-05-27 19:29:18.755921	\N	\N
125	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2026-12-28 09:00:00	2026-12-28 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.763407	2026-05-27 19:29:18.763407	\N	\N
126	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-01-04 09:00:00	2027-01-04 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.768261	2026-05-27 19:29:18.768261	\N	\N
127	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-01-11 09:00:00	2027-01-11 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.772889	2026-05-27 19:29:18.772889	\N	\N
128	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-01-18 09:00:00	2027-01-18 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.78022	2026-05-27 19:29:18.78022	\N	\N
129	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-01-25 09:00:00	2027-01-25 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.785561	2026-05-27 19:29:18.785561	\N	\N
130	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-02-01 09:00:00	2027-02-01 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.7906	2026-05-27 19:29:18.7906	\N	\N
131	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-02-08 09:00:00	2027-02-08 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.794533	2026-05-27 19:29:18.794533	\N	\N
132	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-02-15 09:00:00	2027-02-15 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.799383	2026-05-27 19:29:18.799383	\N	\N
133	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-02-22 09:00:00	2027-02-22 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.803348	2026-05-27 19:29:18.803348	\N	\N
134	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-03-01 09:00:00	2027-03-01 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.807423	2026-05-27 19:29:18.807423	\N	\N
135	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-03-08 09:00:00	2027-03-08 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.81122	2026-05-27 19:29:18.81122	\N	\N
136	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-03-15 09:00:00	2027-03-15 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.815004	2026-05-27 19:29:18.815004	\N	\N
137	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-03-22 09:00:00	2027-03-22 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.818506	2026-05-27 19:29:18.818506	\N	\N
138	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-03-29 09:00:00	2027-03-29 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.82363	2026-05-27 19:29:18.82363	\N	\N
139	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-04-05 09:00:00	2027-04-05 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.828041	2026-05-27 19:29:18.828041	\N	\N
140	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-04-12 09:00:00	2027-04-12 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.831938	2026-05-27 19:29:18.831938	\N	\N
141	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-04-19 09:00:00	2027-04-19 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.837932	2026-05-27 19:29:18.837932	\N	\N
142	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-04-26 09:00:00	2027-04-26 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.84139	2026-05-27 19:29:18.84139	\N	\N
143	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-05-03 09:00:00	2027-05-03 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.844075	2026-05-27 19:29:18.844075	\N	\N
144	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-05-10 09:00:00	2027-05-10 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.846977	2026-05-27 19:29:18.846977	\N	\N
145	41	TAREA1	De 09:00:00 a 10:00:00	pendiente	media	\N	2027-05-17 09:00:00	2027-05-17 10:00:00	60	f	f	\N	t	\N	2026-05-27 19:29:18.849789	2026-05-27 19:29:18.849789	\N	\N
\.


--
-- TOC entry 5804 (class 0 OID 66182)
-- Dependencies: 278
-- Data for Name: tareas_compartidas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tareas_compartidas (id, proyecto_id, creado_por, asignado_a, titulo, descripcion, estado, prioridad, fecha_limite, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5764 (class 0 OID 49483)
-- Dependencies: 238
-- Data for Name: usuario_gamificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario_gamificacion (usuario_id, xp, nivel, streak, ultimo_registro) FROM stdin;
\.


--
-- TOC entry 5747 (class 0 OID 33062)
-- Dependencies: 221
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, email, password, creado_en, actualizado_en, google_id, google_access_token, google_refresh_token, google_token_expiry, email_semanal_activo) FROM stdin;
38	Arias	ariasnicolas200506@gmail.com	$2b$10$zMJDgQeo4fuWnEHkYkidXecG5hG5by8Hs3RK0ZG7CB7PtOm7hnIdG	2026-05-25 14:05:04.046147	2026-05-25 14:05:04.046147	\N	\N	\N	\N	f
39	Test	test@test.co	$2b$10$CARGfXFWSXBSKKumnEifY.xqeBIdnwP7Ofloi6LpRf8x0Zs9zq.4y	2026-05-25 14:59:22.756659	2026-05-25 14:59:22.756659	\N	\N	\N	\N	f
40	test	test@test.com	$2b$10$391VkTNonCuiDb6U3w5HeeoGtCOc4F623AHx5BUyxLNeqZodnnYci	2026-05-25 16:36:25.991182	2026-05-25 16:36:25.991182	\N	\N	\N	\N	f
41	Arias	ariasnicolas2005@gmail.com	$2b$10$yE3dQ8kYt5Yx7KGIrFGhDeUiwjvZkHCK7HboUEYR8B6f9ZOaxcf02	2026-05-27 11:23:10.17061	2026-05-27 13:02:29.975838	\N	\N	\N	\N	f
\.


--
-- TOC entry 5883 (class 0 OID 0)
-- Dependencies: 271
-- Name: amistades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.amistades_id_seq', 1, false);


--
-- TOC entry 5884 (class 0 OID 0)
-- Dependencies: 251
-- Name: analisis_ia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analisis_ia_id_seq', 3, true);


--
-- TOC entry 5885 (class 0 OID 0)
-- Dependencies: 269
-- Name: bloques_tiempo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bloques_tiempo_id_seq', 11, true);


--
-- TOC entry 5886 (class 0 OID 0)
-- Dependencies: 228
-- Name: categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_seq', 1, true);


--
-- TOC entry 5887 (class 0 OID 0)
-- Dependencies: 284
-- Name: checkins_emocionales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checkins_emocionales_id_seq', 2, true);


--
-- TOC entry 5888 (class 0 OID 0)
-- Dependencies: 279
-- Name: comentarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comentarios_id_seq', 1, false);


--
-- TOC entry 5889 (class 0 OID 0)
-- Dependencies: 255
-- Name: conversaciones_ia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conversaciones_ia_id_seq', 1, false);


--
-- TOC entry 5890 (class 0 OID 0)
-- Dependencies: 286
-- Name: diario_personal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diario_personal_id_seq', 1, false);


--
-- TOC entry 5891 (class 0 OID 0)
-- Dependencies: 292
-- Name: ejercicios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ejercicios_id_seq', 9, true);


--
-- TOC entry 5892 (class 0 OID 0)
-- Dependencies: 247
-- Name: eventos_gamificacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.eventos_gamificacion_id_seq', 11, true);


--
-- TOC entry 5893 (class 0 OID 0)
-- Dependencies: 257
-- Name: finanzas_categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.finanzas_categorias_id_seq', 1, false);


--
-- TOC entry 5894 (class 0 OID 0)
-- Dependencies: 259
-- Name: finanzas_cuentas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.finanzas_cuentas_id_seq', 1, false);


--
-- TOC entry 5895 (class 0 OID 0)
-- Dependencies: 267
-- Name: finanzas_deudas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.finanzas_deudas_id_seq', 1, false);


--
-- TOC entry 5896 (class 0 OID 0)
-- Dependencies: 265
-- Name: finanzas_metas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.finanzas_metas_id_seq', 1, false);


--
-- TOC entry 5897 (class 0 OID 0)
-- Dependencies: 263
-- Name: finanzas_presupuestos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.finanzas_presupuestos_id_seq', 1, false);


--
-- TOC entry 5898 (class 0 OID 0)
-- Dependencies: 261
-- Name: finanzas_transacciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.finanzas_transacciones_id_seq', 1, false);


--
-- TOC entry 5899 (class 0 OID 0)
-- Dependencies: 222
-- Name: habitos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.habitos_id_seq', 23, true);


--
-- TOC entry 5900 (class 0 OID 0)
-- Dependencies: 245
-- Name: historial_puntos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historial_puntos_id_seq', 7, true);


--
-- TOC entry 5901 (class 0 OID 0)
-- Dependencies: 300
-- Name: key_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.key_results_id_seq', 1, false);


--
-- TOC entry 5902 (class 0 OID 0)
-- Dependencies: 241
-- Name: logros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logros_id_seq', 24, true);


--
-- TOC entry 5903 (class 0 OID 0)
-- Dependencies: 243
-- Name: logros_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logros_usuario_id_seq', 2, true);


--
-- TOC entry 5904 (class 0 OID 0)
-- Dependencies: 302
-- Name: meta_progreso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meta_progreso_id_seq', 1, false);


--
-- TOC entry 5905 (class 0 OID 0)
-- Dependencies: 298
-- Name: metas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.metas_id_seq', 4, true);


--
-- TOC entry 5906 (class 0 OID 0)
-- Dependencies: 236
-- Name: notificaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notificaciones_id_seq', 39, true);


--
-- TOC entry 5907 (class 0 OID 0)
-- Dependencies: 288
-- Name: pausas_activas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pausas_activas_id_seq', 1, true);


--
-- TOC entry 5908 (class 0 OID 0)
-- Dependencies: 239
-- Name: perfil_gamificacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.perfil_gamificacion_id_seq', 25, true);


--
-- TOC entry 5909 (class 0 OID 0)
-- Dependencies: 249
-- Name: pgmigrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pgmigrations_id_seq', 10, true);


--
-- TOC entry 5910 (class 0 OID 0)
-- Dependencies: 306
-- Name: plantillas_bloques_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.plantillas_bloques_id_seq', 82, true);


--
-- TOC entry 5911 (class 0 OID 0)
-- Dependencies: 304
-- Name: plantillas_dia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.plantillas_dia_id_seq', 37, true);


--
-- TOC entry 5912 (class 0 OID 0)
-- Dependencies: 282
-- Name: pomodoro_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pomodoro_sessions_id_seq', 1, false);


--
-- TOC entry 5913 (class 0 OID 0)
-- Dependencies: 232
-- Name: preferencias_notificacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.preferencias_notificacion_id_seq', 2, true);


--
-- TOC entry 5914 (class 0 OID 0)
-- Dependencies: 230
-- Name: progreso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.progreso_id_seq', 1, false);


--
-- TOC entry 5915 (class 0 OID 0)
-- Dependencies: 275
-- Name: proyecto_miembros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proyecto_miembros_id_seq', 1, false);


--
-- TOC entry 5916 (class 0 OID 0)
-- Dependencies: 273
-- Name: proyectos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proyectos_id_seq', 1, false);


--
-- TOC entry 5917 (class 0 OID 0)
-- Dependencies: 234
-- Name: recordatorios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recordatorios_id_seq', 52, true);


--
-- TOC entry 5918 (class 0 OID 0)
-- Dependencies: 294
-- Name: registros_entrenamiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registros_entrenamiento_id_seq', 22, true);


--
-- TOC entry 5919 (class 0 OID 0)
-- Dependencies: 224
-- Name: registros_habitos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registros_habitos_id_seq', 4, true);


--
-- TOC entry 5920 (class 0 OID 0)
-- Dependencies: 290
-- Name: rutinas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rutinas_id_seq', 4, true);


--
-- TOC entry 5921 (class 0 OID 0)
-- Dependencies: 296
-- Name: series_entrenamiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.series_entrenamiento_id_seq', 58, true);


--
-- TOC entry 5922 (class 0 OID 0)
-- Dependencies: 253
-- Name: sugerencias_ia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sugerencias_ia_id_seq', 1, false);


--
-- TOC entry 5923 (class 0 OID 0)
-- Dependencies: 277
-- Name: tareas_compartidas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tareas_compartidas_id_seq', 1, false);


--
-- TOC entry 5924 (class 0 OID 0)
-- Dependencies: 226
-- Name: tareas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tareas_id_seq', 145, true);


--
-- TOC entry 5925 (class 0 OID 0)
-- Dependencies: 220
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 41, true);


--
-- TOC entry 5480 (class 2606 OID 66125)
-- Name: amistades amistades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT amistades_pkey PRIMARY KEY (id);


--
-- TOC entry 5482 (class 2606 OID 66137)
-- Name: amistades amistades_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT amistades_unique UNIQUE (solicitante_id, receptor_id);


--
-- TOC entry 5445 (class 2606 OID 65890)
-- Name: analisis_ia analisis_ia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_ia
    ADD CONSTRAINT analisis_ia_pkey PRIMARY KEY (id);


--
-- TOC entry 5478 (class 2606 OID 66108)
-- Name: bloques_tiempo bloques_tiempo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloques_tiempo
    ADD CONSTRAINT bloques_tiempo_pkey PRIMARY KEY (id);


--
-- TOC entry 5397 (class 2606 OID 33151)
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- TOC entry 5501 (class 2606 OID 67286)
-- Name: checkins_emocionales checkins_emocionales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkins_emocionales
    ADD CONSTRAINT checkins_emocionales_pkey PRIMARY KEY (id);


--
-- TOC entry 5503 (class 2606 OID 67293)
-- Name: checkins_emocionales checkins_emocionales_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkins_emocionales
    ADD CONSTRAINT checkins_emocionales_unique UNIQUE (usuario_id, fecha);


--
-- TOC entry 5492 (class 2606 OID 66226)
-- Name: comentarios comentarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_pkey PRIMARY KEY (id);


--
-- TOC entry 5452 (class 2606 OID 65930)
-- Name: conversaciones_ia conversaciones_ia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversaciones_ia
    ADD CONSTRAINT conversaciones_ia_pkey PRIMARY KEY (id);


--
-- TOC entry 5506 (class 2606 OID 67310)
-- Name: diario_personal diario_personal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diario_personal
    ADD CONSTRAINT diario_personal_pkey PRIMARY KEY (id);


--
-- TOC entry 5514 (class 2606 OID 67373)
-- Name: ejercicios ejercicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ejercicios
    ADD CONSTRAINT ejercicios_pkey PRIMARY KEY (id);


--
-- TOC entry 5438 (class 2606 OID 57771)
-- Name: eventos_gamificacion eventos_gamificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_gamificacion
    ADD CONSTRAINT eventos_gamificacion_pkey PRIMARY KEY (id);


--
-- TOC entry 5440 (class 2606 OID 57773)
-- Name: eventos_gamificacion eventos_gamificacion_usuario_id_referencia_tipo_referencia__key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_gamificacion
    ADD CONSTRAINT eventos_gamificacion_usuario_id_referencia_tipo_referencia__key UNIQUE (usuario_id, referencia_tipo, referencia_id, tipo);


--
-- TOC entry 5455 (class 2606 OID 65953)
-- Name: finanzas_categorias finanzas_categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_categorias
    ADD CONSTRAINT finanzas_categorias_pkey PRIMARY KEY (id);


--
-- TOC entry 5458 (class 2606 OID 65975)
-- Name: finanzas_cuentas finanzas_cuentas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_cuentas
    ADD CONSTRAINT finanzas_cuentas_pkey PRIMARY KEY (id);


--
-- TOC entry 5475 (class 2606 OID 66087)
-- Name: finanzas_deudas finanzas_deudas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_deudas
    ADD CONSTRAINT finanzas_deudas_pkey PRIMARY KEY (id);


--
-- TOC entry 5472 (class 2606 OID 66063)
-- Name: finanzas_metas finanzas_metas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_metas
    ADD CONSTRAINT finanzas_metas_pkey PRIMARY KEY (id);


--
-- TOC entry 5467 (class 2606 OID 66034)
-- Name: finanzas_presupuestos finanzas_presupuestos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_presupuestos
    ADD CONSTRAINT finanzas_presupuestos_pkey PRIMARY KEY (id);


--
-- TOC entry 5469 (class 2606 OID 66047)
-- Name: finanzas_presupuestos finanzas_presupuestos_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_presupuestos
    ADD CONSTRAINT finanzas_presupuestos_unique UNIQUE (usuario_id, categoria_id, mes, anio);


--
-- TOC entry 5464 (class 2606 OID 65999)
-- Name: finanzas_transacciones finanzas_transacciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_transacciones
    ADD CONSTRAINT finanzas_transacciones_pkey PRIMARY KEY (id);


--
-- TOC entry 5383 (class 2606 OID 33091)
-- Name: habitos habitos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habitos
    ADD CONSTRAINT habitos_pkey PRIMARY KEY (id);


--
-- TOC entry 5435 (class 2606 OID 57748)
-- Name: historial_puntos historial_puntos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_puntos
    ADD CONSTRAINT historial_puntos_pkey PRIMARY KEY (id);


--
-- TOC entry 5524 (class 2606 OID 67461)
-- Name: key_results key_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.key_results
    ADD CONSTRAINT key_results_pkey PRIMARY KEY (id);


--
-- TOC entry 5426 (class 2606 OID 57716)
-- Name: logros logros_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros
    ADD CONSTRAINT logros_codigo_key UNIQUE (codigo);


--
-- TOC entry 5428 (class 2606 OID 57714)
-- Name: logros logros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros
    ADD CONSTRAINT logros_pkey PRIMARY KEY (id);


--
-- TOC entry 5431 (class 2606 OID 57725)
-- Name: logros_usuario logros_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros_usuario
    ADD CONSTRAINT logros_usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 5433 (class 2606 OID 57727)
-- Name: logros_usuario logros_usuario_usuario_id_logro_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros_usuario
    ADD CONSTRAINT logros_usuario_usuario_id_logro_id_key UNIQUE (usuario_id, logro_id);


--
-- TOC entry 5526 (class 2606 OID 67480)
-- Name: meta_progreso meta_progreso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meta_progreso
    ADD CONSTRAINT meta_progreso_pkey PRIMARY KEY (id);


--
-- TOC entry 5528 (class 2606 OID 67487)
-- Name: meta_progreso meta_progreso_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meta_progreso
    ADD CONSTRAINT meta_progreso_unique UNIQUE (meta_id, fecha);


--
-- TOC entry 5520 (class 2606 OID 67439)
-- Name: metas metas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metas
    ADD CONSTRAINT metas_pkey PRIMARY KEY (id);


--
-- TOC entry 5415 (class 2606 OID 41271)
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 5509 (class 2606 OID 67329)
-- Name: pausas_activas pausas_activas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pausas_activas
    ADD CONSTRAINT pausas_activas_pkey PRIMARY KEY (id);


--
-- TOC entry 5422 (class 2606 OID 57690)
-- Name: perfil_gamificacion perfil_gamificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfil_gamificacion
    ADD CONSTRAINT perfil_gamificacion_pkey PRIMARY KEY (id);


--
-- TOC entry 5424 (class 2606 OID 57692)
-- Name: perfil_gamificacion perfil_gamificacion_usuario_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfil_gamificacion
    ADD CONSTRAINT perfil_gamificacion_usuario_id_key UNIQUE (usuario_id);


--
-- TOC entry 5443 (class 2606 OID 65876)
-- Name: pgmigrations pgmigrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pgmigrations
    ADD CONSTRAINT pgmigrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5534 (class 2606 OID 75650)
-- Name: plantillas_bloques plantillas_bloques_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantillas_bloques
    ADD CONSTRAINT plantillas_bloques_pkey PRIMARY KEY (id);


--
-- TOC entry 5530 (class 2606 OID 75627)
-- Name: plantillas_dia plantillas_dia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantillas_dia
    ADD CONSTRAINT plantillas_dia_pkey PRIMARY KEY (id);


--
-- TOC entry 5532 (class 2606 OID 75629)
-- Name: plantillas_dia plantillas_dia_usuario_id_dia_semana_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantillas_dia
    ADD CONSTRAINT plantillas_dia_usuario_id_dia_semana_key UNIQUE (usuario_id, dia_semana);


--
-- TOC entry 5497 (class 2606 OID 66270)
-- Name: pomodoro_sessions pomodoro_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pomodoro_sessions
    ADD CONSTRAINT pomodoro_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5494 (class 2606 OID 66255)
-- Name: pomodoro_settings pomodoro_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pomodoro_settings
    ADD CONSTRAINT pomodoro_settings_pkey PRIMARY KEY (usuario_id);


--
-- TOC entry 5404 (class 2606 OID 41222)
-- Name: preferencias_notificacion preferencias_notificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferencias_notificacion
    ADD CONSTRAINT preferencias_notificacion_pkey PRIMARY KEY (id);


--
-- TOC entry 5406 (class 2606 OID 41224)
-- Name: preferencias_notificacion preferencias_notificacion_usuario_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferencias_notificacion
    ADD CONSTRAINT preferencias_notificacion_usuario_id_key UNIQUE (usuario_id);


--
-- TOC entry 5400 (class 2606 OID 33170)
-- Name: progreso progreso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progreso
    ADD CONSTRAINT progreso_pkey PRIMARY KEY (id);


--
-- TOC entry 5402 (class 2606 OID 67421)
-- Name: progreso progreso_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progreso
    ADD CONSTRAINT progreso_unique UNIQUE (usuario_id, tipo, fecha);


--
-- TOC entry 5486 (class 2606 OID 66168)
-- Name: proyecto_miembros proyecto_miembros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_miembros
    ADD CONSTRAINT proyecto_miembros_pkey PRIMARY KEY (id);


--
-- TOC entry 5488 (class 2606 OID 66180)
-- Name: proyecto_miembros proyecto_miembros_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_miembros
    ADD CONSTRAINT proyecto_miembros_unique UNIQUE (proyecto_id, usuario_id);


--
-- TOC entry 5484 (class 2606 OID 66151)
-- Name: proyectos proyectos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_pkey PRIMARY KEY (id);


--
-- TOC entry 5411 (class 2606 OID 41251)
-- Name: recordatorios recordatorios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recordatorios
    ADD CONSTRAINT recordatorios_pkey PRIMARY KEY (id);


--
-- TOC entry 5516 (class 2606 OID 67390)
-- Name: registros_entrenamiento registros_entrenamiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_entrenamiento
    ADD CONSTRAINT registros_entrenamiento_pkey PRIMARY KEY (id);


--
-- TOC entry 5388 (class 2606 OID 33107)
-- Name: registros_habitos registros_habitos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_habitos
    ADD CONSTRAINT registros_habitos_pkey PRIMARY KEY (id);


--
-- TOC entry 5512 (class 2606 OID 67357)
-- Name: rutinas rutinas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rutinas
    ADD CONSTRAINT rutinas_pkey PRIMARY KEY (id);


--
-- TOC entry 5518 (class 2606 OID 67413)
-- Name: series_entrenamiento series_entrenamiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.series_entrenamiento
    ADD CONSTRAINT series_entrenamiento_pkey PRIMARY KEY (id);


--
-- TOC entry 5450 (class 2606 OID 65910)
-- Name: sugerencias_ia sugerencias_ia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sugerencias_ia
    ADD CONSTRAINT sugerencias_ia_pkey PRIMARY KEY (id);


--
-- TOC entry 5490 (class 2606 OID 66197)
-- Name: tareas_compartidas tareas_compartidas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas_compartidas
    ADD CONSTRAINT tareas_compartidas_pkey PRIMARY KEY (id);


--
-- TOC entry 5395 (class 2606 OID 33133)
-- Name: tareas tareas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_pkey PRIMARY KEY (id);


--
-- TOC entry 5418 (class 2606 OID 49491)
-- Name: usuario_gamificacion usuario_gamificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_gamificacion
    ADD CONSTRAINT usuario_gamificacion_pkey PRIMARY KEY (usuario_id);


--
-- TOC entry 5379 (class 2606 OID 33077)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 5381 (class 2606 OID 33075)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 5504 (class 1259 OID 67294)
-- Name: checkins_emocionales_usuario_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX checkins_emocionales_usuario_id_index ON public.checkins_emocionales USING btree (usuario_id);


--
-- TOC entry 5507 (class 1259 OID 67316)
-- Name: diario_personal_usuario_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX diario_personal_usuario_id_index ON public.diario_personal USING btree (usuario_id);


--
-- TOC entry 5456 (class 1259 OID 65959)
-- Name: finanzas_categorias_usuario_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX finanzas_categorias_usuario_id_index ON public.finanzas_categorias USING btree (usuario_id);


--
-- TOC entry 5459 (class 1259 OID 65981)
-- Name: finanzas_cuentas_usuario_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX finanzas_cuentas_usuario_id_index ON public.finanzas_cuentas USING btree (usuario_id);


--
-- TOC entry 5476 (class 1259 OID 66093)
-- Name: finanzas_deudas_usuario_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX finanzas_deudas_usuario_id_index ON public.finanzas_deudas USING btree (usuario_id);


--
-- TOC entry 5473 (class 1259 OID 66069)
-- Name: finanzas_metas_usuario_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX finanzas_metas_usuario_id_index ON public.finanzas_metas USING btree (usuario_id);


--
-- TOC entry 5470 (class 1259 OID 66045)
-- Name: finanzas_presupuestos_usuario_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX finanzas_presupuestos_usuario_id_index ON public.finanzas_presupuestos USING btree (usuario_id);


--
-- TOC entry 5460 (class 1259 OID 66016)
-- Name: finanzas_transacciones_categoria_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX finanzas_transacciones_categoria_id_index ON public.finanzas_transacciones USING btree (categoria_id);


--
-- TOC entry 5461 (class 1259 OID 66017)
-- Name: finanzas_transacciones_cuenta_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX finanzas_transacciones_cuenta_id_index ON public.finanzas_transacciones USING btree (cuenta_id);


--
-- TOC entry 5462 (class 1259 OID 66018)
-- Name: finanzas_transacciones_fecha_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX finanzas_transacciones_fecha_index ON public.finanzas_transacciones USING btree (fecha);


--
-- TOC entry 5465 (class 1259 OID 66015)
-- Name: finanzas_transacciones_usuario_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX finanzas_transacciones_usuario_id_index ON public.finanzas_transacciones USING btree (usuario_id);


--
-- TOC entry 5446 (class 1259 OID 65937)
-- Name: idx_analisis_ia_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analisis_ia_tipo ON public.analisis_ia USING btree (tipo);


--
-- TOC entry 5447 (class 1259 OID 65936)
-- Name: idx_analisis_ia_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analisis_ia_usuario ON public.analisis_ia USING btree (usuario_id);


--
-- TOC entry 5398 (class 1259 OID 33185)
-- Name: idx_categorias_usuario_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categorias_usuario_id ON public.categorias USING btree (usuario_id);


--
-- TOC entry 5453 (class 1259 OID 65939)
-- Name: idx_conversaciones_ia_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversaciones_ia_usuario ON public.conversaciones_ia USING btree (usuario_id);


--
-- TOC entry 5384 (class 1259 OID 33177)
-- Name: idx_habitos_usuario_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_habitos_usuario_id ON public.habitos USING btree (usuario_id);


--
-- TOC entry 5436 (class 1259 OID 57756)
-- Name: idx_historial_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historial_usuario ON public.historial_puntos USING btree (usuario_id);


--
-- TOC entry 5429 (class 1259 OID 57755)
-- Name: idx_logros_usuario_uid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logros_usuario_uid ON public.logros_usuario USING btree (usuario_id);


--
-- TOC entry 5412 (class 1259 OID 41286)
-- Name: idx_notificaciones_leida; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notificaciones_leida ON public.notificaciones USING btree (leida);


--
-- TOC entry 5413 (class 1259 OID 41285)
-- Name: idx_notificaciones_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notificaciones_usuario ON public.notificaciones USING btree (usuario_id);


--
-- TOC entry 5419 (class 1259 OID 67498)
-- Name: idx_perfil_puntos; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_perfil_puntos ON public.perfil_gamificacion USING btree (puntos_totales);


--
-- TOC entry 5420 (class 1259 OID 57754)
-- Name: idx_perfil_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_perfil_usuario ON public.perfil_gamificacion USING btree (usuario_id);


--
-- TOC entry 5407 (class 1259 OID 41284)
-- Name: idx_recordatorios_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recordatorios_estado ON public.recordatorios USING btree (estado);


--
-- TOC entry 5408 (class 1259 OID 41283)
-- Name: idx_recordatorios_fecha_hora; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recordatorios_fecha_hora ON public.recordatorios USING btree (fecha_hora);


--
-- TOC entry 5409 (class 1259 OID 41282)
-- Name: idx_recordatorios_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recordatorios_usuario ON public.recordatorios USING btree (usuario_id);


--
-- TOC entry 5385 (class 1259 OID 33179)
-- Name: idx_registros_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_fecha ON public.registros_habitos USING btree (fecha);


--
-- TOC entry 5386 (class 1259 OID 33178)
-- Name: idx_registros_habito_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_registros_habito_id ON public.registros_habitos USING btree (habito_id);


--
-- TOC entry 5448 (class 1259 OID 65938)
-- Name: idx_sugerencias_ia_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sugerencias_ia_usuario ON public.sugerencias_ia USING btree (usuario_id);


--
-- TOC entry 5389 (class 1259 OID 33181)
-- Name: idx_tareas_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tareas_estado ON public.tareas USING btree (estado);


--
-- TOC entry 5390 (class 1259 OID 33183)
-- Name: idx_tareas_fecha_inicio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tareas_fecha_inicio ON public.tareas USING btree (fecha_inicio);


--
-- TOC entry 5391 (class 1259 OID 33184)
-- Name: idx_tareas_fecha_limite; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tareas_fecha_limite ON public.tareas USING btree (fecha_limite);


--
-- TOC entry 5392 (class 1259 OID 33182)
-- Name: idx_tareas_prioridad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tareas_prioridad ON public.tareas USING btree (prioridad);


--
-- TOC entry 5393 (class 1259 OID 33180)
-- Name: idx_tareas_usuario_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tareas_usuario_id ON public.tareas USING btree (usuario_id);


--
-- TOC entry 5377 (class 1259 OID 33176)
-- Name: idx_usuarios_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_email ON public.usuarios USING btree (email);


--
-- TOC entry 5522 (class 1259 OID 67467)
-- Name: key_results_meta_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX key_results_meta_id_index ON public.key_results USING btree (meta_id);


--
-- TOC entry 5521 (class 1259 OID 67445)
-- Name: metas_usuario_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX metas_usuario_id_index ON public.metas USING btree (usuario_id);


--
-- TOC entry 5510 (class 1259 OID 67335)
-- Name: pausas_activas_usuario_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pausas_activas_usuario_id_index ON public.pausas_activas USING btree (usuario_id);


--
-- TOC entry 5495 (class 1259 OID 66283)
-- Name: pomodoro_sessions_inicio_en_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pomodoro_sessions_inicio_en_index ON public.pomodoro_sessions USING btree (inicio_en);


--
-- TOC entry 5498 (class 1259 OID 66282)
-- Name: pomodoro_sessions_tarea_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pomodoro_sessions_tarea_id_index ON public.pomodoro_sessions USING btree (tarea_id);


--
-- TOC entry 5499 (class 1259 OID 66281)
-- Name: pomodoro_sessions_usuario_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pomodoro_sessions_usuario_id_index ON public.pomodoro_sessions USING btree (usuario_id);


--
-- TOC entry 5416 (class 1259 OID 41290)
-- Name: uniq_notificacion_recordatorio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_notificacion_recordatorio ON public.notificaciones USING btree (recordatorio_id, usuario_id);


--
-- TOC entry 5441 (class 1259 OID 57774)
-- Name: unique_evento_gamificacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_evento_gamificacion ON public.eventos_gamificacion USING btree (usuario_id, tipo, referencia_tipo, referencia_id);


--
-- TOC entry 5595 (class 2620 OID 33190)
-- Name: categorias trigger_categorias_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_categorias_updated BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- TOC entry 5593 (class 2620 OID 33188)
-- Name: habitos trigger_habitos_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_habitos_updated BEFORE UPDATE ON public.habitos FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- TOC entry 5598 (class 2620 OID 57757)
-- Name: perfil_gamificacion trigger_perfil_actualizado; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_perfil_actualizado BEFORE UPDATE ON public.perfil_gamificacion FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- TOC entry 5596 (class 2620 OID 41289)
-- Name: preferencias_notificacion trigger_preferencias_actualizado; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_preferencias_actualizado BEFORE UPDATE ON public.preferencias_notificacion FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- TOC entry 5597 (class 2620 OID 41288)
-- Name: recordatorios trigger_recordatorios_actualizado; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_recordatorios_actualizado BEFORE UPDATE ON public.recordatorios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- TOC entry 5594 (class 2620 OID 33189)
-- Name: tareas trigger_tareas_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_tareas_updated BEFORE UPDATE ON public.tareas FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- TOC entry 5592 (class 2620 OID 33187)
-- Name: usuarios trigger_usuarios_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_usuarios_updated BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- TOC entry 5564 (class 2606 OID 66131)
-- Name: amistades amistades_receptor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT amistades_receptor_id_fkey FOREIGN KEY (receptor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5565 (class 2606 OID 66126)
-- Name: amistades amistades_solicitante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT amistades_solicitante_id_fkey FOREIGN KEY (solicitante_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5551 (class 2606 OID 65891)
-- Name: analisis_ia analisis_ia_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_ia
    ADD CONSTRAINT analisis_ia_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5563 (class 2606 OID 66109)
-- Name: bloques_tiempo bloques_tiempo_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bloques_tiempo
    ADD CONSTRAINT bloques_tiempo_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5541 (class 2606 OID 33152)
-- Name: categorias categorias_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5577 (class 2606 OID 67287)
-- Name: checkins_emocionales checkins_emocionales_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkins_emocionales
    ADD CONSTRAINT checkins_emocionales_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5572 (class 2606 OID 66227)
-- Name: comentarios comentarios_tarea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tareas_compartidas(id) ON DELETE CASCADE;


--
-- TOC entry 5573 (class 2606 OID 66232)
-- Name: comentarios comentarios_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5553 (class 2606 OID 65931)
-- Name: conversaciones_ia conversaciones_ia_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversaciones_ia
    ADD CONSTRAINT conversaciones_ia_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5578 (class 2606 OID 67311)
-- Name: diario_personal diario_personal_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diario_personal
    ADD CONSTRAINT diario_personal_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5581 (class 2606 OID 67374)
-- Name: ejercicios ejercicios_rutina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ejercicios
    ADD CONSTRAINT ejercicios_rutina_id_fkey FOREIGN KEY (rutina_id) REFERENCES public.rutinas(id) ON DELETE CASCADE;


--
-- TOC entry 5554 (class 2606 OID 65954)
-- Name: finanzas_categorias finanzas_categorias_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_categorias
    ADD CONSTRAINT finanzas_categorias_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5555 (class 2606 OID 65976)
-- Name: finanzas_cuentas finanzas_cuentas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_cuentas
    ADD CONSTRAINT finanzas_cuentas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5562 (class 2606 OID 66088)
-- Name: finanzas_deudas finanzas_deudas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_deudas
    ADD CONSTRAINT finanzas_deudas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5561 (class 2606 OID 66064)
-- Name: finanzas_metas finanzas_metas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_metas
    ADD CONSTRAINT finanzas_metas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5559 (class 2606 OID 66040)
-- Name: finanzas_presupuestos finanzas_presupuestos_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_presupuestos
    ADD CONSTRAINT finanzas_presupuestos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.finanzas_categorias(id) ON DELETE CASCADE;


--
-- TOC entry 5560 (class 2606 OID 66035)
-- Name: finanzas_presupuestos finanzas_presupuestos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_presupuestos
    ADD CONSTRAINT finanzas_presupuestos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5556 (class 2606 OID 66005)
-- Name: finanzas_transacciones finanzas_transacciones_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_transacciones
    ADD CONSTRAINT finanzas_transacciones_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.finanzas_categorias(id) ON DELETE SET NULL;


--
-- TOC entry 5557 (class 2606 OID 66010)
-- Name: finanzas_transacciones finanzas_transacciones_cuenta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_transacciones
    ADD CONSTRAINT finanzas_transacciones_cuenta_id_fkey FOREIGN KEY (cuenta_id) REFERENCES public.finanzas_cuentas(id) ON DELETE SET NULL;


--
-- TOC entry 5558 (class 2606 OID 66000)
-- Name: finanzas_transacciones finanzas_transacciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finanzas_transacciones
    ADD CONSTRAINT finanzas_transacciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5537 (class 2606 OID 33157)
-- Name: tareas fk_tareas_categoria; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT fk_tareas_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;


--
-- TOC entry 5535 (class 2606 OID 33092)
-- Name: habitos habitos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habitos
    ADD CONSTRAINT habitos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5550 (class 2606 OID 57749)
-- Name: historial_puntos historial_puntos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_puntos
    ADD CONSTRAINT historial_puntos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5587 (class 2606 OID 67462)
-- Name: key_results key_results_meta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.key_results
    ADD CONSTRAINT key_results_meta_id_fkey FOREIGN KEY (meta_id) REFERENCES public.metas(id) ON DELETE CASCADE;


--
-- TOC entry 5548 (class 2606 OID 57733)
-- Name: logros_usuario logros_usuario_logro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros_usuario
    ADD CONSTRAINT logros_usuario_logro_id_fkey FOREIGN KEY (logro_id) REFERENCES public.logros(id) ON DELETE CASCADE;


--
-- TOC entry 5549 (class 2606 OID 57728)
-- Name: logros_usuario logros_usuario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros_usuario
    ADD CONSTRAINT logros_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5588 (class 2606 OID 67481)
-- Name: meta_progreso meta_progreso_meta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meta_progreso
    ADD CONSTRAINT meta_progreso_meta_id_fkey FOREIGN KEY (meta_id) REFERENCES public.metas(id) ON DELETE CASCADE;


--
-- TOC entry 5586 (class 2606 OID 67440)
-- Name: metas metas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metas
    ADD CONSTRAINT metas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5545 (class 2606 OID 41277)
-- Name: notificaciones notificaciones_recordatorio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_recordatorio_id_fkey FOREIGN KEY (recordatorio_id) REFERENCES public.recordatorios(id) ON DELETE SET NULL;


--
-- TOC entry 5546 (class 2606 OID 41272)
-- Name: notificaciones notificaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5579 (class 2606 OID 67330)
-- Name: pausas_activas pausas_activas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pausas_activas
    ADD CONSTRAINT pausas_activas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5547 (class 2606 OID 57693)
-- Name: perfil_gamificacion perfil_gamificacion_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfil_gamificacion
    ADD CONSTRAINT perfil_gamificacion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5590 (class 2606 OID 83809)
-- Name: plantillas_bloques plantillas_bloques_gimnasio_rutina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantillas_bloques
    ADD CONSTRAINT plantillas_bloques_gimnasio_rutina_id_fkey FOREIGN KEY (gimnasio_rutina_id) REFERENCES public.rutinas(id) ON DELETE SET NULL;


--
-- TOC entry 5591 (class 2606 OID 75651)
-- Name: plantillas_bloques plantillas_bloques_plantilla_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantillas_bloques
    ADD CONSTRAINT plantillas_bloques_plantilla_id_fkey FOREIGN KEY (plantilla_id) REFERENCES public.plantillas_dia(id) ON DELETE CASCADE;


--
-- TOC entry 5589 (class 2606 OID 75630)
-- Name: plantillas_dia plantillas_dia_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plantillas_dia
    ADD CONSTRAINT plantillas_dia_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5575 (class 2606 OID 66276)
-- Name: pomodoro_sessions pomodoro_sessions_tarea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pomodoro_sessions
    ADD CONSTRAINT pomodoro_sessions_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tareas(id) ON DELETE SET NULL;


--
-- TOC entry 5576 (class 2606 OID 66271)
-- Name: pomodoro_sessions pomodoro_sessions_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pomodoro_sessions
    ADD CONSTRAINT pomodoro_sessions_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5574 (class 2606 OID 66249)
-- Name: pomodoro_settings pomodoro_settings_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pomodoro_settings
    ADD CONSTRAINT pomodoro_settings_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5543 (class 2606 OID 41225)
-- Name: preferencias_notificacion preferencias_notificacion_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferencias_notificacion
    ADD CONSTRAINT preferencias_notificacion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5542 (class 2606 OID 33171)
-- Name: progreso progreso_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progreso
    ADD CONSTRAINT progreso_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5567 (class 2606 OID 66169)
-- Name: proyecto_miembros proyecto_miembros_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_miembros
    ADD CONSTRAINT proyecto_miembros_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- TOC entry 5568 (class 2606 OID 66174)
-- Name: proyecto_miembros proyecto_miembros_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyecto_miembros
    ADD CONSTRAINT proyecto_miembros_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5566 (class 2606 OID 66152)
-- Name: proyectos proyectos_creador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_creador_id_fkey FOREIGN KEY (creador_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5544 (class 2606 OID 41252)
-- Name: recordatorios recordatorios_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recordatorios
    ADD CONSTRAINT recordatorios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5582 (class 2606 OID 67396)
-- Name: registros_entrenamiento registros_entrenamiento_ejercicio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_entrenamiento
    ADD CONSTRAINT registros_entrenamiento_ejercicio_id_fkey FOREIGN KEY (ejercicio_id) REFERENCES public.ejercicios(id) ON DELETE CASCADE;


--
-- TOC entry 5583 (class 2606 OID 67401)
-- Name: registros_entrenamiento registros_entrenamiento_rutina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_entrenamiento
    ADD CONSTRAINT registros_entrenamiento_rutina_id_fkey FOREIGN KEY (rutina_id) REFERENCES public.rutinas(id) ON DELETE SET NULL;


--
-- TOC entry 5584 (class 2606 OID 67391)
-- Name: registros_entrenamiento registros_entrenamiento_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_entrenamiento
    ADD CONSTRAINT registros_entrenamiento_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5536 (class 2606 OID 33108)
-- Name: registros_habitos registros_habitos_habito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_habitos
    ADD CONSTRAINT registros_habitos_habito_id_fkey FOREIGN KEY (habito_id) REFERENCES public.habitos(id) ON DELETE CASCADE;


--
-- TOC entry 5580 (class 2606 OID 67358)
-- Name: rutinas rutinas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rutinas
    ADD CONSTRAINT rutinas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5585 (class 2606 OID 67414)
-- Name: series_entrenamiento series_entrenamiento_registro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.series_entrenamiento
    ADD CONSTRAINT series_entrenamiento_registro_id_fkey FOREIGN KEY (registro_id) REFERENCES public.registros_entrenamiento(id) ON DELETE CASCADE;


--
-- TOC entry 5552 (class 2606 OID 65911)
-- Name: sugerencias_ia sugerencias_ia_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sugerencias_ia
    ADD CONSTRAINT sugerencias_ia_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5569 (class 2606 OID 66208)
-- Name: tareas_compartidas tareas_compartidas_asignado_a_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas_compartidas
    ADD CONSTRAINT tareas_compartidas_asignado_a_fkey FOREIGN KEY (asignado_a) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- TOC entry 5570 (class 2606 OID 66203)
-- Name: tareas_compartidas tareas_compartidas_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas_compartidas
    ADD CONSTRAINT tareas_compartidas_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5571 (class 2606 OID 66198)
-- Name: tareas_compartidas tareas_compartidas_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas_compartidas
    ADD CONSTRAINT tareas_compartidas_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- TOC entry 5538 (class 2606 OID 67493)
-- Name: tareas tareas_key_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_key_result_id_fkey FOREIGN KEY (key_result_id) REFERENCES public.key_results(id) ON DELETE SET NULL;


--
-- TOC entry 5539 (class 2606 OID 67488)
-- Name: tareas tareas_meta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_meta_id_fkey FOREIGN KEY (meta_id) REFERENCES public.metas(id) ON DELETE SET NULL;


--
-- TOC entry 5540 (class 2606 OID 33134)
-- Name: tareas tareas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


-- Completed on 2026-05-27 23:38:27

--
-- PostgreSQL database dump complete
--

\unrestrict yHnNrbIk5cEP4ydVUit2gvybA8aqPXFvqw0QKxMVAV0iebesdmcuJ6AVrxSJdTZ

