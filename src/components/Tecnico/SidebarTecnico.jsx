import {
  LayoutDashboard,
  ClipboardList,
  Package,
  BarChart3,
  Settings,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function SidebarTecnico() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menu = [
    { name: "Dashboard",          icon: LayoutDashboard, path: "/tecnico/dashboard"  },
    { name: "Órdenes de trabajo",  icon: ClipboardList,   path: "/tecnico/ordenes"    },
    { name: "Inventario",          icon: Package,         path: "/tecnico/inventario" },
    { name: "Estadísticas",        icon: BarChart3,       path: "/tecnico/estadisticas"},
    { name: "Mi perfil",           icon: Settings,        path: "/tecnico/perfil"     },
  ];

  const cerrarSesion = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col justify-between flex-shrink-0">
      <div>
        <div
          onClick={() => navigate("/tecnico/dashboard")}
          className="px-4 py-4 cursor-pointer border-b border-slate-800 h-16 flex flex-col justify-center"
        >
          <h1 className="text-lg font-black tracking-tight">
            Mecánica<span className="text-orange-500">Hub</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-0.5">
            Portal Técnico
          </p>
        </div>

        <nav className="px-2 py-4 space-y-0.5">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-orange-500 text-white shadow"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={() => alert("Soporte técnico no disponible en esta versión.")}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-white text-sm font-medium transition rounded-lg hover:bg-slate-800"
        >
          <LifeBuoy size={18} />
          Soporte
        </button>

        <button
          onClick={cerrarSesion}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-red-400 text-sm font-medium transition rounded-lg hover:bg-slate-800"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}