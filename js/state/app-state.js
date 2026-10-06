/**
 * Gestor reactivo de estado centralizado para la aplicación.
 * Implementa el patrón Observador (Pub-Sub) para desacoplar componentes.
 */

import { storageService } from "../services/storage.service.js";
import { UNIT_TYPES } from "../utils/units.js";

export const APP_STATUS = {
  IDLE: "idle",       // Estado vacío inicial
  LOADING: "loading", // Petición en curso
  SUCCESS: "success", // Datos listos para presentar
  ERROR: "error"      // Fallo de red, ciudad no encontrada o permisos
};

class AppState {
  constructor() {
    this._listeners = new Set();

    this.state = {
      status: APP_STATUS.IDLE,
      errorMessage: "",
      errorType: "",
      currentCity: null,
      forecast: null,
      unit: storageService.getUnit(),
      favorites: storageService.getFavorites(),
      suggestions: [],
      isSearching: false
    };
  }

  /**
   * Obtiene una copia inmutable del estado actual.
   * @returns {Object}
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Suscribe un listener a cambios en el estado.
   * @param {Function} listener
   * @returns {Function} Función para desuscribirse
   */
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /**
   * Notifica a todos los suscriptores pasando el nuevo estado y la acción disparada.
   * @private
   */
  _notify(actionName) {
    const currentState = this.getState();
    this._listeners.forEach(listener => {
      try {
        listener(currentState, actionName);
      } catch (err) {
        console.error("Error en listener de AppState:", err);
      }
    });
  }

  /**
   * Actualiza el estado a cargando.
   * @param {string} [cityLabel=""]
   */
  setLoading(cityLabel = "") {
    this.state.status = APP_STATUS.LOADING;
    this.state.errorMessage = "";
    this.state.errorType = "";
    this._notify("SET_LOADING");
  }

  /**
   * Establece un error con mensaje amigable.
   * @param {string} message 
   * @param {string} [errorType=""]
   */
  setError(message, errorType = "") {
    this.state.status = APP_STATUS.ERROR;
    this.state.errorMessage = message;
    this.state.errorType = errorType;
    this._notify("SET_ERROR");
  }

  /**
   * Establece los datos de ciudad y pronóstico obtenidos exitosamente.
   * @param {Object} city
   * @param {Object} forecast
   */
  setForecastSuccess(city, forecast) {
    this.state.status = APP_STATUS.SUCCESS;
    this.state.currentCity = city;
    this.state.forecast = forecast;
    this.state.errorMessage = "";
    this.state.suggestions = [];

    // Persistir última ciudad
    storageService.setLastCity(city);

    this._notify("SET_FORECAST_SUCCESS");
  }

  /**
   * Cambia la unidad de temperatura (°C <-> °F) y la persiste.
   * @param {string} unit
   */
  setUnit(unit) {
    if (unit !== UNIT_TYPES.CELSIUS && unit !== UNIT_TYPES.FAHRENHEIT) return;
    this.state.unit = unit;
    storageService.setUnit(unit);
    this._notify("SET_UNIT");
  }

  /**
   * Alterna la unidad actual.
   */
  toggleUnit() {
    const nextUnit = this.state.unit === UNIT_TYPES.CELSIUS
      ? UNIT_TYPES.FAHRENHEIT
      : UNIT_TYPES.CELSIUS;
    this.setUnit(nextUnit);
  }

  /**
   * Alterna el estado de favorito de la ciudad actual.
   */
  toggleFavoriteCurrentCity() {
    if (!this.state.currentCity) return;
    storageService.toggleFavorite(this.state.currentCity);
    this.state.favorites = storageService.getFavorites();
    this._notify("UPDATE_FAVORITES");
  }

  /**
   * Elimina un favorito específico.
   * @param {string} cityKey
   */
  removeFavorite(cityKey) {
    storageService.removeFavorite(cityKey);
    this.state.favorites = storageService.getFavorites();
    this._notify("UPDATE_FAVORITES");
  }

  /**
   * Establece las sugerencias de autocompletado en el buscador.
   * @param {Array} suggestions
   */
  setSuggestions(suggestions = []) {
    this.state.suggestions = suggestions;
    this._notify("SET_SUGGESTIONS");
  }

  /**
   * Limpia las sugerencias de búsqueda.
   */
  clearSuggestions() {
    this.state.suggestions = [];
    this._notify("CLEAR_SUGGESTIONS");
  }

  /**
   * Restaura la vista al estado vacío inicial.
   */
  resetToIdle() {
    this.state.status = APP_STATUS.IDLE;
    this.state.errorMessage = "";
    this.state.currentCity = null;
    this.state.forecast = null;
    this.state.suggestions = [];
    this._notify("RESET_IDLE");
  }
}

export const appState = new AppState();
