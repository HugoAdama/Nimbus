/**
 * Utilidad matemática para generación de curvas SVG (Splines Bézier).
 * Convierte series de datos numéricos en trayectorias continuas y suaves.
 */

/**
 * Genera el atributo SVG 'd' con curvas Bézier cúbicas entre puntos (Catmull-Rom a Bézier).
 * @param {Array<{x: number, y: number}>} points Colección de puntos bidimensionales
 * @returns {string} Comando 'd' para elemento <path> SVG
 */
export function generateCubicBezierPath(points) {
  if (!points || points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    // Cálculo de puntos de control Catmull-Rom convertidos a Bézier cúbico
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}

/**
 * Cierra una curva de línea hacia la base inferior para formar un polígono de área con degradado.
 * @param {string} linePath Comando 'd' de la línea superior
 * @param {Array<{x: number, y: number}>} points
 * @param {number} baselineY Coordenada Y del suelo del gráfico
 * @returns {string} Comando 'd' del área cerrada
 */
export function generateAreaPath(linePath, points, baselineY) {
  if (!linePath || points.length < 2) return "";
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath} L ${last.x.toFixed(2)} ${baselineY.toFixed(2)} L ${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
}
