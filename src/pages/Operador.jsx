import { useState } from 'react'
import { Link } from 'react-router-dom'
import MapaOperador from '../mapa/MapaOperador.jsx'
import { BARRIOS } from '../data/barrios.js'
import { GRUPOS } from '../data/grupos.js'
import { useReportes } from '../context/ReportesContext.jsx'

const azar = (lista) => lista[Math.floor(Math.random() * lista.length)]

export default function Operador() {
  // Los reportes ya NO son de prueba: vienen del estado global (Context)
  const { reportes, agregarReporte, limpiarReportes } = useReportes()
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const seleccionado = reportes.find((r) => r.id === seleccionadoId)

  // TEMPORAL: crea un reporte ficticio para probar el estado global.
  // Se elimina cuando exista el formulario de /reportar.
  const crearDePrueba = () =>
    agregarReporte({
      nombres: 'Prueba',
      apellidos: 'Ficticio',
      telefono: '3000000000',
      grupo: azar(GRUPOS).codigo,
      queVe: 'Reporte de prueba',
      direccion: 'Calle 1 # 1-1',
      barrio: azar(BARRIOS).nombre,
      referencia: 'Sin referencia',
      edificio: 'No aplica',
    })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: '100vh' }}>
      <MapaOperador
        reportes={reportes}
        seleccionadoId={seleccionadoId}
        onSeleccionar={setSeleccionadoId}
      />
      <aside style={{ padding: 16, background: '#0f172a', color: '#e2e8f0', overflowY: 'auto', borderLeft: '1px solid #1e293b' }}>
        <h2>Radio operador</h2>

        {/* TEMPORAL: botones de prueba del estado global */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button onClick={crearDePrueba}>+ Reporte de prueba</button>
          <button onClick={limpiarReportes}>Borrar todos</button>
        </div>

        {/* Lista mínima: al hacer clic, el mapa vuela al reporte.
            TODO (estudiantes): lista completa, detalle, llamar/validar y despacho. */}
        {reportes.length === 0 && <p style={{ color: '#94a3b8' }}>Aún no hay reportes.</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {reportes.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => setSeleccionadoId(r.id)}
                style={{
                  width: '100%', textAlign: 'left', margin: '4px 0', padding: '8px 10px', borderRadius: 8,
                  border: '1px solid #334155', cursor: 'pointer', color: '#e2e8f0',
                  background: r.id === seleccionadoId ? '#1e3a5f' : '#111827',
                }}
              >
                #{r.radicado} · {r.grupo} · {r.barrio}
                <br />
                <small style={{ color: '#94a3b8' }}>{r.estado}</small>
              </button>
            </li>
          ))}
        </ul>
        {seleccionado && <p>Seleccionado: reporte #{seleccionado.radicado}</p>}
        <Link to="/" style={{ color: '#7dd3fc' }}>Volver a la landing</Link>
      </aside>
    </div>
  )
}
