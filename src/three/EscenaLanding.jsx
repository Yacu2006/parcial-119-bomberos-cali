import { Component, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import CamionBomberos from './CamionBomberos.jsx'
import './escena.css'

// Escena 3D de la landing (React Three Fiber).
//   <Canvas>      crea la escena, la cámara y el renderizador WebGL
//   luces         sin luz, los materiales "standard" se ven negros
//   CamionBomberos nuestro componente 3D propio (ver CamionBomberos.jsx)
// El estado `alarma` vive aquí (y no dentro del camión) para que lo compartan
// el click sobre el camión 3D y el botón normal de HTML que hay debajo.

// Piso circular: un disco oscuro con un aro que se pone rojo cuando suena la alarma
function Piso({ alarma }) {
  return (
    <group position={[0, -0.02, 0]}>
      <mesh>
        <cylinderGeometry args={[2.9, 2.9, 0.1, 64]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.7, 2.85, 64]} />
        <meshStandardMaterial
          color={alarma ? '#ef4444' : '#78716c'}
          emissive={alarma ? '#ef4444' : '#000000'}
          emissiveIntensity={alarma ? 1.2 : 0}
        />
      </mesh>
    </group>
  )
}

// Si el recuadro de la escena es angosto (celular, ventana pequeña), la cámara se aleja
// un poco para que el piso y el camión no se recorten por los lados.
// El factor k solo acerca o aleja la cámara sobre la misma línea de visión.
function AjusteCamara() {
  const { camera, size } = useThree()
  useEffect(() => {
    const k = Math.max(1, 1.35 / (size.width / size.height))
    camera.position.set(0, 2.6 * k, 7 * k)
  }, [camera, size])
  return null
}

// Si el navegador no soporta WebGL, R3F lanza un error que dejaría la landing en blanco.
// Este "límite de error" lo atrapa y muestra un mensaje; el resto de la página sigue viva.
class LimiteEscena extends Component {
  state = { fallo: false }
  static getDerivedStateFromError() {
    return { fallo: true }
  }
  render() {
    if (this.state.fallo) {
      return <p className="escena__error">No se pudo cargar la escena 3D en este navegador.</p>
    }
    return this.props.children
  }
}

export default function EscenaLanding() {
  const [alarma, setAlarma] = useState(false)
  const alternar = () => setAlarma((a) => !a)

  return (
    <div className="escena">
      <LimiteEscena>
        <Canvas camera={{ position: [0, 2.6, 7], fov: 40 }} dpr={[1, 2]}>
          <AjusteCamara />
          <ambientLight intensity={0.8} />
          <hemisphereLight args={['#ffffff', '#44403c', 0.6]} />
          <directionalLight position={[4, 6, 3]} intensity={1.6} />
          <Piso alarma={alarma} />
          <CamionBomberos alarma={alarma} onToggle={alternar} />
        </Canvas>
      </LimiteEscena>

      {/* Botón HTML: mismo efecto que el click en el camión, útil en celular y con teclado */}
      <button type="button" className="escena__boton" onClick={alternar} aria-pressed={alarma}>
        {alarma ? 'Apagar sirena' : 'Toca el camión: activar sirena'}
      </button>
    </div>
  )
}
