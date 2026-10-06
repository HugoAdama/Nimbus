/**
 * Controlador: Gestión del Flujo de Datos Meteorológicos y Geolocalización.
 * Orquesta la carga de datos, cancelación de peticiones anteriores con AbortController,
 * geolocalización por GPS, reverse geocoding y reintentos ante errores.
 */

import { appState } from "../state/app-state.js";
import { weatherService } from "../services/weather.service.js";
import { geolocationService, GEOLOCATION_ERRORS } from "../services/geolocation.service.js";
import { storageService } from "../services/storage.service.js";

export class WeatherController {
  constructor() {
    this.lastRequestedCity = null;
    this.activeForecastAbort = null;
  }

  /**
   * Carga el pronóstico meteorológico para una ciudad objetivo.
   * Cancela automáticamente cualquier consulta en vuelo previa.
   * @param {Object} city Objeto ciudad con latitude, longitude, name, etc.
   */
  async loadWeatherForCity(city) {
    if (!city || city.latitude === undefined || city.longitude === undefined) {
      appState.setError("No encontramos los datos geográficos de esa ciudad.");
      return;
    }

    this.lastRequestedCity = city;

    // Cancelar consulta previa en curso si existiera
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
   * Maneja la geolocalización por GPS del navegador y la resolución de la ciudad.
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
   * Reintenta la última acción solicitada por el usuario (ciudad o GPS).
   */
  retryLastAction() {
    if (this.lastRequestedCity) {
      this.loadWeatherForCity(this.lastRequestedCity);
    } else {
      this.handleLocateUser();
    }
  }

  /**
   * Restaura la última ciudad consultada en la sesión anterior o inicializa el estado vacío.
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

export const weatherController = new WeatherController();
