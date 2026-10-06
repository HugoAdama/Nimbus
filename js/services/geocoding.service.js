/**
 * Servicio de búsqueda y geocodificación de ciudades usando Open-Meteo Geocoding API.
 */

import { API_CONFIG } from "../config/api.config.js";

class GeocodingService {
  constructor() {
    this.activeController = null;
  }

  /**
   * Busca ciudades por nombre con soporte de cancelación de solicitudes pendientes.
   * @param {string} query Texto a buscar
   * @returns {Promise<Array<Object>>} Lista de ciudades encontradas
   */
  async searchCities(query) {
    const trimmed = query ? query.trim() : "";
    if (trimmed.length < 2) {
      return [];
    }

    // Cancelar petición anterior si aún está en curso para evitar condiciones de carrera
    if (this.activeController) {
      this.activeController.abort();
    }
    this.activeController = new AbortController();

    const url = new URL(API_CONFIG.GEOCODING_URL);
    url.searchParams.set("name", trimmed);
    url.searchParams.set("count", API_CONFIG.AUTOCOMPLETE_COUNT);
    url.searchParams.set("language", API_CONFIG.LANGUAGE);
    url.searchParams.set("format", "json");

    try {
      const response = await fetch(url.toString(), {
        signal: this.activeController.signal
      });

      if (!response.ok) {
        throw new Error(`Error en servidor de geocodificación: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map(item => ({
        id: item.id,
        name: item.name,
        country: item.country || "",
        countryCode: item.country_code || "",
        admin1: item.admin1 || "",
        admin2: item.admin2 || "",
        latitude: item.latitude,
        longitude: item.longitude,
        timezone: item.timezone || "auto",
        elevation: item.elevation
      }));
    } catch (error) {
      if (error.name === "AbortError") {
        // Petición cancelada intencionalmente por nueva pulsación del usuario
        return [];
      }
      console.error("Fallo al buscar ciudades:", error);
      throw error;
    } finally {
      this.activeController = null;
    }
  }

  /**
   * Genera una cadena descriptiva para una ciudad.
   * Ejemplo: "Madrid, Comunidad de Madrid, España"
   * @param {Object} city
   * @returns {string}
   */
  formatCitySubtitle(city) {
    const parts = [];
    if (city.admin1 && city.admin1 !== city.name) {
      parts.push(city.admin1);
    }
    if (city.country) {
      parts.push(city.country);
    }
    return parts.join(", ");
  }
}

export const geocodingService = new GeocodingService();
