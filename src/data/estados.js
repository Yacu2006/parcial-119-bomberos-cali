// Estados por los que pasa un reporte (flujo del enunciado):
//   Recibido → Validado → Unidad despachada → Cerrado   (o Descartado)
// Se guardan como constantes para no escribir los textos a mano en cada archivo
// (un error de tipeo como 'Validdo' rompería el flujo sin avisar).
export const ESTADOS = {
  RECIBIDO: 'Recibido',
  VALIDADO: 'Validado',
  DESPACHADO: 'Unidad despachada',
  CERRADO: 'Cerrado',
  DESCARTADO: 'Descartado',
}

// Color de cada estado (etiquetas EstadoBadge)
export const COLOR_ESTADO = {
  [ESTADOS.RECIBIDO]: '#d97706',
  [ESTADOS.VALIDADO]: '#2563eb',
  [ESTADOS.DESPACHADO]: '#7c3aed',
  [ESTADOS.CERRADO]: '#16a34a',
  [ESTADOS.DESCARTADO]: '#6b7280',
}

// Unidades que el operador puede despachar
export const UNIDADES = ['Máquina', 'Rescate', 'Ambulancia', 'HazMat']