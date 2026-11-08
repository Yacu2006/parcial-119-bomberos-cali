import { Routes, Route, Link } from 'react-router-dom'
import { ReportesProvider } from './context/ReportesContext.jsx'
import Landing from './pages/Landing.jsx'
import Reportar from './pages/Reportar.jsx'
import Operador from './pages/Operador.jsx'

// Las tres pantallas del parcial.
// ReportesProvider envuelve las rutas: así /reportar, /operador y la landing
// comparten la misma lista de reportes (estado global).
export default function App() {
  return (
    <ReportesProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/reportar" element={<Reportar />} />
        <Route path="/operador" element={<Operador />} />
        <Route path="*" element={<p style={{ padding: 24 }}>Página no encontrada. <Link to="/">Volver</Link></p>} />
      </Routes>
    </ReportesProvider>
  )
}