import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { BARRIOS } from '../data/barrios.js'
import { ESTADOS, UNIDADES } from '../data/estados.js'

// ─────────────────────────────────────────────────────────────────────────────
// ESTADO GLOBAL DE LOS REPORTES
//
// Idea: en vez de que cada pantalla tenga su propia lista de reportes, hay UNA
// sola lista, guardada aquí. Las tres pantallas la leen y la modifican a través
// de este Context:
//   /reportar  → agregarReporte(...)
//   /operador  → validarReporte / descartarReporte / despacharReporte / cerrarReporte
//   ciudadano  → lee el reporte para ver su estado actualizado
//
// El Context NO dibuja nada: solo guarda datos y ofrece funciones para cambiarlos.
// ─────────────────────────────────────────────────────────────────────────────

const CLAVE = 'bomberos119:reportes' // nombre con el que se guarda en localStorage

// 1) El "contenedor" del Context. Vale null hasta que un Provider lo llene.
const ReportesContext = createContext(null)

// Lee los reportes guardados. Si no hay nada, o el texto está dañado, empieza vacío.
function cargarReportes() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE))
    if (!Array.isArray(guardado)) return []
    // Descarta datos incompletos para que el mapa nunca reciba un reporte sin coordenadas
    return guardado
      .filter((r) => r && r.id && Number.isFinite(r.lat) && Number.isFinite(r.lng))
      .map((r) => ({ ...r, fotos: [] })) // las fotos no se guardan (ver guardarReportes)
  } catch {
    return []
  }
}

// Guarda los reportes. OJO con las fotos: son URL temporales creadas con
// URL.createObjectURL y dejan de existir al recargar la página; guardarlas en
// localStorage solo dejaría enlaces rotos. Por eso se guardan sin fotos.
function guardarReportes(reportes) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(reportes.map((r) => ({ ...r, fotos: [] }))))
  } catch {
    // localStorage lleno o bloqueado: la app sigue funcionando, solo sin persistencia
  }
}

// 2) El Provider: envuelve la app y reparte el estado a todos sus hijos.
export function ReportesProvider({ children }) {
  // useState con una FUNCIÓN: React la ejecuta una sola vez, al crear el componente
  const [reportes, setReportes] = useState(cargarReportes)

  // Cada vez que cambia la lista, se guarda en localStorage
  useEffect(() => {
    guardarReportes(reportes)
  }, [reportes])

  // Actualiza UN reporte, pero solo si está en un estado permitido.
  // Así se respeta el flujo (p. ej. no se puede despachar algo sin validar)
  // aunque alguna pantalla se equivoque y llame a la función en mal momento.
  const actualizar = (id, estadosPermitidos, cambios) => {
    setReportes((anteriores) =>
      anteriores.map((r) =>
        r.id === id && estadosPermitidos.includes(r.estado)
          ? { ...r, ...cambios, actualizadoEn: new Date().toISOString() }
          : r
      )
    )
  }

  // Todo lo que las pantallas pueden usar, agrupado en un objeto.
  // useMemo evita recrearlo en cada render si la lista no cambió.
  const valor = useMemo(
    () => ({
      reportes,

      // Ciudadano: crea un reporte nuevo. Recibe los datos del formulario y
      // devuelve el reporte creado (con su radicado) para mostrar la confirmación.
      agregarReporte: (datos) => {
        const id = reportes.reduce((max, r) => Math.max(max, r.id), 0) + 1
        const barrio = BARRIOS.find((b) => b.nombre === datos.barrio)
        const ahora = new Date().toISOString()
        const nuevo = {
          ...datos,
          id,
          radicado: `119-${String(id).padStart(4, '0')}`, // ej: 119-0007
          lat: barrio?.lat ?? datos.lat,
          lng: barrio?.lng ?? datos.lng,
          fotos: datos.fotos ?? [],
          estado: ESTADOS.RECIBIDO,
          unidad: null,
          creadoEn: ahora,
          actualizadoEn: ahora,
        }
        setReportes((anteriores) => [...anteriores, nuevo])
        return nuevo
      },

      // Operador: Recibido → Validado (puede corregir el grupo)
      validarReporte: (id, grupo) =>
        actualizar(id, [ESTADOS.RECIBIDO], {
          estado: ESTADOS.VALIDADO,
          ...(grupo ? { grupo } : {}),
        }),

      // Operador: Recibido → Descartado (falso o duplicado)
      descartarReporte: (id) => actualizar(id, [ESTADOS.RECIBIDO], { estado: ESTADOS.DESCARTADO }),

      // Operador: Validado → Unidad despachada (solo si ya fue validado)
      despacharReporte: (id, unidad) => {
        if (!UNIDADES.includes(unidad)) return
        actualizar(id, [ESTADOS.VALIDADO], { estado: ESTADOS.DESPACHADO, unidad })
      },

      // Operador: Unidad despachada → Cerrado
      cerrarReporte: (id) => actualizar(id, [ESTADOS.DESPACHADO], { estado: ESTADOS.CERRADO }),

      // Para pruebas y demostraciones: borra todos los reportes
      limpiarReportes: () => setReportes([]),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reportes]
  )

  return <ReportesContext.Provider value={valor}>{children}</ReportesContext.Provider>
}

// 3) Hook propio: las pantallas escriben `useReportes()` en vez de `useContext(...)`.
// Además avisa con un error claro si se olvidó envolver la app con el Provider.
export function useReportes() {
  const contexto = useContext(ReportesContext)
  if (!contexto) throw new Error('useReportes debe usarse dentro de <ReportesProvider>')
  return contexto
}
