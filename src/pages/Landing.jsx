import { Link } from 'react-router-dom'
import { GRUPOS } from '../data/grupos.js'
import EscenaLanding from '../three/EscenaLanding.jsx'
import TarjetaGrupo from '../components/landing/TarjetaGrupo.jsx'
import './landing.css'

// Pantalla 1: landing. En pocos segundos la persona debe entender qué es
// y llegar al reporte (el botón principal se ve sin hacer scroll).
export default function Landing() {
  return (
    <div className="land">
      <section className="land__hero">
        <header className="land__marca">
          <span className="land__logo" aria-hidden="true">119</span>
          <span>Bomberos Cali · Línea 119</span>
        </header>

        <div className="land__hero-contenido">
          <div className="land__texto">
            <h1>¿Tienes una emergencia?</h1>
            <p className="land__lema">
              Repórtala en un minuto, con fotos y la ubicación. Un radio operador de Bomberos la recibe en su tablero.
            </p>

            <div className="land__acciones">
              <Link to="/reportar" className="land__boton land__boton--principal">
                Reportar emergencia
              </Link>
              <a href="tel:119" className="land__boton land__boton--llamar">
                Llamar al 119
              </a>
            </div>

            <small className="land__nota">Prototipo académico: no atiende emergencias reales.</small>
          </div>

          <div className="land__escena">
            <EscenaLanding />
          </div>
        </div>
      </section>

      <section className="land__grupos" aria-labelledby="titulo-grupos">
        <h2 id="titulo-grupos">Grupos de emergencia</h2>
        <p>Cada reporte se clasifica en uno de estos grupos del protocolo de despacho. El color es el mismo en el mapa del operador.</p>
        <ul className="land__lista">
          {GRUPOS.map((g) => (
            <TarjetaGrupo key={g.codigo} grupo={g} />
          ))}
        </ul>
      </section>

      <footer className="land__pie">
        <span>Línea 119 · Bomberos Cali · Prototipo académico</span>
        <Link to="/operador">Acceso radio operador</Link>
      </footer>
    </div>
  )
}
