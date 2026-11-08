import { Link } from 'react-router-dom'
import { GRUPOS, colorDeGrupo } from '../data/grupos.js'
import { ESTADOS } from '../data/estados.js'
import EstadoBadge from './EstadoBadge.jsx'

const PASOS = [ESTADOS.RECIBIDO, ESTADOS.VALIDADO, ESTADOS.DESPACHADO, ESTADOS.CERRADO]

// Texto que ve el ciudadano según el estado de su reporte
function mensajeDe(reporte) {
  switch (reporte.estado) {
    case ESTADOS.RECIBIDO:
      return 'Tu reporte fue recibido. Un radio operador lo revisará y podría llamarte al número que registraste.'
    case ESTADOS.VALIDADO:
      return 'Un radio operador verificó tu reporte.'
    case ESTADOS.DESPACHADO:
      return `Se despachó una unidad (${reporte.unidad}) hacia el lugar.`
    case ESTADOS.CERRADO:
      return 'El caso fue cerrado. Gracias por reportar.'
    case ESTADOS.DESCARTADO:
      return 'El operador descartó este reporte (falso o duplicado).'
    default:
      return ''
  }
}

const formatear = (iso) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

// Pantalla de confirmación: respuesta automática con radicado, hora y estado.
// `reporte` viene del Context, así que cuando el operador cambia el estado
// esta pantalla se actualiza sola.
export default function ConfirmacionReporte({ reporte, onNuevo }) {
  const grupo = GRUPOS.find((g) => g.codigo === reporte.grupo)
  const descartado = reporte.estado === ESTADOS.DESCARTADO
  const indice = PASOS.indexOf(reporte.estado)

  return (
    <section className="confirmacion" aria-live="polite">
      <p className="confirmacion__ok">✔ Reporte recibido</p>
      <h2>Radicado {reporte.radicado}</h2>

      <dl className="confirmacion__datos">
        <div>
          <dt>Hora de recepción</dt>
          <dd>{formatear(reporte.creadoEn)}</dd>
        </div>
        <div>
          <dt>Estado actual</dt>
          <dd>
            <EstadoBadge estado={reporte.estado} />
          </dd>
        </div>
        <div>
          <dt>Grupo</dt>
          <dd>
            <span className="punto" style={{ background: colorDeGrupo(reporte.grupo) }} />
            {reporte.grupo} · {grupo?.nombre}
          </dd>
        </div>
        <div>
          <dt>Ubicación</dt>
          <dd>
            {reporte.direccion}, {reporte.barrio}
          </dd>
        </div>
        {reporte.actualizadoEn !== reporte.creadoEn && (
          <div>
            <dt>Última actualización</dt>
            <dd>{formatear(reporte.actualizadoEn)}</dd>
          </div>
        )}
      </dl>

      <p className="confirmacion__mensaje">{mensajeDe(reporte)}</p>

      {!descartado && (
        <ol className="pasos" aria-label="Progreso del reporte">
          {PASOS.map((paso, i) => (
            <li key={paso} className={i < indice ? 'hecho' : i === indice ? 'actual' : ''}>
              {paso}
            </li>
          ))}
        </ol>
      )}

      <p className="confirmacion__nota">
        Esta pantalla se actualiza cuando el operador cambia el estado.
      </p>

      <div className="confirmacion__acciones">
        <button type="button" className="boton boton--secundario" onClick={onNuevo}>
          Hacer otro reporte
        </button>
        <Link to="/" className="boton boton--secundario">
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}
