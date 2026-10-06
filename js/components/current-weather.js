/**
 * Componente: Clima actual (Tarjeta Principal / Hero).
 * Muestra temperatura principal con tipografía destacada, icono dinámico,
 * condición, resumen de micro-métricas, sensación térmica y rangos.
 */

import { appState } from "../state/app-state.js";
import { getWeatherInterpretation } from "../config/wmo-codes.js";
import { formatTempString, formatTempNumber } from "../utils/units.js";
import { formatFullDate, formatCoordinates, formatHour } from "../utils/formatters.js";
import { escapeHtml } from "../utils/dom.js";
import { SVG_ICONS, getIcon } from "../../assets/icons/weather-icons.js";
import { storageService } from "../services/storage.service.js";

export class CurrentWeatherComponent {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container;
    this.render();

    appState.subscribe((state, action) => {
      if (
        action === "SET_FORECAST_SUCCESS" || 
        action === "SET_UNIT" || 
        action === "UPDATE_FAVORITES"
      ) {
        this.render();
      } else if (action === "RESET_IDLE" || action === "SET_LOADING" || action === "SET_ERROR") {
        this.container.innerHTML = "";
      }
    });
  }

  render() {
    const { currentCity, forecast, unit, status } = appState.getState();

    if (status !== "success" || !currentCity || !forecast) {
      this.container.innerHTML = "";
      return;
    }

    const { current, daily } = forecast;
    const weatherInfo = getWeatherInterpretation(current.weatherCode, current.isDay);
    const isFav = storageService.isFavorite(currentCity);

    // Temperaturas máxima y mínima de hoy
    const todayDaily = daily && daily.length > 0 ? daily[0] : null;
    const tempMaxStr = todayDaily ? formatTempString(todayDaily.tempMax, unit) : "";
    const tempMinStr = todayDaily ? formatTempString(todayDaily.tempMin, unit) : "";

    const fullDate = formatFullDate(current.time);
    const timeFormatted = formatHour(current.time);
    const coordsStr = formatCoordinates(currentCity.latitude, currentCity.longitude);

    const subtitle = [currentCity.admin1, currentCity.country]
      .filter(Boolean)
      .join(", ");

    this.container.innerHTML = `
      <section class="current-weather-card ${weatherInfo.theme} ${current.isDay ? "is-day" : "is-night"}" aria-label="Condiciones actuales">
        <div class="card-ambient-glow" aria-hidden="true"></div>

        <div class="current-top-row">
          <div class="location-details">
            <div class="location-badge">
              <span class="badge-icon">${SVG_ICONS.pin}</span>
              <span class="badge-text">${escapeHtml(coordsStr)}</span>
            </div>
            <h2 class="city-name">${escapeHtml(currentCity.name)}</h2>
            ${subtitle ? `<p class="city-subtitle">${escapeHtml(subtitle)}</p>` : ""}
            <p class="current-date-meta">
              <span class="meta-date">${escapeHtml(fullDate)}</span>
              <span class="meta-separator">·</span>
              <span class="meta-time">
                <span class="live-dot" aria-hidden="true"></span>
                Actualizado a las ${escapeHtml(timeFormatted)}
              </span>
            </p>
          </div>

          <button 
            type="button" 
            id="btn-toggle-favorite" 
            class="fav-toggle-btn ${isFav ? "is-favorite" : ""}" 
            title="${isFav ? "Quitar de favoritos" : "Guardar en favoritos"}"
            aria-label="${isFav ? "Quitar de favoritos" : "Guardar en favoritos"}"
            aria-pressed="${isFav}"
          >
            <span class="fav-star-icon">${isFav ? SVG_ICONS.starFilled : SVG_ICONS.starOutline}</span>
            <span class="fav-label">${isFav ? "Guardada" : "Guardar"}</span>
          </button>
        </div>

        <div class="current-main-row">
          <div class="current-temp-block">
            <div class="temp-hero-display">
              <span class="temp-main-val">${formatTempNumber(current.temperature, unit)}</span>
              <span class="temp-unit-symbol">°${unit === "fahrenheit" ? "F" : "C"}</span>
            </div>

            <div class="condition-summary">
              <h3 class="condition-title">${escapeHtml(weatherInfo.label)}</h3>
              <p class="condition-desc">${escapeHtml(weatherInfo.description)}</p>
            </div>
          </div>

          <div class="current-icon-block" aria-hidden="true">
            ${getIcon(weatherInfo.icon, "hero-svg-icon")}
          </div>
        </div>

        <div class="current-highlights-strip" role="group" aria-label="Resumen rápido">
          <div class="highlight-item" title="Humedad relativa">
            <span class="highlight-icon">${SVG_ICONS.humidity || SVG_ICONS.droplet}</span>
            <span class="highlight-val">${current.humidity}%</span>
            <span class="highlight-label">Humedad</span>
          </div>
          <div class="highlight-item" title="Velocidad del viento">
            <span class="highlight-icon">${SVG_ICONS.wind}</span>
            <span class="highlight-val">${Math.round(current.windSpeed)} km/h</span>
            <span class="highlight-label">Viento</span>
          </div>
          <div class="highlight-item" title="Índice ultravioleta máximo">
            <span class="highlight-icon">${SVG_ICONS.sun}</span>
            <span class="highlight-val">UV ${todayDaily ? Math.round(todayDaily.uvIndexMax) : 0}</span>
            <span class="highlight-label">Índice</span>
          </div>
        </div>

        <div class="current-footer-row">
          <div class="thermal-pill">
            <span class="pill-icon">${SVG_ICONS.thermometer}</span>
            <span class="pill-label">Sensación térmica:</span>
            <span class="pill-val">${formatTempString(current.apparentTemperature, unit)}</span>
          </div>

          ${todayDaily ? `
            <div class="range-pill">
              <span class="range-item">
                <span class="range-arrow up">${SVG_ICONS.arrowUp}</span>
                <span class="range-label">Máx:</span>
                <span class="range-val">${tempMaxStr}</span>
              </span>
              <span class="range-divider">|</span>
              <span class="range-item">
                <span class="range-arrow down">${SVG_ICONS.arrowDown}</span>
                <span class="range-label">Mín:</span>
                <span class="range-val">${tempMinStr}</span>
              </span>
            </div>
          ` : ""}
        </div>
      </section>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const favBtn = this.container.querySelector("#btn-toggle-favorite");
    if (favBtn) {
      favBtn.addEventListener("click", () => {
        appState.toggleFavoriteCurrentCity();
      });
    }
  }
}
