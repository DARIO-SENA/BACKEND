-- ============================================================
-- Fix 3: FOREIGN KEY para eventos_gamificacion
-- ============================================================
ALTER TABLE public.eventos_gamificacion
  ADD CONSTRAINT eventos_gamificacion_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;

-- ============================================================
-- Fix 14: CHECK constraint para metas.estado
-- ============================================================
ALTER TABLE public.metas
  ADD CONSTRAINT metas_estado_check
  CHECK (estado IN ('borrador', 'en_progreso', 'completada', 'cancelada'));

-- ============================================================
-- Fix 21: Unificar triggers duplicados
-- Reemplazar update_updated_at() con actualizar_timestamp()
-- ============================================================
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

-- ============================================================
-- Fix 15: Añadir triggers actualizado_en a tablas faltantes
-- ============================================================
-- Agendas / bloques_tiempo
CREATE TRIGGER trigger_bloques_tiempo_updated
  BEFORE UPDATE ON public.bloques_tiempo
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

-- Gym
CREATE TRIGGER trigger_rutinas_updated
  BEFORE UPDATE ON public.rutinas
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_ejercicios_updated
  BEFORE UPDATE ON public.ejercicios
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_registros_entrenamiento_updated
  BEFORE UPDATE ON public.registros_entrenamiento
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

-- Finanzas
CREATE TRIGGER trigger_finanzas_categorias_updated
  BEFORE UPDATE ON public.finanzas_categorias
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_finanzas_cuentas_updated
  BEFORE UPDATE ON public.finanzas_cuentas
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_finanzas_transacciones_updated
  BEFORE UPDATE ON public.finanzas_transacciones
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_finanzas_presupuestos_updated
  BEFORE UPDATE ON public.finanzas_presupuestos
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_finanzas_metas_updated
  BEFORE UPDATE ON public.finanzas_metas
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_finanzas_deudas_updated
  BEFORE UPDATE ON public.finanzas_deudas
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

-- Metas / OKRs
CREATE TRIGGER trigger_metas_updated
  BEFORE UPDATE ON public.metas
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_key_results_updated
  BEFORE UPDATE ON public.key_results
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

-- Social
CREATE TRIGGER trigger_amistades_updated
  BEFORE UPDATE ON public.amistades
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_comentarios_updated
  BEFORE UPDATE ON public.comentarios
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

-- Pomodoro
CREATE TRIGGER trigger_pomodoro_sessions_updated
  BEFORE UPDATE ON public.pomodoro_sessions
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

-- Bienestar
CREATE TRIGGER trigger_checkins_emocionales_updated
  BEFORE UPDATE ON public.checkins_emocionales
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_diario_personal_updated
  BEFORE UPDATE ON public.diario_personal
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

-- Events / logs
CREATE TRIGGER trigger_eventos_gamificacion_updated
  BEFORE UPDATE ON public.eventos_gamificacion
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();

-- ============================================================
-- Fix 28: usuario_gamificacion es tabla duplicada/huérfana
-- perfil_gamificacion es la tabla activa. La migración no la
-- dropea automáticamente para no perder datos, pero se marca
-- como tabla legacy. Ejecutar solo si se verifica que no tiene
-- datos distintos a perfil_gamificacion.
-- ============================================================
-- Comentar la línea siguiente después de verificar:
-- DROP TABLE IF EXISTS public.usuario_gamificacion;

-- ============================================================
-- Fix 25: TEXT → VARCHAR con límite en columnas comunes
-- No se alteran automáticamente para evitar bloqueos en prod.
-- Estas alteraciones deben ejecutarse en mantenimiento.
-- ============================================================
-- ALTER TABLE public.notificaciones ALTER COLUMN mensaje TYPE VARCHAR(500);
-- ALTER TABLE public.finanzas_transacciones ALTER COLUMN descripcion TYPE VARCHAR(300);
-- ALTER TABLE public.finanzas_categorias ALTER COLUMN descripcion TYPE VARCHAR(300);
-- ALTER TABLE public.diario_personal ALTER COLUMN contenido TYPE VARCHAR(5000);
-- ALTER TABLE public.checkins_emocionales ALTER COLUMN notas TYPE VARCHAR(500);

-- ============================================================
-- Nota: ejecutar con: psql -U user -d dbname -f fixes.sql
-- ============================================================
