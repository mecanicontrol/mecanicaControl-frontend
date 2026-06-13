import { useEffect, useState } from "react";
import SidebarTecnico from "../../components/Tecnico/SidebarTecnico";
import TopbarTecnico from "../../components/Tecnico/TopbarTecnico";
import { Eye, Search, Filter, ClipboardList, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { obtenerMisOrdenesTecnico } from "../../services/tecnicoService";
import api from "../../api/axiosInstance";

export default function OrdenesTecnico() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [taller, setTaller]     = useState(null);

  useEffect(() => {
    obtenerMisOrdenesTecnico()
      .then(({ data }) => setOrdenes(Array.isArray(data) ? data : []))
      .catch(() => setOrdenes([]))
      .finally(() => setCargando(false));
    api.get('/api/taller/estado').then(({ data }) => setTaller(data)).catch(() => {});
  }, []);

  const ordenesFiltradas = ordenes.filter((ot) => {
    const texto = `${ot.codigo} ${ot.cliente} ${ot.vehiculo} ${ot.patente} ${ot.servicio}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const estadoConfig = (estado = "") => {
    switch (estado.toUpperCase()) {
      case "ACTIVA":         return { cls: "bg-blue-100 text-blue-700",   label: "Agendado" };
      case "EN_PROCESO":     return { cls: "bg-orange-100 text-orange-700", label: "En Proceso" };
      case "CONTROL_CALIDAD":return { cls: "bg-cyan-100 text-cyan-700",   label: "Control Calidad" };
      case "LISTA_ENTREGA":  return { cls: "bg-green-100 text-green-700", label: "Listo Entrega" };
      case "COMPLETADA":     return { cls: "bg-gray-100 text-gray-500",   label: "Completada" };
      default:               return { cls: "bg-gray-100 text-gray-700",   label: estado.replace(/_/g, " ") };
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarTecnico />

      <div className="flex-1">
        <TopbarTecnico />

        <main className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-orange-500 font-black tracking-[0.35em] text-xs uppercase">
                Terminal / Órdenes / Técnico
              </p>

              <h1 className="text-5xl font-black text-slate-900 mt-3">
                ÓRDENES DE TRABAJO
              </h1>

              <p className="text-gray-500 mt-2">
                Gestiona las órdenes asignadas, revisa prioridades y estados.
              </p>
            </div>

            <div className="bg-slate-900 text-white px-5 py-3 rounded font-black uppercase text-sm">
              {ordenesFiltradas.length} órdenes
            </div>
          </div>

          {taller && (
            <section className={`rounded-xl px-5 py-3 mb-6 flex items-center gap-4 border ${taller.tallerLleno ? 'bg-red-50 border-red-200' : taller.disponibles <= 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <Car size={18} className={taller.tallerLleno ? 'text-red-500' : taller.disponibles <= 3 ? 'text-yellow-600' : 'text-green-600'} />
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <span className={`text-sm font-black ${taller.tallerLleno ? 'text-red-700' : taller.disponibles <= 3 ? 'text-yellow-700' : 'text-green-700'}`}>
                  Taller: {taller.vehiculosEnTaller}/{taller.capacidadMaxima} vehículos
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${taller.tallerLleno ? 'bg-red-500' : taller.disponibles <= 3 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, Math.round((taller.vehiculosEnTaller / taller.capacidadMaxima) * 100))}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${taller.tallerLleno ? 'text-red-500' : taller.disponibles <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {taller.tallerLleno ? '— Lleno' : `— ${taller.disponibles} cupo${taller.disponibles !== 1 ? 's' : ''} libre${taller.disponibles !== 1 ? 's' : ''}`}
                </span>
              </div>
            </section>
          )}

          <section className="bg-white rounded-2xl shadow p-6 mb-8">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por OT, vehículo, cliente o patente..."
                  className="w-full bg-gray-100 rounded-xl pl-12 pr-4 py-4 outline-none"
                />
              </div>

              <button
                onClick={() => alert("Filtros disponibles próximamente")}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-6 py-4 rounded-xl font-black uppercase"
              >
                <Filter size={18} />
                Filtros
              </button>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-8 py-6 border-b flex items-center gap-3">
              <ClipboardList className="text-orange-500" />

              <h2 className="text-2xl font-black uppercase text-slate-900">
                Listado operativo
              </h2>
            </div>

            <div className="divide-y">
              {cargando ? (
                <p className="text-center py-12 text-gray-400 animate-pulse">Cargando órdenes...</p>
              ) : ordenesFiltradas.length === 0 ? (
                <p className="text-center py-12 text-gray-400">No hay órdenes asignadas</p>
              ) : (
                ordenesFiltradas.map((ot) => (
                  <div
                    key={ot.codigo}
                    className="p-6 hover:bg-gray-50 transition grid grid-cols-12 gap-4 items-center"
                  >
                    <div className="col-span-2">
                      <p className="text-orange-500 font-black">{ot.codigo}</p>
                      <p className="text-xs text-gray-500">{ot.fecha}</p>
                    </div>

                    <div className="col-span-3">
                      <p className="font-black text-slate-900">{ot.vehiculo}</p>
                      <p className="text-sm text-gray-500">
                        {ot.patente} · {ot.cliente}
                      </p>
                    </div>

                    <div className="col-span-3">
                      <p className="font-semibold text-slate-700">{ot.servicio}</p>
                    </div>

                    <div className="col-span-2">
                      <span className={`px-4 py-2 rounded-full text-xs font-black uppercase ${estadoConfig(ot.estado).cls}`}>
                        {estadoConfig(ot.estado).label}
                      </span>
                    </div>

                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => navigate(`/tecnico/ordenes/${ot.codigo}`)}
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-black text-sm uppercase"
                      >
                        <Eye size={18} />
                        Ver detalle
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}