// Campo de formulario reutilizable: etiqueta + control + mensaje de error.
// tipo: 'input' (por defecto), 'select' o 'textarea'.
// Todo lo demás (value, onChange, onBlur, type, maxLength...) pasa directo al control.
export default function Campo({ etiqueta, nombre, tipo = 'input', opciones = [], error, ayuda, ...resto }) {
  const id = `campo-${nombre}`
  const propsControl = {
    id,
    name: nombre,
    className: `campo__control${error ? ' campo__control--error' : ''}`,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined,
    ...resto,
  }

  let control
  if (tipo === 'textarea') {
    control = <textarea rows={3} {...propsControl} />
  } else if (tipo === 'select') {
    control = (
      <select {...propsControl}>
        <option value="">Selecciona…</option>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    )
  } else {
    control = <input {...propsControl} />
  }

  return (
    <div className="campo">
      <label htmlFor={id}>
        {etiqueta} <span aria-hidden="true">*</span>
      </label>
      {control}
      {ayuda && !error && (
        <small id={`${id}-ayuda`} className="campo__ayuda">
          {ayuda}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} className="campo__error" role="alert">
          {error}
        </small>
      )}
    </div>
  )
}
