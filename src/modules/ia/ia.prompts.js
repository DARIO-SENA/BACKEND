export const SYSTEM_PROMPT_AGENT = `
Eres DARIO, un asistente de productividad personal inteligente.
Ayudas al usuario a gestionar sus tareas, habitos, agenda, entrenamiento y bienestar.

Personalidad: Motivador, directo, empatico. Siempre en espanol neutro.
Contexto: El usuario se llama {nombre}, tiene nivel {nivel} y una racha de {racha} dias.

Reglas:
- Si preguntan por datos, usa las herramientas disponibles, no inventes.
- Si no sabes algo, dilo honestamente.
- Las respuestas deben ser concretas y accionables.
- Usa emojis con moderacion.

Herramientas disponibles:
{tools}
`;

export const PROMPT_CREAR_TAREA = `
Analiza el siguiente texto en lenguaje natural y extrae los datos para crear una tarea.
Devuelve UNICAMENTE un JSON valido sin explicaciones.

Reglas de extraccion:
- titulo: obligatorio, string
- descripcion: opcional, string (si no hay, string vacio)
- prioridad: "alta", "media" o "baja". Inferir del contexto (urgente=alta, importante=media, trivial=baja)
- fecha_limite: opcional, ISO date string o null. Interpretar fechas relativas (manana, pasado, proximo lunes, etc.)
- fecha_inicio: opcional, ISO datetime string o null
- categoria: opcional, string o null. Inferir del contexto
- duracion_minutos: opcional, numero. Inferir si se menciona tiempo

Texto del usuario: "{texto}"

Responde SOLO con el JSON, nada mas.
`;

export const PROMPT_CREAR_HABITO = `
Analiza el siguiente texto y extrae datos para crear un habito.
Devuelve UNICAMENTE un JSON valido.

Reglas:
- titulo: obligatorio, string
- descripcion: opcional, string vacio si no hay
- frecuencia: "diario", "semanal" o "mensual". Inferir del contexto.

Texto: "{texto}"

JSON:
`;

export const PROMPT_CREAR_EVENTO = `
Analiza el siguiente texto y extrae datos para un evento de agenda.
Devuelve UNICAMENTE un JSON valido.

Reglas:
- titulo: obligatorio
- fecha_inicio: ISO datetime. Fechas relativas: manana, pasado, proximo lunes, etc.
- duracion_minutos: numero, por defecto 60
- descripcion: opcional

Texto: "{texto}"

JSON:
`;

export const PROMPT_PRIORIDADES = `
Eres un experto en productividad personal.
Recibes las tareas del dia de un usuario y debes ordenarlas por prioridad optima.

Contexto del usuario:
- Nivel: {nivel}
- Racha actual: {racha} dias
- Hora actual: {hora}

Tareas del dia:
{tareas}

Instrucciones:
1. Ordena las tareas de mas a menos prioritarias
2. Considera: fecha_limite, prioridad, energia del usuario (manana=mejor para dificiles)
3. Agrupa tareas similares juntas (misma categoria)
4. Devuelve un JSON array con cada tarea y una breve razon

Responde SOLO con el JSON array:
[{ "id": number, "razon": "string" }]
`;

export const PROMPT_RESUMEN_DIARIO = `
Genera un resumen motivacional del dia del usuario en espanol.
Usa emojis con moderacion. Maximo 3 parrafos cortos.

Datos del dia:
- Tareas: {completadas}/{total} completadas
- Puntos ganados: {puntos}
- Racha: {racha} dias

Estructura:
1. Logro principal del dia
2. Area de mejora sutil
3. Motivacion para manana
`;

export const PROMPT_RESUMEN_SEMANAL = `
Genera un analisis semanal detallado pero motivacional.

Datos de la semana:
{reporte}

Incluye:
1. Resumen ejecutivo (completitud general)
2. Mejor dia de la semana
3. Area con mas progreso
4. Recomendacion concreta para la proxima semana
5. Comparacion con la semana anterior (si hay datos)

Formato: 4-5 parrafos cortos en espanol.
`;

export const PROMPT_PREDECIR_DURACION = `
Analiza el historial de tareas similares y predice la duracion real.

Tarea actual:
{tarea}

Historial de tareas similares (misma categoria):
{historial}

Devuelve JSON:
{
  "duracion_estimada_minutos": number,
  "confianza": "alta"|"media"|"baja",
  "rango": { "min": number, "max": number },
  "razon": "breve explicacion"
}
`;

export const PROMPT_OPTIMIZAR_AGENDA = `
Eres un planificador experto. Optimiza la agenda del dia.

Tareas pendientes:
{tareas}

Bloques ocupados actuales:
{bloques}

Reglas:
- Tareas alta prioridad en la manana (mayor energia)
- Tareas similares juntas (misma categoria)
- Dejar espacios de 15 min entre tareas
- No programar en bloque nocturno (23:00-07:00) ni almuerzo (12:00-13:00)
- Respetar bloques existentes del usuario

Devuelve JSON array ordenado de tareas con nueva fecha_inicio asignada:
[{ "id": number, "fecha_inicio": "ISO datetime", "razon": "por que aqui" }]
`;

export const PROMPT_RECOMENDAR_HABITOS = `
Basado en el perfil del usuario, recomienda habitos que complementen su rutina.

Perfil:
- Habitos actuales: {habitos}
- Tareas frecuentes: {categorias_frecuentes}
- Horas activas: {horas_productivas}
- Promedio tareas/dia: {promedio_tareas}

Devuelve JSON array con maximo 3 sugerencias:
[{
  "titulo": "nombre del habito sugerido",
  "descripcion": "por que ayudaria"
}]
`;

export const PROMPT_SUGERIR_RUTINA = `
Eres un entrenador personal experto. Disena una rutina de ejercicios.

Perfil del usuario:
- Objetivo: {objetivo} (fuerza/hipertrofia/resistencia)
- Nivel: {nivel}
- Historial reciente: {historial}
- Ejercicios conocidos: {ejercicios_conocidos}

Disena UNA rutina con 4-6 ejercicios.
Devuelve JSON:
{
  "nombre": "string",
  "descripcion": "string",
  "dificultad": "principiante"|"intermedio"|"avanzado",
  "ejercicios": [{ "nombre": "...", "grupo_muscular": "...", "series": number, "repeticiones": number }]
}
`;

export const PROMPT_RECOMENDAR_AMIGOS = `
Basado en patrones de productividad, sugiere posibles amigos.

Usuario actual: {usuario_id}
Nombre: {nombre}
Patron del usuario: {patron}

Usuarios potenciales (excluyendo amigos actuales):
{potenciales}

Analiza similitud de: horas activas, categorias de tareas, nivel de productividad.
Devuelve JSON array con IDs de usuarios recomendados (maximo 3):
[{ "usuario_id": number, "razon": "por que compatible" }]
`;

export const PROMPT_PATRONES = `
Analiza los siguientes datos de 30 dias y encuentra patrones de productividad.

Datos:
{datos}

Busca:
1. Mejor hora del dia para hacer tareas
2. Dia de la semana mas productivo
3. Correlaciones (ej: gym productividad, sueno estado de animo)
4. Periodos de baja motivacion detectados
5. Categoria de tarea mas completada

Devuelve JSON:
{
  "mejor_hora": "string (ej: 9:00-11:00)",
  "mejor_dia": "string",
  "productividad_promedio": "%",
  "correlaciones": [{ "factor": "string", "impacto": "positivo|negativo", "descripcion": "string" }],
  "recomendacion": "string - consejo concreto"
}
`;

export const PROMPT_ANOMALIAS = `
Analiza si hay comportamiento anomalo en los siguientes datos.

Datos del usuario (ultimos 14 dias contra ultimos 60 dias):
{datos}

Indicadores de anomalia:
- Productividad cayo >30%
- Rachas perdidas sin razon aparente
- Muchas tareas vencidas de golpe
- Ejercicios: peso bajando consistentemente
- Estado de animo bajo por varios dias seguidos

Devuelve JSON:
{
  "hay_anomalias": boolean,
  "nivel_alerta": "bajo"|"medio"|"alto",
  "anomalias": [{ "tipo": "string", "descripcion": "string", "severidad": 1-5 }],
  "sugerencia": "string - que hacer al respecto"
}
`;

export const PROMPT_LOGRO_PERSONALIZADO = `
Crea un logro personalizado basado en el comportamiento unico del usuario.

Datos del usuario:
{datos}

El logro debe:
- Ser alcanzable pero retador
- Relacionado con un patron real del usuario
- Tener un nombre creativo

Devuelve JSON:
{
  "codigo": "string (ej: MADRUGADOR_10)",
  "titulo": "string",
  "descripcion": "string",
  "icono": "string (emoji)",
  "puntos": number (20-100),
  "condicion": { "tipo": "string", "valor": number }
}
`;

export const PROMPT_SOBRECARGA = `
Evalua si el usuario esta sobrecargado de trabajo.

Datos actuales:
- Tareas pendientes: {pendientes}
- Tareas vencidas: {vencidas}
- Promedio completadas por dia (ultima semana): {promedio_completadas}
- Dias disponibles hasta fecha_limite mas cercana: {dias_disponibles}

Devuelve JSON:
{
  "sobrecargado": boolean,
  "nivel": "bajo"|"medio"|"alto",
  "exceso_tareas": number (cuantas tareas sobran),
  "sugerencia": "string - que hacer"
}
`;
