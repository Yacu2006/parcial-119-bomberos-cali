import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GRUPOS, colorDeGrupo } from '../data/grupos.js'
import { BARRIOS } from '../data/barrios.js'
import { useReportes } from '../context/ReportesContext.jsx'
import { validarReporte } from '../utils/validarReporte.js'
import Campo from '../components/Campo.jsx'
import SubidorFotos from '../components/SubidorFotos.jsx'
import ConfirmacionReporte from '../components/ConfirmacionReporte.jsx'
import './reportar.css'

// Estado inicial del formulario: todos los campos vacíos
const VACIO = {
  nombres: '',
  apellidos: '',
  telefono: '',
  grupo: '',
  queVe: '',
  direccion: '',
  barrio: '',
  referencia: '',
  edificio: '',
  edificioNoAplica: false,
}

// Opciones de las listas desplegables (se calculan una sola vez)
const OPCIONES_GRUPO = GRUPOS.map((g) => ({ valor: String(g.codigo), texto: `${g.codigo} · ${g.nombre}` }))
const OPCIONES_BARRIO = [...BARRIOS]
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  .map((b) => ({ valor: b.nombre, texto: b.nombre }))

// Pantalla 2: reporte del ciudadano.
// Si el ciudadano ya envió un reporte (miReporte), muestra su confirmación y estado;
// si no, muestra el formulario.
export default function Reportar() {
  const { miReporte, agregarReporte, nuevoReporte } = useReportes()

  const [datos, setDatos] = useState(VACIO) // valores de los campos (formulario controlado)
  const [tocado, setTocado] = useState({}) // campos que el usuario ya visitó
  const [fotos, setFotos] = useState([]) // [{ id, url, nombre }]

  // Errores calculados en cada render a partir de los datos actuales
  const errores = validarReporte(datos)
  const cantidadErrores = Object.keys(errores).length
  const esValido = cantidadErrores === 0

  // Al salir de la página, libera las miniaturas que no se enviaron
  const fotosRef = useRef(fotos)
  fotosRef.current = fotos
  useEffect(() => () => fotosRef.current.forEach((f) => URL.revokeObjectURL(f.url)), [])

  // Al enviar el reporte, sube al inicio para ver la confirmación
  useEffect(() => {
    if (miReporte) window.scrollTo(0, 0)
  }, [miReporte?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Un solo manejador para todos los campos: usa el atributo `name` de cada uno
  const cambiar = (evento) => {
    const { name, value, type, checked } = evento.target
    setDatos((anterior) => {
      if (type === 'checkbox') {
        // "No aplica" limpia el nombre del edificio
        return { ...anterior, [name]: checked, ...(checked ? { edificio: '' } : {}) }
      }
      if (name === 'telefono') {
        // Solo números y máximo 10 dígitos: lo demás se descarta al escribir
        return { ...anterior, telefono: value.replace(/\D/g, '').slice(0, 10) }
      }
      return { ...anterior, [name]: value }
    })
  }

  // Marca el campo como visitado (los errores se muestran al salir del campo)
  const salir = (evento) => setTocado((anterior) => ({ ...anterior, [evento.target.name]: true }))

  const enviar = (evento) => {
    evento.preventDefault()
    if (!esValido) return // el botón ya está desactivado, pero por seguridad
    agregarReporte({
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      telefono: datos.telefono,
      grupo: Number(datos.grupo),
      queVe: datos.queVe.trim(),
      direccion: datos.direccion.trim(),
      barrio: datos.barrio,
      referencia: datos.referencia.trim(),
      edificio: datos.edificioNoAplica ? 'No aplica' : datos.edificio.trim(),
      fotos: fotos.map((f) => f.url), // las URL pasan al reporte; el formulario se vacía sin liberarlas
    })
    setDatos(VACIO)
    setTocado({})
    setFotos([])
  }

  // Props comunes de cada campo: valor, eventos y error (solo si ya fue visitado)
  const propsDe = (nombre) => ({
    nombre,
    value: datos[nombre],
    onChange: cambiar,
    onBlur: salir,
    error: tocado[nombre] ? errores[nombre] : undefined,
  })

  return (
    <main className="rep">
      <header className="rep__cabecera">
        <Link to="/">← Inicio</Link>
        <p className="rep__marca">Línea 119 · Bomberos Cali</p>
        <h1>Reportar emergencia</h1>
      </header>

      {miReporte ? (
        <ConfirmacionReporte reporte={miReporte} onNuevo={nuevoReporte} />
      ) : (
        <form className="rep__form" onSubmit={enviar} noValidate>
          <p className="rep__aviso">
            Prototipo académico. En una emergencia real, llama al <a href="tel:119">119</a>. Los campos con{' '}
            <strong>*</strong> son obligatorios.
          </p>

          <fieldset>
            <legend>1. Tus datos</legend>
            <div className="rep__fila">
              <Campo etiqueta="Nombres" autoComplete="given-name" {...propsDe('nombres')} />
              <Campo etiqueta="Apellidos" autoComplete="family-name" {...propsDe('apellidos')} />
            </div>
            <Campo
              etiqueta="Teléfono"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="3001234567"
              ayuda="10 dígitos, solo números."
              {...propsDe('telefono')}
            />
          </fieldset>

          <fieldset>
            <legend>2. La emergencia</legend>
            <div className="campo--grupo">
              <Campo
                etiqueta="Grupo de emergencia"
                tipo="select"
                opciones={OPCIONES_GRUPO}
                {...propsDe('grupo')}
              />
              {datos.grupo && (
                <span
                  className="punto punto--grande"
                  style={{ background: colorDeGrupo(Number(datos.grupo)) }}
                  title="Color del grupo en el mapa"
                />
              )}
            </div>
            <Campo
              etiqueta="¿Qué ve?"
              tipo="textarea"
              placeholder="Describe lo que está pasando"
              {...propsDe('queVe')}
            />
          </fieldset>

          <fieldset>
            <legend>3. ¿Dónde es?</legend>
            <Campo etiqueta="Dirección" autoComplete="street-address" placeholder="Ej: Calle 5 # 10-20" {...propsDe('direccion')} />
            <Campo etiqueta="Barrio" tipo="select" opciones={OPCIONES_BARRIO} {...propsDe('barrio')} />
            <Campo etiqueta="Punto de referencia" placeholder="Ej: frente a la panadería" {...propsDe('referencia')} />
            <Campo
              etiqueta="Nombre del edificio"
              disabled={datos.edificioNoAplica}
              {...propsDe('edificio')}
            />
            <label className="rep__check">
              <input
                type="checkbox"
                name="edificioNoAplica"
                checked={datos.edificioNoAplica}
                onChange={cambiar}
              />
              No aplica (no es un edificio)
            </label>
          </fieldset>

          <fieldset>
            <legend>4. Fotos</legend>
            <SubidorFotos fotos={fotos} onChange={setFotos} max={3} />
          </fieldset>

          <div className="rep__enviar">
            <button type="submit" className="boton boton--principal" disabled={!esValido}>
              Enviar reporte
            </button>
            {!esValido && (
              <small className="campo__ayuda">
                Faltan {cantidadErrores} {cantidadErrores === 1 ? 'campo obligatorio' : 'campos obligatorios'} por completar.
              </small>
            )}
          </div>
        </form>
      )}
    </main>
  )
}
