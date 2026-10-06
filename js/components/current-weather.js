/**
 * Componente: Clima actual (Tarjeta Principal / Hero).
 * Muestra temperatura principal, icono dinámico, condición, sensación térmica
 * y botón para marcar como favorita la ciudad actual.
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
            class="favorite-toggle-btn ${isFav ? "is-fav" : ""}" 
            title="${isFav ? "Quitar de favoritos" : "Guardar en favoritos"}"
            aria-label="${isFav ? "Quitar de favoritos" : "Guardar en favoritos"}"
            aria-pressed="${isFav}"
          >
            <span class="fav-icon">${isFav ? SVG_ICONS.starFilled : SVG_ICONS.starOutline}</span>
            <span class="fav-label">${isFav ? "Guardada" : "Guardar"}</span>
          </button>
        </div>

        <div class="current-main-row">
          <div class="temp-condition-block">
            <div class="temperature-display">
              <span class="temperature-number">${formatTempNumber(current.temperature, unit)}</span>
              <div class="temp-unit-badge">
                <span class="temp-degree">°</span>
                <span class="temp-letter">${unit === "fahrenheit" ? "F" : "C"}</span>
              </div>
            </div>

            <div class="condition-display">
              <h3 class="condition-title">${escapeHtml(weatherInfo.label)}</h3>
              <p class="condition-description">${escapeHtml(weatherInfo.description)}</p>
            </div>
          </div>

          <div class="weather-hero-icon" aria-hidden="true">
            ${getIcon(weatherInfo.icon, "hero-svg-icon")}
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
