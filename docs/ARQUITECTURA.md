# Arquitectura del Proyecto Nimbus

## 1. Principio Fundamental: Separacion de Responsabilidades (SoC)

La arquitectura de Nimbus esta fundamentada en la division estricta de responsabilidades (*Separation of Concerns*). Cada capa y modulo del sistema tiene una unica razon para cambiar y no asume tareas que corresponden a otros niveles de abstraccion.

```
                  +-----------------------------------+
                  |         index.html (Vista)        |
                  +-----------------------------------+
                                    |
                  +-----------------------------------+
                  |      app.js (Orquestador Central) |
                  +-----------------------------------+
                     /              |               \
   +--------------------+  +------------------+  +--------------------+
   |  Componentes (UI)  |  |  AppState (State)|  | Servicios (APIs)   |
   | - HeaderBar        |  |  Patron Pub-Sub  |  | - WeatherService   |
   | - SearchAuto       |  |  Flujo Unidir.   |  | - GeocodingService |
   | - CurrentWeather   |  +------------------+  | - GeolocationServ  |
   | - HourlyChart      |                        | - StorageService   |
   | - DailyForecast    |                        +--------------------+
   | - WeatherMetrics   |                                   |
   | - FavoritesBar     |                        +--------------------+
   | - FeedbackView     |                        |   APIs Externas    |
   +--------------------+                        | - Open-Meteo       |
                                                 | - BigDataCloud     |
                                                 +--------------------+
```

---

## 2. Estructura de Directorios

```
APP_CLIMAS/
|-- index.html                       Punto de entrada HTML5 semantico
|-- assets/
|   |-- css/
|   |   |-- variables.css            Tokens de diseno y paleta cromatica
|   |   |-- base.css                 Reset y tipografia base
|   |   |-- layout.css               Contenedores y grilla responsiva
|   |   |-- components.css           Master import de componentes
|   |   |-- components/              Hojas de estilo modulares por componente (SoC)
|   |   |   |-- header.css           Cabecera y controles
|   |   |   |-- search.css           Buscador y sugerencias dropdown
|   |   |   |-- favorites.css        Chips de favoritos
|   |   |   |-- current-weather.css  Tarjeta hero de clima actual
|   |   |   |-- hourly-chart.css     Grafico de 24h y tira horizontal
|   |   |   |-- daily-forecast.css   Pronostico de 7 dias y barras termicas
|   |   |   |-- weather-metrics.css  Metricas atmosfericas detalladas
|   |   |   |-- feedback.css         Vistas de estado vacio, carga y error
|   |   |-- weather-themes.css       Temas ambientales segun clima y ciclo solar
|   |   |-- animations.css           Transiciones y animaciones fluidas
|   |-- icons/
|       |-- favicon.svg              Icono oficial de aplicacion y favicon
|       |-- weather-icons.js         Catalogo vectorial SVG (sin emojis)
|-- js/
|   |-- app.js                       Punto de montaje e inicializacion
|   |-- config/
|   |   |-- api.config.js            Endpoints y parametros de configuracion
|   |   |-- wmo-codes.js             Mapeo estandar de codigos OMM (WMO)
|   |-- services/
|   |   |-- weather.service.js       Consumo y normalizacion de Open-Meteo Forecast
|   |   |-- geocoding.service.js     Busqueda de ciudades con cancelacion activa
|   |   |-- geolocation.service.js   Manejo de GPS del navegador y geocodificacion inversa
|   |   |-- storage.service.js       Persistencia tolerante a fallos en localStorage
|   |-- utils/
|   |   |-- svg-curve.js             Calculo matematico de splines Bezier para SVG
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

### 3.1. Capa de Servicios (`js/services/`)
Los servicios no tienen contacto directo con la interfaz de usuario ni con el DOM. Su unico proposito es gestionar la entrada/salida de datos y comunicarse con fuentes externas.

- **`weather.service.js`**: Realiza peticiones a la API Open-Meteo Forecast. Transforma la respuesta cruda de arrays paralelos en un modelo orientado a dominio limpio (`current`, `hourly`, `daily`).
- **`geocoding.service.js`**: Interactua con Open-Meteo Geocoding. Incorpora `AbortController` para abortar peticiones previas cuando el usuario escribe a gran velocidad.
- **`geolocation.service.js`**: Encapsula `navigator.geolocation.getCurrentPosition` en una promesa pura, clasificando los codigos de error del navegador (`PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT`). Incluye fallback para geocodificacion inversa.
- **`storage.service.js`**: Administra la persistencia en `localStorage`. Envuelve todas las lecturas y escrituras en bloques defensivos `try/catch` para evitar caidas si las politicas de privacidad bloquean el almacenamiento local.

### 3.2. Capa de Estado (`js/state/app-state.js`)
Implementa el patron **Observador (Pub-Sub)**:
- Mantiene una unica fuente de la verdad (*Single Source of Truth*).
- Los componentes se suscriben mediante `appState.subscribe(listener)`.
- Cuando ocurre una mutacion (ej. cambio de unidad, carga exitosa de clima, error), el estado notifica a los componentes registrados de manera desacoplada.
- Retorna copias inmutables del estado con `getState()`, previniendo mutaciones laterales accidentales desde la vista.

### 3.3. Capa de Presentacion (`js/components/`)
Cada componente es una clase independiente con su propio ciclo de vida:
- `constructor(container, options)`: Recibe el elemento contenedor del DOM y dependencias/callbacks.
- `render()`: Dibuja el marcado correspondiente a su responsabilidad.
- `bindEvents()`: Registra escuchadores de eventos especificos.
- `subscribe`: Escucha eventos relevantes de `appState` para refrescar exclusivamente su seccion.

### 3.4. Capa de Utilidades (`js/utils/`)
Funciones puras y reutilizables sin estado interno ni efectos secundarios.
- `debounce`: Retardo parametrizable con cancelacion explicita.
- `units`: Calculos matematicos de conversion y escalas meteorologicas.
- `formatters`: Localizacion linguistica al espanol sin depender de librerias pesadas.

---

## 4. Control de Concurrencia y Resiliencia

Uno de los mayores desafios en aplicaciones dependientes de red son las **condiciones de carrera (*race conditions*)**:
1. **Debounce + AbortController**: Cuando el usuario escribe rapidamente en el buscador, el debounce retrasa la llamada 380 ms. Si aun asi una peticion previa esta en vuelo al enviar una nueva, `geocodingService.abort()` cancela la peticion anterior a nivel de red, garantizando que un resultado desactualizado nunca sobreescriba un resultado nuevo.
2. **Normalizacion y Tipado Defensivo**: Todo consumo de JSON cuenta con valores por defecto (*nullish coalescing `??`* y encadenamiento opcional `?.`), evitando errores de referencia `undefined`.
