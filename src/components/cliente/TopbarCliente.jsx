import {
  Bell, Settings, Search, LogOut, User, Car,
  Calendar, History, LayoutDashboard, Home, Menu,
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerMisAgendamientos } from '../../services/agendamientoService'
import { useAuth } from '../../context/AuthContext'

export default function TopbarCliente() {
  const navigate = useNavigate()
  const { logout, usuario } = useAuth()
  const menuRef  = useRef(null)
  const notifRef = useRef(null)

  const [busqueda,              setBusqueda]              = useState('')
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false)
  const [mostrarMenuUsuario,    setMostrarMenuUsuario]    = useState(false)
  const [mostrarBusqueda,       setMostrarBusqueda]       = useState(false)
  const [agendamientos,         setAgendamientos]         = useState([])
  const [fotoPerfil,            setFotoPerfil]            = useState(
    localStorage.getItem('fotoPerfilCliente') ||
      'https://api.dicebear.com/7.x/notionists/svg?seed=DefaultUser'
  )

  useEffect(() => { cargarAgendamientos() }, [])

  useEffect(() => {
    const actualizar = () =>
      setFotoPerfil(
        localStorage.getItem('fotoPerfilCliente') ||
          'https://api.dicebear.com/7.x/notionists/svg?seed=DefaultUser'
      )
    window.addEventListener('fotoPerfilActualizada', actualizar)
    return () => window.removeEventListener('fotoPerfilActualizada', actualizar)
  }, [])

  useEffect(() => {
    const cerrar = (e) => {
      if (
        menuRef.current  && !menuRef.current.contains(e.target) &&
        notifRef.current && !notifRef.current.contains(e.target)
      ) {
        setMostrarMenuUsuario(false)
        setMostrarNotificaciones(false)
      }
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [])

  const cargarAgendamientos = async () => {
    try {
      const res = await obtenerMisAgendamientos()
      setAgendamientos(res.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const buscar = () => {
    const texto = busqueda.toLowerCase().trim()
    if (!texto) return
    const encontrado = agendamientos.find(
      ag => ag.patenteVehiculo?.toLowerCase().includes(texto) ||
            ag.idAgendamiento?.toLowerCase().includes(texto)
    )
    if (encontrado) {
      navigate('/cliente/agendamientos')
      setBusqueda('')
      setMostrarBusqueda(false)
    } else {
      alert('No se encontraron resultados')
    }
  }

  const cerrarSesion = () => { logout(); navigate('/login') }
  const proximos = agendamientos.slice(0, 3)

  return (
    <header className="bg-white h-16 sm:h-20 px-4 sm:px-6 flex items-center justify-between border-b flex-shrink-0 relative">

      {/* Hamburguesa — solo visible en móvil */}
      <button
        className="md:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-gray-100 transition"
        onClick={() => window.dispatchEvent(new Event('sidebarCliente:toggle'))}
      >
        <Menu size={22} />
      </button>

      {/* Título */}
      <h1
        onClick={() => navigate('/cliente/dashboard')}
        className="text-base sm:text-xl md:text-2xl font-black text-orange-500 cursor-pointer hover:opacity-80 transition hidden sm:block"
      >
        PORTAL DE CLIENTE
      </h1>

      {/* Acciones */}
      <div className="flex items-center gap-3 sm:gap-5 ml-auto">

        {/* Búsqueda — desktop */}
        <div className="relative hidden md:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            onClick={buscar}
          />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="Buscar vehículo o OT..."
            className="pl-10 pr-4 py-2.5 w-56 lg:w-72 rounded-xl bg-gray-100 outline-none text-sm"
          />
        </div>

        {/* Búsqueda — icono móvil */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-gray-100 transition"
          onClick={() => setMostrarBusqueda(!mostrarBusqueda)}
        >
          <Search size={20} />
        </button>

        {/* Notificaciones */}
        <div className="relative" ref={notifRef}>
          <button
            className="relative p-2 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-gray-100 transition"
            onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
          >
            <Bell size={20} />
            {proximos.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
            )}
          </button>

          {mostrarNotificaciones && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl p-5 z-50 border max-h-96 overflow-y-auto">
              <h3 className="font-black text-base mb-4">Próximas citas</h3>
              {proximos.length === 0 ? (
                <p className="text-gray-500 text-sm">No tienes notificaciones</p>
              ) : (
                proximos.map(ag => (
                  <div key={ag.idAgendamiento} className="border-b py-3 last:border-none">
                    <p className="font-bold text-sm">{ag.nombreServicio}</p>
                    <p className="text-xs text-gray-500">{ag.patenteVehiculo}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Configuración */}
        <button
          className="hidden sm:block p-2 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-gray-100 transition"
          onClick={() => navigate('/cliente/perfil')}
        >
          <Settings size={20} />
        </button>

        {/* Avatar */}
        <div className="relative" ref={menuRef}>
          <img
            src={fotoPerfil}
            alt="usuario"
            onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-orange-500 cursor-pointer object-cover bg-white"
          />

          {mostrarMenuUsuario && (
            <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl w-64 sm:w-72 overflow-hidden z-50 border">
              <div className="px-5 py-4 border-b bg-gray-50">
                <p className="font-black text-slate-900 text-sm">{usuario?.nombre || 'Cliente'}</p>
                <p className="text-xs text-gray-500 truncate">{usuario?.email}</p>
              </div>
              {[
                { icon: Home,            label: 'Inicio',          path: '/'                        },
                { icon: LayoutDashboard, label: 'Dashboard',       path: '/cliente/dashboard'        },
                { icon: User,            label: 'Mi perfil',       path: '/cliente/perfil'           },
                { icon: Car,             label: 'Mis vehículos',   path: '/mis-vehiculos'            },
                { icon: Calendar,        label: 'Agendamientos',   path: '/cliente/agendamientos'    },
                { icon: History,         label: 'Historial',       path: '/cliente/historial'        },
              ].map(({ icon: Icon, label, path }) => (
                <button key={path} onClick={() => { navigate(path); setMostrarMenuUsuario(false) }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-100 text-left text-sm">
                  <Icon size={17} /> {label}
                </button>
              ))}
              <div className="border-t">
                <button onClick={cerrarSesion}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-red-50 text-red-600 text-left text-sm">
                  <LogOut size={17} /> Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barra de búsqueda expandida en móvil */}
      {mostrarBusqueda && (
        <div className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 px-4 py-3 z-30 md:hidden">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscar()}
              placeholder="Buscar vehículo o OT..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 outline-none text-sm"
            />
          </div>
        </div>
      )}
    </header>
  )
}