/**
 * Configuración de endpoints y parámetros de red para las APIs externas.
 */

export const API_CONFIG = {
  GEOCODING_URL: "https://geocoding-api.open-meteo.com/v1/search",
  FORECAST_URL: "https://api.open-meteo.com/v1/forecast",
  REVERSE_GEO_URL: "https://api.bigdatacloud.net/data/reverse-geocode-client",

  DEBOUNCE_DELAY_MS: 380,
  AUTOCOMPLETE_COUNT: 6,
  LANGUAGE: "es",

  // Parámetros de petición para pronósticos completos
  FORECAST_PARAMS: {
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "surface_pressure"
    ].join(","),
    hourly: [
      "temperature_2m",
      "weather_code",
      "precipitation_probability",
      "relative_humidity_2m"
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "uv_index_max",
      "precipitation_sum"
    ].join(","),
    timezone: "auto"
  },

  STORAGE_KEYS: {
    UNIT: "nimbus_pref_unit",
    FAVORITES: "nimbus_pref_favorites",
    LAST_CITY: "nimbus_pref_last_city",
    THEME_MODE: "nimbus_theme_mode"
  },

  // Ciudades sugeridas por defecto en estado vacío
  DEFAULT_SUGGESTIONS: [
    { name: "Lima", country: "Perú", latitude: -12.0464, longitude: -77.0428 },
    { name: "Madrid", country: "España", latitude: 40.4165, longitude: -3.70256 },
    { name: "Ciudad de México", country: "México", latitude: 19.4326, longitude: -99.1332 },
    { name: "Buenos Aires", country: "Argentina", latitude: -34.6131, longitude: -58.3772 },
    { name: "Bogotá", country: "Colombia", latitude: 4.6097, longitude: -74.0817 },
    { name: "Tokio", country: "Japón", latitude: 35.6895, longitude: 139.6917 }
  ]
};
