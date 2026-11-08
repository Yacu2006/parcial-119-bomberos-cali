import { useState } from 'react'

// Selector de fotos con miniaturas. Es un componente CONTROLADO: la lista de fotos
// vive en la pantalla que lo usa (props `fotos` y `onChange`).
// Cada foto es { id, url, nombre }. La url se crea con URL.createObjectURL: es una
// dirección temporal en el navegador; la imagen NO se sube a ningún servidor.
export default function SubidorFotos({ fotos, onChange, max = 3 }) {
  const [aviso, setAviso] = useState('')
  const lleno = fotos.length >= max

  const alElegir = (evento) => {
    const elegidos = Array.from(evento.target.files)
    const imagenes = elegidos.filter((f) => f.type.startsWith('image/'))
    const cupo = max - fotos.length
    const nuevas = imagenes.slice(0, cupo).map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(f),
      nombre: f.name,
    }))

    if (imagenes.length < elegidos.length) setAviso('Solo se aceptan imágenes.')
    else if (imagenes.length > cupo) setAviso(`Solo caben ${max} fotos; se agregaron las primeras.`)
    else setAviso('')

    onChange([...fotos, ...nuevas])
    evento.target.value = '' // permite volver a elegir el mismo archivo
  }

  const quitar = (foto) => {
    URL.revokeObjectURL(foto.url) // libera la memoria de la miniatura
    onChange(fotos.filter((f) => f.id !== foto.id))
    setAviso('')
  }

  return (
    <div className="fotos">
      <label className={`fotos__boton${lleno ? ' fotos__boton--lleno' : ''}`}>
        {lleno ? `Máximo de fotos alcanzado (${max}/${max})` : `Agregar fotos (${fotos.length}/${max})`}
        <input type="file" accept="image/*" multiple disabled={lleno} onChange={alElegir} />
      </label>
      <small className="campo__ayuda">
        Opcional. Si es seguro hacerlo, toma la foto desde lejos y de frente al incidente.
      </small>
      {aviso && (
        <small className="campo__error" role="alert">
          {aviso}
        </small>
      )}
      {fotos.length > 0 && (
        <ul className="fotos__lista">
          {fotos.map((foto) => (
            <li key={foto.id}>
              <img src={foto.url} alt={`Foto adjunta: ${foto.nombre}`} />
              <button type="button" onClick={() => quitar(foto)} aria-label={`Quitar foto ${foto.nombre}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
