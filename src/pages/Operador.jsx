import { useState } from 'react'
import { Link } from 'react-router-dom'
import MapaOperador from '../mapa/MapaOperador.jsx'
import ListaReportes from '../components/operador/ListaReportes.jsx'
import DetalleReporte from '../components/operador/DetalleReporte.jsx'
import { useReportes } from '../context/ReportesContext.jsx'
import './reportar.css' // reutiliza .boton, .badge, .punto y .campo__control
import './operador.css'

// Pantalla 3: tablero del radio operador.
// Mapa a la izquierda; a la derecha, la lista de reportes o el detalle del seleccionado.
// Los reportes vienen del estado global: lo que el ciudadano envía aparece aquí,
// y lo que el operador cambia lo ve el ciudadano.
export default function Operador() {
  const { reportes, limpiarReportes } = useReportes()
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const seleccionado = reportes.find((r) => r.id === seleccionadoId) ?? null

  const reiniciar = () => {
    if (window.confirm('¿Borrar todos los reportes de la demostración?')) {
      limpiarReportes()
      setSeleccionadoId(null)
    }
  }

  return (
    <div className="op">
      <div className="op__mapa">
        <MapaOperador reportes={reportes} seleccionadoId={seleccionadoId} onSeleccionar={setSeleccionadoId} />
      </div>

      <aside className="op__panel">
        <header className="op__cab">
          <p className="op__marca">Línea 119 · Bomberos Cali</p>
          <h1>Radio operador</h1>
          <nav aria-label="Navegación">
            <Link to="/">Inicio</Link> · <Link to="/reportar">Pantalla del ciudadano</Link>
          </nav>
        </header>

        {seleccionado ? (
          // key: al cambiar de reporte, el detalle empieza con sus selectores limpios
          <DetalleReporte key={seleccionado.id} reporte={seleccionado} onVolver={() => setSeleccionadoId(null)} />
        ) : (
          <ListaReportes reportes={reportes} onSeleccionar={setSeleccionadoId} />
        )}

        {reportes.length > 0 && (
          <button type="button" className="op__reiniciar" onClick={reiniciar}>
            Reiniciar demostración
          </button>
        )}
      </aside>
    </div>
  )
}
