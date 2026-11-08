import { ESTADOS } from '../data/estados.js'

// Clase CSS que cambia el aspecto del pin según el estado del reporte,
// para que cada cambio de estado se vea en el mapa:
//   Recibido          → pin--pulso      (late: requiere atención)
//   Validado          → (normal)
//   Unidad despachada → pin--despachado (borde morado)
//   Cerrado/Descartado→ pin--apagado    (gris y tenue)
export function clasesDePin(estado) {
  switch (estado) {
    case ESTADOS.RECIBIDO:
      return 'pin--pulso'
    case ESTADOS.DESPACHADO:
      return 'pin--despachado'
    case ESTADOS.CERRADO:
    case ESTADOS.DESCARTADO:
      return 'pin--apagado'
    default:
      return ''
  }
}

// Solo los casos CERRADOS llevan el sello verde de "verificado" en la esquina del pin
export const tieneSello = (estado) => estado === ESTADOS.CERRADO

// Sello de verificado: estrella verde con una palomita blanca (SVG propio, sin imágenes)
const SELLO_SVG =
  '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">' +
  '<polygon points="13.38,0.58 14.86,3.26 17.64,1.98 17.99,5.02 21.05,4.90 20.21,7.84 23.08,8.90 21.17,11.30 23.42,13.38 20.74,14.86 22.02,17.64 18.98,17.99 19.10,21.05 16.16,20.21 15.10,23.08 12.70,21.17 10.62,23.42 9.14,20.74 6.36,22.02 6.01,18.98 2.95,19.10 3.79,16.16 0.92,15.10 2.83,12.70 0.58,10.62 3.26,9.14 1.98,6.36 5.02,6.01 4.90,2.95 7.84,3.79 8.90,0.92 11.30,2.83" fill="#16a34a" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>' +
  '<path d="M7.3 12.3l3.2 3.8 6.2-8.2" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
  '</svg>'

// HTML del pin (función pura: se puede probar sin Leaflet).
// Devuelve el HTML y el tamaño del pin; crearIcono (iconos.js) los usa para el divIcon.
export function htmlDelPin(color, { seleccionado = false, clases = '', sello = false } = {}) {
  const tam = seleccionado ? 34 : 26
  const tamSello = Math.round(tam * 0.8)
  const pin = `<div class="pin ${seleccionado ? 'pin--seleccionado' : ''} ${clases}" style="--color:${color}; width:${tam}px; height:${tam}px"></div>`
  // El sello va APARTE del pin (no dentro): así no hereda el gris, la opacidad ni la rotación
  const selloHtml = sello
    ? `<span class="pin-sello" title="Caso cerrado" style="width:${tamSello}px; height:${tamSello}px">${SELLO_SVG}</span>`
    : ''
  return { html: pin + selloHtml, tam }
}
