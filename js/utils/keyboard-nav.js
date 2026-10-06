/**
 * Utilidad: Manejo de Navegación Accesible por Teclado en Listas y Dropdowns.
 * Controla la selección circular de índices y la actualización de estados ARIA.
 */

/**
 * Calcula el siguiente índice en una lista circular.
 * @param {number} currentIndex Índice activo actual (-1 si ninguno está seleccionado)
 * @param {number} totalCount Total de elementos en la lista
 * @param {1 | -1} direction +1 para avanzar (Flecha Abajo), -1 para retroceder (Flecha Arriba)
 * @returns {number} Siguiente índice válido
 */
export function calculateNextIndex(currentIndex, totalCount, direction) {
  if (totalCount <= 0) return -1;
  let next = currentIndex + direction;

  if (next >= totalCount) next = 0;
  if (next < 0) next = totalCount - 1;

  return next;
}

/**
 * Actualiza visualmente y a nivel de accesibilidad el elemento seleccionado en una colección de nodos.
 * @param {NodeList | Array<HTMLElement>} items Elementos de la lista
 * @param {number} selectedIndex Índice del elemento a activar
 * @param {Object} [options]
 * @param {string} [options.selectedClass="selected"] Clase CSS aplicada al ítem activo
 * @param {boolean} [options.scrollIntoView=true] Si debe desplazarse para ser visible
 */
export function updateItemSelection(items, selectedIndex, options = {}) {
  const { selectedClass = "selected", scrollIntoView = true } = options;

  items.forEach((item, idx) => {
    const isSelected = idx === selectedIndex;
    item.classList.toggle(selectedClass, isSelected);
    item.setAttribute("aria-selected", isSelected ? "true" : "false");

    if (isSelected && scrollIntoView && typeof item.scrollIntoView === "function") {
      item.scrollIntoView({ block: "nearest" });
    }
  });
}
