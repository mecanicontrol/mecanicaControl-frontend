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
    { name: "Dashboard", icon: LayoutDashboard, path: "/cliente/dashboard" },
    { name: "Vehículos", icon: Car, path: "/mis-vehiculos" },
    { name: "Agendamientos", icon: Calendar, path: "/cliente/agendamientos" },
    { name: "Historial", icon: History, path: "/cliente/historial" },
    { name: "Perfil", icon: User, path: "/cliente/perfil" },
  ];

  return (
    <aside className="w-72 min-h-screen bg-slate-900 text-white flex flex-col justify-between shadow-2xl">
      <div>
        <div
          onClick={() => navigate("/cliente/dashboard")}
          className="p-8 cursor-pointer hover:opacity-90 transition"
        >
          <h1 className="text-3xl font-black tracking-tight">
            Mecánica<span className="text-orange-500">Hub</span>
          </h1>

          <p className="text-xs text-gray-400 uppercase tracking-widest mt-2">
            Silver Member
          </p>
        </div>

        <nav className="space-y-2 px-4">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition duration-200 ${
                  active
                    ? "bg-orange-500 text-white shadow-lg"
                    : "hover:bg-slate-800 text-gray-300 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4">
        <button
          onClick={() => navigate("/cotizador")}
          className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 py-4 rounded-xl font-black uppercase shadow-lg transition duration-200"
        >
          Nueva cotización
        </button>
      </div>
    </aside>
  );
}

export default SidebarCliente;