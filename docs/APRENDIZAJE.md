# Aprendizajes y Lecciones Tecnicas en la Creacion del Proyecto

La construccion de Nimbus ha representado un ejercicio practico intensivo en ingenieria de software frontend, asincronia avanzada, gestion de APIs publicas y diseno de interfaces resilientes. A continuacion se detallan los principales aprendizajes tecnicos adquiridos durante su desarrollo.

---

## 1. Asincronia Avanzada y Resolucion de Condiciones de Carrera (Race Conditions)

### El problema:
En aplicaciones interactivas con autocompletado en tiempo real, las solicitudes HTTP enviadas al servidor no necesariamente responden en el mismo orden en que fueron despachadas debido a variaciones en la latencia de la red. Por ejemplo:
1. El usuario escribe *"Mad"* (se dispara la Peticion 1).
2. Luego escribe *"Madrid"* (se dispara la Peticion 2).
3. Si la Peticion 2 responde en 120 ms y la Peticion 1 responde en 350 ms, la respuesta obsoleta de *"Mad"* sobreescribiria los resultados correctos de *"Madrid"*.

### La solucion aprendida:
El uso conjunto de **Debounce** con **`AbortController`**:
- El debounce introduce una pausa prudencial (380 ms) que espera a que el usuario termine de pulsar teclas antes de emitir trafico de red.
- Si una nueva busqueda se inicia mientras una peticion previa todavia esta en estado pendiente (*in-flight*), el metodo `this.activeController.abort()` cancela la conexion a nivel de sockets del navegador.
- En el bloque `catch`, se captura especificamente el error `AbortError` para ignorarlo silenciosamente, permitiendo que unicamente la peticion mas reciente actualice la interfaz de usuario.

---

## 2. Manejo Integral de la Geolocation API y Sus Excepciones

### El problema:
La geolocalizacion del navegador es una de las APIs que mayor friccion genera con los usuarios, ya que requiere consentimiento explicito y depende del hardware del dispositivo. Un manejo deficiente deja al usuario frente a una interfaz bloqueada o sin explicacion cuando el permiso es rechazado.

### La solucion aprendida:
- Envolver la funcion tradicional de callbacks `navigator.geolocation.getCurrentPosition` en una Promesa nativa para poder utilizar la sintaxis moderna `async / await`.
- Desglosar los codigos de error numericos de la especificacion W3C:
  - **Codigo 1 (`PERMISSION_DENIED`)**: El usuario rechazo explicitamente la solicitud. Se presenta un mensaje explicativo indicando que la aplicacion continuara funcionando normalmente mediante la busqueda manual de ciudades.
  - **Codigo 2 (`POSITION_UNAVAILABLE`)**: Falla de cobertura o antenas GPS.
  - **Codigo 3 (`TIMEOUT`)**: Se agotaron los 10 segundos configurados como limite de espera.
- Implementar **geocodificacion inversa** para transformar coordenadas brutas (latitud y longitud) en un nombre legible de localidad y pais, enriqueciendo sustancialmente la experiencia visual.

---

## 3. Diseno Intencional de los Cuatro Estados de la Interfaz

### El problema:
Muchos desarrollos frontend solo consideran el *Happy Path* (estado de exito con datos cargados), descuidando la experiencia durante los momentos de transicion o fallo de red.

### La solucion aprendida:
Implementar un componente dedicado (`FeedbackViewComponent`) que modela formalmente una maquina de estados finita:
1. **Estado Vacio (*Empty State*)**: Antes de que el usuario busque nada, la pantalla no queda desierta; ofrece una bienvenida visual clara, la opcion directa de geolocalizarse y pildoras con sugerencias de capitales mundiales para probar la aplicacion con un solo clic.
2. **Estado de Carga (*Skeleton Loading State*)**: En lugar de un spinner flotante en una pantalla blanca que produce saltos de diseno (*Cumulative Layout Shift*), se despliegan tarjetas de silueta con animacion de brillo (*shimmer*) que replican exactamente las dimensiones de los componentes finales.
3. **Estado de Error (*Error State*)**: Ante un fallo en la red o cuando una ciudad no existe en los registros, se muestra un panel explicativo con diagnostico, recomendaciones y botones de accion para reintentar o regresar al inicio.
4. **Estado de Exito (*Success State*)**: Los datos se presentan en tarjetas de alto contraste con ambientacion de fondo reactiva a la condicion climatica.

---

## 4. Persistencia Tolerante a Fallos en Almacenamiento Local

### El problema:
Invocar directamente `localStorage.setItem()` o `getItem()` sin proteccion puede provocar caidas fatales en la aplicacion en escenarios como:
- Navegacion privada o modo incognito estricto donde el almacenamiento esta deshabilitado por politicas del navegador.
- Almacenamiento con cuota saturada.
- Datos previamente guardados corruptos que no cumplen con la estructura JSON esperada.

### La solucion aprendida:
Construir un `StorageService` defensivo:
- Todos los accesos a disco estan protegidos con bloques `try / catch`.
- Los valores leidos se validan contra esquemas permitidos (por ejemplo, verificando que la unidad leida sea estrictamente `"celsius"` o `"fahrenheit"`).
- Si `localStorage` falla, el servicio emite una advertencia limpia en consola y recurre de manera transparente a los valores por defecto sin interrumpir la ejecucion de la aplicacion.

---

## 5. Graficado Matematico en SVG Nativo sin Dependencias

### El problema:
Incorporar librerias externas pesadas para un unico grafico de 24 horas incrementa el peso del paquete de la aplicacion, anade dependencias de mantenimiento y reduce el control sobre la estetica.

### La solucion aprendida:
Desarrollar un generador matematico de curvas spline en SVG puro:
- Conversion de una coleccion de puntos temporales en coordenadas relativas sobre un espacio virtual `viewBox="0 0 860 220"`.
- Implementacion de interpolacion de curvas cubicas Bezier (`C cp1x cp1y, cp2x cp2y, x y`) a partir de derivadas de Catmull-Rom para garantizar que la linea de temperatura fluya sin quiebres abruptos.
- Renderizado de una capa de relleno con gradiente vertical (`<linearGradient>`) que se desvanece hacia la base.
- Deteccion de puntero y eventos tactiles para proyectar una linea guia vertical y un circulo de rastreo sincronizados con un tooltip flotante informativo.

---

## 6. Disciplina de Diseno Profesional: Erradicacion Total de Emojis

### El problema:
Es comun en tutoriales basicos recurrir a emojis de caracteres Unicode para representar el sol, la lluvia o el termometro. Sin embargo, los emojis presentan graves deficiencias en entornos de calidad profesional:
- Se renderizan de forma dispar e inconsistente entre Windows, macOS, Android e iOS.
- No permiten transicion cromatica, escalado vectorial nitido ni integracion con las variables de color del tema CSS.
- Restan seriedad y apariencia ejecutiva a la aplicacion.

### La solucion aprendida:
- Disenar un catalogo vectorial propio (`SVG_ICONS` en `assets/icons/weather-icons.js`) basado en vectores de 24x24 px con trazos uniformes (`stroke-width: 2`, `stroke-linecap: round`).
- Vincular la interpretacion de codigos de la OMM (WMO Weather Codes) a pares de iconos de dia y noche.
- El uso de la propiedad CSS `stroke: currentColor` permite que cada icono adopte dinamicamente el color del contenedor o tema activo con fidelidad absoluta.
