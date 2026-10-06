# Nimbus - Aplicacion Meteorologica Profesional

Aplicacion web meteorologica en tiempo real con arquitectura limpia basada en Separacion de Responsabilidades (SoC), gestion reactiva del estado, consumo asincrono de APIs abiertas y diseno sin emojis.

---

## Caracteristicas Principales

### Funcionalidades Base
- **Busqueda de Ciudades**: Resolucion global de ciudades con geocodificacion abierta.
- **Condicion y Temperatura Actual**: Tarjeta principal con icono vectorial SVG tematico, sensacion termica, humedad, viento y rango termico.
- **Pronostico Extendido**: Desglose diario para 7 dias con barras relativas de amplitud termica.
- **Estados de Interfaz Cuidados**:
  - Estado Vacio (*Empty State*) con bienvenida y acceso rapido a capitales mundiales.
  - Estado de Carga (*Skeleton Loaders*) con efecto de brillo progresivo (*shimmer*).
  - Estado de Error (*Error State*) descriptivo con diagnostico y boton de reintento.

### Funcionalidades Avanzadas
- **Buscador con Debounce y Sugerencias**: Retardo de 380 ms que optimiza el consumo de red y evita sobrecargas. Soporte completo para navegacion por teclado (Flecha Arriba, Flecha Abajo, Enter, Escape).
- **Geolocalizacion con Tolerancia a Fallos**: Deteccion automatica de ubicacion del usuario (`navigator.geolocation`) con geocodificacion inversa y manejo exhaustivo de permisos denegados o timeouts.
- **Conmutador de Unidades (°C / °F)**: Alternancia instantanea entre grados Celsius y Fahrenheit persistida en el navegador.
- **Ciudades Favoritas**: Marcado de ciudades destacadas con estrella dorada, chips de acceso inmediato y sincronizacion en `localStorage`.
- **Grafico Horario Interactivo (24h)**: Curva continua de temperatura generada matematicamente con Splines Bezier sobre SVG nativo, con linea guia y tooltip flotante interactivo.
- **Fondo y Temas Dinamicos**: Paletas cromaticas reactivas a la condicion atmosferica (despejado, nubes, lluvia, tormenta, nieve, niebla) y al ciclo solar (dia/noche).
- **Modo Claro y Oscuro**: Soporte para alternar entre Modo Oscuro y Modo Claro con paleta adaptada, alto contraste, transiciones fluidas y persistencia automatica.
- **Diseno Responsivo Equilibrado**: Distribucion 2x2 en pantallas de escritorio y flujo vertical fluido en tablet y moviles, con tipografia fluida mediante `clamp()`.
- **Estricta Politica Sin Emojis**: Catalogo de iconos vectoriales SVG de 24x24 px limpios y consistentes en cualquier dispositivo.

---

## Estructura del Proyecto

```
APP_CLIMAS/
|-- index.html                       Punto de entrada HTML5
|-- server.js                        Servidor local HTTP de pruebas
|-- assets/
|   |-- css/                         Hojas de estilo modulares (Tokens, Base, Layout, Componentes, Temas)
|   |-- icons/                       Catalogo vectorial SVG y favicon oficial
|-- js/
|   |-- app.js                       Punto de arranque e inicializacion pura (Bootstrap)
|   |-- controllers/                 Controladores de flujo asincrono (WeatherController)
|   |-- config/                      Configuracion de APIs y mapeo OMM (WMO)
|   |-- services/                    Servicios de red, GPS, temas y almacenamiento local
|   |-- state/                       Estado centralizado reactivo (Patron Observador)
|   |-- components/                  Componentes de interfaz de usuario desacoplados
|   |-- utils/                       Utilidades (splines SVG, navegacion teclado, debounce, unidades)
|-- docs/
    |-- ARQUITECTURA.md              Diseno arquitectonico detallado y flujo de datos
    |-- TECNOLOGIAS.md               Pila tecnologica y terminos de Open-Meteo
    |-- APRENDIZAJE.md               Lecciones tecnicas y resolucion de desafios
```

---

## Documentacion Detallada

Para profundizar en el diseno y las decisiones tecnicas, consulta la carpeta `docs/`:

1. [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md): Explicacion de la arquitectura de software, desacoplamiento, patron Observador y cancelacion de peticiones con `AbortController`.
2. [docs/TECNOLOGIAS.md](docs/TECNOLOGIAS.md): Detalle de APIs (Open-Meteo Forecast, Geocoding, BigDataCloud), APIs del navegador y condiciones de uso/atribucion.
3. [docs/APRENDIZAJE.md](docs/APRENDIZAJE.md): Reflexion sobre los retos de asincronia, manejo de errores en geolocalizacion, persistencia defensiva y graficado matematico en SVG.

---

## Ejecucion Local

Para ejecutar el proyecto localmente sin dependencias externas:

```bash
node server.js
```

Abre tu navegador en `http://localhost:8085`.
