# Tecnologias Utilizadas y Especificaciones Tecnicas

Este documento detalla la pila tecnologica, las APIs publicas integradas y las condiciones legales de servicio aplicadas en el desarrollo de Nimbus.

---

## 1. Pila Tecnologica Principal

### 1.1. HTML5 Semantico
- Marcado estructurado segun estandares del W3C (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- Accesibilidad nativa con atributos ARIA (`role="listbox"`, `role="option"`, `aria-expanded`, `aria-label`, `aria-busy`).
- Etiquetas meta para optimizacion en motores de busqueda (SEO) y tarjetas sociales (Open Graph).

### 1.2. Vanilla CSS3 y Sistema de Diseno Moderno
- **Variables CSS (Design Tokens)**: Control centralizado de colores, radios de curvatura, sombras de profundidad y tiempos de transicion.
- **Glassmorphism**: Uso de `backdrop-filter: blur(16px)` combinado con fondos translucidos en capas (`rgba`) para lograr una estetica de profundidad.
- **CSS Grid y Flexbox Avanzado**: Disposicion fluida y responsiva sin necesidad de frameworks monoliticos como Tailwind o Bootstrap.
- **Micro-interacciones y Animaciones**: Declaracion de keyframes para efectos de esqueleto (*shimmer*), rotaciones lineales (*spin*), y transiciones de tema ambiental.

### 1.3. JavaScript Moderno (ES6+ / ES Modules)
- **Modulos Nativos (`import` / `export`)**: Organizacion del codigo en componentes, servicios, estado y utilidades sin necesidad de transpiladores (Webpack, Rollup, Babel).
- **Asincronia Pura**: Empleo de `async` / `await` para flujos asincronos legibles y gestion de excepciones mediante `try / catch`.
- **Cancelacion de Solicitudes HTTP**: Integracion nativa de `AbortController` y `AbortSignal`.
- **Patron Observador**: Implementacion manual de suscripcion a eventos de estado sin librerias externas.

---

## 2. APIs Externas y Servicios de Datos

### 2.1. Open-Meteo Weather Forecast API
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Metodo**: `GET`
- **Descripcion**: Proveedor de pronosticos meteorologicos globales de alta precision basado en modelos numericos de prediccion (DWD ICON, NOAA GFS, ECMWF).
- **Variables consultadas**:
  - `current`: temperatura a 2m, humedad relativa, sensacion termica, dia/noche, codigo WMO, velocidad y direccion del viento, presion superficial.
  - `hourly`: temperatura horaria, probabilidad de precipitacion, codigo climatico.
  - `daily`: temperaturas maximas y minimas, acumulado de precipitacion, amanecer, atardecer, indice UV maximo.
- **Condiciones de uso y licencia**:
  - Gratuita para uso no comercial y de investigacion.
  - No requiere clave de API (*API Key*), lo que simplifica la ejecucion local sin comprometer secretos en el cliente.
  - Licencia de datos: **Creative Commons Attribution 4.0 International (CC BY 4.0)**.
  - Requisito legal de uso: Atribucion explicita a Open-Meteo en la interfaz de usuario (incorporada en el pie de pagina de la aplicacion).

### 2.2. Open-Meteo Geocoding API
- **Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`
- **Metodo**: `GET`
- **Descripcion**: Servicio de busqueda y resolucion espacial de nombres de ciudades a coordenadas geograficas (latitud, longitud, pais, division administrativa).
- **Optimizacion**: Filtrado por idioma espanol (`language=es`) y limite de resultados para garantizar respuestas de baja latencia.

### 2.3. BigDataCloud Reverse Geocoding Client API
- **Endpoint**: `https://api.bigdatacloud.net/data/reverse-geocode-client`
- **Metodo**: `GET`
- **Descripcion**: Servicio de geocodificacion inversa ligero, disenado para aplicaciones cliente, que convierte coordenadas GPS obtenidas del navegador en nombres legibles de municipios o ciudades sin requerir claves de autenticacion.

---

## 3. APIs Nativas de la Plataforma Web (Browser APIs)

| API | Proposito en Nimbus |
| :--- | :--- |
| **Geolocation API** | Obtencion de coordenadas fisicas del dispositivo mediante `navigator.geolocation.getCurrentPosition`. |
| **Web Storage API** | Persistencia en disco local (`localStorage`) de la unidad preferida (°C/°F) y de las ciudades favoritas del usuario. |
| **Fetch API** | Comunicacion HTTP asincrona basada en promesas para consumir endpoints REST JSON. |
| **AbortController API** | Cancelacion activa de peticiones HTTP en vuelo para prevenir condiciones de carrera. |

---

## 4. Motor de Renderizado Grafico e Iconografia

- **Grafico SVG Dinamico (24 horas)**: Calculo matematico de curvas spline Catmull-Rom a Bezier cubicas (`C cp1x cp1y, cp2x cp2y, x y`) sobre un `viewBox` escalable. Relleno con gradiente lineal y cursor interactivo sincronizado con puntero o eventos tactiles.
- **Catalogo de Iconos Vectoriales (Zero Emojis)**: Creacion de un archivo de iconos en formato SVG puro (`weather-icons.js`) con coordenadas exactas de 24x24 px, asegurando una apariencia profesional, neutral y libre de variaciones visuales segun el sistema operativo del usuario.
