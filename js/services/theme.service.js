/**
 * Servicio: Gestión de Temas Visuales y Ciclo Solar.
 * Se encarga de aplicar en el DOM el modo claro/oscuro y las ambientaciones
 * atmosféricas dinámicas basadas en las condiciones meteorológicas y el ciclo día/noche.
 */

import { appState, APP_STATUS } from "../state/app-state.js";
import { getWeatherInterpretation } from "../config/wmo-codes.js";

const ATMOSPHERIC_THEME_CLASSES = [
  "theme-clear",
  "theme-clouds",
  "theme-rain",
  "theme-storm",
  "theme-snow",
  "theme-fog",
  "theme-default"
];

export class ThemeService {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Inicializa la suscripción al estado para sincronizar temas automáticamente.
   */
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Aplicar modo inicial persistido
    this.applyThemeMode(appState.getState().themeMode);

    // Escuchar cambios en el estado
    appState.subscribe((state) => {
      this.syncWithState(state);
    });
  }

  /**
   * Aplica el modo claro u oscuro en los elementos raíz del documento.
   * @param {"dark" | "light"} mode
   */
  applyThemeMode(mode) {
    const isLight = mode === "light";
    document.documentElement.setAttribute("data-theme-mode", mode);
    document.body.classList.toggle("mode-light", isLight);
    document.body.classList.toggle("mode-dark", !isLight);
  }

  /**
   * Sincroniza las clases del tema en el <body> según el estado actual de la aplicación.
   * @param {Object} state
   */
  syncWithState(state) {
    const body = document.body;
    const appContainer = document.getElementById("app-container");

    // Sincronizar conmutador claro/oscuro
    this.applyThemeMode(state.themeMode);

    if (state.status === APP_STATUS.SUCCESS && state.forecast) {
      const current = state.forecast.current;
      const weatherInfo = getWeatherInterpretation(current.weatherCode, current.isDay);

      // Limpiar clases temáticas anteriores
      body.classList.remove(...ATMOSPHERIC_THEME_CLASSES);
      body.classList.remove("is-day", "is-night");

      // Aplicar ambientación climática activa y ciclo solar
      body.classList.add(weatherInfo.theme);
      body.classList.add(current.isDay ? "is-day" : "is-night");

      if (appContainer) {
        appContainer.dataset.theme = weatherInfo.theme;
      }
    } else {
      // Estado neutral para bienvenida, carga inicial o error
      body.classList.remove(...ATMOSPHERIC_THEME_CLASSES);
      body.classList.add("theme-default", "is-day");

      if (appContainer) {
        delete appContainer.dataset.theme;
      }
    }
  }
}

export const themeService = new ThemeService();
