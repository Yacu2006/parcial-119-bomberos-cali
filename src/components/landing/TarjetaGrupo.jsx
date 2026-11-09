// Tarjeta de un grupo de emergencia: código grande, nombre y su color.
// Es un componente de presentación: solo recibe `grupo` por props y lo dibuja.
// El color viene de data/grupos.js, el mismo que usan el formulario y el mapa.
export default function TarjetaGrupo({ grupo }) {
  return (
    <li className="tarjeta-grupo" style={{ '--color-grupo': grupo.color }}>
      <span className="tarjeta-grupo__codigo">{grupo.codigo}</span>
      <span className="tarjeta-grupo__nombre">{grupo.nombre}</span>
    </li>
  )
}
