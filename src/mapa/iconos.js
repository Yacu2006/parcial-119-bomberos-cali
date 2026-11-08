import L from 'leaflet'
import { htmlDelPin } from './estiloPin.js'

// Crea el ícono (pin) de un reporte con el color de su grupo.
// Usa HTML + CSS (clases en mapa.css), así no hace falta ninguna imagen.
// Opciones: seleccionado (más grande y con brillo), clases (según el estado)
// y sello (true en casos cerrados: muestra el verificado verde).
export function crearIcono(color, opciones = {}) {
  const { html, tam } = htmlDelPin(color, opciones)
  return L.divIcon({
    className: '', // quita el estilo por defecto de Leaflet
    html,
    iconSize: [tam, tam],
    iconAnchor: [tam / 2, tam], // la punta del pin queda sobre la coordenada
    popupAnchor: [0, -tam],
  })
}
