# Línea 119 · Bomberos Cali — Prototipo web

Parcial final de **Desarrollo Web** · Universidad de San Buenaventura, Cali · Ingeniería Multimedia.

Prototipo de un canal digital para la **línea 119 del Cuerpo de Bomberos Voluntarios de Cali (Colombia)**: el ciudadano reporta una emergencia desde el navegador (con fotos y barrio) y el radio operador lo ve en un mapa real de Cali, la valida y despacha una unidad. El ciudadano ve cómo cambia el estado de su reporte.

## Integrantes

| Nombre | Código |
| --- | --- |
| _(Camilo Yacumal Girón)_ | _(30000128513)_ |

## Enlaces

- **Sitio desplegado:** _(https://parcial-119-bomberos-cali.vercel.app/)_
- **Repositorio:** _(https://github.com/Yacu2006/parcial-119-bomberos-cali)_

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173`.

## Cómo probar el flujo completo

1. En landing, pulsar **Reportar emergencia**.
2. En `/reportar`, llenar el formulario y enviar (todos los campos son obligatorios, el botón de enviar solo se activa cuando están completos). Aparece la confirmación con el radicado (`119-0001`) y el estado **Recibido**.
3. Ir a `/operador` (enlace «Acceso radio operador» en el pie de la landing). El reporte aparece en la lista y como pin pulsante en el mapa.
4. Abrir el reporte → **Validar** (se puede corregir el grupo) → elegir unidad → **Despachar unidad** → **Cerrar caso**. En cada paso el pin cambia: pulso (Recibido), normal (Validado), borde morado (Despachado), gris con sello verde (Cerrado).
5. Volver a `/reportar`: el ciudadano ve el estado actualizado de su reporte.

Todo corre en el navegador (sin backend): el estado se comparte entre pantallas con Context y se guarda en `localStorage`, así que `/reportar` y `/operador` deben abrirse **en el mismo navegador**. El botón «Reiniciar demostración» del operador borra todo.

## Las tres pantallas

| Ruta | Pantalla | Qué hace |
| --- | --- | --- |
| `/` | Landing | Título, botón **Reportar emergencia** (visible sin scroll), **Llamar al 119** (`tel:119`), escena 3D, tarjetas de los 7 grupos y enlace al operador en el pie |
| `/reportar` | Ciudadano | Formulario controlado con validación, hasta 3 fotos con miniaturas, confirmación con radicado y estado en vivo |
| `/operador` | Radio operador | Mapa real (Leaflet + OpenStreetMap), lista y detalle del reporte, validar / descartar / despachar / cerrar |

## Decisiones técnicas

**Estado global (`src/context/ReportesContext.jsx`).** Una sola lista de reportes vive en un Context y las tres pantallas la usan con el hook `useReportes()`. Cada cambio se guarda en `localStorage`. El Context también protege el flujo de estados: `Recibido → Validado → Unidad despachada → Cerrado` (o `Descartado` desde Recibido). Una función como `despacharReporte` solo actúa si el reporte está en el estado anterior correcto, así que **no se puede despachar sin validar** aunque una pantalla se equivoque.

**Formulario (`src/pages/Reportar.jsx`).** Campos controlados, una función pura de validación (`src/utils/validarReporte.js`) que se recalcula en cada render, errores que aparecen al salir de cada campo y botón de envío desactivado mientras falte algo. El teléfono acepta solo 10 dígitos.

**Mapa (`src/mapa/`).** react-leaflet con teselas de OpenStreetMap (sin API key). Un pin por reporte, con el color de su grupo y un estilo según el estado; popup con nombre, grupo, qué ve, barrio y estado; vuelo al reporte seleccionado; leyenda con conteo por grupo. Las coordenadas salen del barrio elegido (`src/data/barrios.js`).

**Escena 3D (`src/three/`).** Un camión de bomberos armado con geometrías básicas de React Three Fiber (cajas, cilindros y esferas; sin modelos externos).
- `useFrame`: el camión gira suavemente hacia el puntero del mouse, «respira» en reposo y, con la sirena encendida, vibra, gira las ruedas y alterna las balizas roja y azul.
- Interacción: al pasar el mouse (`onPointerOver`) el camión crece y brilla; al hacer click (`onClick`) se enciende o apaga la sirena. Un botón HTML hace lo mismo para celular y teclado.
- No se usó `OrbitControls` para no bloquear el scroll en pantallas táctiles.

**Estilos.** CSS propio, responsive (la landing pasa de tres columnas a una al estrechar la pantalla).

## Respuestas a las 5 preguntas de Bomberos

### 1. ¿Puede llegarle al radio operador un mapa con la ubicación exacta a partir de las coordenadas del ciudadano?

**Qué se hizo.** Cada reporte guarda `lat` y `lng` y el operador lo ve como un pin en un mapa real de Cali. El detalle incluye un enlace a Google Maps con esas coordenadas. Las coordenadas son las **del barrio elegido** (aproximadas).

### 2. ¿Puede el ciudadano recibir una respuesta automática para saber que su reporte fue recibido?

**Qué se hizo.** Al enviar, el ciudadano ve una confirmación con el **radicado** (`119-000N`) y el estado del reporte, que se actualiza cuando el operador lo valida, despacha o cierra.

**Qué se puede mejorar.** Que se envíe la confirmación por un canal real (SMS, WhatsApp o correo).

### 3. ¿Qué pasa si hay una emergencia de gran magnitud y llegan reportes masivos?

**Qué se hizo.** El tablero ordena los reportes del más reciente al más antiguo, indica cuántos están **por atender** y marca con pulso en el mapa los que están en estado Recibido. No se probó con volúmenes grandes.

**Qué falta.** Base de datos, paginación y filtros por grupo, estado y zona, agrupar pines cercanos, detectar reportes duplicados del mismo incidente y priorizar por grupo.

### 4. ¿Puede el radio operador, si lo decide, hacer una videollamada al ciudadano?

**No está implementado** El operador puede llamar con el enlace `tel:` del teléfono del ciudadano, que aparece en el detalle del reporte.

**Qué se puede implementar.** Un botón «Solicitar videollamada» que genere una sala y envíe el enlace al ciudadano; consentimiento explícito, manejo de mala conexión y política sobre grabación y privacidad.

### 5. ¿Se pueden enviar varias fotos o videos, con recomendaciones de cómo tomarlos?

**Qué se tiene.** Hasta **3 fotos** con miniaturas (`<input type="file" multiple accept="image/*">`), con opción de quitarlas y una recomendación: tomar la foto desde lejos y de frente al incidente, solo si es seguro. Las fotos se ven en el detalle del operador. Se previsualizan con `URL.createObjectURL` y **no se suben a ningún servidor**, por eso no se conservan al recargar la página. No hay video.

**Qué falta.** Almacenamiento real de archivos (object storage), videos cortos, compresión y límite de peso en el navegador, validación en el servidor, más recomendaciones de captura (varias tomas, mantener distancia, no entrar a zonas de riesgo) y una política de retención de las imágenes.

## Sobre las preguntas del protocolo de despacho

Según el cliente, una foto, un video o una videollamada permiten omitir muchas preguntas del protocolo. En este prototipo **todos los campos del formulario son obligatorios**, como pide el enunciado, para que el reporte llegue completo al operador. 
Las preguntas más claras de omitir cuando hay foto serían «¿Cuál es su emergencia?» (la foto y «¿qué ve?» la responden) y la parte descriptiva de «¿Dónde es su emergencia?» (punto de referencia y nombre del edificio), en donde se podría llegar a ubicar mediante esta. 
La **dirección** solo podría omitirse si hubiera coordenadas exactas, y el **teléfono** y el **nombre** no se pueden omitir porque son necesarios para contactar a quien reporta.

## Estructura del proyecto

```
src/
├── App.jsx                  Rutas y Provider del estado global
├── context/                 ReportesContext (estado global + reglas de estados)
├── data/                    grupos, barrios y estados
├── pages/                   Landing, Reportar, Operador (+ su CSS)
├── components/              Campo, SubidorFotos, EstadoBadge, ConfirmacionReporte
│   ├── landing/             TarjetaGrupo
│   └── operador/            ListaReportes, DetalleReporte
├── mapa/                    MapaOperador, iconos y estilo de pines (por estado)
├── three/                   EscenaLanding y CamionBomberos (React Three Fiber)
└── utils/                   validarReporte
```

## Despliegue

Desplegado en Vercel. El archivo `vercel.json` redirige todas las rutas a `index.html` para que `/reportar` y `/operador` funcionen al recargar la página o abrirlas directamente (React Router corre en el navegador).

## Limitaciones conocidas

- Sin backend: los datos solo existen en el navegador donde se crearon.
- Las fotos no se guardan al recargar.
- La ubicación del reporte es la del barrio, no la exacta.
- Sin autenticación: cualquiera puede abrir `/operador`.

