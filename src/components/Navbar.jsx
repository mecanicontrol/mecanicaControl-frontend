import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-gray-900 text-white px-6 py-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/" className="font-bold text-xl">
          MecánicaHub
        </Link>

        <div className="hidden md:flex gap-6 text-sm">
          <Link to="/" className="hover:text-orange-400">Inicio</Link>
          <Link to="/servicios" className="hover:text-orange-400">Servicios</Link>
          <Link to="/cotizador" className="hover:text-orange-400">Cotizador</Link>
          <Link to="/agendar" className="hover:text-orange-400">Agendar</Link>
          <Link to="/contacto" className="hover:text-orange-400">Contacto</Link>
        </div>

        <div className="hidden md:flex gap-3">
          <Link to="/login" className="text-sm border border-white px-4 py-1.5 rounded hover:bg-white hover:text-gray-900">
            Acceso
          </Link>
          <Link to="/agendar" className="text-sm bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600">
            Agendar
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-3 flex flex-col gap-3 text-sm border-t border-gray-700 pt-3">
          <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link to="/servicios" onClick={() => setMenuOpen(false)}>Servicios</Link>
          <Link to="/cotizador" onClick={() => setMenuOpen(false)}>Cotizador</Link>
          <Link to="/agendar" onClick={() => setMenuOpen(false)}>Agendar</Link>
          <Link to="/contacto" onClick={() => setMenuOpen(false)}>Contacto</Link>
        </div>
      )}
    </nav>
  )
}
