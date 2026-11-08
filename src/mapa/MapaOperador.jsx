import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './mapa.css'
import { crearIcono } from './iconos.js'
import { GRUPOS, colorDeGrupo } from '../data/grupos.js'
import { clasesDePin } from './estiloPin.js'
import EstadoBadge from '../components/EstadoBadge.jsx'

const CENTRO_CALI = [3.437, -76.522]

// Mapa REAL de Cali (OpenStreetMap a través de Leaflet). No necesita API key.
// Props:
//   reportes: los reportes del estado global (id, grupo, lat, lng, estado, barrio, nombres, queVe…)
//   seleccionadoId: id del reporte seleccionado (o null)
//   onSeleccionar: (id) => void
export default function MapaOperador({ reportes = [], seleccionadoId = null, onSeleccionar }) {
  const seleccionado = reportes.find((r) => r.id === seleccionadoId)

  return (
    <MapContainer center={CENTRO_CALI} zoom={13} style={{ width: '100%', height: '100%' }}>
      {/* Dos estilos de mapa: el operador los cambia con el control de la esquina */}
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Calles (OpenStreetMap)">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Oscuro (centro de control)">
          {/* Mismo mapa de OpenStreetMap, oscurecido con un filtro CSS (.tiles-oscuro): no requiere API key */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="tiles-oscuro"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {reportes.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={crearIcono(colorDeGrupo(r.grupo), {
            seleccionado: r.id === seleccionadoId,
            clases: clasesDePin(r.estado), // pulso, despachado o apagado según el estado
          })}
          zIndexOffset={r.id === seleccionadoId ? 1000 : 0} // el seleccionado queda encima
          eventHandlers={{ click: () => onSeleccionar?.(r.id) }}
        >
          <Popup>
            <strong>
              {r.nombres} {r.apellidos}
            </strong>
            <br />
            {r.grupo} · {GRUPOS.find((g) => g.codigo === r.grupo)?.nombre}
            <br />
            <em>«{r.queVe}»</em>
            <br />
            {r.barrio} · <EstadoBadge estado={r.estado} />
          </Popup>
        </Marker>
      ))}

      <IrAlSeleccionado reporte={seleccionado} />
      <Leyenda reportes={reportes} />
    </MapContainer>
  )
}

// Cuando se selecciona un reporte (desde la lista o el mapa), el mapa vuela hasta él.
// El efecto depende del id y de las coordenadas (no del objeto completo): así, cuando
// el operador valida o despacha, el reporte cambia de estado pero el mapa NO vuela otra vez.
function IrAlSeleccionado({ reporte }) {
  const map = useMap()
  const id = reporte?.id
  const lat = reporte?.lat
  const lng = reporte?.lng
  useEffect(() => {
    if (id) map.flyTo([lat, lng], 16, { duration: 0.8 })
  }, [id, lat, lng, map])
  return null
}

// Leyenda fija en la esquina inferior izquierda: color y conteo por grupo.
function Leyenda({ reportes }) {
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leyenda">
        <div style={{ fontWeight: 700, marginBottom: 6 }}>REPORTES · {reportes.length}</div>
        {GRUPOS.map((g) => {
          const n = reportes.filter((r) => r.grupo === g.codigo).length
          return (
            <div key={g.codigo} className="leyenda__fila" style={{ opacity: n ? 1 : 0.45 }}>
              <span className="leyenda__punto" style={{ background: g.color }} />
              <span style={{ width: 28, color: '#94a3b8' }}>{g.codigo}</span>
              <span style={{ flex: 1 }}>{g.nombre}</span>
              <strong>{n}</strong>
            </div>
          )
        })}
      </div>
    </div>
  )
}
