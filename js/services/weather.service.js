/**
 * Servicio de obtención y modelado del pronóstico meteorológico desde Open-Meteo API.
 */

import { API_CONFIG } from "../config/api.config.js";

class WeatherService {
  /**
   * Obtiene el pronóstico meteorológico completo para unas coordenadas dadas.
   * @param {number} latitude
   * @param {number} longitude
   * @param {AbortSignal} [signal]
   * @returns {Promise<Object>} Datos meteorológicos normalizados
   */
  async fetchForecast(latitude, longitude, signal) {
    if (latitude === undefined || longitude === undefined) {
      throw new Error("Coordenadas no válidas para la consulta del tiempo.");
    }

    const url = new URL(API_CONFIG.FORECAST_URL);
    url.searchParams.set("latitude", latitude);
    url.searchParams.set("longitude", longitude);
    url.searchParams.set("current", API_CONFIG.FORECAST_PARAMS.current);
    url.searchParams.set("hourly", API_CONFIG.FORECAST_PARAMS.hourly);
    url.searchParams.set("daily", API_CONFIG.FORECAST_PARAMS.daily);
    url.searchParams.set("timezone", API_CONFIG.FORECAST_PARAMS.timezone);

    try {
      const response = await fetch(url.toString(), { signal });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Parámetros de consulta meteorológica inválidos.");
        }
        if (response.status >= 500) {
          throw new Error("El servicio meteorológico Open-Meteo no está disponible temporalmente.");
        }
        throw new Error(`Error al consultar el clima (${response.status}).`);
      }

      const raw = await response.json();
      return this.normalizeForecastData(raw);
    } catch (error) {
      if (error.name === "AbortError") {
        throw error;
      }
      console.error("Fallo al obtener datos meteorológicos:", error);
      throw error;
    }
  }

  /**
   * Transforma la estructura de respuesta de Open-Meteo en un modelo de dominio limpio.
   * @param {Object} raw Datos en bruto de Open-Meteo
   * @returns {Object}
   */
  normalizeForecastData(raw) {
    const current = {
      time: raw.current?.time || new Date().toISOString(),
      temperature: raw.current?.temperature_2m ?? 0,
      apparentTemperature: raw.current?.apparent_temperature ?? 0,
      humidity: raw.current?.relative_humidity_2m ?? 0,
      isDay: raw.current?.is_day ?? 1,
      precipitation: raw.current?.precipitation ?? 0,
      weatherCode: raw.current?.weather_code ?? 0,
      windSpeed: raw.current?.wind_speed_10m ?? 0,
      windDirection: raw.current?.wind_direction_10m ?? 0,
      pressure: raw.current?.surface_pressure ?? 1013
    };

    // Procesar las próximas 24 horas a partir de la hora actual
    const hourlyList = [];
    if (raw.hourly && Array.isArray(raw.hourly.time)) {
      const nowIso = raw.current?.time || new Date().toISOString().substring(0, 13);
      const times = raw.hourly.time;
      let startIndex = times.findIndex(t => t >= nowIso);
      if (startIndex < 0) startIndex = 0;

      const endIndex = Math.min(startIndex + 24, times.length);
      for (let i = startIndex; i < endIndex; i++) {
        hourlyList.push({
          time: times[i],
          temperature: raw.hourly.temperature_2m?.[i] ?? 0,
          weatherCode: raw.hourly.weather_code?.[i] ?? 0,
          precipitationProbability: raw.hourly.precipitation_probability?.[i] ?? 0,
          humidity: raw.hourly.relative_humidity_2m?.[i] ?? 0
        });
      }
    }

    // Procesar pronóstico diario (hasta 7 días)
    const dailyList = [];
    if (raw.daily && Array.isArray(raw.daily.time)) {
      const daysCount = Math.min(raw.daily.time.length, 7);
      for (let i = 0; i < daysCount; i++) {
        dailyList.push({
          date: raw.daily.time[i],
          weatherCode: raw.daily.weather_code?.[i] ?? 0,
          tempMax: raw.daily.temperature_2m_max?.[i] ?? 0,
          tempMin: raw.daily.temperature_2m_min?.[i] ?? 0,
          sunrise: raw.daily.sunrise?.[i] || "",
          sunset: raw.daily.sunset?.[i] || "",
          uvIndexMax: raw.daily.uv_index_max?.[i] ?? 0,
          precipitationSum: raw.daily.precipitation_sum?.[i] ?? 0
        });
      }
    }

    return {
      current,
      hourly: hourlyList,
      daily: dailyList,
      elevation: raw.elevation,
      timezone: raw.timezone,
      timezoneAbbreviation: raw.timezone_abbreviation
    };
  }
}

export const weatherService = new WeatherService();
