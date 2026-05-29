import { useEffect, useState } from "react";
import SidebarTecnico from "../../components/Tecnico/SidebarTecnico";
import TopbarTecnico from "../../components/Tecnico/TopbarTecnico";
import { Eye, Search, Filter, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OrdenesTecnico() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [ordenes, setOrdenes] = useState([]);

  const ordenesBase = [
    {
      codigo: "OT-2026-0011",
      cliente: "Claudio Mohr",
      vehiculo: "Toyota Hilux",
      patente: "ZWWVE2",
      servicio: "Revisión sistema eléctrico",
      estado: "En proceso",
      prioridad: "Media",
      fecha: "29/05/2026",
    },
    {
      codigo: "OT-2026-0012",
      cliente: "María González",
      vehiculo: "Chevrolet Silverado",
      patente: "DDS-0012",
      servicio: "Diagnóstico electrónico",
      estado: "Pendiente",
      prioridad: "Alta",
      fecha: "29/05/2026",
    },
    {
      codigo: "OT-2026-0013",
      cliente: "Juan Pérez",
      vehiculo: "Ford Ranger",
      patente: "FRD-2231",
      servicio: "Mantención preventiva",
      estado: "Completada",
      prioridad: "Baja",
      fecha: "28/05/2026",
    },
  ];

  useEffect(() => {
    const actualizadas = ordenesBase.map((ot) => ({
      ...ot,
      estado: localStorage.getItem(`estado-${ot.codigo}`) || ot.estado,
    }));

    setOrdenes(actualizadas);
  }, []);

  const ordenesFiltradas = ordenes.filter((ot) => {
    const texto = `${ot.codigo} ${ot.cliente} ${ot.vehiculo} ${ot.patente} ${ot.servicio}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const estadoClass = (estado) => {
    if (estado === "Completada") return "bg-green-100 text-green-700";
    if (estado === "En proceso") return "bg-orange-100 text-orange-700";
    return "bg-gray-100 text-gray-700";
  };

  const prioridadClass = (prioridad) => {
    if (prioridad === "Alta") return "text-red-600";
    if (prioridad === "Media") return "text-orange-600";
    return "text-green-600";
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
              {ordenesFiltradas.map((ot) => (
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
                    <p className="font-semibold text-slate-700">
                      {ot.servicio}
                    </p>

                    <p className={`text-sm font-black ${prioridadClass(ot.prioridad)}`}>
                      Prioridad {ot.prioridad}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <span
                      className={`px-4 py-2 rounded-full text-xs font-black uppercase ${estadoClass(
                        ot.estado
                      )}`}
                    >
                      {ot.estado}
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
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}