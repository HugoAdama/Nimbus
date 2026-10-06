/**
 * Mapeo de códigos de interpretación meteorológica de la OMM (WMO Code).
 * Proporciona etiquetas en español, iconos SVG asociados y clases de tema visual.
 */

export const WMO_WEATHER_CODES = {
  0: {
    label: "Cielo despejado",
    iconDay: "sun",
    iconNight: "moon",
    theme: "theme-clear",
    description: "Cielo completamente despejado sin nubosidad apreciable."
  },
  1: {
    label: "Mayormente despejado",
    iconDay: "cloudSun",
    iconNight: "cloudMoon",
    theme: "theme-clear",
    description: "Cielo predominantemente despejado con nubes dispersas."
  },
  2: {
    label: "Parcialmente nublado",
    iconDay: "cloudSun",
    iconNight: "cloudMoon",
    theme: "theme-clouds",
    description: "Intervalos nubosos con periodos de sol o claridad nocturna."
  },
  3: {
    label: "Nublado",
    iconDay: "cloud",
    iconNight: "cloud",
    theme: "theme-clouds",
    description: "Cielo cubierto por una densa capa de nubes."
  },
  45: {
    label: "Niebla",
    iconDay: "fog",
    iconNight: "fog",
    theme: "theme-fog",
    description: "Visibilidad reducida provocada por densa concentración de niebla."
  },
  48: {
    label: "Niebla con escarcha",
    iconDay: "fog",
    iconNight: "fog",
    theme: "theme-fog",
    description: "Niebla engelante que deposita cencellada o escarcha."
  },
  51: {
    label: "Llovizna ligera",
    iconDay: "drizzle",
    iconNight: "drizzle",
    theme: "theme-rain",
    description: "Precipitación muy fina y suave de baja intensidad."
  },
  53: {
    label: "Llovizna moderada",
    iconDay: "drizzle",
    iconNight: "drizzle",
    theme: "theme-rain",
    description: "Llovizna continua de intensidad intermedia."
  },
  55: {
    label: "Llovizna densa",
    iconDay: "drizzle",
    iconNight: "drizzle",
    theme: "theme-rain",
    description: "Llovizna persistente y tupida con acumulación leve."
  },
  56: {
    label: "Llovizna gélida ligera",
    iconDay: "snow",
    iconNight: "snow",
    theme: "theme-snow",
    description: "Gotas de llovizna helada al contacto con el suelo."
  },
  57: {
    label: "Llovizna gélida densa",
    iconDay: "snow",
    iconNight: "snow",
    theme: "theme-snow",
    description: "Llovizna gélida intensa propensa a crear hielo en superficies."
  },
  61: {
    label: "Lluvia ligera",
    iconDay: "rain",
    iconNight: "rain",
    theme: "theme-rain",
    description: "Lluvia de baja intensidad con precipitaciones intermitentes."
  },
  63: {
    label: "Lluvia moderada",
    iconDay: "rain",
    iconNight: "rain",
    theme: "theme-rain",
    description: "Lluvia constante de intensidad normal."
  },
  65: {
    label: "Lluvia fuerte",
    iconDay: "rainHeavy",
    iconNight: "rainHeavy",
    theme: "theme-rain",
    description: "Precipitaciones copiosas de intensidad considerable."
  },
  66: {
    label: "Lluvia helada ligera",
    iconDay: "rain",
    iconNight: "rain",
    theme: "theme-snow",
    description: "Lluvia que se congela instantáneamente al tocar superficies."
  },
  67: {
    label: "Lluvia helada fuerte",
    iconDay: "rainHeavy",
    iconNight: "rainHeavy",
    theme: "theme-snow",
    description: "Lluvia helada torrencial con alto riesgo de heladas."
  },
  71: {
    label: "Nevada ligera",
    iconDay: "snow",
    iconNight: "snow",
    theme: "theme-snow",
    description: "Copos de nieve dispersos y acumulación incipiente."
  },
  73: {
    label: "Nevada moderada",
    iconDay: "snow",
    iconNight: "snow",
    theme: "theme-snow",
    description: "Nevada persistente con acumulación progresiva."
  },
  75: {
    label: "Nevada fuerte",
    iconDay: "snow",
    iconNight: "snow",
    theme: "theme-snow",
    description: "Precipitación intensa de nieve con visibilidad comprometida."
  },
  77: {
    label: "Granizo menudo / Gránulos",
    iconDay: "snow",
    iconNight: "snow",
    theme: "theme-snow",
    description: "Granos de nieve opacos o granizo menudo."
  },
  80: {
    label: "Chubascos leves",
    iconDay: "rain",
    iconNight: "rain",
    theme: "theme-rain",
    description: "Aguaceros repentinos y de corta duración."
  },
  81: {
    label: "Chubascos moderados",
    iconDay: "rain",
    iconNight: "rain",
    theme: "theme-rain",
    description: "Aguaceros intermitentes de intensidad apreciable."
  },
  82: {
    label: "Chubascos violentos",
    iconDay: "rainHeavy",
    iconNight: "rainHeavy",
    theme: "theme-rain",
    description: "Chubascos muy intensos y torrenciales."
  },
  85: {
    label: "Chubascos de nieve ligeros",
    iconDay: "snow",
    iconNight: "snow",
    theme: "theme-snow",
    description: "Ráfagas repentinas de copos de nieve."
  },
  86: {
    label: "Chubascos de nieve intensos",
    iconDay: "snow",
    iconNight: "snow",
    theme: "theme-snow",
    description: "Chubascos de nieve densos y severos."
  },
  95: {
    label: "Tormenta eléctrica",
    iconDay: "thunderstorm",
    iconNight: "thunderstorm",
    theme: "theme-storm",
    description: "Actividad tormentosa con aparato eléctrico y posibles ráfagas."
  },
  96: {
    label: "Tormenta con granizo leve",
    iconDay: "thunderstorm",
    iconNight: "thunderstorm",
    theme: "theme-storm",
    description: "Tormenta eléctrica acompañada de granizo menudo."
  },
  99: {
    label: "Tormenta con granizo severo",
    iconDay: "thunderstorm",
    iconNight: "thunderstorm",
    theme: "theme-storm",
    description: "Tormenta eléctrica severa con granizo destructivo."
  }
};

/**
 * Resuelve la información meteorológica asociada a un código WMO.
 * @param {number} code Código WMO
 * @param {boolean|number} isDay Indica si es de día (1) o noche (0)
 * @returns {{ label: string, icon: string, theme: string, description: string }}
 */
export function getWeatherInterpretation(code, isDay = 1) {
  const numericCode = Number(code);
  const entry = WMO_WEATHER_CODES[numericCode] || {
    label: "Condición no especificada",
    iconDay: "cloud",
    iconNight: "cloud",
    theme: "theme-clouds",
    description: "Estado meteorológico variable."
  };

  const isDaytime = Boolean(Number(isDay));
  return {
    label: entry.label,
    icon: isDaytime ? entry.iconDay : entry.iconNight,
    theme: entry.theme,
    description: entry.description,
    isDay: isDaytime
  };
}
