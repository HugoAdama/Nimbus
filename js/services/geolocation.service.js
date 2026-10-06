/**
 * Servicio de geolocalización del navegador y geocodificación inversa.
 * Maneja exhaustivamente los casos de éxito, rechazo de permisos y fallos técnicos.
 */

import { API_CONFIG } from "../config/api.config.js";

export const GEOLOCATION_ERRORS = {
  NOT_SUPPORTED: "NOT_SUPPORTED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  POSITION_UNAVAILABLE: "POSITION_UNAVAILABLE",
  TIMEOUT: "TIMEOUT",
  UNKNOWN: "UNKNOWN"
};

class GeolocationService {
  /**
   * Verifica si la API de geolocalización está disponible en el entorno del navegador.
   * @returns {boolean}
   */
  isSupported() {
    return typeof navigator !== "undefined" && "geolocation" in navigator;
  }

  /**
   * Solicita las coordenadas GPS del dispositivo mediante Promise.
   * @param {Object} [options]
   * @returns {Promise<{ latitude: number, longitude: number, accuracy: number }>}
   */
  async getCurrentPosition(options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }) {
    if (!this.isSupported()) {
      const err = new Error("La geolocalización no es compatible con este navegador.");
      err.code = GEOLOCATION_ERRORS.NOT_SUPPORTED;
      throw err;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        },
        (error) => {
          const customError = new Error();
          switch (error.code) {
            case error.PERMISSION_DENIED:
              customError.code = GEOLOCATION_ERRORS.PERMISSION_DENIED;
              customError.message = "Permiso de ubicación denegado. Para utilizar tu ubicación actual, habilita el permiso en la configuración de tu navegador o busca tu ciudad manualmente.";
              break;
            case error.POSITION_UNAVAILABLE:
              customError.code = GEOLOCATION_ERRORS.POSITION_UNAVAILABLE;
              customError.message = "La información de ubicación no está disponible en este momento.";
              break;
            case error.TIMEOUT:
              customError.code = GEOLOCATION_ERRORS.TIMEOUT;
              customError.message = "Se agotó el tiempo de espera para obtener la ubicación.";
              break;
            default:
              customError.code = GEOLOCATION_ERRORS.UNKNOWN;
              customError.message = "Ocurrió un error inesperado al intentar acceder a tu ubicación.";
          }
          reject(customError);
        },
        options
      );
    });
  }

  /**
   * Resuelve el nombre de la localidad a partir de coordenadas mediante geocodificación inversa.
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<{ name: string, country: string, admin1: string, latitude: number, longitude: number }>}
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const url = new URL(API_CONFIG.REVERSE_GEO_URL);
      url.searchParams.set("latitude", latitude);
      url.searchParams.set("longitude", longitude);
      url.searchParams.set("localityLanguage", API_CONFIG.LANGUAGE);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        const cityName = data.city || data.locality || data.principalSubdivision || "Ubicación detectada";
        const country = data.countryName || "";
        const admin1 = data.principalSubdivision || "";

        return {
          name: cityName,
          country: country,
          admin1: admin1,
          latitude: latitude,
          longitude: longitude
        };
      }
    } catch (e) {
      console.warn("Fallo al resolver nombre con geocodificación inversa, usando fallback:", e);
    }

    // Fallback limpio cuando el servicio inverso no responde
    return {
      name: "Ubicación actual",
      country: "",
      admin1: "",
      latitude: latitude,
      longitude: longitude
    };
  }
}

export const geolocationService = new GeolocationService();
