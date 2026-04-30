import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/',          label: 'Inicio'     },
  { to: '/servicios', label: 'Servicios'  },
  { to: '/cotizador', label: 'Cotizador'  },
  { to: '/agendar',   label: 'Citas'      },
  { to: '/contacto',  label: 'Contacto'   },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <nav className="bg-gray-900 border-b border-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded flex items-center justify-center rotate-12">
            <svg className="w-4 h-4 text-white -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0l-3 3z"/>
              <path d="M8.7 11.3l-5.4 5.4a2 2 0 000 2.8l1.4 1.4a2 2 0 002.8 0l5.4-5.4"/>
            </svg>
          </div>
          <span className="font-black text-base tracking-wide uppercase">
            Mecánica<span className="text-orange-500">Hub</span>
          </span>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                location.pathname === to
                  ? 'text-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Botones */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-gray-300 border border-gray-700 rounded hover:border-gray-500 hover:text-white transition-colors"
          >
            Acceso
          </Link>
          <Link
            to="/agendar"
            className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors"
          >
            Agendar cita
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className={`w-5 h-0.5 bg-current mb-1.5 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`w-5 h-0.5 bg-current mb-1.5 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 px-6 py-4 flex flex-col gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2.5 text-sm font-medium rounded transition-colors ${
                location.pathname === to
                  ? 'text-orange-500 bg-gray-800'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-800">
            <Link to="/login" className="flex-1 text-center py-2 text-sm border border-gray-700 text-gray-300 rounded hover:border-gray-500">
              Acceso
            </Link>
            <Link to="/agendar" className="flex-1 text-center py-2 text-sm bg-orange-500 text-white rounded font-semibold hover:bg-orange-600">
              Agendar
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
