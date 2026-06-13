import {
  Bell,
  Settings,
  Search,
  LogOut,
  User,
  Car,
  Calendar,
  History,
  LayoutDashboard,
  Home
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerMisAgendamientos } from "../../services/agendamientoService";
import { useAuth } from "../../context/AuthContext";

export default function TopbarCliente() {
  const navigate = useNavigate();
  const { logout, usuario } = useAuth();
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  const [busqueda, setBusqueda] = useState("");
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [agendamientos, setAgendamientos] = useState([]);
  const [fotoPerfil, setFotoPerfil] = useState(
    localStorage.getItem("fotoPerfilCliente") ||
      "https://api.dicebear.com/7.x/notionists/svg?seed=DefaultUser"
  );

  useEffect(() => {
    cargarAgendamientos();
  }, []);

  useEffect(() => {
    const actualizarFoto = () => {
      setFotoPerfil(
        localStorage.getItem("fotoPerfilCliente") ||
          "https://api.dicebear.com/7.x/notionists/svg?seed=DefaultUser"
      );
    };

    window.addEventListener("fotoPerfilActualizada", actualizarFoto);

    return () => {
      window.removeEventListener("fotoPerfilActualizada", actualizarFoto);
    };
  }, []);

  useEffect(() => {
    const cerrarMenus = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setMostrarMenuUsuario(false);
        setMostrarNotificaciones(false);
      }
    };

    document.addEventListener("mousedown", cerrarMenus);

    return () => {
      document.removeEventListener("mousedown", cerrarMenus);
    };
  }, []);

  const cargarAgendamientos = async () => {
    try {
      const cached = sessionStorage.getItem('_ag_topbar');
      if (cached) { setAgendamientos(JSON.parse(cached)); return; }
      const res = await obtenerMisAgendamientos();
      const data = res.data || [];
      sessionStorage.setItem('_ag_topbar', JSON.stringify(data));
      setAgendamientos(data);
    } catch {
      // notificaciones no son críticas, falla silenciosa
    }
  };

  const buscar = () => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return;

    const encontrado = agendamientos.find(
      (ag) =>
        ag.patenteVehiculo?.toLowerCase().includes(texto) ||
        ag.idAgendamiento?.toLowerCase().includes(texto)
    );

    if (encontrado) {
      navigate("/cliente/agendamientos");
      setBusqueda("");
    } else {
      alert("No se encontraron resultados");
    }
  };

  const cerrarSesion = () => {
    logout();
    navigate("/login");
  };

  const proximos = agendamientos.slice(0, 3);

  return (
    <header className="bg-white h-16 px-6 flex items-center justify-between border-b relative flex-shrink-0">
      <h1
        onClick={() => navigate("/cliente/dashboard")}
        className="text-sm font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:text-orange-500 transition"
      >
        Portal de Cliente
      </h1>

      <div className="flex items-center gap-4 relative">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            onClick={buscar}
          />

          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Buscar vehículo o OT..."
            className="pl-9 pr-3 py-1.5 w-64 text-sm rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div className="relative" ref={notifRef}>
          <Bell
            className="text-gray-700 cursor-pointer hover:text-orange-500 transition"
            onClick={() =>
              setMostrarNotificaciones(!mostrarNotificaciones)
            }
          />

          {mostrarNotificaciones && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-2xl p-4 z-50 border">
              <h3 className="font-bold text-sm mb-3 text-slate-800">Próximas citas</h3>

              {proximos.length === 0 ? (
                <p className="text-gray-500">No tienes notificaciones</p>
              ) : (
                proximos.map((ag) => (
                  <div
                    key={ag.idAgendamiento}
                    className="border-b py-3 last:border-none"
                  >
                    <p className="font-bold">{ag.nombreServicio}</p>
                    <p className="text-sm text-gray-500">
                      {ag.patenteVehiculo}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <Settings
          className="text-gray-700 cursor-pointer hover:text-orange-500 transition"
          onClick={() => navigate("/cliente/perfil")}
        />

        <div className="relative" ref={menuRef}>
          <img
            src={fotoPerfil}
            alt="usuario"
            onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)}
            className="w-8 h-8 rounded-full border-2 border-orange-500 cursor-pointer object-cover bg-white"
          />

          {mostrarMenuUsuario && (
            <div className="absolute right-0 top-11 bg-white rounded-xl shadow-2xl w-56 overflow-hidden z-50 border">
              <div className="px-4 py-3 border-b bg-gray-50">
                <p className="font-bold text-sm text-slate-900">
                  {usuario?.nombre || "Cliente"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {usuario?.email}
                </p>
              </div>

              <button onClick={() => navigate("/")} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-left text-sm text-gray-700">
                <Home size={15} />
                Inicio
              </button>

              <button onClick={() => navigate("/cliente/dashboard")} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-left text-sm text-gray-700">
                <LayoutDashboard size={15} />
                Dashboard
              </button>

              <button onClick={() => navigate("/cliente/perfil")} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-left text-sm text-gray-700">
                <User size={15} />
                Mi perfil
              </button>

              <button onClick={() => navigate("/mis-vehiculos")} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-left text-sm text-gray-700">
                <Car size={15} />
                Mis vehículos
              </button>

              <button onClick={() => navigate("/cliente/agendamientos")} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-left text-sm text-gray-700">
                <Calendar size={15} />
                Agendamientos
              </button>

              <button onClick={() => navigate("/cliente/historial")} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-left text-sm text-gray-700">
                <History size={15} />
                Historial
              </button>

              <div className="border-t">
                <button
                  onClick={cerrarSesion}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 text-red-500 text-left text-sm"
                >
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}