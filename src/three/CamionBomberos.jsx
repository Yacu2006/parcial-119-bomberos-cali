import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// CAMIÓN DE BOMBEROS (hecho solo con geometrías básicas, sin modelos externos)
//
// Cada pieza es un <mesh> con una geometría (caja, cilindro, esfera) y un material.
// Las piezas se agrupan en un <group> para moverlas todas juntas.
// El frente del camión apunta hacia +X.
//
// Interacciones con el mouse:
//   1) Mover el mouse → el camión gira suavemente hacia el puntero (useFrame)
//   2) Pasar el mouse por encima (onPointerOver) → crece un poco y brilla
//   3) Click (onClick) → enciende / apaga la sirena (lo decide EscenaLanding)
// ─────────────────────────────────────────────────────────────────────────────

const ROJO = '#dc2626'
const ROJO_OSCURO = '#991b1b'
const GRIS = '#44403c'
const CROMO = '#e7e5e4'

const GIRO_BASE = -0.55 // ángulo inicial: se ve de tres cuartos, con el frente hacia la cámara

// Posición de las 4 ruedas: [x, y, z]
const RUEDAS = [
  [-1.0, 0.36, 0.68],
  [-1.0, 0.36, -0.68],
  [1.0, 0.36, 0.68],
  [1.0, 0.36, -0.68],
]

// Peldaños de la escalera del techo (8 posiciones en x)
const PELDANOS = Array.from({ length: 8 }, (_, i) => -1.5 + i * 0.257)

export default function CamionBomberos({ alarma, onToggle }) {
  const camion = useRef() // grupo con todo el camión
  const ruedas = useRef() // grupo con las 4 ruedas
  const materialRojo = useRef() // material de la baliza roja
  const materialAzul = useRef() // material de la baliza azul
  const luzRoja = useRef() // luz que ilumina la escena en rojo
  const luzAzul = useRef()
  const [encima, setEncima] = useState(false) // ¿el mouse está sobre el camión?

  // El cursor se vuelve "manito" mientras el mouse esté sobre el camión
  useEffect(() => {
    document.body.style.cursor = encima ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [encima])

  // useFrame corre ANTES de dibujar cada cuadro (unas 60 veces por segundo).
  // `delta` es el tiempo desde el cuadro anterior: sirve para que la animación
  // dure lo mismo en un computador lento o rápido.
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const c = camion.current

    // 1) Seguir al mouse: state.pointer.x va de -1 (izquierda) a 1 (derecha).
    //    MathUtils.damp acerca el valor actual al objetivo de forma suave.
    c.rotation.y = MathUtils.damp(c.rotation.y, GIRO_BASE + state.pointer.x * 0.55, 4, delta)

    // 2) Hover: crece hasta 7 % cuando el mouse está encima
    c.scale.setScalar(MathUtils.damp(c.scale.x, encima ? 1.07 : 1, 6, delta))

    // 3) Movimiento: con la alarma vibra; sin ella "respira" suavemente
    c.position.y = alarma ? Math.abs(Math.sin(t * 18)) * 0.03 : Math.sin(t * 1.5) * 0.03
    c.rotation.z = alarma ? Math.sin(t * 30) * 0.01 : 0

    // 4) Ruedas: giran solo con la alarma encendida
    ruedas.current.children.forEach((rueda) => {
      rueda.rotation.z -= delta * (alarma ? 12 : 0)
    })

    // 5) Balizas: con la alarma se alternan rojo/azul; apagada, un brillo tenue
    const rojoEncendido = Math.sin(t * 14) > 0
    const rojo = alarma ? (rojoEncendido ? 1 : 0) : 0.15 + 0.1 * Math.sin(t * 2)
    const azul = alarma ? (rojoEncendido ? 0 : 1) : 0.15 + 0.1 * Math.cos(t * 2)
    materialRojo.current.emissiveIntensity = rojo * 3
    materialAzul.current.emissiveIntensity = azul * 3
    luzRoja.current.intensity = rojo * 8
    luzAzul.current.intensity = azul * 8
  })

  return (
    <group
      ref={camion}
      position={[0, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setEncima(true)
      }}
      onPointerOut={() => setEncima(false)}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
    >
      {/* Chasis */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[3.2, 0.35, 1.2]} />
        <meshStandardMaterial color={GRIS} roughness={0.7} />
      </mesh>

      {/* Cuerpo trasero (donde van los equipos) */}
      <mesh position={[-0.6, 1.15, 0]}>
        <boxGeometry args={[2.0, 1.0, 1.2]} />
        <meshStandardMaterial color={ROJO} roughness={0.45} metalness={0.1} emissive={ROJO} emissiveIntensity={encima ? 0.3 : 0} />
      </mesh>

      {/* Cabina */}
      <mesh position={[1.0, 1.1, 0]}>
        <boxGeometry args={[1.2, 0.9, 1.2]} />
        <meshStandardMaterial color={ROJO} roughness={0.45} metalness={0.1} emissive={ROJO} emissiveIntensity={encima ? 0.3 : 0} />
      </mesh>

      {/* Franja blanca a lo largo del camión */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[3.22, 0.1, 1.24]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.6} />
      </mesh>

      {/* Vidrios: parabrisas y ventanas laterales */}
      <mesh position={[1.61, 1.25, 0]}>
        <boxGeometry args={[0.04, 0.45, 1.0]} />
        <meshStandardMaterial color="#bae6fd" roughness={0.1} metalness={0.6} />
      </mesh>
      {[0.61, -0.61].map((z) => (
        <mesh key={z} position={[0.95, 1.28, z]}>
          <boxGeometry args={[0.8, 0.4, 0.02]} />
          <meshStandardMaterial color="#bae6fd" roughness={0.1} metalness={0.6} />
        </mesh>
      ))}

      {/* Compuertas de equipos en los costados del cuerpo trasero */}
      {[0.61, -0.61].flatMap((z) =>
        [-1.05, -0.15].map((x) => (
          <mesh key={`${z}${x}`} position={[x, 1.25, z]}>
            <boxGeometry args={[0.8, 0.55, 0.02]} />
            <meshStandardMaterial color={ROJO_OSCURO} roughness={0.5} />
          </mesh>
        ))
      )}

      {/* Escalera sobre el techo: dos rieles, peldaños y soportes */}
      {[0.3, -0.3].map((z) => (
        <group key={z}>
          <mesh position={[-0.6, 1.75, z]}>
            <boxGeometry args={[2.0, 0.06, 0.07]} />
            <meshStandardMaterial color={CROMO} metalness={0.7} roughness={0.3} />
          </mesh>
          {[-1.4, 0.2].map((x) => (
            <mesh key={x} position={[x, 1.7, z]}>
              <boxGeometry args={[0.08, 0.1, 0.08]} />
              <meshStandardMaterial color={GRIS} />
            </mesh>
          ))}
        </group>
      ))}
      {PELDANOS.map((x) => (
        <mesh key={x} position={[x, 1.75, 0]}>
          <boxGeometry args={[0.05, 0.05, 0.6]} />
          <meshStandardMaterial color={CROMO} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Barra de luces sobre la cabina con las dos balizas (roja y azul) */}
      <mesh position={[1.0, 1.6, 0]}>
        <boxGeometry args={[0.3, 0.1, 1.0]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
      <mesh position={[1.0, 1.7, 0.3]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial ref={materialRojo} color="#fecaca" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[1.0, 1.7, -0.3]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial ref={materialAzul} color="#bfdbfe" emissive="#3b82f6" emissiveIntensity={0.3} />
      </mesh>
      <pointLight ref={luzRoja} position={[1.0, 2.0, 0.6]} color="#ef4444" intensity={0} distance={6} />
      <pointLight ref={luzAzul} position={[1.0, 2.0, -0.6]} color="#3b82f6" intensity={0} distance={6} />

      {/* Parachoques y faros delanteros */}
      <mesh position={[1.66, 0.45, 0]}>
        <boxGeometry args={[0.1, 0.2, 1.3]} />
        <meshStandardMaterial color={CROMO} metalness={0.8} roughness={0.25} />
      </mesh>
      {[0.4, -0.4].map((z) => (
        <mesh key={z} position={[1.62, 0.78, z]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#fef9c3" emissive="#fde047" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* Ruedas: cada una es un grupo (para poder girarla) con llanta y rin */}
      <group ref={ruedas}>
        {RUEDAS.map((posicion, i) => (
          <group key={i} position={posicion}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.36, 0.36, 0.26, 24]} />
              <meshStandardMaterial color="#1c1917" roughness={0.9} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.28, 16]} />
              <meshStandardMaterial color={CROMO} metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Barra del rin: permite VER que la rueda gira */}
            <mesh>
              <boxGeometry args={[0.4, 0.06, 0.3]} />
              <meshStandardMaterial color={GRIS} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
