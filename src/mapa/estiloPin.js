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
