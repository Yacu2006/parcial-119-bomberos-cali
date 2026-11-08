import { colorDeGrupo } from '../../data/grupos.js'
import { ESTADOS } from '../../data/estados.js'
import EstadoBadge from '../EstadoBadge.jsx'

export const formatearFecha = (iso) =>
  new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// Lista de reportes: color y código del grupo, hora, barrio y estado.
// Los más recientes primero. Al hacer clic en uno, se avisa con onSeleccionar(id).
export default function ListaReportes({ reportes, onSeleccionar }) {
  const porAtender = reportes.filter((r) => r.estado === ESTADOS.RECIBIDO).length
  const ordenados = [...reportes].sort((a, b) => b.id - a.id)

  if (reportes.length === 0) {
    return (
      <p className="op-vacio">
        Aún no hay reportes. Cuando un ciudadano envíe uno desde la pantalla de reporte, aparecerá aquí y en el mapa.
      </p>
    )
  }

  return (
    <section aria-labelledby="titulo-lista">
      <h2 id="titulo-lista" className="op-subtitulo">
        {reportes.length} {reportes.length === 1 ? 'reporte' : 'reportes'} · {porAtender} por atender
      </h2>
      <ul className="op-lista">
        {ordenados.map((r) => (
          <li key={r.id}>
            <button type="button" className="op-item" onClick={() => onSeleccionar(r.id)}>
              <span className="op-item__grupo" style={{ '--color': colorDeGrupo(r.grupo) }}>
                {r.grupo}
              </span>
              <span className="op-item__texto">
                <strong>{r.barrio}</strong>
                <small>
                  {r.radicado} · {formatearFecha(r.creadoEn)}
                </small>
              </span>
              <EstadoBadge estado={r.estado} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
