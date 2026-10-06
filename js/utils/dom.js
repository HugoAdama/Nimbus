/**
 * Utilidades para manipulación segura y concisa del DOM.
 */

export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

/**
 * Escapa cadenas para prevenir inyecciones HTML en renderizado dinámico.
 * @param {string} str 
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Crea un elemento DOM con clases, atributos y contenido opcional.
 * @param {string} tag
 * @param {Object} [options={}]
 * @returns {HTMLElement}
 */
export function createElement(tag, { className = "", attrs = {}, html = "", text = "" } = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  Object.entries(attrs).forEach(([key, val]) => {
    if (val !== undefined && val !== null) el.setAttribute(key, val);
  });
  if (text) el.textContent = text;
  if (html) el.innerHTML = html;
  return el;
}
