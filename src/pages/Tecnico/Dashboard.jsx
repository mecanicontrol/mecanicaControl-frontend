import SidebarTecnico from "../../components/Tecnico/SidebarTecnico";
import TopbarTecnico from "../../components/Tecnico/TopbarTecnico";
import { useEffect, useState } from "react";
import { obtenerDashboardTecnico } from "../../services/tecnicoService";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Car,
  Clock,
  Activity,
  Wrench,
  Eye,
  Bell,
} from "lucide-react";

const ordenesBase = [
  {
    codigo: "OT-2026-0011",
    vehiculo: "Toyota Hilux",
    patente: "ZWWVE2",
    servicio: "Revisión sistema eléctrico",
    estado: "En proceso",
    prioridad: "Media",
    progreso: 60,
  },
  {
    codigo: "OT-2026-0012",
    vehiculo: "Chevrolet Silverado",
    patente: "DDS-0012",
    servicio: "Diagnóstico electrónico",
    estado: "Pendiente",
    prioridad: "Alta",
    progreso: 20,
  },
  {
    codigo: "OT-2026-0013",
    vehiculo: "Ford Ranger",
    patente: "FRD-2231",
    servicio: "Mantención preventiva",
    estado: "Completada",
    prioridad: "Baja",
    progreso: 100,
  },
];

export default function TecnicoDashboard() {
  const navigate = useNavigate();

  const [disponible, setDisponible] = useState(
    localStorage.getItem("tecnico-disponible") !== "false"
  );

  const [ordenes, setOrdenes] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const [dashboard, setDashboard] = useState({
    otActivas: 0,
    vehiculosHoy: 0,
    tiempoPromedio: "42m",
    rendimiento: "98%",
  });

  useEffect(() => {
    cargarOrdenes();
    cargarDashboard();
  }, []);

  const cargarOrdenes = () => {
    const actualizadas = ordenesBase.map((ot) => ({
      ...ot,
      estado: localStorage.getItem(`estado-${ot.codigo}`) || ot.estado,
      progreso:
        Number(localStorage.getItem(`progreso-${ot.codigo}`)) || ot.progreso,
    }));

    setOrdenes(actualizadas);

    const activas = actualizadas.filter(
      (ot) => ot.estado !== "Completada"
    ).length;

    setDashboard((prev) => ({
      ...prev,
      otActivas: activas,
      vehiculosHoy: actualizadas.length,
      rendimiento:
        Math.round(
          (actualizadas.filter((ot) => ot.estado === "Completada").length /
            actualizadas.length) *
            100
        ) + "%",
    }));
  };

  const cargarDashboard = async () => {
    try {
      const { data } = await obtenerDashboardTecnico();

      setDashboard((prev) => ({
        ...prev,
        tiempoPromedio: data.tiempoPromedio
          ? `${data.tiempoPromedio}m`
          : prev.tiempoPromedio,
      }));
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    }
  };

  const avisar = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 2500);
  };

  const crearNuevaRevision = () => {
    navigate("/tecnico/ordenes");
  };

  const cambiarDisponibilidad = () => {
    const nuevoEstado = !disponible;
    setDisponible(nuevoEstado);
    localStorage.setItem("tecnico-disponible", nuevoEstado);
    avisar(
      nuevoEstado
        ? "Disponibilidad activada correctamente."
        : "Disponibilidad desactivada correctamente."
    );
  };

  const estadoClass = (estado) => {
    if (estado === "Completada") return "bg-green-100 text-green-700";
    if (estado === "En proceso") return "bg-orange-100 text-orange-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarTecnico />

      <div className="flex-1">
        <TopbarTecnico />

        <main className="p-8">
          {mensaje && (
            <div className="mb-6 bg-green-100 text-green-700 px-6 py-4 rounded-xl font-black">
              {mensaje}
            </div>
          )}

          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-orange-500 font-black tracking-[0.35em] text-xs uppercase">
                Terminal / Dashboard / Técnico
              </p>

              <h1 className="text-5xl font-black text-slate-900 mt-3">
                MI DASHBOARD
              </h1>

              <p className="text-gray-500 mt-2">
                Centro operativo de órdenes asignadas y rendimiento técnico.
              </p>
            </div>

            <div
              className={`px-5 py-3 rounded font-black uppercase text-sm ${
                disponible
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {disponible ? "● Operacional" : "● No disponible"}
            </div>
          </div>

          <section className="bg-slate-900 text-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black uppercase">
                  Bienvenido, Carlos
                </h2>

                <p className="text-slate-400 mt-3">
                  Tienes órdenes activas listas para gestionar.
                </p>
              </div>

              <button
                onClick={crearNuevaRevision}
                className="bg-orange-500 hover:bg-orange-600 px-8 py-4 rounded font-black uppercase"
              >
                Nueva revisión
              </button>
            </div>
          </section>

          <section className="grid grid-cols-4 gap-6 mb-8">
            <CardResumen
              icon={<ClipboardList className="text-orange-500 mb-4" size={30} />}
              borde="border-orange-500"
              titulo="OT activas"
              valor={dashboard.otActivas}
            />

            <CardResumen
              icon={<Car className="text-green-500 mb-4" size={30} />}
              borde="border-green-500"
              titulo="Vehículos hoy"
              valor={dashboard.vehiculosHoy}
            />

            <CardResumen
              icon={<Clock className="text-blue-500 mb-4" size={30} />}
              borde="border-blue-500"
              titulo="Tiempo promedio"
              valor={dashboard.tiempoPromedio}
            />

            <CardResumen
              icon={<Activity className="text-yellow-500 mb-4" size={30} />}
              borde="border-yellow-500"
              titulo="Rendimiento"
              valor={dashboard.rendimiento}
              naranja
            />
          </section>

          <section className="grid grid-cols-12 gap-8">
            <div className="col-span-8 bg-white rounded-2xl shadow p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black uppercase text-slate-900">
                  Órdenes asignadas
                </h2>

                <span className="text-xs font-black text-slate-500 uppercase">
                  Sincronizado localmente
                </span>
              </div>

              <div className="space-y-5">
                {ordenes.map((ot) => (
                  <div
                    key={ot.codigo}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-orange-500 font-black">
                          {ot.codigo}
                        </p>

                        <h3 className="text-xl font-black mt-1">
                          {ot.vehiculo}
                        </h3>

                        <p className="text-gray-500 text-sm">
                          Patente: {ot.patente} · {ot.servicio}
                        </p>
                      </div>

                      <span
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase ${estadoClass(
                          ot.estado
                        )}`}
                      >
                        {ot.estado}
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="flex justify-between text-xs font-black uppercase mb-2">
                        <span>Progreso</span>
                        <span>{ot.progreso}%</span>
                      </div>

                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{ width: ot.progreso + "%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-5">
                      <p className="text-sm text-gray-500">
                        Prioridad:{" "}
                        <span className="font-bold text-slate-900">
                          {ot.prioridad}
                        </span>
                      </p>

                      <button
                        onClick={() => navigate(`/tecnico/ordenes/${ot.codigo}`)}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded font-black text-sm uppercase"
                      >
                        <Eye size={18} />
                        Ver detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-4 space-y-8">
              <div className="bg-white rounded-2xl shadow p-8">
                <h2 className="text-2xl font-black uppercase mb-6">
                  Actividad reciente
                </h2>

                <div className="space-y-5">
                  <Actividad icon={<Bell />} titulo="Nueva OT asignada" tiempo="Hace 12 minutos" />
                  <Actividad icon={<Wrench />} titulo="Diagnóstico actualizado" tiempo="Hace 35 minutos" />
                  <Actividad icon={<Activity />} titulo="Disponibilidad confirmada" tiempo="Hace 1 hora" />
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl shadow p-8">
                <h2 className="text-2xl font-black uppercase">
                  Disponibilidad
                </h2>

                <p
                  className={`font-black mt-5 ${
                    disponible ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {disponible ? "● Disponible" : "● No disponible"}
                </p>

                <p className="text-slate-400 mt-3">
                  {disponible
                    ? "Listo para recibir nuevas órdenes de trabajo."
                    : "No recibirás nuevas órdenes mientras estés inactivo."}
                </p>

                <button
                  onClick={cambiarDisponibilidad}
                  className="mt-6 w-full bg-orange-500 hover:bg-orange-600 py-4 rounded font-black uppercase"
                >
                  Cambiar estado
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function CardResumen({ icon, borde, titulo, valor, naranja = false }) {
  return (
    <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${borde}`}>
      {icon}
      <p className="text-xs text-gray-500 font-black uppercase">{titulo}</p>
      <h3
        className={`text-5xl font-black mt-3 ${
          naranja ? "text-orange-500" : ""
        }`}
      >
        {valor}
      </h3>
    </div>
  );
}

function Actividad({ icon, titulo, tiempo }) {
  return (
    <div className="flex gap-4">
      <div className="text-orange-500">{icon}</div>
      <div>
        <p className="font-bold">{titulo}</p>
        <p className="text-gray-500 text-sm">{tiempo}</p>
      </div>
    </div>
  );
}