// src/utils/time.utils.js

/**
 * Calcula la fecha real del recordatorio aplicando la anticipación
 * @param {string|Date} fechaHora - Fecha/hora del evento
 * @param {number} anticipacionMin - Minutos de anticipación
 * @returns {Date}
 */
export const calcularFechaReal = (fechaHora, anticipacionMin = 0) => {
  const fecha = new Date(fechaHora);
  fecha.setMinutes(fecha.getMinutes() - anticipacionMin);
  return fecha;
};

/**
 * Calcula el delay en ms desde ahora hasta una fecha futura
 * @param {Date} fecha
 * @returns {number} milisegundos (mínimo 0)
 */
export const calcularDelay = (fecha) => {
  return Math.max(0, new Date(fecha).getTime() - Date.now());
};

/**
 * Verifica si una hora está dentro del horario de silencio
 * @param {string} horaInicio - "HH:MM"
 * @param {string} horaFin    - "HH:MM"
 * @returns {boolean}
 */
export const estaEnHorarioSilencio = (horaInicio, horaFin) => {
  const ahora = new Date();
  const minActual = ahora.getHours() * 60 + ahora.getMinutes();

  const [hI, mI] = horaInicio.split(':').map(Number);
  const [hF, mF] = horaFin.split(':').map(Number);
  const minInicio = hI * 60 + mI;
  const minFin    = hF * 60 + mF;

  // Manejo de rangos que cruzan medianoche (ej: 22:00 - 07:00)
  if (minInicio > minFin) {
    return minActual >= minInicio || minActual < minFin;
  }
  return minActual >= minInicio && minActual < minFin;
};

/**
 * Calcula la siguiente fecha según regla de recurrencia
 * @param {Date} fechaActual
 * @param {'diario'|'semanal'|'mensual'} regla
 * @returns {Date}
 */
export const calcularSiguienteRecurrencia = (fechaActual, regla) => {
  const siguiente = new Date(fechaActual);
  switch (regla) {
    case 'diario':   siguiente.setDate(siguiente.getDate() + 1);      break;
    case 'semanal':  siguiente.setDate(siguiente.getDate() + 7);      break;
    case 'mensual':  siguiente.setMonth(siguiente.getMonth() + 1);    break;
    default: throw { status: 400, message: `Regla de recurrencia inválida: ${regla}` };
  }
  return siguiente;
};
