/**
 * Utilidades para conversión y formateo de unidades meteorológicas.
 */

export const UNIT_TYPES = {
  CELSIUS: "celsius",
  FAHRENHEIT: "fahrenheit"
};

/**
 * Convierte grados Celsius a Fahrenheit.
 * @param {number} c
 * @returns {number}
 */
export function celsiusToFahrenheit(c) {
  if (c === null || c === undefined || isNaN(c)) return 0;
  return (c * 9) / 5 + 32;
}

/**
 * Convierte grados Fahrenheit a Celsius.
 * @param {number} f
 * @returns {number}
 */
export function fahrenheitToCelsius(f) {
  if (f === null || f === undefined || isNaN(f)) return 0;
  return ((f - 32) * 5) / 9;
}

/**
 * Convierte un valor base en Celsius a la unidad indicada y redondea.
 * @param {number} celsiusVal
 * @param {string} targetUnit "celsius" | "fahrenheit"
 * @returns {number}
 */
export function formatTempNumber(celsiusVal, targetUnit = UNIT_TYPES.CELSIUS) {
  if (celsiusVal === null || celsiusVal === undefined || isNaN(celsiusVal)) return 0;
  const val = targetUnit === UNIT_TYPES.FAHRENHEIT
    ? celsiusToFahrenheit(celsiusVal)
    : celsiusVal;
  return Math.round(val);
}

/**
 * Retorna la etiqueta con el símbolo según la unidad.
 * @param {number} celsiusVal
 * @param {string} targetUnit
 * @returns {string} Ejemplo: "22°C" o "72°F"
 */
export function formatTempString(celsiusVal, targetUnit = UNIT_TYPES.CELSIUS) {
  const rounded = formatTempNumber(celsiusVal, targetUnit);
  const symbol = targetUnit === UNIT_TYPES.FAHRENHEIT ? "°F" : "°C";
  return `${rounded}${symbol}`;
}

/**
 * Convierte grados de dirección del viento (0 - 360) a punto cardinal en español.
 * @param {number} degrees
 * @returns {string}
 */
export function degreesToCardinal(degrees) {
  if (degrees === null || degrees === undefined || isNaN(degrees)) return "Calma";
  const points = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"
  ];
  const normalized = (degrees % 360 + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return points[index];
}

/**
 * Formatea velocidad del viento según unidad seleccionada.
 * @param {number} kmh
 * @param {string} unit
 * @returns {string}
 */
export function formatWindSpeed(kmh, unit = UNIT_TYPES.CELSIUS) {
  if (kmh === null || kmh === undefined || isNaN(kmh)) return "0 km/h";
  if (unit === UNIT_TYPES.FAHRENHEIT) {
    const mph = Math.round(kmh * 0.621371);
    return `${mph} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}
