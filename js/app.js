/**
 * Orquestador principal de la aplicación Nimbus.
 * Coordina la inicialización de componentes, el flujo de datos y el cambio dinámico de temas.
 */

import { appState, APP_STATUS } from "./state/app-state.js";
import { weatherService } from "./services/weather.service.js";
import { geolocationService, GEOLOCATION_ERRORS } from "./services/geolocation.service.js";
import { storageService } from "./services/storage.service.js";
import { getWeatherInterpretation } from "./config/wmo-codes.js";

// Componentes
import { HeaderBarComponent } from "./components/header-bar.js";
import { SearchAutocompleteComponent } from "./components/search-autocomplete.js";
import { FavoritesBarComponent } from "./components/favorites-bar.js";
import { CurrentWeatherComponent } from "./components/current-weather.js";
import { HourlyChartComponent } from "./components/hourly-chart.js";
import { DailyForecastComponent } from "./components/daily-forecast.js";
import { WeatherMetricsComponent } from "./components/weather-metrics.js";
import { FeedbackViewComponent } from "./components/feedback-view.js";

class WeatherApp {
  constructor() {
    this.lastRequestedCity = null;
    this.activeForecastAbort = null;
  }

  /**
   * Inicializa la aplicación y sus componentes.
   */
  init() {
    this.initComponents();
    this.setupThemeWatcher();
    this.restoreInitialSession();
  }

  initComponents() {
    // 1. Barra de cabecera
    new HeaderBarComponent(
      document.getElementById("mount-header"),
      {
        onLocateMe: () => this.handleLocateUser()
      }
    );

    // 2. Buscador con autocompletado y debounce
    new SearchAutocompleteComponent(
      document.getElementById("mount-search"),
      {
        onSelectCity: (city) => this.loadWeatherForCity(city)
      }
    );

    // 3. Barra de favoritos
    new FavoritesBarComponent(
      document.getElementById("mount-favorites"),
      {
        onSelectCity: (city) => this.loadWeatherForCity(city)
      }
    );

    // 4. Vistas de retroalimentación (Vacío, Carga, Error)
    new FeedbackViewComponent(
      document.getElementById("mount-feedback"),
      {
        onSelectCity: (city) => this.loadWeatherForCity(city),
        onLocateMe: () => this.handleLocateUser(),
        onRetry: () => this.retryLastAction()
      }
    );

    // 5. Componentes de datos del clima
    new CurrentWeatherComponent(document.getElementById("mount-current-weather"));
    new HourlyChartComponent(document.getElementById("mount-hourly-chart"));
    new DailyForecastComponent(document.getElementById("mount-daily-forecast"));
    new WeatherMetricsComponent(document.getElementById("mount-weather-metrics"));
  }

  /**
   * Observa cambios en el estado para actualizar el fondo temático dinámico.
   */
  setupThemeWatcher() {
    appState.subscribe((state, action) => {
      const body = document.body;
      const appContainer = document.getElementById("app-container");

      if (state.status === APP_STATUS.SUCCESS && state.forecast) {
        const current = state.forecast.current;
        const weatherInfo = getWeatherInterpretation(current.weatherCode, current.isDay);

        // Remover clases temáticas anteriores
        const themeClasses = [
          "theme-clear", "theme-clouds", "theme-rain",
          "theme-storm", "theme-snow", "theme-fog"
        ];
        body.classList.remove(...themeClasses);
        body.classList.remove("is-day", "is-night");

        // Aplicar nuevo tema y ciclo día/noche
        body.classList.add(weatherInfo.theme);
        body.classList.add(current.isDay ? "is-day" : "is-night");
        if (appContainer) {
          appContainer.dataset.theme = weatherInfo.theme;
        }
      } else {
        // En estado idle, error o loading temprano, tema neutral sobrio
        body.className = "theme-default is-day";
        if (appContainer) {
          delete appContainer.dataset.theme;
        }
      }
    });
  }

  /**
   * Carga el pronóstico meteorológico para una ciudad objetivo.
   * @param {Object} city
   */
  async loadWeatherForCity(city) {
    if (!city || city.latitude === undefined || city.longitude === undefined) {
      appState.setError("No encontramos los datos geográficos de esa ciudad.");
      return;
    }

    this.lastRequestedCity = city;

    // Cancelar consulta en curso previa si existiera
    if (this.activeForecastAbort) {
      this.activeForecastAbort.abort();
    }
    this.activeForecastAbort = new AbortController();

    appState.setLoading(city.name);

    try {
      const forecastData = await weatherService.fetchForecast(
        city.latitude,
        city.longitude,
        this.activeForecastAbort.signal
      );

      appState.setForecastSuccess(city, forecastData);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }
      console.error("Error al cargar pronóstico:", err);
      appState.setError(
        err.message || "No pudimos obtener el pronóstico meteorológico. Revisa tu conexión a internet.",
        "NETWORK_ERROR"
      );
    } finally {
      this.activeForecastAbort = null;
    }
  }

  /**
   * Maneja la geolocalización del navegador.
   */
  async handleLocateUser() {
    appState.setLoading("Determinando tu ubicación actual...");

    try {
      const coords = await geolocationService.getCurrentPosition();
      const resolvedLocation = await geolocationService.reverseGeocode(
        coords.latitude,
        coords.longitude
      );

      await this.loadWeatherForCity(resolvedLocation);
    } catch (err) {
      console.error("Fallo de geolocalización:", err);
      if (err.code === GEOLOCATION_ERRORS.PERMISSION_DENIED) {
        appState.setError(
          "Permiso de ubicación denegado por el navegador. Puedes buscar tu ciudad manualmente en la barra superior o activar el permiso en la configuración del sitio.",
          "GEOLOCATION_PERMISSION"
        );
      } else if (err.code === GEOLOCATION_ERRORS.TIMEOUT) {
        appState.setError(
          "Tiempo de espera agotado al consultar tu GPS. Por favor intenta buscar tu ciudad directamente.",
          "GEOLOCATION_TIMEOUT"
        );
      } else {
        appState.setError(
          err.message || "No fue posible detectar tu ubicación geográfica.",
          "GEOLOCATION_ERROR"
        );
      }
    }
  }

  /**
   * Reintenta la última acción solicitada por el usuario.
   */
  retryLastAction() {
    if (this.lastRequestedCity) {
      this.loadWeatherForCity(this.lastRequestedCity);
    } else {
      this.handleLocateUser();
    }
  }

  /**
   * Recupera la última ciudad vista para enriquecer la experiencia inicial
   * o deja el estado vacío bien diseñado si es la primera visita.
   */
  restoreInitialSession() {
    const lastCity = storageService.getLastCity();
    if (lastCity) {
      this.loadWeatherForCity(lastCity);
    } else {
      appState.resetToIdle();
    }
  }
}

// Iniciar al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  const app = new WeatherApp();
  app.init();
});
