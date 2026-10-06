/**
 * Crea una función con retardo (debounce) para optimizar eventos de alta frecuencia.
 * Soporta cancelación explícita del temporizador pendiente.
 * 
 * @param {Function} fn Función objetivo a ejecutar
 * @param {number} delayMs Tiempo de espera en milisegundos
 * @returns {Function} Función decorada con método .cancel()
 */
export function debounce(fn, delayMs = 350) {
  let timeoutId = null;

  const debounced = function (...args) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn.apply(this, args);
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}
