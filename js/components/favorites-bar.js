/**
 * Componente: Barra de ciudades favoritas.
 * Permite acceso rápido a ubicaciones guardadas y eliminación individual.
 */

import { appState } from "../state/app-state.js";
import { escapeHtml } from "../utils/dom.js";
import { SVG_ICONS } from "../../assets/icons/weather-icons.js";

export class FavoritesBarComponent {
  /**
   * @param {HTMLElement} container
   * @param {Object} options
   * @param {Function} options.onSelectCity
   */
  constructor(container, { onSelectCity }) {
    this.container = container;
    this.onSelectCity = onSelectCity;

    this.render();

    appState.subscribe((state, action) => {
      if (action === "UPDATE_FAVORITES" || action === "SET_FORECAST_SUCCESS" || action === "RESET_IDLE") {
        this.render();
      }
    });
  }

  render() {
    const { favorites, currentCity } = appState.getState();

    if (!favorites || favorites.length === 0) {
      this.container.innerHTML = "";
      this.container.classList.add("hidden");
      return;
    }

    this.container.classList.remove("hidden");
    const activeKey = currentCity ? `${currentCity.name.toLowerCase().trim()}_${Number(currentCity.latitude).toFixed(3)}_${Number(currentCity.longitude).toFixed(3)}` : "";

    const chipsHtml = favorites.map(fav => {
      const isCurrentActive = fav.id === activeKey;
      return `
        <div class="favorite-chip ${isCurrentActive ? "active" : ""}" data-id="${fav.id}">
          <button 
            type="button" 
            class="favorite-chip-btn" 
            title="Ver clima en ${escapeHtml(fav.name)}, ${escapeHtml(fav.country)}"
          >
            <span class="chip-star">${SVG_ICONS.starFilled}</span>
            <span class="chip-label">${escapeHtml(fav.name)}</span>
            ${fav.country ? `<span class="chip-country">${escapeHtml(fav.country)}</span>` : ""}
          </button>
          <button 
            type="button" 
            class="favorite-remove-btn" 
            data-id="${fav.id}" 
            title="Eliminar de favoritos"
            aria-label="Eliminar ${escapeHtml(fav.name)} de favoritos"
          >
            ${SVG_ICONS.close}
          </button>
        </div>
      `;
    }).join("");

    this.container.innerHTML = `
      <section class="favorites-section" aria-label="Ciudades favoritas">
        <div class="favorites-header">
          <span class="favorites-title-icon">${SVG_ICONS.starFilled}</span>
          <span class="favorites-title">Ciudades guardadas</span>
        </div>
        <div class="favorites-list" role="list">
          ${chipsHtml}
        </div>
      </section>
    `;

    this.bindEvents(favorites);
  }

  bindEvents(favorites) {
    const chips = this.container.querySelectorAll(".favorite-chip");
    chips.forEach(chip => {
      const id = chip.dataset.id;
      const favData = favorites.find(f => f.id === id);
      if (!favData) return;

      const selectBtn = chip.querySelector(".favorite-chip-btn");
      if (selectBtn) {
        selectBtn.addEventListener("click", () => {
          if (this.onSelectCity) {
            this.onSelectCity(favData);
          }
        });
      }

      const removeBtn = chip.querySelector(".favorite-remove-btn");
      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          appState.removeFavorite(id);
        });
      }
    });
  }
}
