/**
 * Componente: Métricas meteorológicas detalladas (viento, humedad, presión, UV, sol).
 */

import { appState } from "../state/app-state.js";
import { formatWindSpeed, degreesToCardinal } from "../utils/units.js";
import { formatHour, getUVLevel } from "../utils/formatters.js";
import { SVG_ICONS } from "../../assets/icons/weather-icons.js";
import { escapeHtml } from "../utils/dom.js";

export class WeatherMetricsComponent {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container;
    this.render();

    appState.subscribe((state, action) => {
      if (action === "SET_FORECAST_SUCCESS" || action === "SET_UNIT") {
        this.render();
      } else if (action === "RESET_IDLE" || action === "SET_LOADING" || action === "SET_ERROR") {
        this.container.innerHTML = "";
      }
    });
  }

  render() {
    const { forecast, unit, status } = appState.getState();

    if (status !== "success" || !forecast) {
      this.container.innerHTML = "";
      return;
    }

    const { current, daily } = forecast;
    const todayDaily = daily && daily.length > 0 ? daily[0] : null;

    const windSpeedStr = formatWindSpeed(current.windSpeed, unit);
    const windCardinal = degreesToCardinal(current.windDirection);
    const humidityVal = current.humidity;
    const pressureVal = current.pressure ? `${Math.round(current.pressure)} hPa` : "--";
    const uvInfo = getUVLevel(todayDaily ? todayDaily.uvIndexMax : 0);

    const sunriseStr = todayDaily && todayDaily.sunrise ? formatHour(todayDaily.sunrise) : "--:--";
    const sunsetStr = todayDaily && todayDaily.sunset ? formatHour(todayDaily.sunset) : "--:--";
    const precipVal = `${Number(current.precipitation).toFixed(1)} mm`;

    this.container.innerHTML = `
      <section class="metrics-section" aria-label="Métricas meteorológicas avanzadas">
        <h3 class="sr-only">Detalles ambientales</h3>

        <div class="metrics-grid">
          <!-- Viento -->
          <div class="metric-card card-surface">
            <div class="metric-header">
              <span class="metric-icon">${SVG_ICONS.wind}</span>
              <span class="metric-title">Viento</span>
            </div>
            <div class="metric-main-val">
              <span class="metric-number">${escapeHtml(windSpeedStr)}</span>
            </div>
            <div class="metric-sub-val">
              <span 
                class="compass-arrow" 
                style="transform: rotate(${current.windDirection || 0}deg);" 
                title="${current.windDirection}°"
              >
                ${SVG_ICONS.arrowUp}
              </span>
              <span>Dirección: ${escapeHtml(windCardinal)} (${current.windDirection}°)</span>
            </div>
          </div>

          <!-- Humedad -->
          <div class="metric-card card-surface">
            <div class="metric-header">
              <span class="metric-icon">${SVG_ICONS.humidity}</span>
              <span class="metric-title">Humedad</span>
            </div>
            <div class="metric-main-val">
              <span class="metric-number">${humidityVal}%</span>
            </div>
            <div class="metric-progress-wrap">
              <div class="metric-progress-bar" style="width: ${Math.min(100, humidityVal)}%;"></div>
            </div>
            <div class="metric-sub-val">
              <span>${humidityVal > 70 ? "Humedad alta" : humidityVal < 30 ? "Ambiente seco" : "Nivel confortable"}</span>
            </div>
          </div>

          <!-- Presión atmosférica -->
          <div class="metric-card card-surface">
            <div class="metric-header">
              <span class="metric-icon">${SVG_ICONS.gauge}</span>
              <span class="metric-title">Presión</span>
            </div>
            <div class="metric-main-val">
              <span class="metric-number">${escapeHtml(pressureVal)}</span>
            </div>
            <div class="metric-sub-val">
              <span>Nivel barométrico de superficie</span>
            </div>
          </div>

          <!-- Índice UV -->
          <div class="metric-card card-surface">
            <div class="metric-header">
              <span class="metric-icon">${SVG_ICONS.uv}</span>
              <span class="metric-title">Índice UV</span>
            </div>
            <div class="metric-main-val">
              <span class="metric-number">${todayDaily ? Math.round(todayDaily.uvIndexMax) : 0}</span>
            </div>
            <div class="metric-sub-val">
              <span class="uv-badge ${uvInfo.cssClass}">${escapeHtml(uvInfo.level)}</span>
            </div>
          </div>

          <!-- Precipitación actual -->
          <div class="metric-card card-surface">
            <div class="metric-header">
              <span class="metric-icon">${SVG_ICONS.drizzle}</span>
              <span class="metric-title">Precipitación</span>
            </div>
            <div class="metric-main-val">
              <span class="metric-number">${escapeHtml(precipVal)}</span>
            </div>
            <div class="metric-sub-val">
              <span>Acumulado en última hora</span>
            </div>
          </div>

          <!-- Salida y puesta de sol (Ciclo Solar) -->
          <div class="metric-card card-surface solar-card">
            <div class="metric-header">
              <span class="metric-icon">${SVG_ICONS.sun}</span>
              <span class="metric-title">Ciclo Solar</span>
            </div>
            <div class="solar-times">
              <div class="solar-item">
                <span class="solar-icon">${SVG_ICONS.sunrise}</span>
                <div class="solar-info">
                  <span class="solar-label">Amanecer</span>
                  <span class="solar-time">${escapeHtml(sunriseStr)}</span>
                </div>
              </div>
              <div class="solar-item">
                <span class="solar-icon">${SVG_ICONS.sunset}</span>
                <div class="solar-info">
                  <span class="solar-label">Atardecer</span>
                  <span class="solar-time">${escapeHtml(sunsetStr)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
