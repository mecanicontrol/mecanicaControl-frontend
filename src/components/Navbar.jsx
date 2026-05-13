import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { User, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LINKS_PUBLICO = [
  { to: '/',          label: 'Inicio'    },
  { to: '/servicios', label: 'Servicios' },
  { to: '/tienda',     label: 'Tienda'   },
  { to: '/cotizador', label: 'Cotizador' },
  { to: '/blog',      label: 'Blog'      },
  { to: '/contacto',  label: 'Contacto'  },
]

const LINKS_CLIENTE = [
  { to: '/',               label: 'Inicio'        },
  { to: '/servicios',      label: 'Servicios'     },
  { to: '/tienda',         label: 'Tienda'        },
  { to: '/cotizador',      label: 'Cotizador'     },
  { to: '/blog',           label: 'Blog'          },
  { to: '/mis-vehiculos',  label: 'Mis Vehículos' },
  { to: '/contacto',       label: 'Contacto'      },
]

const LINKS_ADMIN = [
  { to: '/admin',          label: 'Panel Admin'   },
  { to: '/cotizador',      label: 'Cotizador'     },
]

const LINKS_TECNICO = [
  { to: '/',          label: 'Inicio'    },
  { to: '/cotizador', label: 'Cotizador' },
]

function getLinks(rol) {
  if (rol === 'ADMIN')   return LINKS_ADMIN
  if (rol === 'TECNICO') return LINKS_TECNICO
  if (rol === 'CLIENTE') return LINKS_CLIENTE
  return LINKS_PUBLICO
}

function getPerfilRoute(rol) {
  if (rol === 'ADMIN')   return '/admin/mi-perfil'
  if (rol === 'TECNICO') return '/tecnico/perfil'
  return '/perfil'
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [perfilOpen, setPerfilOpen] = useState(false)
  const perfilRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()

  const links = getLinks(usuario?.rol)

  useEffect(() => {
    function handleClickOutside(e) {
      if (perfilRef.current && !perfilRef.current.contains(e.target)) {
        setPerfilOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setPerfilOpen(false)
    logout()
    navigate('/')
  }

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

        {/* Botones derecha */}
        <div className="hidden md:flex items-center gap-3">
          {usuario ? (
            <div className="relative" ref={perfilRef}>
              <button
                onClick={() => setPerfilOpen(!perfilOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-sm text-gray-300 hidden lg:block">
                  {usuario.nombre ?? usuario.email}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${perfilOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {perfilOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-semibold text-white truncate">
                      {usuario.nombre ?? 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {usuario.email ?? ''}
                    </p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-orange-500/20 text-orange-400">
                      {usuario.rol ?? 'CLIENTE'}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to={getPerfilRoute(usuario.rol)}
                      onClick={() => setPerfilOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <User size={16} />
                      Mi Perfil
                    </Link>
                  </div>

                  <div className="border-t border-gray-700 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-700 hover:text-red-400 transition-colors"
                    >
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 text-sm font-semibold border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition"
              >
                Acceso
              </Link>

              <Link
                to="/register"
                className="px-5 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Registro
              </Link>
            </>
          )}
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

          <div className="mt-3 pt-3 border-t border-gray-800">
            {usuario ? (
              <>
                <Link
                  to={getPerfilRoute(usuario.rol)}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 w-full py-2.5 text-sm text-gray-300 hover:text-white"
                >
                  <User size={16} />
                  Mi Perfil
                </Link>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full py-2.5 text-sm text-gray-400 hover:text-red-400"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">

                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center py-2 text-sm border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition"
                >
                  Acceso
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Registro
                </Link>

              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}