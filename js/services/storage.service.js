/**
 * Servicio de persistencia local (localStorage) con tolerancia a fallos.
 */

import { API_CONFIG } from "../config/api.config.js";
import { UNIT_TYPES } from "../utils/units.js";

class StorageService {
  /**
   * Obtiene la preferencia de unidad de temperatura (°C o °F).
   * @returns {string}
   */
  getUnit() {
    try {
      const stored = localStorage.getItem(API_CONFIG.STORAGE_KEYS.UNIT);
      if (stored === UNIT_TYPES.FAHRENHEIT || stored === UNIT_TYPES.CELSIUS) {
        return stored;
      }
    } catch (e) {
      console.warn("No se pudo leer la unidad desde localStorage:", e);
    }
    return UNIT_TYPES.CELSIUS;
  }

  /**
   * Guarda la preferencia de unidad de temperatura.
   * @param {string} unit
   */
  setUnit(unit) {
    try {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.UNIT, unit);
    } catch (e) {
      console.warn("No se pudo persistir la unidad en localStorage:", e);
    }
  }

  /**
   * Obtiene la preferencia del modo de interfaz ("dark" o "light").
   * @returns {"dark"|"light"}
   */
  getThemeMode() {
    try {
      const stored = localStorage.getItem(API_CONFIG.STORAGE_KEYS.THEME_MODE);
      if (stored === "light" || stored === "dark") {
        return stored;
      }
    } catch (e) {
      console.warn("No se pudo leer el modo de tema desde localStorage:", e);
    }
    return "dark";
  }

  /**
   * Guarda la preferencia del modo de interfaz.
   * @param {"dark"|"light"} mode
   */
  setThemeMode(mode) {
    try {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.THEME_MODE, mode);
    } catch (e) {
      console.warn("No se pudo persistir el modo de tema:", e);
    }
  }

  /**
   * Obtiene la lista de ciudades favoritas guardadas.
   * @returns {Array<Object>}
   */
  getFavorites() {
    try {
      const raw = localStorage.getItem(API_CONFIG.STORAGE_KEYS.FAVORITES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("No se pudieron leer los favoritos desde localStorage:", e);
    }
    return [];
  }

  /**
   * Agrega o elimina una ciudad de favoritos.
   * @param {Object} city
   * @returns {boolean} true si fue agregada, false si fue removida
   */
  toggleFavorite(city) {
    if (!city || city.latitude === undefined || city.longitude === undefined) {
      return false;
    }
    const current = this.getFavorites();
    const cityId = this.generateCityKey(city);
    const existingIndex = current.findIndex(c => this.generateCityKey(c) === cityId);

    let isAdded = false;
    if (existingIndex >= 0) {
      current.splice(existingIndex, 1);
      isAdded = false;
    } else {
      current.unshift({
        id: cityId,
        name: city.name,
        country: city.country || "",
        admin1: city.admin1 || "",
        latitude: city.latitude,
        longitude: city.longitude
      });
      isAdded = true;
    }

    try {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(current));
    } catch (e) {
      console.warn("No se pudieron guardar los favoritos:", e);
    }

    return isAdded;
  }

  /**
   * Comprueba si una ciudad se encuentra en favoritos.
   * @param {Object} city
   * @returns {boolean}
   */
  isFavorite(city) {
    if (!city) return false;
    const cityId = this.generateCityKey(city);
    return this.getFavorites().some(c => this.generateCityKey(c) === cityId);
  }

  /**
   * Elimina una ciudad específica de favoritos por su ID o coordenadas.
   * @param {string} cityKey
   */
  removeFavorite(cityKey) {
    const current = this.getFavorites().filter(c => this.generateCityKey(c) !== cityKey);
    try {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(current));
    } catch (e) {
      console.warn("No se pudo remover favorito:", e);
    }
  }

  /**
   * Guarda la última ciudad consultada exitosamente.
   * @param {Object} city
   */
  setLastCity(city) {
    try {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.LAST_CITY, JSON.stringify(city));
    } catch (e) {
      console.warn("No se pudo guardar la última ciudad:", e);
    }
  }

  /**
   * Recupera la última ciudad consultada.
   * @returns {Object|null}
   */
  getLastCity() {
    try {
      const raw = localStorage.getItem(API_CONFIG.STORAGE_KEYS.LAST_CITY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Genera un identificador determinista para una ciudad basado en su nombre y coordenadas.
   * @param {Object} city
   * @returns {string}
   */
  generateCityKey(city) {
    if (!city) return "";
    const lat = Number(city.latitude).toFixed(3);
    const lon = Number(city.longitude).toFixed(3);
    return `${city.name.toLowerCase().trim()}_${lat}_${lon}`;
  }
}

export const storageService = new StorageService();
