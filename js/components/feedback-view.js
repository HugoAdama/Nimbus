/**
 * Componente: Vistas de retroalimentación de estado (Vacío, Cargando y Error).
 * Cuida minuciosamente los estados de la interfaz con esqueletos de carga
 * y mensajes explicativos claros sin ningún emoji.
 */

import { appState, APP_STATUS } from "../state/app-state.js";
import { API_CONFIG } from "../config/api.config.js";
import { escapeHtml } from "../utils/dom.js";
import { SVG_ICONS } from "../../assets/icons/weather-icons.js";

export class FeedbackViewComponent {
  /**
   * @param {HTMLElement} container
   * @param {Object} options
   * @param {Function} options.onSelectCity
   * @param {Function} options.onLocateMe
   * @param {Function} options.onRetry
   */
  constructor(container, { onSelectCity, onLocateMe, onRetry }) {
    this.container = container;
    this.onSelectCity = onSelectCity;
    this.onLocateMe = onLocateMe;
    this.onRetry = onRetry;

    this.render();

    appState.subscribe((state) => {
      this.render();
    });
  }

  render() {
    const { status, errorMessage } = appState.getState();

    switch (status) {
      case APP_STATUS.IDLE:
        this.renderEmptyState();
        break;
      case APP_STATUS.LOADING:
        this.renderLoadingSkeleton();
        break;
      case APP_STATUS.ERROR:
        this.renderErrorState(errorMessage);
        break;
      case APP_STATUS.SUCCESS:
      default:
        this.container.innerHTML = "";
        this.container.classList.add("hidden");
        break;
    }
  }

  renderEmptyState() {
    this.container.classList.remove("hidden");
    const suggestions = API_CONFIG.DEFAULT_SUGGESTIONS;

    this.container.innerHTML = `
      <section class="feedback-container empty-state-container" aria-label="Inicio">
        <div class="empty-hero-icon" aria-hidden="true">
          ${SVG_ICONS.sun}
        </div>
        <h2 class="empty-title">Explora el clima en tiempo real</h2>
        <p class="empty-desc">
          Escribe el nombre de cualquier ciudad en la barra superior o pulsa en tu ubicación para consultar el pronóstico meteorológico detallado.
        </p>

        <div class="empty-actions">
          <button type="button" id="btn-empty-locate" class="btn-primary">
            <span class="btn-icon">${SVG_ICONS.location}</span>
            <span>Detectar mi ubicación</span>
          </button>
        </div>

        <div class="empty-suggestions">
          <span class="suggestions-label">O explora ciudades populares:</span>
          <div class="suggestion-pills">
            ${suggestions.map((s, idx) => `
              <button 
                type="button" 
                class="suggestion-pill" 
                data-index="${idx}"
              >
                <span class="pill-dot"></span>
                <span>${escapeHtml(s.name)}</span>
              </button>
            `).join("")}
          </div>
        </div>
      </section>
    `;

    // Asignar listeners
    const locateBtn = this.container.querySelector("#btn-empty-locate");
    if (locateBtn && this.onLocateMe) {
      locateBtn.addEventListener("click", () => this.onLocateMe());
    }

    const pills = this.container.querySelectorAll(".suggestion-pill");
    pills.forEach(pill => {
      pill.addEventListener("click", () => {
        const idx = Number(pill.dataset.index);
        const city = suggestions[idx];
        if (city && this.onSelectCity) {
          this.onSelectCity(city);
        }
      });
    });
  }

  renderLoadingSkeleton() {
    this.container.classList.remove("hidden");
    this.container.innerHTML = `
      <div class="feedback-container skeleton-container" aria-busy="true" aria-label="Cargando información meteorológica">
        <div class="skeleton-spinner-wrap">
          <div class="spinner-ring" aria-hidden="true"></div>
          <span class="spinner-text">Consultando pronóstico en tiempo real...</span>
        </div>

        <!-- Skeleton Hero Card -->
        <div class="skeleton-card skeleton-hero">
          <div class="skeleton-line w-30"></div>
          <div class="skeleton-line w-60 h-lg"></div>
          <div class="skeleton-row mt-4">
            <div class="skeleton-circle xl"></div>
            <div class="skeleton-col flex-1">
              <div class="skeleton-line w-40 h-xl"></div>
              <div class="skeleton-line w-50"></div>
            </div>
          </div>
        </div>

        <!-- Skeleton Chart -->
        <div class="skeleton-card skeleton-chart">
          <div class="skeleton-line w-35"></div>
          <div class="skeleton-chart-box"></div>
        </div>

        <!-- Skeleton Grid -->
        <div class="skeleton-grid">
          <div class="skeleton-card sm"></div>
          <div class="skeleton-card sm"></div>
          <div class="skeleton-card sm"></div>
          <div class="skeleton-card sm"></div>
        </div>
      </div>
    `;
  }

  renderErrorState(message) {
    this.container.classList.remove("hidden");
    const safeMsg = escapeHtml(message || "No encontramos esa ciudad o no fue posible obtener los datos meteorológicos.");

    this.container.innerHTML = `
      <section class="feedback-container error-state-container" role="alert" aria-live="assertive">
        <div class="error-hero-icon" aria-hidden="true">
          ${SVG_ICONS.alertCircle}
        </div>
        <h2 class="error-title">No fue posible completar la consulta</h2>
        <p class="error-desc">${safeMsg}</p>

        <div class="error-help-box">
          <div class="help-item">
            <span class="help-bullet">-</span>
            <span>Verifica la ortografía o intenta ingresar el nombre del país (ej. "Santiago, Chile").</span>
          </div>
          <div class="help-item">
            <span class="help-bullet">-</span>
            <span>Si usaste la opción de ubicación, asegúrate de haber otorgado los permisos en tu navegador.</span>
          </div>
        </div>

        <div class="error-actions">
          <button type="button" id="btn-error-retry" class="btn-primary">
            <span class="btn-icon">${SVG_ICONS.refresh}</span>
            <span>Intentar nuevamente</span>
          </button>
          <button type="button" id="btn-error-home" class="btn-secondary">
            <span>Volver al inicio</span>
          </button>
        </div>
      </section>
    `;

    const retryBtn = this.container.querySelector("#btn-error-retry");
    if (retryBtn && this.onRetry) {
      retryBtn.addEventListener("click", () => this.onRetry());
    }

    const homeBtn = this.container.querySelector("#btn-error-home");
    if (homeBtn) {
      homeBtn.addEventListener("click", () => {
        appState.resetToIdle();
      });
    }
  }
}
