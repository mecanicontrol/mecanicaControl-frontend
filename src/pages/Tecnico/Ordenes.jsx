import { useEffect, useState } from "react";
import SidebarTecnico from "../../components/Tecnico/SidebarTecnico";
import TopbarTecnico from "../../components/Tecnico/TopbarTecnico";
import { obtenerMisOTs } from "../../services/adminOTService";
import {
  Eye,
  Search,
  Filter,
  Info,
  Circle,
  ClipboardList,
  X,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { obtenerOTs } from "../../services/adminOTService";

export default function OrdenesTecnico() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [disponible, setDisponible] = useState(true);
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarNuevaOT, setMostrarNuevaOT] = useState(false);
  const [mostrarHorario, setMostrarHorario] = useState(false);

  const [nuevaOT, setNuevaOT] = useState({
    cliente: "",
    vehiculo: "",
    patente: "",
    servicio: "",
    estado: "Pendiente",
    prioridad: "Media",
    fecha: "",
  });

  const [dias, setDias] = useState([
    { dia: "LUN", inicio: "08:30", fin: "18:00", activo: true },
    { dia: "MAR", inicio: "08:30", fin: "18:00", activo: true },
    { dia: "MIÉ", inicio: "08:30", fin: "18:00", activo: true },
    { dia: "JUE", inicio: "08:30", fin: "18:00", activo: true },
    { dia: "VIE", inicio: "08:30", fin: "18:00", activo: true },
    { dia: "SÁB", inicio: "—", fin: "OFF", activo: false },
    { dia: "DOM", inicio: "—", fin: "OFF", activo: false },
  ]);

  useEffect(() => {
    cargarOrdenesBackend();

    const disponibilidadGuardada = localStorage.getItem("tecnico-disponible");
    const horarioGuardado = localStorage.getItem("horario-tecnico");

    if (disponibilidadGuardada !== null) {
      setDisponible(disponibilidadGuardada === "true");
    }

    if (horarioGuardado) {
      setDias(JSON.parse(horarioGuardado));
    }
  }, []);

  const normalizarOT = (ot) => {
    const cliente =
      ot?.cliente?.nombre ||
      ot?.clienteNombre ||
      ot?.nombreCliente ||
      ot?.cliente ||
      "Cliente no asignado";

    const vehiculo =
      ot?.vehiculo?.modelo ||
      ot?.vehiculo?.marcaModelo ||
      ot?.vehiculoNombre ||
      ot?.modeloVehiculo ||
      ot?.vehiculo ||
      "Vehículo no asignado";

    const patente =
      ot?.vehiculo?.patente ||
      ot?.patente ||
      ot?.placa ||
      "Sin patente";

    const servicio =
      ot?.servicio?.nombre ||
      ot?.servicioNombre ||
      ot?.descripcion ||
      ot?.diagnostico ||
      ot?.motivo ||
      ot?.servicio ||
      "Servicio no especificado";

    return {
      id: ot?.id || ot?.otId || ot?.codigo,
      codigo: ot?.codigo || ot?.numero || ot?.id || "SIN-CODIGO",
      cliente,
      vehiculo,
      patente,
      servicio,
      estado: ot?.estado || ot?.estadoOT || "Pendiente",
      prioridad: ot?.prioridad || "Media",
      fecha:
        ot?.fechaEstimada ||
        ot?.fechaProgramada ||
        ot?.fechaCreacion ||
        ot?.fecha ||
        "Sin fecha",
      original: ot,
    };
  };

  const cargarOrdenesBackend = async () => {
    try {
      setCargando(true);
      setError("");

      const response = await obtenerMisOTs();

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.content || response.data?.data || [];

      const ordenesNormalizadas = data.map(normalizarOT);
      setOrdenes(ordenesNormalizadas);

      console.log("OT cargadas desde backend:", data);
    } catch (err) {
      console.error("Error cargando OT desde backend:", err);
      setError("No se pudieron cargar las órdenes desde el backend.");
      setOrdenes([]);
    } finally {
      setCargando(false);
    }
  };

  const cambiarDisponibilidad = () => {
    const nuevoEstado = !disponible;
    setDisponible(nuevoEstado);
    localStorage.setItem("tecnico-disponible", String(nuevoEstado));
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroPrioridad("Todas");
    setFiltroEstado("Todos");
  };

  const crearOT = () => {
    alert(
      "Para crear OT real falta agregar el endpoint POST en el service. Por ahora esta pantalla carga las OT reales desde /api/ot."
    );
    setMostrarNuevaOT(false);
  };

  const guardarHorario = () => {
    localStorage.setItem("horario-tecnico", JSON.stringify(dias));
    setMostrarHorario(false);
  };

  const cambiarDia = (index, campo, valor) => {
    const copia = [...dias];
    copia[index] = { ...copia[index], [campo]: valor };
    setDias(copia);
  };

  const ordenesFiltradas = ordenes.filter((ot) => {
    const texto = `${ot.codigo} ${ot.cliente} ${ot.vehiculo} ${ot.patente} ${ot.servicio}`.toLowerCase();

    const coincideBusqueda = texto.includes(busqueda.toLowerCase());
    const coincidePrioridad =
      filtroPrioridad === "Todas" ||
      String(ot.prioridad).toLowerCase() === filtroPrioridad.toLowerCase();

    const coincideEstado =
      filtroEstado === "Todos" ||
      String(ot.estado).toLowerCase() === filtroEstado.toLowerCase();

    return coincideBusqueda && coincidePrioridad && coincideEstado;
  });

  const estadoClass = (estado) => {
    const e = String(estado).toLowerCase();

    if (e.includes("complet")) return "bg-green-100 text-green-700";
    if (e.includes("ruta") || e.includes("proceso")) return "bg-blue-100 text-blue-700";
    if (e.includes("pend")) return "bg-orange-100 text-orange-700";
    if (e.includes("program")) return "bg-gray-200 text-gray-700";

    return "bg-gray-200 text-gray-700";
  };

  const prioridadClass = (prioridad) => {
    const p = String(prioridad).toLowerCase();

    if (p.includes("alta") || p.includes("crítica") || p.includes("critica"))
      return "text-red-600";

    if (p.includes("media")) return "text-yellow-600";

    return "text-blue-600";
  };

  const prioridadDot = (prioridad) => {
    const p = String(prioridad).toLowerCase();

    if (p.includes("alta") || p.includes("crítica") || p.includes("critica"))
      return "fill-red-600 text-red-600";

    if (p.includes("media")) return "fill-yellow-500 text-yellow-500";

    return "fill-blue-600 text-blue-600";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarTecnico />

      <div className="flex-1">
        <TopbarTecnico />

        <main className="p-8">
          <div className="flex justify-between items-start mb-7">
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

            <button
              onClick={() => setMostrarNuevaOT(true)}
              className="bg-slate-900 text-orange-500 px-7 py-4 rounded-lg font-black uppercase text-sm hover:bg-slate-800 flex items-center gap-2"
            >
              <Plus size={18} />
              Nueva OT
            </button>
          </div>

          <section className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-4 bg-white rounded-2xl shadow p-7">
              <p className="text-orange-500 font-black text-xs tracking-widest uppercase">
                Estado actual
              </p>

              <h2 className="text-xl font-black text-slate-900 mt-2 uppercase">
                Mi disponibilidad
              </h2>

              <div className="mt-7 bg-gray-100 rounded-xl p-6 flex items-center justify-between">
                <div>
                  <p
                    className={`text-3xl font-black ${
                      disponible ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {disponible ? "DISPONIBLE" : "NO DISPONIBLE"}
                  </p>

                  <p className="text-xs font-black tracking-widest text-slate-800 uppercase">
                    {disponible ? "Listo para asignación" : "Fuera de servicio"}
                  </p>
                </div>

                <button
                  onClick={cambiarDisponibilidad}
                  className={`w-20 h-10 rounded-full flex items-center p-1 transition ${
                    disponible
                      ? "bg-green-500 justify-end"
                      : "bg-red-500 justify-start"
                  }`}
                >
                  <span className="w-8 h-8 bg-white rounded-full shadow" />
                </button>
              </div>

              <p className="text-sm text-slate-600 leading-6 mt-8 border-t pt-6">
                Al estar{" "}
                <b className={disponible ? "text-green-600" : "text-red-600"}>
                  {disponible ? "DISPONIBLE" : "NO DISPONIBLE"}
                </b>
                , el sistema podrá asignarte órdenes de trabajo prioritarias
                según tu geolocalización.
              </p>
            </div>

            <div className="col-span-8 bg-white rounded-2xl shadow p-7">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 uppercase">
                  Mi horario semanal
                </h2>

                <button
                  onClick={() => setMostrarHorario(true)}
                  className="text-orange-500 font-black text-xs uppercase tracking-widest"
                >
                  Editar horario
                </button>
              </div>

              <div className="grid grid-cols-7 gap-4 mt-6">
                {dias.map((item) => (
                  <div
                    key={item.dia}
                    className={`rounded-xl p-5 text-center ${
                      item.activo
                        ? "bg-orange-50 border border-orange-200"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <p
                      className={`font-black text-xs ${
                        item.activo ? "text-orange-500" : "text-gray-400"
                      }`}
                    >
                      {item.dia}
                    </p>

                    <p className="font-black mt-4 text-slate-900">
                      {item.inicio}
                    </p>

                    <div className="w-px h-8 bg-orange-400 mx-auto my-2" />

                    <p className="font-black text-slate-900">{item.fin}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-gray-50 rounded-xl p-5 flex items-center gap-3 text-sm text-slate-600 italic">
                <Info size={20} className="text-orange-500" />
                Tu horario actual contempla 47.5 horas semanales asignadas bajo
                contrato de técnico Senior.
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow p-6 mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por OT, vehículo, cliente o patente..."
                  className="w-full bg-gray-100 rounded-xl pl-12 pr-4 py-4 outline-none text-slate-700"
                />
              </div>

              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-8 py-4 rounded-xl font-black uppercase"
              >
                <Filter size={18} />
                Filtros
              </button>

              <button
                onClick={cargarOrdenesBackend}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-xl font-black uppercase"
              >
                <RefreshCw size={18} />
                Recargar
              </button>
            </div>

            {mostrarFiltros && (
              <div className="grid grid-cols-3 gap-4 mt-5 border-t pt-5">
                <select
                  value={filtroPrioridad}
                  onChange={(e) => setFiltroPrioridad(e.target.value)}
                  className="bg-gray-100 rounded-xl px-4 py-3 font-bold outline-none"
                >
                  <option>Todas</option>
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                  <option>Crítica</option>
                </select>

                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="bg-gray-100 rounded-xl px-4 py-3 font-bold outline-none"
                >
                  <option>Todos</option>
                  <option>Pendiente</option>
                  <option>En ruta</option>
                  <option>En proceso</option>
                  <option>Programada</option>
                  <option>Completada</option>
                </select>

                <button
                  onClick={limpiarFiltros}
                  className="bg-slate-900 text-white rounded-xl font-black uppercase"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-8 py-5 border-b flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <ClipboardList className="text-orange-500" />

                <h2 className="text-xl font-black uppercase text-slate-900">
                  Próximas OT programadas
                </h2>
              </div>

              <span className="bg-slate-900 text-white px-4 py-2 rounded text-xs font-black">
                BACKEND /API/OT
              </span>
            </div>

            <div className="grid grid-cols-12 px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-600 border-b">
              <div className="col-span-2">ID OT</div>
              <div className="col-span-2">Prioridad</div>
              <div className="col-span-3">Cliente / Activo</div>
              <div className="col-span-2">Fecha estimada</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-1 text-center">Acción</div>
            </div>

            <div className="divide-y">
              {cargando ? (
                <div className="p-10 text-center font-black text-gray-400">
                  Cargando órdenes desde backend...
                </div>
              ) : error ? (
                <div className="p-10 text-center">
                  <p className="font-black text-red-600">{error}</p>
                  <button
                    onClick={cargarOrdenesBackend}
                    className="mt-4 bg-orange-500 text-white px-5 py-3 rounded-xl font-black"
                  >
                    Intentar nuevamente
                  </button>
                </div>
              ) : ordenesFiltradas.length === 0 ? (
                <div className="p-10 text-center font-black text-gray-400">
                  No se encontraron órdenes.
                </div>
              ) : (
                ordenesFiltradas.map((ot) => (
                  <div
                    key={ot.codigo}
                    className="grid grid-cols-12 px-8 py-6 items-center hover:bg-gray-50 transition"
                  >
                    <div className="col-span-2">
                      <p className="font-black text-slate-900">#{ot.codigo}</p>
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                      <Circle size={10} className={prioridadDot(ot.prioridad)} />

                      <p
                        className={`font-black text-sm ${prioridadClass(
                          ot.prioridad
                        )}`}
                      >
                        {String(ot.prioridad).toUpperCase()}
                      </p>
                    </div>

                    <div className="col-span-3">
                      <p className="font-black text-slate-900">{ot.cliente}</p>
                      <p className="text-sm text-gray-500">
                        {ot.vehiculo} · {ot.patente}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-slate-700">{ot.fecha}</p>
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`px-4 py-2 rounded text-xs font-black uppercase ${estadoClass(
                          ot.estado
                        )}`}
                      >
                        {ot.estado}
                      </span>
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => navigate(`/tecnico/ordenes/${ot.codigo}`)}
                        className="inline-flex items-center justify-center text-slate-900 hover:text-orange-500"
                      >
                        <Eye size={24} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>

      {mostrarNuevaOT && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[520px] p-7">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-black text-slate-900">NUEVA OT</h2>
              <button onClick={() => setMostrarNuevaOT(false)}>
                <X />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Esta ventana queda lista visualmente, pero para crear una OT real
              falta confirmar el endpoint POST del backend.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Cliente"
                value={nuevaOT.cliente}
                onChange={(e) =>
                  setNuevaOT({ ...nuevaOT, cliente: e.target.value })
                }
                className="bg-gray-100 rounded-xl px-4 py-3 outline-none"
              />

              <input
                placeholder="Vehículo"
                value={nuevaOT.vehiculo}
                onChange={(e) =>
                  setNuevaOT({ ...nuevaOT, vehiculo: e.target.value })
                }
                className="bg-gray-100 rounded-xl px-4 py-3 outline-none"
              />

              <input
                placeholder="Patente"
                value={nuevaOT.patente}
                onChange={(e) =>
                  setNuevaOT({ ...nuevaOT, patente: e.target.value })
                }
                className="bg-gray-100 rounded-xl px-4 py-3 outline-none"
              />

              <input
                placeholder="Fecha estimada"
                value={nuevaOT.fecha}
                onChange={(e) =>
                  setNuevaOT({ ...nuevaOT, fecha: e.target.value })
                }
                className="bg-gray-100 rounded-xl px-4 py-3 outline-none"
              />

              <select
                value={nuevaOT.prioridad}
                onChange={(e) =>
                  setNuevaOT({ ...nuevaOT, prioridad: e.target.value })
                }
                className="bg-gray-100 rounded-xl px-4 py-3 outline-none"
              >
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </select>

              <select
                value={nuevaOT.estado}
                onChange={(e) =>
                  setNuevaOT({ ...nuevaOT, estado: e.target.value })
                }
                className="bg-gray-100 rounded-xl px-4 py-3 outline-none"
              >
                <option>Pendiente</option>
                <option>En ruta</option>
                <option>Programada</option>
                <option>Completada</option>
              </select>

              <textarea
                placeholder="Servicio"
                value={nuevaOT.servicio}
                onChange={(e) =>
                  setNuevaOT({ ...nuevaOT, servicio: e.target.value })
                }
                className="col-span-2 bg-gray-100 rounded-xl px-4 py-3 outline-none resize-none h-24"
              />
            </div>

            <button
              onClick={crearOT}
              className="mt-5 w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-black uppercase"
            >
              Crear orden
            </button>
          </div>
        </div>
      )}

      {mostrarHorario && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[700px] p-7">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-black text-slate-900">
                EDITAR HORARIO
              </h2>
              <button onClick={() => setMostrarHorario(false)}>
                <X />
              </button>
            </div>

            <div className="space-y-3">
              {dias.map((item, index) => (
                <div
                  key={item.dia}
                  className="grid grid-cols-4 gap-3 items-center bg-gray-100 rounded-xl p-3"
                >
                  <p className="font-black">{item.dia}</p>

                  <input
                    value={item.inicio}
                    onChange={(e) => cambiarDia(index, "inicio", e.target.value)}
                    className="bg-white rounded-lg px-3 py-2 outline-none"
                  />

                  <input
                    value={item.fin}
                    onChange={(e) => cambiarDia(index, "fin", e.target.value)}
                    className="bg-white rounded-lg px-3 py-2 outline-none"
                  />

                  <button
                    onClick={() => cambiarDia(index, "activo", !item.activo)}
                    className={`rounded-lg py-2 font-black ${
                      item.activo
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.activo ? "ACTIVO" : "OFF"}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={guardarHorario}
              className="mt-5 w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-black uppercase"
            >
              Guardar horario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}