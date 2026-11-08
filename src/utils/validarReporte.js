// Reglas de validación del formulario de reporte.
// Es una función PURA: recibe los datos y devuelve un objeto con un mensaje por
// cada campo que tiene error. Si el objeto está vacío ({}), el formulario es válido.
// Al estar separada de la pantalla, es fácil de probar y de reutilizar.
const SOLO_LETRAS = /^[\p{L}][\p{L}\s'.-]*$/u // letras (con tildes y ñ), espacios, ' . -

export function validarReporte(d) {
  const errores = {}

  if (d.nombres.trim().length < 2 || !SOLO_LETRAS.test(d.nombres.trim()))
    errores.nombres = 'Escribe tus nombres usando solo letras (mínimo 2).'

  if (d.apellidos.trim().length < 2 || !SOLO_LETRAS.test(d.apellidos.trim()))
    errores.apellidos = 'Escribe tus apellidos usando solo letras (mínimo 2).'

  if (!/^\d{10}$/.test(d.telefono))
    errores.telefono = 'El teléfono debe tener exactamente 10 dígitos, solo números.'

  if (!d.grupo) errores.grupo = 'Elige el grupo de emergencia.'

  if (d.queVe.trim().length < 10)
    errores.queVe = 'Cuéntanos qué ves, con al menos 10 caracteres.'

  if (d.direccion.trim().length < 5) errores.direccion = 'Escribe la dirección (mínimo 5 caracteres).'

  if (!d.barrio) errores.barrio = 'Elige el barrio de la lista.'

  if (d.referencia.trim().length < 3)
    errores.referencia = 'Escribe un punto de referencia (mínimo 3 caracteres).'

  if (!d.edificioNoAplica && d.edificio.trim().length < 2)
    errores.edificio = 'Escribe el nombre del edificio o marca “No aplica”.'

  return errores
}
