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
    { name: "Dashboard", icon: LayoutDashboard, path: "/tecnico/dashboard" },
    { name: "Órdenes de trabajo", icon: ClipboardList, path: "/tecnico/ordenes" },
    { name: "Inventario", icon: Package, path: "/tecnico/inventario" },
    { name: "Estadísticas", icon: BarChart3, path: "/tecnico/estadisticas" },
    { name: "Mi perfil", icon: Settings, path: "/tecnico/perfil" },
  ];

  const cerrarSesion = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-72 min-h-screen bg-slate-900 text-white flex flex-col justify-between">
      <div>
        <div
          onClick={() => navigate("/tecnico/dashboard")}
          className="p-8 cursor-pointer"
        >
          <h1 className="text-3xl font-black leading-tight">
            AUTO-<br />PRECISION
          </h1>
          <p className="text-xs text-slate-500 mt-3">V.2.4.0-BETA</p>
        </div>

        <nav className="px-3 space-y-3">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition ${
                  active
                    ? "bg-orange-500 text-white shadow-lg"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={22} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-5 border-t border-slate-800 space-y-3">
        <button
          onClick={() => alert("Soporte técnico no disponible en esta versión.")}
          className="w-full flex items-center gap-3 text-slate-500 hover:text-white font-bold text-sm transition"
        >
          <LifeBuoy size={20} />
          SOPORTE
        </button>

        <button
          onClick={cerrarSesion}
          className="w-full flex items-center gap-3 text-slate-500 hover:text-red-400 font-bold text-sm transition"
        >
          <LogOut size={20} />
          CERRAR SESIÓN
        </button>
      </div>
    </aside>
  );
}