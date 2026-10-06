/**
 * Utilidades para formateo de fechas, horas y métricas ambientales en español.
 */

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

/**
 * Obtiene el nombre del día para pronóstico diario.
 * Si coincide con el día de hoy, retorna "Hoy".
 * @param {string} dateString Formato "YYYY-MM-DD"
 * @param {number} dayIndex Índice relativo dentro de la lista (0 = hoy)
 * @returns {string}
 */
export function formatDayLabel(dateString, dayIndex = 0) {
  if (dayIndex === 0) return "Hoy";
  if (dayIndex === 1) return "Mañana";

  const date = new Date(dateString + "T00:00:00");
  if (isNaN(date.getTime())) return dateString;
  return DAYS[date.getDay()];
}

/**
 * Formatea una fecha completa en formato extendido.
 * Ejemplo: "Lunes, 6 de octubre de 2026"
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatFullDate(dateInput) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const dayName = DAYS[date.getDay()];
  const dayNum = date.getDate();
  const monthName = MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${dayNum} de ${monthName} de ${year}`;
}

/**
 * Extrae la hora formateada a 24 horas "HH:MM".
 * @param {string} isoDateTime
 * @returns {string}
 */
export function formatHour(isoDateTime) {
  if (!isoDateTime) return "--:--";
  // Puede venir como "2026-10-06T14:00"
  const parts = isoDateTime.split("T");
  if (parts.length > 1) {
    return parts[1].substring(0, 5);
  }
  const date = new Date(isoDateTime);
  if (isNaN(date.getTime())) return isoDateTime;
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Formatea coordenadas geográficas con cardinales.
 * @param {number} lat
 * @param {number} lon
 * @returns {string}
 */
export function formatCoordinates(lat, lon) {
  if (lat === undefined || lon === undefined) return "";
  const latCard = lat >= 0 ? "N" : "S";
  const lonCard = lon >= 0 ? "E" : "O";
  return `${Math.abs(lat).toFixed(2)}° ${latCard}, ${Math.abs(lon).toFixed(2)}° ${lonCard}`;
}

/**
 * Categoriza el índice UV con su nivel de riesgo en español.
 * @param {number} uv
 * @returns {{ level: string, cssClass: string }}
 */
export function getUVLevel(uv) {
  if (uv === null || uv === undefined || isNaN(uv)) {
    return { level: "N/D", cssClass: "uv-low" };
  }
  const val = Math.round(uv);
  if (val <= 2) return { level: "Bajo (0-2)", cssClass: "uv-low" };
  if (val <= 5) return { level: "Moderado (3-5)", cssClass: "uv-moderate" };
  if (val <= 7) return { level: "Alto (6-7)", cssClass: "uv-high" };
  if (val <= 10) return { level: "Muy alto (8-10)", cssClass: "uv-very-high" };
  return { level: "Extremo (11+)", cssClass: "uv-extreme" };
}
