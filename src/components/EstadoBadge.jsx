import { COLOR_ESTADO } from '../data/estados.js'

// Etiqueta de color con el estado de un reporte (la reutilizan el ciudadano y el operador)
export default function EstadoBadge({ estado }) {
  return (
    <span className="badge" style={{ '--color': COLOR_ESTADO[estado] ?? '#475569' }}>
      {estado}
    </span>
  )
}
