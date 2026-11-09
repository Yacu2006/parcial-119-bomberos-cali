import { useState } from 'react'
import { GRUPOS, colorDeGrupo } from '../../data/grupos.js'
import { ESTADOS, UNIDADES } from '../../data/estados.js'
import { MENSAJES_INFO } from '../../data/solicitudes.js'
import { useReportes } from '../../context/ReportesContext.jsx'
import EstadoBadge from '../EstadoBadge.jsx'
import { formatearFecha } from './ListaReportes.jsx'

// Detalle de UN reporte con las acciones del radio operador.
// Los botones solo se activan cuando el estado del reporte lo permite:
//   Validar / Descartar → solo si está Recibido
//   Despachar           → solo si está Validado (y se eligió una unidad)
//   Cerrar caso         → solo si tiene unidad despachada
//   Solicitar más info  → solo en casos abiertos y sin una solicitud pendiente
// (El Context vuelve a comprobarlo, por si alguna pantalla se equivoca.)
export default function DetalleReporte({ reporte: r, onVolver }) {
  const { validarReporte, descartarReporte, despacharReporte, cerrarReporte, solicitarInformacion } = useReportes()

  const [grupo, setGrupo] = useState(String(r.grupo)) // grupo que el operador puede corregir
  const [unidad, setUnidad] = useState('') // unidad elegida para despachar
  const [mensajeInfo, setMensajeInfo] = useState(MENSAJES_INFO[0]) // aviso que se enviará al ciudadano

  const puedeValidar = r.estado === ESTADOS.RECIBIDO
  const puedeDespachar = r.estado === ESTADOS.VALIDADO
  const puedeCerrar = r.estado === ESTADOS.DESPACHADO
  const abierto = r.estado !== ESTADOS.CERRADO && r.estado !== ESTADOS.DESCARTADO
  const info = r.infoSolicitada // { mensaje, solicitadoEn, vistoEn } o undefined
  const infoPendiente = Boolean(info) && !info.vistoEn // ya se pidió y el ciudadano aún no lo vio
  const nombreGrupo = GRUPOS.find((g) => g.codigo === r.grupo)?.nombre

  return (
    <article className="op-detalle" aria-labelledby="titulo-detalle">
      <button type="button" className="op-volver" onClick={onVolver}>
        ← Volver a la lista
      </button>

      <header className="op-detalle__cab">
        <h2 id="titulo-detalle">Reporte {r.radicado}</h2>
        <EstadoBadge estado={r.estado} />
      </header>

      <dl className="op-datos">
        <div>
          <dt>Ciudadano</dt>
          <dd>
            {r.nombres} {r.apellidos}
          </dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd>{r.telefono}</dd>
        </div>
        <div>
          <dt>Recibido</dt>
          <dd>{formatearFecha(r.creadoEn)}</dd>
        </div>
        <div>
          <dt>Grupo</dt>
          <dd>
            <span className="punto" style={{ background: colorDeGrupo(r.grupo) }} />
            {r.grupo} · {nombreGrupo}
          </dd>
        </div>
        <div className="op-datos__ancho">
          <dt>¿Qué ve?</dt>
          <dd>{r.queVe}</dd>
        </div>
        <div className="op-datos__ancho">
          <dt>Ubicación</dt>
          <dd>
            {r.direccion}, {r.barrio}
            <br />
            Referencia: {r.referencia}
            {r.edificio && r.edificio !== 'No aplica' && <> · Edificio: {r.edificio}</>}
          </dd>
        </div>
        {r.unidad && (
          <div>
            <dt>Unidad despachada</dt>
            <dd>{r.unidad}</dd>
          </div>
        )}
      </dl>

      <a
        className="op-enlace"
        href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}
        target="_blank"
        rel="noreferrer"
      >
        Ver en Google Maps ↗
      </a>

      {r.fotos?.length > 0 ? (
        <ul className="op-fotos" aria-label="Fotos del ciudadano">
          {r.fotos.map((url, i) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer" title="Abrir foto en grande">
                <img src={url} alt={`Foto ${i + 1} del reporte ${r.radicado}`} />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="op-nota">Sin fotos adjuntas.</p>
      )}

      {/* 1) Contactar y validar */}
      <section className="op-accion">
        <h3>1. Contactar y validar</h3>
        <a className="boton boton--secundario" href={`tel:${r.telefono}`}>
          Llamar al {r.telefono}
        </a>
        <label className="op-campo">
          Grupo (puedes corregirlo al validar)
          <select
            className="campo__control"
            value={puedeValidar ? grupo : String(r.grupo)}
            onChange={(e) => setGrupo(e.target.value)}
            disabled={!puedeValidar}
          >
            {GRUPOS.map((g) => (
              <option key={g.codigo} value={g.codigo}>
                {g.codigo} · {g.nombre}
              </option>
            ))}
          </select>
        </label>
        <div className="op-botones">
          <button
            type="button"
            className="boton boton--principal"
            disabled={!puedeValidar}
            onClick={() => validarReporte(r.id, Number(grupo))}
          >
            Validar
          </button>
          <button
            type="button"
            className="boton boton--secundario"
            disabled={!puedeValidar}
            onClick={() => descartarReporte(r.id)}
          >
            Descartar (falso o duplicado)
          </button>
        </div>
      </section>

      {/* Más información: el aviso aparece en la pantalla del ciudadano */}
      <section className="op-accion">
        <h3>Más información (opcional)</h3>
        <label className="op-campo">
          Mensaje para el ciudadano
          <select
            className="campo__control"
            value={mensajeInfo}
            onChange={(e) => setMensajeInfo(e.target.value)}
            disabled={!abierto || infoPendiente}
          >
            {MENSAJES_INFO.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="boton boton--secundario"
          disabled={!abierto || infoPendiente}
          onClick={() => solicitarInformacion(r.id, mensajeInfo)}
        >
          Solicitar más información
        </button>
        {info && (
          <p className="op-nota">
            {infoPendiente
              ? `Solicitado (${formatearFecha(info.solicitadoEn)}): el ciudadano aún no ha visto el aviso.`
              : `El ciudadano vio el aviso (${formatearFecha(info.vistoEn)}).`}
          </p>
        )}
        {!abierto && !info && <p className="op-nota">Este caso ya está finalizado.</p>}
      </section>

      {/* 2) Despachar: solo en casos validados */}
      <section className="op-accion">
        <h3>2. Despachar</h3>
        <label className="op-campo">
          Unidad
          <select
            className="campo__control"
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            disabled={!puedeDespachar}
          >
            <option value="">Selecciona…</option>
            {UNIDADES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="boton boton--principal"
          disabled={!puedeDespachar || !unidad}
          onClick={() => despacharReporte(r.id, unidad)}
        >
          Despachar unidad
        </button>
        {!puedeDespachar && !r.unidad && (
          <p className="op-nota">Disponible cuando el reporte esté validado.</p>
        )}
      </section>

      {/* 3) Cierre */}
      <section className="op-accion">
        <h3>3. Cierre</h3>
        <button
          type="button"
          className="boton boton--secundario"
          disabled={!puedeCerrar}
          onClick={() => cerrarReporte(r.id)}
        >
          Cerrar caso
        </button>
        {!puedeCerrar && (
          <p className="op-nota">
            {r.estado === ESTADOS.CERRADO || r.estado === ESTADOS.DESCARTADO
              ? 'Este caso ya está finalizado.'
              : 'Disponible cuando haya una unidad despachada.'}
          </p>
        )}
      </section>
    </article>
  )
}
