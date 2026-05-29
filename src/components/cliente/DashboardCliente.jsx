import { useEffect, useState } from "react";
import SidebarCliente from "../../components/cliente/SidebarCliente";
import TopbarCliente from "../../components/cliente/TopbarCliente";
import { obtenerMisVehiculos } from "../../services/vehiculoService";
import { obtenerMisAgendamientos } from "../../services/agendamientoService";
import { useAuth } from "../../context/AuthContext";
import {
  CalendarDays,
  Car,
  BadgeCheck,
  ClipboardList,
  Wrench,
  Bell,
} from "lucide-react";

export default function DashboardCliente() {
  const { usuario } = useAuth();

  const [vehiculos, setVehiculos] = useState([]);
  const [agendamientos, setAgendamientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setErrorCarga("");

    try {
      const vehiculosRes = await obtenerMisVehiculos().catch(() => ({ data: [] }));
      const agendamientosRes = await obtenerMisAgendamientos().catch(() => ({ data: [] }));

      setVehiculos(Array.isArray(vehiculosRes.data) ? vehiculosRes.data : []);
      setAgendamientos(Array.isArray(agendamientosRes.data) ? agendamientosRes.data : []);
    } catch (error) {
      console.error(error);
      setErrorCarga("No se pudieron cargar algunos datos del dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const obtenerTexto = (valor, fallback = "Sin información") => {
    if (!valor) return fallback;
    if (typeof valor === "object") return valor.nombre || valor.descripcion || fallback;
    return valor;
  };

  const proximoAgendamiento = agendamientos[0];
  const otActiva = agendamientos[0];

  const nombreUsuario =
    usuario?.nombre ||
    usuario?.nombreCompleto ||
    usuario?.nombres ||
    "Cliente";

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarCliente />

        <div className="flex-1">
          <TopbarCliente />

          <main className="p-8">
            <div className="space-y-6 animate-pulse">
              <div className="bg-[#16233b] rounded-2xl h-44 shadow-lg"></div>

              <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl shadow p-6 h-28">
                    <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="h-7 bg-gray-200 rounded w-36"></div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow h-64"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarCliente />

      <div className="flex-1">
        <TopbarCliente />

        <main className="p-8">
          {errorCarga && (
            <div className="mb-6 bg-orange-100 text-orange-700 px-5 py-4 rounded-xl font-bold">
              {errorCarga}
            </div>
          )}

          <div className="bg-[#16233b] rounded-2xl text-white shadow-lg overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="p-8 flex-1">
                <h1 className="text-5xl font-black uppercase">
                  ¡Bienvenido de vuelta, {nombreUsuario}!
                </h1>
                <p className="text-gray-300 mt-3 text-lg max-w-2xl">
                  Tu flota está en las mejores manos.
                </p>
              </div>

              <div className="flex h-full">
                <div className="px-10 flex flex-col justify-center items-center border-l border-slate-600">
                  <p className="text-4xl font-bold text-orange-500">
                    {vehiculos.length}
                  </p>
                  <span className="text-sm uppercase tracking-wide">
                    Vehículos
                  </span>
                </div>

                <div className="px-10 flex flex-col justify-center items-center border-l border-slate-600">
                  <p className="text-4xl font-bold text-orange-500">
                    {agendamientos.length}
                  </p>
                  <span className="text-sm uppercase tracking-wide">Citas</span>
                </div>

                <div className="px-10 flex flex-col justify-center items-center border-l border-slate-600">
                  <p className="text-4xl font-bold text-orange-500">1250</p>
                  <span className="text-sm uppercase tracking-wide">Pts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-orange-500">
              <div className="flex items-center gap-4">
                <CalendarDays className="text-orange-500" size={26} />
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Próxima cita
                  </p>
                  <h3 className="text-xl font-bold">
                    {proximoAgendamiento?.fechaInicio
                      ? new Date(proximoAgendamiento.fechaInicio).toLocaleDateString("es-CL")
                      : "Sin citas"}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-4">
                <Car className="text-slate-700" size={26} />
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Vehículos registrados
                  </p>
                  <h3 className="text-xl font-bold">{vehiculos.length}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-4">
                <BadgeCheck className="text-orange-500" size={26} />
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Puntos acumulados
                  </p>
                  <h3 className="text-xl font-bold">1250 Pts</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-4">
                <ClipboardList className="text-slate-700" size={26} />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Servicios</p>
                  <h3 className="text-xl font-bold">{agendamientos.length}</h3>
                </div>
              </div>
            </div>
          </div>

          {otActiva && (
            <div className="mt-8 bg-white rounded-2xl shadow overflow-hidden">
              <div className="bg-orange-500 text-white px-8 py-5 flex justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Wrench size={20} />
                  OT ACTIVA AHORA
                </h2>

                <span className="font-bold">
                  {otActiva.idAgendamiento?.slice?.(0, 8) || "OT"}
                </span>
              </div>

              <div className="p-8">
                <h3 className="text-3xl font-bold">
                  {obtenerTexto(otActiva.nombreServicio, "Servicio agendado")}
                </h3>

                <p className="text-gray-600 mt-2">
                  {obtenerTexto(otActiva.marcaVehiculo, "")}{" "}
                  {obtenerTexto(otActiva.modeloVehiculo, "")}
                </p>

                <p className="text-gray-500 mt-1">
                  Patente: {obtenerTexto(otActiva.patenteVehiculo, "Sin patente")}
                </p>

                <div className="mt-8 bg-gray-100 rounded-xl px-6 py-5">
                  Técnico asignado:
                  <span className="font-bold ml-2">
                    {obtenerTexto(otActiva.nombreTecnico, "Aún no asignado")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 bg-white rounded-2xl shadow p-6">
            <h3 className="font-black text-xl mb-6">
              Próximos agendamientos
            </h3>

            {agendamientos.length === 0 ? (
              <p className="text-gray-500">No tienes agendamientos registrados.</p>
            ) : (
              <div className="space-y-4">
                {agendamientos.slice(0, 3).map((ag, index) => (
                  <div
                    key={ag.idAgendamiento || index}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">
                        {obtenerTexto(ag.nombreServicio, "Servicio")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {obtenerTexto(ag.patenteVehiculo, "Sin patente")}
                      </p>
                    </div>

                    <Bell className="text-orange-500" size={18} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}