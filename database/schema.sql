CREATE TABLE IF NOT EXISTS checkins_emocionales (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  estado_animo VARCHAR(50) NOT NULL,
  energia INTEGER CHECK (energia BETWEEN 1 AND 10),
  sueno_horas DECIMAL(4,1),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, fecha)
);

CREATE TABLE IF NOT EXISTS diario_personal (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  titulo VARCHAR(255),
  contenido TEXT NOT NULL,
  etiquetas TEXT[],
  es_publico BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bloques_tiempo (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  dias_semana INTEGER[],
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pausas_activas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  ejercicio VARCHAR(255) NOT NULL,
  duracion_minutos INTEGER NOT NULL,
  programada_para TIMESTAMP,
  completada BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analisis_ia (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  resultado JSONB,
  cache_hasta TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
