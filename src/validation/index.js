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
});

export const actualizarHabitoSchema = z.object({
  titulo: z.string().min(1).max(200).optional(),
  descripcion: z.string().optional(),
  frecuencia: z.enum(["diario", "semanal", "mensual"]).optional(),
  completado: z.boolean().optional(),
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
});
