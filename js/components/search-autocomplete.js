/**
 * Componente: Buscador con retardo (debounce) y sugerencias dinámicas.
 * Ofrece navegación por teclado completa (flechas, enter, escape) y manejo de estados.
 */

import { debounce } from "../utils/debounce.js";
import { geocodingService } from "../services/geocoding.service.js";
import { escapeHtml } from "../utils/dom.js";
import { SVG_ICONS } from "../../assets/icons/weather-icons.js";
import { calculateNextIndex, updateItemSelection } from "../utils/keyboard-nav.js";

export class SearchAutocompleteComponent {
  /**
   * @param {HTMLElement} container
   * @param {Object} options
   * @param {Function} options.onSelectCity Callback al seleccionar una ciudad
   */
  constructor(container, { onSelectCity }) {
    this.container = container;
    this.onSelectCity = onSelectCity;
    this.currentSuggestions = [];
    this.activeIndex = -1;
    this.isLoading = false;

    this.debouncedSearch = debounce(this.handleSearchInput.bind(this), 380);

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="search-wrapper" id="search-autocomplete-box">
        <form class="search-form" id="search-city-form" autocomplete="off" onsubmit="return false;">
          <label for="city-search-input" class="sr-only">Buscar ciudad o localidad</label>
          <div class="input-prefix-icon">${SVG_ICONS.search}</div>
          
          <input 
            type="text" 
            id="city-search-input" 
            class="city-search-input" 
            placeholder="Buscar ciudad (ej. Madrid, Tokio, Buenos Aires)..."
            autocomplete="off"
            spellcheck="false"
            aria-autocomplete="list"
            aria-controls="search-suggestions-dropdown"
            aria-expanded="false"
          />

          <div class="search-actions-right">
            <kbd class="search-kbd-badge" title="Presiona / para buscar rápidamente">/</kbd>
            <button 
              type="button" 
              id="search-clear-btn" 
              class="search-clear-btn hidden" 
              aria-label="Limpiar campo de búsqueda"
              title="Limpiar"
            >
              ${SVG_ICONS.close}
            </button>
          </div>

          <div class="search-spinner hidden" id="search-spinner" aria-hidden="true">
            ${SVG_ICONS.refresh}
          </div>
        </form>

        <div 
          id="search-suggestions-dropdown" 
          class="suggestions-dropdown hidden" 
          role="listbox" 
          aria-label="Sugerencias de ciudades"
        ></div>
      </div>
    `;
  }

  bindEvents() {
    this.input = this.container.querySelector("#city-search-input");
    this.clearBtn = this.container.querySelector("#search-clear-btn");
    this.spinner = this.container.querySelector("#search-spinner");
    this.dropdown = this.container.querySelector("#search-suggestions-dropdown");

    // Evento de entrada de texto
    this.input.addEventListener("input", (e) => {
      const val = e.target.value;
      this.clearBtn.classList.toggle("hidden", val.length === 0);
      this.debouncedSearch(val);
    });

    // Limpiar entrada
    this.clearBtn.addEventListener("click", () => {
      this.clearInput();
      this.input.focus();
    });

    // Navegación por teclado
    this.input.addEventListener("keydown", (e) => {
      if (this.dropdown.classList.contains("hidden")) {
        if (e.key === "Enter") {
          e.preventDefault();
          const query = this.input.value.trim();
          if (query.length >= 2) {
            this.handleDirectSubmit(query);
          }
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          this.navigateSuggestions(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          this.navigateSuggestions(-1);
          break;
        case "Enter":
          e.preventDefault();
          if (this.activeIndex >= 0 && this.currentSuggestions[this.activeIndex]) {
            this.selectCity(this.currentSuggestions[this.activeIndex]);
          } else {
            const query = this.input.value.trim();
            if (query.length >= 2) {
              this.handleDirectSubmit(query);
            }
          }
          break;
        case "Escape":
          e.preventDefault();
          this.closeDropdown();
          break;
      }
    });

    // Atajo global de teclado (/ o Ctrl+K) para enfocar el buscador
    document.addEventListener("keydown", (e) => {
      // Ignorar si el usuario ya está escribiendo en un input o textarea
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      if (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        this.input.focus();
        this.input.select();
      }
    });

    // Cierre al hacer clic fuera del componente
    document.addEventListener("click", (e) => {
      if (!this.container.contains(e.target)) {
        this.closeDropdown();
      }
    });
  }

  async handleSearchInput(query) {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      this.closeDropdown();
      return;
    }

    this.showSpinner(true);
    try {
      const cities = await geocodingService.searchCities(trimmed);
      this.currentSuggestions = cities;
      this.activeIndex = -1;
      this.renderSuggestions(cities, trimmed);
    } catch (err) {
      if (err.name !== "AbortError") {
        this.renderErrorState("No fue posible buscar sugerencias en este momento.");
      }
    } finally {
      this.showSpinner(false);
    }
  }

  async handleDirectSubmit(query) {
    this.showSpinner(true);
    try {
      const cities = await geocodingService.searchCities(query);
      if (cities.length > 0) {
        this.selectCity(cities[0]);
      } else {
        this.renderErrorState(`No encontramos ciudades que coincidan con "${query}".`);
        this.openDropdown();
      }
    } catch (err) {
      this.renderErrorState("Error al conectar con el servicio de búsqueda.");
    } finally {
      this.showSpinner(false);
    }
  }

  renderSuggestions(cities, query) {
    if (cities.length === 0) {
      this.dropdown.innerHTML = `
        <div class="suggestion-empty">
          <span class="icon-subtle">${SVG_ICONS.alertCircle}</span>
          <p>No encontramos resultados para "<strong>${escapeHtml(query)}</strong>".</p>
        </div>
      `;
      this.openDropdown();
      return;
    }

    const itemsHtml = cities.map((city, idx) => {
      const subtitle = geocodingService.formatCitySubtitle(city);
      const code = city.countryCode ? city.countryCode.toUpperCase() : "";
      return `
        <div 
          class="suggestion-item" 
          role="option" 
          data-index="${idx}" 
          id="suggestion-opt-${idx}"
          tabindex="-1"
        >
          <div class="suggestion-icon">${SVG_ICONS.pin}</div>
          <div class="suggestion-info">
            <div class="suggestion-name-row">
              <span class="suggestion-name">${escapeHtml(city.name)}</span>
              ${code ? `<span class="suggestion-country-badge">${escapeHtml(code)}</span>` : ""}
            </div>
            ${subtitle ? `<span class="suggestion-location">${escapeHtml(subtitle)}</span>` : ""}
          </div>
        </div>
      `;
    }).join("");

    this.dropdown.innerHTML = itemsHtml;

    // Asignar listeners a cada sugerencia
    const itemEls = this.dropdown.querySelectorAll(".suggestion-item");
    itemEls.forEach((el) => {
      el.addEventListener("click", () => {
        const idx = Number(el.dataset.index);
        const city = this.currentSuggestions[idx];
        if (city) this.selectCity(city);
      });
      el.addEventListener("mouseenter", () => {
        this.setActiveIndex(Number(el.dataset.index));
      });
    });

    this.openDropdown();
  }

  renderErrorState(message) {
    this.dropdown.innerHTML = `
      <div class="suggestion-error">
        <span class="icon-subtle">${SVG_ICONS.alertCircle}</span>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
    this.openDropdown();
  }

  navigateSuggestions(direction) {
    if (this.currentSuggestions.length === 0) return;
    const nextIndex = calculateNextIndex(
      this.activeIndex,
      this.currentSuggestions.length,
      direction
    );
    this.setActiveIndex(nextIndex);
  }

  setActiveIndex(idx) {
    this.activeIndex = idx;
    const items = this.dropdown.querySelectorAll(".suggestion-item");
    updateItemSelection(items, idx);
  }

  selectCity(city) {
    this.closeDropdown();
    this.input.value = `${city.name}${city.country ? `, ${city.country}` : ""}`;
    this.clearBtn.classList.remove("hidden");
    if (this.onSelectCity) {
      this.onSelectCity(city);
    }
  }

  openDropdown() {
    this.dropdown.classList.remove("hidden");
    this.input.setAttribute("aria-expanded", "true");
  }

  closeDropdown() {
    this.dropdown.classList.add("hidden");
    this.input.setAttribute("aria-expanded", "false");
    this.activeIndex = -1;
  }

  clearInput() {
    this.input.value = "";
    this.clearBtn.classList.add("hidden");
    this.closeDropdown();
    this.debouncedSearch.cancel();
  }

  showSpinner(show) {
    this.isLoading = show;
    this.spinner.classList.toggle("hidden", !show);
  }
}
