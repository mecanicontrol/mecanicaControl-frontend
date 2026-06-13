import {
  LayoutDashboard,
  Car,
  Calendar,
  History,
  User
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function SidebarCliente() {
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard",      icon: LayoutDashboard, path: "/cliente/dashboard"    },
    { name: "Vehículos",      icon: Car,             path: "/mis-vehiculos"        },
    { name: "Agendamientos",  icon: Calendar,        path: "/cliente/agendamientos"},
    { name: "Historial",      icon: History,         path: "/cliente/historial"    },
    { name: "Perfil",         icon: User,            path: "/cliente/perfil"       },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col justify-between shadow-2xl flex-shrink-0">
      <div>
        <div
          onClick={() => navigate("/cliente/dashboard")}
          className="px-4 py-4 cursor-pointer hover:opacity-90 transition border-b border-slate-800 h-16 flex flex-col justify-center"
        >
          <h1 className="text-lg font-black tracking-tight">
            Mecánica<span className="text-orange-500">Hub</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-0.5">
            Portal Cliente
          </p>
        </div>

        <nav className="space-y-0.5 px-2 py-4">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition duration-200 ${
                  active
                    ? "bg-orange-500 text-white shadow"
                    : "hover:bg-slate-800 text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => navigate("/cotizador")}
          className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 py-2.5 rounded-lg text-sm font-bold uppercase shadow transition duration-200"
        >
          Nueva cotización
        </button>
      </div>
    </aside>
  );
}

export default SidebarCliente;