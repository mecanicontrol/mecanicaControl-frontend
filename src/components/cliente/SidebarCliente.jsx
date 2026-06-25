import { useEffect, useState } from 'react'
import { LayoutDashboard, Car, Calendar, History, User, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const MENU = [
  { name: 'Dashboard',     icon: LayoutDashboard, path: '/cliente/dashboard'    },
  { name: 'Vehículos',     icon: Car,             path: '/mis-vehiculos'         },
  { name: 'Agendamientos', icon: Calendar,         path: '/cliente/agendamientos' },
  { name: 'Historial',     icon: History,          path: '/cliente/historial'     },
  { name: 'Perfil',        icon: User,             path: '/cliente/perfil'        },
]

function SidebarCliente() {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // TopbarCliente dispara este evento para abrir/cerrar en móvil
  useEffect(() => {
    const toggle = () => setOpen(o => !o)
    window.addEventListener('sidebarCliente:toggle', toggle)
    return () => window.removeEventListener('sidebarCliente:toggle', toggle)
  }, [])

  // Cierra al navegar en móvil
  useEffect(() => { setOpen(false) }, [location.pathname])

  return (
    <>
      {/* Overlay oscuro en móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between shadow-2xl
        transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:flex-shrink-0
      `}>
        {/* Logo + cerrar (móvil) */}
        <div>
          <div className="flex items-center justify-between p-6 pb-4">
            <div
              onClick={() => navigate('/cliente/dashboard')}
              className="cursor-pointer hover:opacity-90 transition"
            >
              <h1 className="text-2xl font-black tracking-tight">
                Mecánica<span className="text-orange-500">Hub</span>
              </h1>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                Silver Member
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-1 px-3">
            {MENU.map(({ name, icon: Icon, path }) => {
              const active = location.pathname === path
              return (
                <Link
                  key={name}
                  to={path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition duration-200 ${
                    active
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'hover:bg-slate-800 text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  {name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4">
          <button
            onClick={() => navigate('/cotizador')}
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 py-3.5 rounded-xl font-black uppercase shadow-lg transition duration-200 text-sm"
          >
            Nueva cotización
          </button>
        </div>
      </aside>
    </>
  )
}

export default SidebarCliente