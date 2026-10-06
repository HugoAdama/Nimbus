/**
 * Componente: Gráfico interactivo de temperatura por horas (próximas 24h).
 * Renderizado en SVG vectorial con curvas Bézier suaves, gradiente de relleno,
 * líneas guía y cursor interactivo con tooltip flotante.
 */

import { appState } from "../state/app-state.js";
import { formatTempString, formatTempNumber } from "../utils/units.js";
import { formatHour } from "../utils/formatters.js";
import { getWeatherInterpretation } from "../config/wmo-codes.js";
import { SVG_ICONS, getIcon } from "../../assets/icons/weather-icons.js";
import { escapeHtml } from "../utils/dom.js";

export class HourlyChartComponent {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container;
    this.pointsData = [];
    this.activeHoverIndex = null;

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

    if (status !== "success" || !forecast || !forecast.hourly || forecast.hourly.length === 0) {
      this.container.innerHTML = "";
      return;
    }

    const hours = forecast.hourly.slice(0, 24);
    if (hours.length === 0) {
      this.container.innerHTML = "";
      return;
    }

    // Calcular escala del gráfico
    const temps = hours.map(h => formatTempNumber(h.temperature, unit));
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const padding = Math.max(2, (maxTemp - minTemp) * 0.2);
    const yMin = minTemp - padding;
    const yMax = maxTemp + padding;
    const yRange = yMax - yMin || 1;

    // Dimensiones del canvas SVG
    const width = 860;
    const height = 220;
    const padX = 40;
    const padTop = 35;
    const padBottom = 45;
    const chartW = width - padX * 2;
    const chartH = height - padTop - padBottom;

    // Calcular coordenadas (x, y) de cada punto
    this.pointsData = hours.map((item, idx) => {
      const x = padX + (idx / (hours.length - 1)) * chartW;
      const t = temps[idx];
      const normY = (t - yMin) / yRange;
      const y = height - padBottom - normY * chartH;
      const weather = getWeatherInterpretation(item.weatherCode, 1);
      return {
        x,
        y,
        temp: t,
        item,
        hourLabel: formatHour(item.time),
        weather
      };
    });

    // Generar ruta de curva cúbica Bézier suave
    const pathD = this.generateSmoothPath(this.pointsData);
    const areaD = `${pathD} L ${this.pointsData[this.pointsData.length - 1].x} ${height - padBottom} L ${this.pointsData[0].x} ${height - padBottom} Z`;

    // Líneas guía horizontales
    const gridLines = [
      { val: maxTemp, y: padTop },
      { val: Math.round((maxTemp + minTemp) / 2), y: padTop + chartH / 2 },
      { val: minTemp, y: padTop + chartH }
    ];

    const unitSymbol = unit === "fahrenheit" ? "°F" : "°C";

    this.container.innerHTML = `
      <section class="hourly-section card-surface" aria-label="Pronóstico por horas">
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-icon">${SVG_ICONS.clock}</span>
            <h3 class="section-title">Pronóstico por horas (24h)</h3>
          </div>
          <span class="section-subtitle">Evolución de temperatura y probabilidad de lluvia</span>
        </div>

        <div class="chart-wrapper">
          <div class="chart-scroll-container">
            <svg 
              id="hourly-svg-chart" 
              viewBox="0 0 ${width} ${height}" 
              preserveAspectRatio="xMidYMid meet"
              class="hourly-svg"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--chart-line-color)" stop-opacity="0.42"/>
                  <stop offset="85%" stop-color="var(--chart-line-color)" stop-opacity="0.04"/>
                  <stop offset="100%" stop-color="var(--chart-line-color)" stop-opacity="0.0"/>
                </linearGradient>
              </defs>

              <!-- Líneas de referencia horizontales -->
              ${gridLines.map(gl => `
                <line 
                  x1="${padX}" 
                  y1="${gl.y}" 
                  x2="${width - padX}" 
                  y2="${gl.y}" 
                  class="chart-grid-line"
                />
                <text 
                  x="${padX - 10}" 
                  y="${gl.y + 4}" 
                  class="chart-grid-text"
                  text-anchor="end"
                >${gl.val}${unitSymbol}</text>
              `).join("")}

              <!-- Área bajo la curva -->
              <path d="${areaD}" fill="url(#chartGradient)" />

              <!-- Línea curva principal -->
              <path d="${pathD}" class="chart-stroke-path" fill="none" />

              <!-- Puntos de datos y etiquetas de hora espaciadas uniformemente -->
              ${this.pointsData.map((pt, i) => {
                // Mostrar etiquetas cada 3 horas para evitar cualquier colisión visual
                const isInterval = i % 3 === 0;
                const isFirst = i === 0;
                const isLast = i === this.pointsData.length - 1;
                // Evitar colisión al final: si el penúltimo se mostró cerca, no amontonar
                const showHourLabel = isFirst || (isInterval && !isLast) || (isLast && (this.pointsData.length - 1) % 3 === 0);
                
                // Mostrar número de temperatura en puntos clave o picos/valles
                const prev = this.pointsData[i - 1]?.temp;
                const next = this.pointsData[i + 1]?.temp;
                const isPeak = prev !== undefined && next !== undefined && ((pt.temp > prev && pt.temp >= next) || (pt.temp < prev && pt.temp <= next));
                const showTempVal = isInterval || isPeak || isFirst;

                return `
                  <g class="chart-point-group" data-index="${i}">
                    <circle 
                      cx="${pt.x}" 
                      cy="${pt.y}" 
                      r="${isInterval ? 4.5 : 3}" 
                      class="chart-dot ${isInterval ? "major" : ""}"
                    />
                    ${showTempVal ? `
                      <text 
                        x="${pt.x}" 
                        y="${pt.y - 12}" 
                        class="chart-val-text"
                        text-anchor="middle"
                      >${pt.temp}°</text>
                    ` : ""}

                    ${showHourLabel ? `
                      <text 
                        x="${pt.x}" 
                        y="${height - padBottom + 22}" 
                        class="chart-axis-hour"
                        text-anchor="middle"
                      >${pt.hourLabel}</text>
                    ` : ""}
                  </g>
                `;
              }).join("")}

              <!-- Elementos interactivos para cursor de seguimiento -->
              <g id="chart-tracker" class="chart-tracker hidden">
                <line id="tracker-line" x1="0" y1="${padTop - 5}" x2="0" y2="${height - padBottom}" class="tracker-line" />
                <circle id="tracker-circle" cx="0" cy="0" r="7" class="tracker-circle" />
              </g>
            </svg>

            <!-- Tooltip dinámico -->
            <div id="chart-floating-tooltip" class="chart-tooltip hidden" role="tooltip"></div>
          </div>
        </div>

        <div class="hourly-cards-reel" role="region" aria-label="Tarjetas detalladas por hora">
          ${hours.slice(0, 12).map((item, i) => {
            const wInfo = getWeatherInterpretation(item.weatherCode, 1);
            return `
              <div class="hourly-reel-card">
                <span class="reel-hour">${formatHour(item.time)}</span>
                <div class="reel-icon" title="${escapeHtml(wInfo.label)}">
                  ${getIcon(wInfo.icon, "reel-svg")}
                </div>
                <span class="reel-temp">${formatTempString(item.temperature, unit)}</span>
                <span class="reel-precip" title="Probabilidad de lluvia">
                  <span class="precip-icon">${SVG_ICONS.drizzle}</span>
                  ${item.precipitationProbability}%
                </span>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    `;

    this.bindChartInteraction();
  }

  /**
   * Genera el atributo SVG 'd' con curvas Bézier cúbicas entre puntos.
   */
  generateSmoothPath(points) {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      // Cálculo de puntos de control Catmull-Rom a Bézier
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }

    return d;
  }

  bindChartInteraction() {
    const svg = this.container.querySelector("#hourly-svg-chart");
    const tracker = this.container.querySelector("#chart-tracker");
    const trackerLine = this.container.querySelector("#tracker-line");
    const trackerCircle = this.container.querySelector("#tracker-circle");
    const tooltip = this.container.querySelector("#chart-floating-tooltip");

    if (!svg || !tracker || !tooltip) return;

    const onPointerMove = (e) => {
      const rect = svg.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      if (clientX === undefined) return;

      const svgX = ((clientX - rect.left) / rect.width) * 860;

      // Buscar el punto más cercano en el eje X
      let closestIdx = 0;
      let minDiff = Infinity;
      this.pointsData.forEach((pt, idx) => {
        const diff = Math.abs(pt.x - svgX);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      const pt = this.pointsData[closestIdx];
      if (!pt) return;

      // Actualizar tracker
      tracker.classList.remove("hidden");
      trackerLine.setAttribute("x1", pt.x);
      trackerLine.setAttribute("x2", pt.x);
      trackerCircle.setAttribute("cx", pt.x);
      trackerCircle.setAttribute("cy", pt.y);

      // Posicionar tooltip relativo al contenedor del gráfico
      const percentX = (pt.x / 860) * 100;
      const percentY = (pt.y / 220) * 100;

      const activeUnit = appState.getState().unit;
      const unitSym = activeUnit === "fahrenheit" ? "°F" : "°C";

      tooltip.innerHTML = `
        <div class="tooltip-time">
          <span>${SVG_ICONS.clock}</span>
          <strong>${escapeHtml(pt.hourLabel)}</strong>
        </div>
        <div class="tooltip-temp">${pt.temp}${unitSym} · ${escapeHtml(pt.weather.label)}</div>
        <div class="tooltip-sub">
          <span>${SVG_ICONS.drizzle}</span>
          <span>Lluvia: ${pt.item.precipitationProbability}%</span>
        </div>
      `;

      tooltip.style.left = `${percentX}%`;
      tooltip.style.top = `${Math.max(10, percentY - 25)}%`;
      tooltip.classList.remove("hidden");
    };

    const onPointerLeave = () => {
      tracker.classList.add("hidden");
      tooltip.classList.add("hidden");
    };

    svg.addEventListener("mousemove", onPointerMove);
    svg.addEventListener("mouseleave", onPointerLeave);
    svg.addEventListener("touchmove", onPointerMove, { passive: true });
    svg.addEventListener("touchend", onPointerLeave);
  }
}
