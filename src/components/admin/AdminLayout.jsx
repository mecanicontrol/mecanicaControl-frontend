import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, CalendarDays, ClipboardList, Package,
  Users, Wrench, BarChart2, BookOpen, UserCog, Settings,
  UserCircle, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin',               icon: LayoutDashboard, label: 'Dashboard'        },
  { to: '/admin/agendamientos', icon: CalendarDays,    label: 'Agendamientos'    },
  { to: '/admin/ot',            icon: ClipboardList,   label: 'Órdenes de Trabajo' },
  { to: '/admin/inventario',    icon: Package,         label: 'Inventario'       },
  { to: '/admin/clientes',      icon: Users,           label: 'Clientes'         },
  { to: '/admin/tecnicos',      icon: Wrench,          label: 'Técnicos'         },
  { to: '/admin/reportes',      icon: BarChart2,       label: 'Reportes'         },
  { to: '/admin/catalogos',     icon: BookOpen,        label: 'Catálogos'        },
  { to: '/admin/usuarios',      icon: UserCog,         label: 'Usuarios'         },
  { to: '/admin/configuracion', icon: Settings,        label: 'Configuración'    },
  { to: '/admin/mi-perfil',     icon: UserCircle,      label: 'Mi Perfil'        },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">

      {/* Sidebar */}
      <aside className={`flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0`}>

        {/* Logo / Toggle */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800 h-16">
          {sidebarOpen && (
            <span className="font-black text-orange-500 text-lg tracking-wider uppercase">MecánicaHub</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-0.5 px-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium group ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
              {sidebarOpen && <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-800 p-3 space-y-1">
          {sidebarOpen && usuario && (
            <div className="px-3 py-2">
              <p className="text-xs font-black text-white truncate">{usuario.nombre}</p>
              <p className="text-xs text-gray-500 truncate">{usuario.rol ?? 'ADMIN'}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6 flex-shrink-0">
          <h1 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Panel de Administración</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-black text-white">
              {usuario?.nombre?.[0] ?? 'A'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
