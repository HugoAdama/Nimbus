/**
 * Orquestador principal de la aplicación Nimbus (Bootstrap).
 * Coordina la inicialización de los servicios, controladores y el montaje de componentes UI.
 */

import { themeService } from "./services/theme.service.js";
import { weatherController } from "./controllers/weather.controller.js";

// Componentes desacoplados de la interfaz
import { HeaderBarComponent } from "./components/header-bar.js";
import { SearchAutocompleteComponent } from "./components/search-autocomplete.js";
import { FavoritesBarComponent } from "./components/favorites-bar.js";
import { CurrentWeatherComponent } from "./components/current-weather.js";
import { HourlyChartComponent } from "./components/hourly-chart.js";
import { DailyForecastComponent } from "./components/daily-forecast.js";
import { WeatherMetricsComponent } from "./components/weather-metrics.js";
import { FeedbackViewComponent } from "./components/feedback-view.js";

class WeatherApp {
  /**
   * Inicializa la aplicación y sus subsistemas.
   */
  init() {
    // 1. Inicializar servicio de temas visuales
    themeService.init();

    // 2. Montar componentes de la interfaz de usuario
    this.initComponents();

    // 3. Restaurar sesión previa o desplegar estado inicial
    weatherController.restoreInitialSession();
  }

  /**
   * Monta cada componente en su punto del DOM y enlaza los callbacks al WeatherController.
   */
  initComponents() {
    // Barra de cabecera con botón de GPS y selector de tema/unidades
    new HeaderBarComponent(
      document.getElementById("mount-header"),
      {
        onLocateMe: () => weatherController.handleLocateUser()
      }
    );

    // Buscador con autocompletado y retardo (debounce)
    new SearchAutocompleteComponent(
      document.getElementById("mount-search"),
      {
        onSelectCity: (city) => weatherController.loadWeatherForCity(city)
      }
    );

    // Barra de ciudades favoritas persistidas
    new FavoritesBarComponent(
      document.getElementById("mount-favorites"),
      {
        onSelectCity: (city) => weatherController.loadWeatherForCity(city)
      }
    );

    // Vistas de retroalimentación (Bienvenida, Esqueleto de Carga, Error)
    new FeedbackViewComponent(
      document.getElementById("mount-feedback"),
      {
        onSelectCity: (city) => weatherController.loadWeatherForCity(city),
        onLocateMe: () => weatherController.handleLocateUser(),
        onRetry: () => weatherController.retryLastAction()
      }
    );

    // Componentes principales de visualización meteorológica
    new CurrentWeatherComponent(document.getElementById("mount-current-weather"));
    new HourlyChartComponent(document.getElementById("mount-hourly-chart"));
    new DailyForecastComponent(document.getElementById("mount-daily-forecast"));
    new WeatherMetricsComponent(document.getElementById("mount-weather-metrics"));
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const app = new WeatherApp();
  app.init();
});
