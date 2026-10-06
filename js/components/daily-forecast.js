/**
 * Componente: Pronóstico extendido por días (7 días).
 * Muestra el pronóstico diario con iconos SVG, rango de temperaturas mín/máx
 * y barras proporcionales de rango térmico semanal.
 */

import { appState } from "../state/app-state.js";
import { formatDayLabel } from "../utils/formatters.js";
import { formatTempString, formatTempNumber } from "../utils/units.js";
import { getWeatherInterpretation } from "../config/wmo-codes.js";
import { escapeHtml } from "../utils/dom.js";
import { SVG_ICONS, getIcon } from "../../assets/icons/weather-icons.js";

export class DailyForecastComponent {
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

    if (status !== "success" || !forecast || !forecast.daily || forecast.daily.length === 0) {
      this.container.innerHTML = "";
      return;
    }

    const days = forecast.daily;

    // Calcular temperaturas mínima y máxima globales de la semana para la barra comparativa
    const allMins = days.map(d => formatTempNumber(d.tempMin, unit));
    const allMaxs = days.map(d => formatTempNumber(d.tempMax, unit));
    const weekMin = Math.min(...allMins);
    const weekMax = Math.max(...allMaxs);
    const weekSpan = weekMax - weekMin || 1;

    const cardsHtml = days.map((day, idx) => {
      const dayLabel = formatDayLabel(day.date, idx);
      const weatherInfo = getWeatherInterpretation(day.weatherCode, 1);
      const minVal = formatTempNumber(day.tempMin, unit);
      const maxVal = formatTempNumber(day.tempMax, unit);

      // Porcentaje relativo en la barra semanal
      const leftPercent = Math.max(0, Math.min(100, ((minVal - weekMin) / weekSpan) * 100));
      const widthPercent = Math.max(8, Math.min(100 - leftPercent, ((maxVal - minVal) / weekSpan) * 100));

      const precipSum = day.precipitationSum ? `${day.precipitationSum.toFixed(1)} mm` : "0 mm";

      return `
        <div class="daily-forecast-item" role="listitem">
          <div class="daily-col-day">
            <span class="daily-day-title">${escapeHtml(dayLabel)}</span>
            <span class="daily-day-date">${escapeHtml(day.date.substring(5))}</span>
          </div>

          <div class="daily-col-weather">
            <div class="daily-icon-box" title="${escapeHtml(weatherInfo.label)}">
              ${getIcon(weatherInfo.icon, "daily-svg")}
            </div>
            ${day.precipitationSum > 0 ? `
              <span class="daily-precip-badge" title="Precipitación prevista">
                <span class="precip-mini-icon">${SVG_ICONS.drizzle}</span>
                ${precipSum}
              </span>
            ` : ""}
          </div>

          <div class="daily-col-temps">
            <span class="temp-min-text">${formatTempString(day.tempMin, unit)}</span>
            
            <div class="temp-range-track" aria-hidden="true">
              <div 
                class="temp-range-fill" 
                style="left: ${leftPercent}%; width: ${widthPercent}%;"
              ></div>
            </div>

            <span class="temp-max-text">${formatTempString(day.tempMax, unit)}</span>
          </div>
        </div>
      `;
    }).join("");

    this.container.innerHTML = `
      <section class="daily-section card-surface" aria-label="Pronóstico de 7 días">
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-icon">${SVG_ICONS.calendar}</span>
            <h3 class="section-title">Pronóstico para 7 días</h3>
          </div>
          <span class="section-subtitle">Tendencia meteorológica semanal</span>
        </div>

        <div class="daily-list" role="list">
          ${cardsHtml}
        </div>
      </section>
    `;
  }
}
