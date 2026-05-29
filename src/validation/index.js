import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(100, "Nombre demasiado largo"),
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Credenciales inválidas"),
  password: z.string().min(1, "Credenciales inválidas"),
});

export const crearHabitoSchema = z.object({
  titulo: z.string().min(1, "Título requerido").max(200),
  descripcion: z.string().optional().default(""),
  frecuencia: z.enum(["diario", "semanal", "mensual"]).optional().default("diario"),
  dias_semana: z.array(z.number().int().min(0).max(6)).optional().default([]),
});

export const actualizarHabitoSchema = z.object({
  titulo: z.string().min(1).max(200).optional(),
  descripcion: z.string().optional(),
  frecuencia: z.enum(["diario", "semanal", "mensual"]).optional(),
  completado: z.boolean().optional(),
  dias_semana: z.array(z.number().int().min(0).max(6)).optional(),
});

export const crearTareaSchema = z.object({
  titulo: z.string().min(1, "Título requerido").max(300),
  descripcion: z.string().optional().default(""),
  prioridad: z.enum(["baja", "media", "alta"]).optional().default("media"),
  duracion_minutos: z.number().int().min(1).optional().default(30),
  fecha_inicio: z.string().datetime().optional().nullable().default(null),
  fecha_fin: z.string().datetime().optional().nullable().default(null),
  fecha_limite: z.string().datetime().optional().nullable().default(null),
  todo_el_dia: z.boolean().optional().default(false),
  categoria_id: z.number().int().optional().nullable().default(null),
  es_recurrente: z.boolean().optional().default(false),
  recurrencia: z.string().optional().nullable().default(null),
  dias_semana: z.array(z.number().int().min(0).max(6)).optional().default([]),
});

export const actualizarTareaSchema = z.object({
  titulo: z.string().min(1).max(300).optional(),
  descripcion: z.string().optional(),
  prioridad: z.enum(["baja", "media", "alta"]).optional(),
  estado: z.enum(["pendiente", "en_progreso", "completada", "cancelada"]).optional(),
  duracion_minutos: z.number().int().min(1).optional(),
  fecha_inicio: z.string().datetime().optional().nullable(),
  fecha_fin: z.string().datetime().optional().nullable(),
  fecha_limite: z.string().datetime().optional().nullable(),
  todo_el_dia: z.boolean().optional(),
  categoria_id: z.number().int().optional().nullable(),
  es_recurrente: z.boolean().optional(),
  recurrencia: z.string().optional().nullable(),
  dias_semana: z.array(z.number().int().min(0).max(6)).optional(),
});

// Gym / Rutinas
export const crearRutinaSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(200),
  descripcion: z.string().optional().default(""),
  dificultad: z.enum(["principiante", "intermedio", "avanzado"]).optional().default("principiante"),
});

export const actualizarRutinaSchema = z.object({
  nombre: z.string().min(1).max(200).optional(),
  descripcion: z.string().optional(),
  dificultad: z.enum(["principiante", "intermedio", "avanzado"]).optional(),
});

export const crearEjercicioSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(200),
  grupo_muscular: z.string().optional().default(""),
  series_default: z.number().int().min(1).optional().default(3),
  repeticiones_default: z.number().int().min(1).optional().default(10),
  peso: z.number().min(0).optional().default(0),
  descanso: z.number().int().min(0).optional().default(90),
  instrucciones: z.string().optional().default(""),
});

export const registrarLogSchema = z.object({
  rutinaId: z.number().int(),
  ejercicios: z.array(z.object({
    ejercicioId: z.number().int(),
    series: z.array(z.object({
      setNum: z.number().int(),
      reps: z.number().int(),
      peso: z.number(),
      completado: z.boolean(),
    })),
  })),
});

// Metas / OKRs
export const crearMetaSchema = z.object({
  titulo: z.string().min(1, "Título requerido").max(200),
  descripcion: z.string().optional().default(""),
  categoria: z.string().optional().default("personal"),
  fecha_inicio: z.string().datetime().optional().nullable().default(null),
  fecha_fin: z.string().datetime().optional().nullable().default(null),
  es_borrador: z.boolean().optional().default(false),
});

export const actualizarMetaSchema = z.object({
  titulo: z.string().min(1).max(200).optional(),
  descripcion: z.string().optional(),
  categoria: z.string().optional(),
  fecha_inicio: z.string().datetime().optional().nullable(),
  fecha_fin: z.string().datetime().optional().nullable(),
  estado: z.enum(["borrador", "en_progreso", "completada", "cancelada"]).optional(),
  es_borrador: z.boolean().optional(),
});

export const crearKeyResultSchema = z.object({
  titulo: z.string().min(1, "Título requerido").max(200),
  descripcion: z.string().optional().default(""),
  orden: z.number().int().optional().default(0),
});

// Finanzas
export const crearCategoriaFinanzaSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(100),
  tipo: z.enum(["ingreso", "gasto"]).optional().default("gasto"),
  color: z.string().optional().default("#6366F1"),
  presupuesto_mensual: z.number().min(0).optional().nullable().default(null),
});

export const crearTransaccionSchema = z.object({
  tipo: z.enum(["ingreso", "gasto"]),
  monto: z.number().positive("El monto debe ser positivo"),
  descripcion: z.string().optional().default(""),
  categoria_id: z.number().int().optional().nullable().default(null),
  cuenta_id: z.number().int().optional().nullable().default(null),
  fecha: z.string().datetime().optional().nullable().default(null),
});

export const crearCuentaSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(100),
  tipo: z.enum(["efectivo", "credito", "debito", "ahorro", "inversion"]).optional().default("efectivo"),
  saldo_inicial: z.number().optional().default(0),
  moneda: z.string().optional().default("BOB"),
});

export const crearPresupuestoSchema = z.object({
  categoria_id: z.number().int(),
  mes: z.string().regex(/^\d{4}-\d{2}$/, "Formato YYYY-MM"),
  monto_limite: z.number().positive("Debe ser positivo"),
});

// Recordatorios
export const crearRecordatorioSchema = z.object({
  titulo: z.string().min(1, "Título requerido").max(200),
  descripcion: z.string().optional().default(""),
  fecha_hora: z.string().datetime("Fecha inválida"),
  tipo: z.enum(["tarea", "evento", "habito", "personalizado"]).optional().default("personalizado"),
  recurrencia: z.string().optional().nullable().default(null),
});

// Agenda / Bloques de tiempo
export const crearBloqueSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(200),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  tipo: z.string().optional().default("tarea"),
  prioridad: z.enum(["baja", "media", "alta"]).optional().default("media"),
});

// Pomodoro
export const crearSesionPomodoroSchema = z.object({
  duracion_minutos: z.number().int().positive(),
  tareas_completadas: z.number().int().min(0).optional().default(0),
  notas: z.string().optional().default(""),
});

// Bienestar
export const crearRegistroBienestarSchema = z.object({
  animo: z.number().int().min(1).max(10),
  energia: z.number().int().min(1).max(10).optional().nullable().default(null),
  estres: z.number().int().min(1).max(10).optional().nullable().default(null),
  horas_sueno: z.number().min(0).max(24).optional().nullable().default(null),
  notas: z.string().optional().default(""),
});
