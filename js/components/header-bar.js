/**
 * Componente: Barra superior de cabecera.
 * Contiene el selector de unidades (°C / °F) y el botón de geolocalización.
 */

import { appState } from "../state/app-state.js";
import { UNIT_TYPES } from "../utils/units.js";
import { SVG_ICONS } from "../../assets/icons/weather-icons.js";

export class HeaderBarComponent {
  /**
   * @param {HTMLElement} container
   * @param {Object} options
   * @param {Function} options.onLocateMe Callback al presionar el botón de geolocalización
   */
  constructor(container, { onLocateMe }) {
    this.container = container;
    this.onLocateMe = onLocateMe;
    this.render();
    this.bindEvents();

    appState.subscribe((state, action) => {
      if (action === "SET_UNIT") {
        this.updateUnitButtons(state.unit);
      } else if (action === "SET_THEME_MODE") {
        this.render();
        this.bindEvents();
      }
    });
  }

  render() {
    const { unit: currentUnit, themeMode: currentThemeMode } = appState.getState();

    this.container.innerHTML = `
      <header class="app-header">
        <div class="header-brand" id="brand-home-trigger" role="button" tabindex="0" title="Ir al inicio">
          <div class="brand-icon">
            ${SVG_ICONS.cloud}
          </div>
          <div class="brand-text">
            <h1 class="brand-title">Nimbus</h1>
            <span class="brand-tagline">Meteorología de precisión</span>
          </div>
        </div>

        <div class="header-actions">
          <button 
            type="button" 
            id="btn-theme-mode" 
            class="action-btn theme-mode-btn" 
            title="${currentThemeMode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}"
            aria-label="${currentThemeMode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}"
          >
            <span class="btn-icon theme-icon">${currentThemeMode === "dark" ? SVG_ICONS.sun : SVG_ICONS.moon}</span>
            <span class="btn-text theme-label">${currentThemeMode === "dark" ? "Claro" : "Oscuro"}</span>
          </button>

          <button 
            type="button" 
            id="btn-locate-me" 
            class="action-btn locate-btn" 
            title="Usar mi ubicación actual"
            aria-label="Obtener clima en mi ubicación actual"
          >
            <span class="btn-icon">${SVG_ICONS.location}</span>
            <span class="btn-text">Ubicación</span>
          </button>

          <div class="unit-switch" role="group" aria-label="Unidad de temperatura">
            <button 
              type="button" 
              class="unit-btn ${currentUnit === UNIT_TYPES.CELSIUS ? "active" : ""}" 
              data-unit="${UNIT_TYPES.CELSIUS}"
              aria-pressed="${currentUnit === UNIT_TYPES.CELSIUS}"
            >
              °C
            </button>
            <button 
              type="button" 
              class="unit-btn ${currentUnit === UNIT_TYPES.FAHRENHEIT ? "active" : ""}" 
              data-unit="${UNIT_TYPES.FAHRENHEIT}"
              aria-pressed="${currentUnit === UNIT_TYPES.FAHRENHEIT}"
            >
              °F
            </button>
          </div>
        </div>
      </header>
    `;
  }

  bindEvents() {
    // Botón de cambio de modo Claro / Oscuro
    const themeBtn = this.container.querySelector("#btn-theme-mode");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        appState.toggleThemeMode();
      });
    }

    // Botón de geolocalización
    const locateBtn = this.container.querySelector("#btn-locate-me");
    if (locateBtn && this.onLocateMe) {
      locateBtn.addEventListener("click", () => {
        this.setLocatingState(true);
        this.onLocateMe().finally(() => {
          this.setLocatingState(false);
        });
      });
    }

    // Clic en la marca para volver al inicio
    const brandHome = this.container.querySelector("#brand-home-trigger");
    if (brandHome) {
      const goHome = () => appState.resetToIdle();
      brandHome.addEventListener("click", goHome);
      brandHome.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goHome();
        }
      });
    }

    // Selector de unidades
    const unitBtns = this.container.querySelectorAll(".unit-btn");
    unitBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const unit = btn.dataset.unit;
        appState.setUnit(unit);
      });
    });
  }

  updateUnitButtons(activeUnit) {
    const unitBtns = this.container.querySelectorAll(".unit-btn");
    unitBtns.forEach(btn => {
      const isActive = btn.dataset.unit === activeUnit;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  setLocatingState(isLocating) {
    const locateBtn = this.container.querySelector("#btn-locate-me");
    if (!locateBtn) return;
    if (isLocating) {
      locateBtn.classList.add("loading");
      locateBtn.setAttribute("disabled", "true");
    } else {
      locateBtn.classList.remove("loading");
      locateBtn.removeAttribute("disabled");
    }
  }
}
