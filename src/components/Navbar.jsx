import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  User,
  ChevronDown,
  LogOut,
  Car,
  Calendar,
  History,
  LayoutDashboard
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LINKS_PUBLICO = [
  { to: '/', label: 'Inicio' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/tienda', label: 'Tienda' },
  { to: '/cotizador', label: 'Cotizador' },
  { to: '/blog', label: 'Blog' },
  { to: '/contacto', label: 'Contacto' },
]

const LINKS_CLIENTE = [
  { to: '/', label: 'Inicio' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/tienda', label: 'Tienda' },
  { to: '/cotizador', label: 'Cotizador' },
  { to: '/mis-vehiculos', label: 'Mis Vehículos' },
]

const LINKS_ADMIN = [
  { to: '/admin', label: 'Panel Admin' },
  { to: '/cotizador', label: 'Cotizador' },
]

const LINKS_TECNICO = [
  { to: '/', label: 'Inicio' },
  { to: '/cotizador', label: 'Cotizador' },
]

function getLinks(rol) {
  if (rol === 'ADMIN') return LINKS_ADMIN
  if (rol === 'TECNICO') return LINKS_TECNICO
  if (rol === 'CLIENTE') return LINKS_CLIENTE
  return LINKS_PUBLICO
}

export default function Navbar() {
  const [perfilOpen, setPerfilOpen] = useState(false)
  const [fotoPerfil, setFotoPerfil] = useState(
    localStorage.getItem('fotoPerfilCliente') ||
      'https://api.dicebear.com/7.x/notionists/svg?seed=DefaultUser'
  )

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

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const actualizarFoto = () => {
      setFotoPerfil(
        localStorage.getItem('fotoPerfilCliente') ||
          'https://api.dicebear.com/7.x/notionists/svg?seed=DefaultUser'
      )
    }

    window.addEventListener('fotoPerfilActualizada', actualizarFoto)

    return () => {
      window.removeEventListener('fotoPerfilActualizada', actualizarFoto)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setPerfilOpen(false)
    navigate('/')
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded flex items-center justify-center rotate-12">
            <span className="-rotate-12 font-black">⚙</span>
          </div>

          <span className="font-black uppercase tracking-wide">
            Mecánica<span className="text-orange-500">Hub</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 text-sm rounded transition ${
                location.pathname === to
                  ? 'text-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {usuario ? (
            <div className="relative" ref={perfilRef}>
              <button
                onClick={() => setPerfilOpen(!perfilOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                <img
                  src={fotoPerfil}
                  alt="perfil"
                  className="w-10 h-10 rounded-full object-cover bg-white border-2 border-orange-500"
                />

                <span className="text-sm text-gray-300 hidden lg:block font-medium">
                  {usuario.nombre || usuario.email}
                </span>

                <ChevronDown
                  size={14}
                  className={`transition ${perfilOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {perfilOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="px-5 py-4 border-b border-gray-700 flex items-center gap-4">
                    <img
                      src={fotoPerfil}
                      alt="perfil"
                      className="w-14 h-14 rounded-full object-cover bg-white border-2 border-orange-500"
                    />

                    <div>
                      <p className="font-bold text-white">
                        {usuario.nombre}
                      </p>

                      <p className="text-sm text-gray-400">
                        {usuario.email}
                      </p>

                      <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-orange-500/20 text-orange-400 font-bold uppercase">
                        {usuario.rol}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(usuario?.rol === 'ADMIN' ? '/admin' : '/cliente/dashboard')}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-700 text-left"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </button>

                  <button
                    onClick={() => navigate(usuario?.rol === 'ADMIN' ? '/admin/mi-perfil' : '/cliente/perfil')}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-700 text-left"
                  >
                    <User size={18} />
                    Mi Perfil
                  </button>

                  <button
                    onClick={() => navigate('/mis-vehiculos')}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-700 text-left"
                  >
                    <Car size={18} />
                    Mis Vehículos
                  </button>

                  <button
                    onClick={() => navigate('/cliente/agendamientos')}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-700 text-left"
                  >
                    <Calendar size={18} />
                    Agendamientos
                  </button>

                  <button
                    onClick={() => navigate('/cliente/historial')}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-700 text-left"
                  >
                    <History size={18} />
                    Historial
                  </button>

                  <div className="border-t border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-500/10 text-red-400 text-left"
                    >
                      <LogOut size={18} />
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
                className="px-5 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition"
              >
                Acceso
              </Link>

              <Link
                to="/register"
                className="px-5 py-2 bg-orange-500 rounded-lg hover:bg-orange-600 transition"
              >
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}