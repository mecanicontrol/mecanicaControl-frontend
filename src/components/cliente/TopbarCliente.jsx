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
      const res = await obtenerMisAgendamientos();
      setAgendamientos(res.data || []);
    } catch (error) {
      console.error(error);
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
    <header className="bg-white h-20 px-8 flex items-center justify-between border-b relative">
      <h1
        onClick={() => navigate("/cliente/dashboard")}
        className="text-3xl font-black text-orange-500 cursor-pointer hover:opacity-80 transition"
      >
        PORTAL DE CLIENTE
      </h1>

      <div className="flex items-center gap-6 relative">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            onClick={buscar}
          />

          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Buscar vehículo o OT..."
            className="pl-12 pr-4 py-3 w-80 rounded-xl bg-gray-100 outline-none"
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
            <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl p-5 z-50 border">
              <h3 className="font-black text-lg mb-4">Próximas citas</h3>

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
            className="w-12 h-12 rounded-full border-2 border-orange-500 cursor-pointer object-cover bg-white"
          />

          {mostrarMenuUsuario && (
            <div className="absolute right-0 top-14 bg-white rounded-2xl shadow-2xl w-72 overflow-hidden z-50 border">
              <div className="px-5 py-4 border-b bg-gray-50">
                <p className="font-black text-slate-900">
                  {usuario?.nombre || "Cliente"}
                </p>

                <p className="text-sm text-gray-500">
                  {usuario?.email}
                </p>
              </div>

              <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-100 text-left">
                <Home size={18} />
                Inicio
              </button>

              <button onClick={() => navigate("/cliente/dashboard")} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-100 text-left">
                <LayoutDashboard size={18} />
                Dashboard
              </button>

              <button onClick={() => navigate("/cliente/perfil")} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-100 text-left">
                <User size={18} />
                Mi perfil
              </button>

              <button onClick={() => navigate("/mis-vehiculos")} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-100 text-left">
                <Car size={18} />
                Mis vehículos
              </button>

              <button onClick={() => navigate("/cliente/agendamientos")} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-100 text-left">
                <Calendar size={18} />
                Agendamientos
              </button>

              <button onClick={() => navigate("/cliente/historial")} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-100 text-left">
                <History size={18} />
                Historial
              </button>

              <div className="border-t">
                <button
                  onClick={cerrarSesion}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 text-red-600 text-left"
                >
                  <LogOut size={18} />
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