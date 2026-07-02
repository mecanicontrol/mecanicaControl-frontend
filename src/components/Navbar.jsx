import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  User, ChevronDown, LogOut, Car, Calendar, History,
  LayoutDashboard, Menu, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LINKS_PUBLICO = [
  { to: '/',          label: 'Inicio'     },
  { to: '/servicios', label: 'Servicios'  },
  { to: '/tienda',    label: 'Tienda'     },
  { to: '/cotizador', label: 'Cotizador'  },
  { to: '/blog',      label: 'Blog'       },
  { to: '/contacto',  label: 'Contacto'   },
]
const LINKS_CLIENTE = [
  { to: '/',              label: 'Inicio'       },
  { to: '/servicios',     label: 'Servicios'    },
  { to: '/tienda',        label: 'Tienda'       },
  { to: '/cotizador',     label: 'Cotizador'    },
  { to: '/mis-vehiculos', label: 'Mis Vehículos' },
]
const LINKS_ADMIN   = [
  { to: '/admin',     label: 'Panel Admin' },
  { to: '/cotizador', label: 'Cotizador'   },
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

export default function Navbar() {
  const [perfilOpen, setPerfilOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [fotoPerfil, setFotoPerfil] = useState(
    localStorage.getItem('fotoPerfilCliente') ||
      'https://api.dicebear.com/7.x/notionists/svg?seed=DefaultUser'
  )

  const perfilRef = useRef(null)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { usuario, logout } = useAuth()

  const links = getLinks(usuario?.rol)

  // Cierra menú al cambiar de ruta
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (perfilRef.current && !perfilRef.current.contains(e.target)) setPerfilOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const actualizar = () =>
      setFotoPerfil(
        localStorage.getItem('fotoPerfilCliente') ||
          'https://api.dicebear.com/7.x/notionists/svg?seed=DefaultUser'
      )
    window.addEventListener('fotoPerfilActualizada', actualizar)
    return () => window.removeEventListener('fotoPerfilActualizada', actualizar)
  }, [])

  const handleLogout = () => {
    logout()
    setPerfilOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 text-white relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-orange-500 rounded flex items-center justify-center rotate-12">
            <span className="-rotate-12 font-black">⚙</span>
          </div>
          <span className="font-black uppercase tracking-wide">
            Mecánica<span className="text-orange-500">Hub</span>
          </span>
        </Link>

        {/* Links — desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 lg:px-4 py-2 text-sm rounded transition ${
                location.pathname === to
                  ? 'text-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Acciones — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {usuario ? (
            <div className="relative" ref={perfilRef}>
              <button
                onClick={() => setPerfilOpen(!perfilOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                <img
                  src={fotoPerfil}
                  alt="perfil"
                  className="w-9 h-9 rounded-full object-cover bg-white border-2 border-orange-500"
                />
                <span className="text-sm text-gray-300 hidden lg:block font-medium">
                  {usuario.nombre || usuario.email}
                </span>
                <ChevronDown size={14} className={`transition ${perfilOpen ? 'rotate-180' : ''}`} />
              </button>

              {perfilOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="px-5 py-4 border-b border-gray-700 flex items-center gap-4">
                    <img src={fotoPerfil} alt="perfil" className="w-12 h-12 rounded-full object-cover bg-white border-2 border-orange-500" />
                    <div>
                      <p className="font-bold text-white">{usuario.nombre}</p>
                      <p className="text-sm text-gray-400">{usuario.email}</p>
                      <span className="inline-block mt-1 px-3 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-400 font-bold uppercase">
                        {usuario.rol}
                      </span>
                    </div>
                  </div>
                  {[
                    { icon: LayoutDashboard, label: 'Dashboard',     path: usuario?.rol === 'ADMIN' ? '/admin' : usuario?.rol === 'TECNICO' ? '/tecnico/perfil' : '/cliente/dashboard' },
                    { icon: User,            label: 'Mi Perfil',     path: usuario?.rol === 'ADMIN' ? '/admin/mi-perfil' : usuario?.rol === 'TECNICO' ? '/tecnico/perfil' : '/cliente/perfil' },
                    ...(usuario?.rol === 'TECNICO' ? [] : [
                      { icon: Car,      label: 'Mis Vehículos',  path: '/mis-vehiculos' },
                      { icon: Calendar, label: 'Agendamientos',  path: '/cliente/agendamientos' },
                      { icon: History,  label: 'Historial',      path: '/cliente/historial' },
                    ]),
                  ].map(({ icon: Icon, label, path }) => (
                    <button key={path} onClick={() => { navigate(path); setPerfilOpen(false) }}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-700 text-left text-sm">
                      <Icon size={17} /> {label}
                    </button>
                  ))}
                  <div className="border-t border-gray-700">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-red-500/10 text-red-400 text-left text-sm">
                      <LogOut size={17} /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"    className="px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition text-sm">Acceso</Link>
              <Link to="/register" className="px-4 py-2 bg-orange-500 rounded-lg hover:bg-orange-600 transition text-sm">Registro</Link>
            </>
          )}
        </div>

        {/* Hamburguesa — móvil */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menú móvil */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-4 space-y-1">
          {links.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition ${
                location.pathname === to
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-800 space-y-1">
            {usuario ? (
              <>
                <div className="px-4 py-3 flex items-center gap-3">
                  <img src={fotoPerfil} alt="perfil" className="w-10 h-10 rounded-full object-cover border-2 border-orange-500" />
                  <div>
                    <p className="text-sm font-bold text-white">{usuario.nombre}</p>
                    <p className="text-xs text-gray-400">{usuario.rol}</p>
                  </div>
                </div>
                <button onClick={() => navigate(usuario?.rol === 'ADMIN' ? '/admin' : usuario?.rol === 'TECNICO' ? '/tecnico/perfil' : '/cliente/dashboard')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                  <LayoutDashboard size={17} /> Dashboard
                </button>
                <button onClick={() => navigate(usuario?.rol === 'ADMIN' ? '/admin/mi-perfil' : usuario?.rol === 'TECNICO' ? '/tecnico/perfil' : '/cliente/perfil')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                  <User size={17} /> Mi Perfil
                </button>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10">
                  <LogOut size={17} /> Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex gap-3 px-4">
                <Link to="/login"    className="flex-1 text-center py-2.5 border border-orange-500 text-orange-500 rounded-lg text-sm font-bold hover:bg-orange-500 hover:text-white transition">Acceso</Link>
                <Link to="/register" className="flex-1 text-center py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition">Registro</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}