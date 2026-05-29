-- Índices compuestos para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_estado ON public.tareas (usuario_id, estado);
CREATE INDEX IF NOT EXISTS idx_tareas_usuario_fecha_inicio ON public.tareas (usuario_id, fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_tareas_key_result_id ON public.tareas (key_result_id);
CREATE INDEX IF NOT EXISTS idx_tareas_auto_programado ON public.tareas (auto_programado) WHERE auto_programado = true;

CREATE INDEX IF NOT EXISTS idx_bloques_tiempo_usuario ON public.bloques_tiempo (usuario_id);
CREATE INDEX IF NOT EXISTS idx_plantillas_dia_usuario ON public.plantillas_dia (usuario_id);
CREATE INDEX IF NOT EXISTS idx_plantillas_bloques_plantilla ON public.plantillas_bloques (plantilla_id);

CREATE INDEX IF NOT EXISTS idx_rutinas_usuario ON public.rutinas (usuario_id);
CREATE INDEX IF NOT EXISTS idx_ejercicios_rutina ON public.ejercicios (rutina_id);

CREATE INDEX IF NOT EXISTS idx_amistades_solicitante ON public.amistades (solicitante_id);
CREATE INDEX IF NOT EXISTS idx_amistades_receptor ON public.amistades (receptor_id);
CREATE INDEX IF NOT EXISTS idx_amistades_estado ON public.amistades (estado);

CREATE INDEX IF NOT EXISTS idx_tareas_meta_id ON public.tareas (meta_id);
CREATE INDEX IF NOT EXISTS idx_meta_progreso_fecha ON public.meta_progreso (fecha DESC);
