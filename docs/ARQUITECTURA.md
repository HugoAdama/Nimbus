# Arquitectura del Proyecto Nimbus

## 1. Principio Fundamental: Separacion de Responsabilidades (SoC)

La arquitectura de Nimbus esta fundamentada en la division estricta de responsabilidades (*Separation of Concerns* y *Single Responsibility Principle*). Cada capa y modulo del sistema tiene una unica razon para cambiar y no asume tareas que corresponden a otros niveles de abstraccion.

```
                  +-----------------------------------+
                  |         index.html (Vista)        |
                  +-----------------------------------+
                                    |
                  +-----------------------------------+
                  |      app.js (Bootstrap / Init)    |
                  +-----------------------------------+
                     /              |               \
   +--------------------+  +------------------+  +--------------------+
   |  Componentes (UI)  |  |  Controladores   |  |  ThemeService      |
   | - HeaderBar        |  | WeatherController|  |  (Modo y Ambient.) |
   | - SearchAuto       |  +------------------+  +--------------------+
   | - CurrentWeather   |           |                      |
   | - HourlyChart      |  +------------------+            |
   | - DailyForecast    |  |  AppState (State)|            |
   | - WeatherMetrics   |  |  Patron Pub-Sub  |<-----------+
   | - FavoritesBar     |  +------------------+
   | - FeedbackView     |           |
   +--------------------+  +--------------------+
                           | Servicios (APIs)   |
                           | - WeatherService   |
                           | - GeocodingService |
                           | - GeolocationServ  |
                           | - StorageService   |
                           +--------------------+
                                    |
                           +--------------------+
                           |   APIs Externas    |
                           | - Open-Meteo       |
                           | - BigDataCloud     |
                           +--------------------+
```

---

## 2. Estructura de Directorios

```
APP_CLIMAS/
|-- index.html                       Punto de entrada HTML5 semantico
|-- server.js                        Servidor local HTTP de pruebas
|-- assets/
|   |-- css/
|   |   |-- variables.css            Tokens de diseno y paleta cromatica (alto contraste)
|   |   |-- base.css                 Reset y tipografia base
|   |   |-- layout.css               Contenedores y grilla responsiva equilibrada 2x2
|   |   |-- components.css           Master import de componentes
|   |   |-- components/              Hojas de estilo modulares por componente (SoC)
|   |   |   |-- header.css           Cabecera, selector de unidades y conmutador de tema
|   |   |   |-- search.css           Buscador, input y dropdown de sugerencias
|   |   |   |-- favorites.css        Chips interactivos de favoritos
|   |   |   |-- current-weather.css  Tarjeta hero de clima actual y pastillas termicas
|   |   |   |-- hourly-chart.css     Grafico horario de 24h y tira horizontal
|   |   |   |-- daily-forecast.css   Pronostico de 7 dias y barras termicas
|   |   |   |-- weather-metrics.css  Metricas atmosfericas detalladas y ciclo solar
|   |   |   |-- feedback.css         Vistas de estado vacio, carga y error
|   |   |-- weather-themes.css       Temas ambientales segun clima y ciclo solar
|   |   |-- animations.css           Transiciones fluidas y animaciones
|   |-- icons/
|       |-- favicon.svg              Icono vectorial oficial de aplicacion y favicon
|       |-- weather-icons.js         Catalogo vectorial SVG (estricto sin emojis)
|-- js/
|   |-- app.js                       Punto de arranque e inicializacion pura (Bootstrap)
|   |-- controllers/                 Capa de coordinacion de flujos asincronos
|   |   |-- weather.controller.js    Manejo de consultas climáticas, GPS y cancelaciones
|   |-- config/
|   |   |-- api.config.js            Endpoints y parametros de configuracion
|   |   |-- wmo-codes.js             Mapeo estandar de codigos OMM (WMO)
|   |-- services/
|   |   |-- theme.service.js         Gestion de tema claro/oscuro y clases atmosfericas
|   |   |-- weather.service.js       Consumo y normalizacion de Open-Meteo Forecast
|   |   |-- geocoding.service.js     Busqueda de ciudades con cancelacion activa
|   |   |-- geolocation.service.js   Manejo de GPS del navegador y geocodificacion inversa
|   |   |-- storage.service.js       Persistencia tolerante a fallos en localStorage
|   |-- utils/
|   |   |-- svg-curve.js             Calculo matematico de splines Bezier para SVG
|   |   |-- keyboard-nav.js          Navegacion accesible por teclado en listas
|   |   |-- debounce.js              Manejador de retardo temporal con cancelacion
|   |   |-- units.js                 Conversiones Celsius/Fahrenheit y viento
|   |   |-- formatters.js            Formateo de fechas, horas y cardinales en espanol
|   |   |-- dom.js                   Funciones auxiliares para manipulacion del DOM
|   |-- state/
|   |   |-- app-state.js             Estado reactivo central con patron Observador
|   |-- components/
|       |-- header-bar.js            Cabecera, selector de unidades y boton GPS
|       |-- search-autocomplete.js   Buscador interactivo con teclado y debounce
|       |-- favorites-bar.js         Chips de ciudades favoritas
|       |-- current-weather.js       Tarjeta principal con ambientacion climatica
|       |-- hourly-chart.js          Grafico SVG con curvas Bezier y cursor flotante
|       |-- daily-forecast.js        Pronostico de 7 dias con barras de rango termico
|       |-- weather-metrics.js       Metricas de presion, UV, humedad y ciclo solar
|       |-- feedback-view.js         Estados de vacio, carga esqueletica y errores
|-- docs/
    |-- ARQUITECTURA.md              Documento actual de diseno arquitectonico
    |-- TECNOLOGIAS.md               Detalle de herramientas, protocolos y APIs
    |-- APRENDIZAJE.md               Lecciones tecnicas y resolucion de desafios
```

---

## 3. Capas del Sistema y Descripcion de Modulos

### 3.1. Capa de Inicializacion (`js/app.js`)
Actúa como punto de arranque (*Bootstrap*). No almacena lógica de negocio ni manipula directamente estilos visuales. Su responsabilidad se limita a:
1. Inicializar el servicio de temas (`themeService.init()`).
2. Instanciar los componentes de la interfaz pasando las referencias al DOM.
3. Conectar las interacciones de los componentes con los métodos de `weatherController`.
4. Ordenar a `weatherController` la restauración de la sesión inicial.

### 3.2. Capa de Controladores (`js/controllers/`)
Coordina los casos de uso y flujos asíncronos que conectan servicios, estado y acciones de usuario:
- **`weather.controller.js`**:
  - Controla la cancelación activa de peticiones concurrentes con `AbortController`.
  - Orquesta el flujo completo de geolocalización: GPS → Geocodificación Inversa → Consulta Meteorológica → Actualización de Estado.
  - Gestiona el mecanismo de reintento (`retryLastAction`).
  - Restaura la última ciudad almacenada en `storageService` o activa el estado de bienvenida.

### 3.3. Capa de Servicios (`js/services/`)
Los servicios no tienen contacto directo con la interfaz de usuario ni con el DOM de componentes específicos:
- **`theme.service.js`**: Centraliza la aplicación de temas en el DOM (`data-theme-mode`, `mode-light`, `mode-dark`) y mapea los códigos WMO al ciclo día/noche y temas dinámicos (`theme-clear`, `theme-clouds`, `theme-rain`, etc.).
- **`weather.service.js`**: Realiza peticiones a la API Open-Meteo Forecast. Transforma la respuesta cruda de arrays paralelos en un modelo orientado a dominio limpio (`current`, `hourly`, `daily`).
- **`geocoding.service.js`**: Interactua con Open-Meteo Geocoding con soporte para `AbortController`.
- **`geolocation.service.js`**: Encapsula `navigator.geolocation.getCurrentPosition` en promesas puras y maneja errores de permiso y timeout.
- **`storage.service.js`**: Administra la persistencia en `localStorage` con lectura/escritura defensiva.

### 3.4. Capa de Estado (`js/state/app-state.js`)
Implementa el patrón **Observador (Pub-Sub)**:
- Mantiene una única fuente de la verdad (*Single Source of Truth*).
- Los componentes se suscriben mediante `appState.subscribe(listener)`.
- Retorna copias inmutables del estado con `getState()`, previniendo mutaciones laterales accidentales.

### 3.5. Capa de Presentación (`js/components/`)
Cada componente es una clase independiente con su propio ciclo de vida (`constructor`, `render`, `bindEvents`, `subscribe`). No realiza llamadas directas a APIs de red; delega las acciones al controlador.

### 3.6. Capa de Utilidades (`js/utils/`)
Funciones puras y especializadas sin estado mutable:
- **`svg-curve.js`**: Algoritmo matemático para generación de splines Bézier cúbicos Catmull-Rom sobre SVG nativo.
- **`keyboard-nav.js`**: Lógica de navegación circular por teclado y gestión de accesibilidad ARIA en colecciones de elementos.
- **`debounce.js`**: Retardo parametrizable con cancelación explícita.
- **`units.js`**: Cálculos matemáticos de conversión Celsius/Fahrenheit y viento.
- **`formatters.js`**: Formateo de fechas, horas y rumbos cardinales en español.
- **`dom.js`**: Escape seguro de cadenas HTML contra vulnerabilidades XSS.

---

## 4. Beneficios de la Modularizacion Realizada

1. **Alta Cohesion**: Cada módulo resuelve un único problema bien delimitado.
2. **Bajo Acoplamiento**: Los componentes no conocen cómo se obtienen los datos; los servicios no conocen cómo se renderiza el HTML.
3. **Testabilidad Aislada**: Los algoritmos matemáticos (`svg-curve.js`, `keyboard-nav.js`) y controladores pueden ser probados de forma unitaria en Node.js sin emular un navegador completo.
4. **Mantenibilidad CSS**: Al dividir `components.css` en 8 hojas específicas por componente, la edición de estilos es inmediata y no produce efectos colaterales en otros elementos.
