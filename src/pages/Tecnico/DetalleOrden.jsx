import { useEffect, useRef, useState } from "react";
import ChatOT from "../../components/shared/ChatOT";
import SidebarTecnico from "../../components/Tecnico/SidebarTecnico";
import TopbarTecnico from "../../components/Tecnico/TopbarTecnico";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Car, User, Wrench, Clock,
  CheckCircle, ClipboardList, Search as SearchIcon, ShieldCheck,
  Upload, X, Plus, Trash2, Send, Bot, PackageSearch,
  Sparkles, StickyNote, Camera, AlertCircle, Tag, CheckSquare,
  Square, MinusCircle, FileText, ListChecks,
} from "lucide-react";
import {
  obtenerDetalleOrdenTecnico,
  actualizarEstadoOrden,
} from "../../services/tecnicoService";
import api from "../../api/axiosInstance";
import { supabase } from "../../lib/supabaseClient";

// ── Orden y metadata de fases ─────────────────────────────────────────────────

const FASES_ORDER = ["RECEPCION", "DIAGNOSTICO", "EN_TRABAJO", "CONTROL_CALIDAD", "LISTO_ENTREGA"];

const FASES_META = {
  RECEPCION:       { label: "Recepción",          labelCorto: "Recepción",  Icono: ClipboardList },
  DIAGNOSTICO:     { label: "Diagnóstico",         labelCorto: "Diagnóstico",Icono: SearchIcon    },
  EN_TRABAJO:      { label: "En trabajo",          labelCorto: "Trabajo",    Icono: Wrench        },
  CONTROL_CALIDAD: { label: "Control de calidad",  labelCorto: "Control",    Icono: ShieldCheck   },
  LISTO_ENTREGA:   { label: "Listo para entrega",  labelCorto: "Entrega",    Icono: Car           },
};

const CHECKLIST_CALIDAD = [
  { id: "motor",     label: "Motor y sistema de transmisión" },
  { id: "frenos",    label: "Sistema de frenos" },
  { id: "electrico", label: "Sistema eléctrico y luces" },
  { id: "fluidos",   label: "Niveles de fluidos" },
  { id: "neumaticos",label: "Neumáticos y ruedas" },
  { id: "limpieza",  label: "Limpieza del vehículo" },
  { id: "ruta",      label: "Prueba de ruta" },
];

// ── Componente principal ──────────────────────────────────────────────────────

export default function DetalleOrden() {
  const { codigo } = useParams();
  const navigate   = useNavigate();

  const [ot,             setOt]             = useState(null);
  const [fases,          setFases]          = useState([]);
  const [idxFase,        setIdxFase]        = useState(0);
  const [cargando,       setCargando]       = useState(true);
  const [mensaje,        setMensaje]        = useState({ texto: "", tipo: "ok" });
  const [panelIA,        setPanelIA]        = useState(false);
  const [contextoIA,     setContextoIA]     = useState("");
  const [confirmRetiro,  setConfirmRetiro]  = useState(false);
  const [procesandoRetiro, setProcesandoRetiro] = useState(false);

  useEffect(() => {
    Promise.all([
      obtenerDetalleOrdenTecnico(codigo),
      api.get(`/api/tecnicos/ordenes/${codigo}/fases`),
    ])
      .then(([{ data: otData }, { data: fasesData }]) => {
        setOt(otData);
        const ordenadas = FASES_ORDER
          .map((n) => fasesData.find((f) => f.nombre === n))
          .filter(Boolean);
        setFases(ordenadas);
        const activa = ordenadas.findIndex((f) => f.estado === "ACTIVA");
        setIdxFase(activa >= 0 ? activa : 0);
      })
      .catch(() => setOt(null))
      .finally(() => setCargando(false));
  }, [codigo]);

  const avisar = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "ok" }), 3500);
  };

  const abrirIA = (contexto = "") => { setContextoIA(contexto); setPanelIA(true); };

  const ejecutarConfirmarRetiro = async () => {
    setProcesandoRetiro(true);
    try {
      await api.post(`/api/tecnicos/ordenes/${codigo}/confirmar-retiro`);
      setOt((prev) => ({ ...prev, estado: "COMPLETADA" }));
      setConfirmRetiro(false);
      avisar("Retiro confirmado — OT cerrada correctamente");
    } catch {
      avisar("Error al confirmar retiro", "error");
    } finally {
      setProcesandoRetiro(false);
    }
  };

  if (cargando) return (
    <Layout><div className="flex items-center justify-center h-64">
      <p className="text-slate-400 animate-pulse text-lg">Cargando orden...</p>
    </div></Layout>
  );

  if (!ot) return (
    <Layout><div className="p-8">
      <BtnVolver onClick={() => navigate("/tecnico/ordenes")} />
      <p className="text-slate-400 mt-4">Orden no encontrada o sin acceso.</p>
    </div></Layout>
  );

  const faseActual  = fases[idxFase] || null;
  const fasePrev    = idxFase > 0 ? fases[idxFase - 1] : null;
  const faseNext    = idxFase < fases.length - 1 ? fases[idxFase + 1] : null;
  const completadas = fases.filter((f) => f.estado === "COMPLETADA").length;
  const progresoPct = fases.length > 0 ? Math.round((completadas / fases.length) * 100) : 0;

  const handleGuardado = (updated) => {
    setFases((prev) => prev.map((f) => f.id === updated.id ? updated : f));
    avisar("Borrador guardado");
  };

  const handleCompletada = (updated) => {
    setFases((prev) => {
      const nuevas = prev.map((f) => f.id === updated.id ? updated : f);
      let activado = false;
      return nuevas.map((f) => {
        if (f.finAt || f.id === updated.id) return { ...f, estado: "COMPLETADA" };
        if (!activado) { activado = true; return { ...f, estado: "ACTIVA" }; }
        return { ...f, estado: "PENDIENTE" };
      });
    });
    if (faseNext) setIdxFase((p) => p + 1);
    avisar(`Fase completada${faseNext ? " — avanzando a la siguiente" : ""}`);
  };

  return (
    <Layout>
      {mensaje.texto && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-2xl transition-all ${
          mensaje.tipo === "error" ? "bg-red-600 text-white" : "bg-green-500 text-white"
        }`}>{mensaje.texto}</div>
      )}

      {panelIA && (
        <PanelIAFlotante ot={ot} contexto={contextoIA} onCerrar={() => setPanelIA(false)} />
      )}

      <div className="p-5 lg:p-6">
        <BtnVolver onClick={() => navigate("/tecnico/ordenes")} />

        {/* Hero: OT + info + progress + tabs de fase */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl mb-5 overflow-hidden">
          {/* Fila superior */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-700">
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <p className="text-[10px] text-orange-500 font-black tracking-[0.25em] uppercase mb-0.5">
                  {ot.servicio || "Servicio de taller"}
                </p>
                <h1 className="text-2xl font-black text-white font-mono leading-none">{ot.codigo}</h1>
              </div>
              <span className={`hidden sm:block text-xs font-black uppercase px-3 py-1.5 rounded-full flex-shrink-0 ${estadoBadgeClass(ot.estado)}`}>
                {ot.estado?.replace(/_/g, " ")}
              </span>
            </div>
            {/* Info chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Car,   val: `${ot.vehiculo} · ${ot.patente}` },
                { icon: User,  val: ot.cliente || "Sin cliente" },
                { icon: Clock, val: ot.fechaInicio ? new Date(ot.fechaInicio).toLocaleDateString("es-CL") : "—" },
              ].map(({ icon: Icon, val }) => (
                <span key={val} className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-700/60 px-3 py-1.5 rounded-lg">
                  <Icon size={11} className="text-slate-500" /> {val}
                </span>
              ))}
            </div>
          </div>

          {/* Barra progreso + tabs de fase en una sola fila */}
          <div className="px-5 py-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{ width: `${progresoPct}%` }} />
              </div>
              <span className="text-xs font-black text-orange-400 flex-shrink-0">{completadas}/{fases.length} · {progresoPct}%</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {fases.map((f, i) => {
                const meta = FASES_META[f.nombre] || { labelCorto: f.nombre, Icono: CheckCircle };
                const esActual = i === idxFase;
                const Icon = meta.Icono;
                return (
                  <button
                    key={f.id}
                    onClick={() => setIdxFase(i)}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-center transition-all ${
                      esActual
                        ? "bg-orange-500/20 border border-orange-500/40"
                        : f.estado === "COMPLETADA"
                        ? "bg-green-500/10 border border-green-500/20 hover:bg-green-500/20"
                        : "bg-slate-700/40 border border-transparent hover:bg-slate-700"
                    }`}
                  >
                    <Icon size={14} className={
                      esActual ? "text-orange-400" :
                      f.estado === "COMPLETADA" ? "text-green-400" : "text-slate-600"
                    } />
                    <span className={`text-[10px] font-black leading-tight ${
                      esActual ? "text-orange-400" :
                      f.estado === "COMPLETADA" ? "text-green-400" : "text-slate-600"
                    }`}>{meta.labelCorto}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Banner confirmar retiro — visible cuando OT está LISTA_ENTREGA */}
        {ot.estado === "LISTA_ENTREGA" && (
          <div className="mb-5 bg-green-900/30 border border-green-500/40 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Car size={20} className="text-green-400" />
              </div>
              <div>
                <p className="font-black text-green-300 text-sm">Vehículo listo para entrega</p>
                <p className="text-xs text-green-500/80">Confirma que el cliente retiró su vehículo para cerrar la OT.</p>
              </div>
            </div>
            {!confirmRetiro ? (
              <button
                onClick={() => setConfirmRetiro(true)}
                className="flex-shrink-0 bg-green-500 hover:bg-green-400 text-white font-black text-sm px-5 py-2.5 rounded-xl transition"
              >
                Confirmar retiro del cliente
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-green-300 font-black">¿Confirmar retiro?</span>
                <button
                  onClick={ejecutarConfirmarRetiro}
                  disabled={procesandoRetiro}
                  className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-black text-sm px-4 py-2 rounded-xl transition"
                >
                  {procesandoRetiro ? "Procesando..." : "Sí, confirmar"}
                </button>
                <button
                  onClick={() => setConfirmRetiro(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-black text-sm px-4 py-2 rounded-xl transition"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Grid principal */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
          {/* Panel de fase */}
          <div>
            {faseActual && (
              <PanelFaseRouter
                key={faseActual.id}
                fv={faseActual}
                fases={fases}
                faseNext={faseNext}
                ot={ot}
                codigo={codigo}
                onGuardado={handleGuardado}
                onCompletada={handleCompletada}
                avisar={avisar}
                onAbrirIA={abrirIA}
              />
            )}
          </div>

          {/* Sidebar sticky */}
          <div className="space-y-4 xl:sticky xl:top-5">
            {/* Costos */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Costos</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mano de obra</span>
                  <span className="text-white font-black">${parseFloat(ot.costoManoObra || 0).toLocaleString("es-CL")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Repuestos</span>
                  <span className="text-white font-black">${parseFloat(ot.costoRepuestos || 0).toLocaleString("es-CL")}</span>
                </div>
                <div className="h-px bg-slate-700" />
                <div className="flex justify-between">
                  <span className="text-white font-bold text-sm">Total</span>
                  <span className="text-orange-400 font-black text-base">
                    ${(parseFloat(ot.costoManoObra || 0) + parseFloat(ot.costoRepuestos || 0)).toLocaleString("es-CL")}
                  </span>
                </div>
              </div>
            </div>

            {/* MecaniBot */}
            <button
              onClick={() => abrirIA("")}
              className="w-full bg-slate-800 border border-slate-700 hover:border-orange-500/50 rounded-2xl p-4 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bot size={18} className="text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white text-sm group-hover:text-orange-400 transition-colors">MecaniBot</p>
                  <p className="text-[10px] text-slate-500">Asistente técnico IA</p>
                </div>
                <Sparkles size={13} className="text-orange-500 flex-shrink-0" />
              </div>
            </button>

            {/* Chat con el cliente */}
            <ChatOT codigoOt={codigo} embedded />
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ── Router de fases ───────────────────────────────────────────────────────────

function PanelFaseRouter(props) {
  switch (props.fv.nombre) {
    case "RECEPCION":       return <PanelRecepcion       {...props} />;
    case "DIAGNOSTICO":     return <PanelDiagnostico     {...props} />;
    case "EN_TRABAJO":      return <PanelEnTrabajo        {...props} />;
    case "CONTROL_CALIDAD": return <PanelControlCalidad  {...props} />;
    case "LISTO_ENTREGA":   return <PanelListoEntrega     {...props} />;
    default:                return <PanelGenerico         {...props} />;
  }
}

// ── Hooks / helpers compartidos ───────────────────────────────────────────────

function useFaseBase(fv) {
  const esCompletada = fv.estado === "COMPLETADA";
  const esActiva     = fv.estado === "ACTIVA";
  const meta         = FASES_META[fv.nombre] || { label: fv.nombre, Icono: FileText };
  return { esCompletada, esActiva, meta };
}

async function subirArchivos(archivos, avisar) {
  const urls = [];
  for (const archivo of archivos) {
    const ruta = `ot-imagenes/${Date.now()}-${archivo.name.replace(/\s/g, "_")}`;
    const { error } = await supabase.storage.from("ot-imagenes").upload(ruta, archivo, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("ot-imagenes").getPublicUrl(ruta);
    urls.push(data.publicUrl);
  }
  return urls;
}

function FaseHeader({ meta, esCompletada, esActiva }) {
  return (
    <div className={`px-6 py-4 flex items-center justify-between ${
      esCompletada ? "bg-green-900/40" : esActiva ? "bg-orange-900/30" : "bg-slate-700/50"
    }`}>
      <div className="flex items-center gap-3">
        <meta.Icono size={18} className={esCompletada ? "text-green-400" : esActiva ? "text-orange-400" : "text-slate-500"} />
        <span className="font-black text-white">{meta.label}</span>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
        esCompletada ? "bg-green-500/20 text-green-400" :
        esActiva     ? "bg-orange-500/20 text-orange-400" :
                       "bg-slate-600 text-slate-400"
      }`}>
        {esCompletada ? "Completada" : esActiva ? "En curso" : "Pendiente"}
      </span>
    </div>
  );
}

function ZonaFotos({ imagenes, subiendo, esCompletada, onSubir, onEliminar, errFoto, obligatorio = true }) {
  const fileRef = useRef(null);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Camera size={14} className={errFoto ? "text-red-400" : "text-slate-400"} />
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Evidencia fotográfica</span>
          {obligatorio && !esCompletada && <span className="text-red-500 text-xs font-black">* mín. 1 foto</span>}
        </div>
        {imagenes.length > 0 && (
          <span className="text-xs font-black text-green-400">{imagenes.length} foto{imagenes.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      <div className={`rounded-xl border-2 p-4 transition-colors ${
        errFoto ? "border-red-500 bg-red-950/20" : imagenes.length > 0 ? "border-slate-600 bg-slate-900/50" : "border-dashed border-slate-600"
      }`}>
        <div className="flex flex-wrap gap-3">
          {imagenes.map((url) => (
            <div key={url} className="relative group w-28 h-28 flex-shrink-0">
              <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-slate-600" />
              {!esCompletada && (
                <button
                  onClick={() => onEliminar(url)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}

          {!esCompletada && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={subiendo}
              className="w-28 h-28 border-2 border-dashed border-slate-500 hover:border-orange-500 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-orange-400 transition disabled:opacity-50"
            >
              {subiendo
                ? <span className="text-xs animate-pulse text-center px-2">Subiendo...</span>
                : <><Upload size={20} /><span className="text-xs mt-1 font-black">Agregar</span></>
              }
            </button>
          )}

          {imagenes.length === 0 && !esCompletada && (
            <div className="flex-1 flex items-center justify-center py-4 text-center">
              <div>
                <Camera size={28} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs text-slate-500 font-black">Sin fotos aún</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
        onChange={async (e) => {
          const archivos = Array.from(e.target.files || []);
          if (!archivos.length) return;
          await onSubir(archivos);
          e.target.value = "";
        }}
      />
      {errFoto && (
        <p className="mt-1.5 text-xs font-black text-red-400 flex items-center gap-1">
          <X size={11} /> Debes subir al menos una foto.
        </p>
      )}
    </div>
  );
}

function BotonesAccion({ meta, metaNext, esActiva, guardando, completando, confirmando, onBorrador, onCompletar, onConfirmar, onCancelarConfirm }) {
  if (confirmando) {
    return (
      <div className="bg-orange-950/40 border border-orange-500/50 rounded-xl p-5">
        <p className="font-black text-white mb-1">
          ¿Confirmas que la fase <span className="text-orange-400">{meta.label}</span> está completada?
        </p>
        <p className="text-sm text-slate-400 mb-4">
          Esta acción no se puede deshacer.{metaNext && ` Se activará "${metaNext.label}".`}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancelarConfirm} className="flex-1 px-4 py-2.5 rounded-xl font-black text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition">
            Cancelar
          </button>
          <button onClick={onConfirmar} disabled={completando} className="flex-1 px-4 py-2.5 rounded-xl font-black text-sm bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition flex items-center justify-center gap-2">
            <CheckCircle size={15} /> {completando ? "Completando..." : "Sí, completar fase"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 pt-1">
      {onBorrador && (
        <button
          onClick={onBorrador}
          disabled={guardando}
          className="px-6 py-3 rounded-xl font-black text-sm uppercase bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-50 transition"
        >
          {guardando ? "Guardando..." : "Guardar borrador"}
        </button>
      )}
      <button
        onClick={onCompletar}
        disabled={completando || !esActiva}
        className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-black text-sm uppercase transition"
      >
        {completando ? "Completando..." : (
          <>
            <CheckCircle size={16} />
            {metaNext ? `Completar y avanzar a ${metaNext.labelCorto}` : "Completar fase final"}
          </>
        )}
      </button>
    </div>
  );
}

function FaseCompletadaBadge({ finAt }) {
  return (
    <div className="flex items-center gap-2 text-green-400 text-sm font-black bg-green-900/20 rounded-xl px-4 py-3 border border-green-900/50">
      <CheckCircle size={16} />
      {finAt ? `Completada el ${finAt}` : "Fase completada"}
    </div>
  );
}

// ── PANEL RECEPCIÓN ───────────────────────────────────────────────────────────
// Solo: descripción del estado del vehículo + fotos de llegada

function PanelRecepcion({ fv, faseNext, ot, onGuardado, onCompletada, avisar, onAbrirIA }) {
  const { esCompletada, esActiva, meta } = useFaseBase(fv);
  const metaNext = faseNext ? FASES_META[faseNext.nombre] : null;

  const [observaciones, setObservaciones] = useState(fv.observaciones || "");
  const [imagenes,      setImagenes]      = useState(() => { try { return JSON.parse(fv.imagenes || "[]"); } catch { return []; } });
  const [subiendo,   setSubiendo]   = useState(false);
  const [guardando,  setGuardando]  = useState(false);
  const [completando,setCompletando]= useState(false);
  const [confirmando,setConfirmando]= useState(false);
  const [errDesc,    setErrDesc]    = useState(false);
  const [errFoto,    setErrFoto]    = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => { if (observaciones.trim()) setErrDesc(false); }, [observaciones]);
  useEffect(() => { if (imagenes.length > 0)  setErrFoto(false); }, [imagenes]);

  const handleSubir = async (archivos) => {
    setSubiendo(true);
    try {
      const urls = await subirArchivos(archivos, avisar);
      setImagenes((p) => [...p, ...urls]);
    } catch { avisar("Error al subir la imagen", "error"); }
    finally { setSubiendo(false); }
  };

  const payload = () => ({ observaciones, imagenes: JSON.stringify(imagenes) });

  const guardarBorrador = async () => {
    setGuardando(true);
    try {
      await api.patch(`/api/tecnicos/fases/${fv.id}`, payload());
      onGuardado({ ...fv, ...payload() });
    } catch { avisar("Error al guardar", "error"); }
    finally { setGuardando(false); }
  };

  const solicitarCompletar = () => {
    let ok = true;
    if (!observaciones.trim()) { setErrDesc(true); textareaRef.current?.focus(); ok = false; }
    if (imagenes.length === 0) { setErrFoto(true); ok = false; }
    if (!ok) { avisar("Completa la descripción y sube al menos una foto", "error"); return; }
    setConfirmando(true);
  };

  const confirmarCompletar = async () => {
    setConfirmando(false); setCompletando(true);
    try {
      await api.post(`/api/tecnicos/fases/${fv.id}/completar`, payload());
      onCompletada({ ...fv, ...payload(), estado: "COMPLETADA", finAt: new Date().toLocaleString("es-CL") });
    } catch (e) {
      const msg = e.response?.data?.message ?? e.response?.data?.error ?? "Error al completar la fase";
      avisar(msg, "error");
    }
    finally { setCompletando(false); }
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <FaseHeader meta={meta} esCompletada={esCompletada} esActiva={esActiva} />
      <div className="p-6 space-y-6">

        <div className="bg-slate-700/40 rounded-xl px-4 py-3 text-sm text-slate-300">
          <p className="font-black text-slate-200 mb-1">¿Qué registrar en esta fase?</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            Describe el estado en que llega el vehículo y sube fotos de evidencia (golpes, rayones, nivel de combustible, etc.). No se requiere diagnóstico técnico aquí.
          </p>
        </div>

        {/* Estado del vehículo */}
        <div ref={textareaRef}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Estado del vehículo al ingreso</label>
              {!esCompletada && <span className="text-red-500 text-xs font-black">* obligatorio</span>}
            </div>
            {!esCompletada && (
              <button
                onClick={() => onAbrirIA(`Vehículo ${ot.vehiculo} (${ot.patente}) ingresa al taller para: ${ot.servicio}. Dame un listado de ítems que debo inspeccionar y documentar en la recepción.`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-black text-orange-400 transition"
              >
                <Sparkles size={12} /> Sugerir con IA
              </button>
            )}
          </div>
          <textarea
            rows={4}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            disabled={esCompletada}
            placeholder="Ej: Vehículo llega con golpe en parachoques delantero, nivel de combustible 1/4, luces traseras funcionando. Sin llaves adicionales..."
            className={`w-full bg-slate-900 border rounded-xl p-4 text-white placeholder-slate-500 outline-none resize-none disabled:opacity-50 transition-colors text-sm leading-relaxed ${
              errDesc ? "border-red-500" : "border-slate-600 focus:border-orange-500"
            }`}
          />
          {errDesc && <p className="mt-1 text-xs font-black text-red-400 flex items-center gap-1"><X size={11} />La descripción es obligatoria.</p>}
        </div>

        <ZonaFotos imagenes={imagenes} subiendo={subiendo} esCompletada={esCompletada}
          onSubir={handleSubir} onEliminar={(url) => setImagenes((p) => p.filter((u) => u !== url))}
          errFoto={errFoto}
        />

        {!esCompletada && (
          <BotonesAccion
            meta={meta} metaNext={metaNext} esActiva={esActiva}
            guardando={guardando} completando={completando} confirmando={confirmando}
            onBorrador={guardarBorrador}
            onCompletar={solicitarCompletar}
            onConfirmar={confirmarCompletar}
            onCancelarConfirm={() => setConfirmando(false)}
          />
        )}
        {esCompletada && <FaseCompletadaBadge finAt={fv.finAt} />}
      </div>
    </div>
  );
}

// ── PANEL DIAGNÓSTICO ─────────────────────────────────────────────────────────
// Propuesta de servicios al cliente con justificación + fotos por servicio

const ESTADO_PROPUESTA_LABEL = {
  PENDIENTE_ADMIN:    { label: "Enviada al admin, pendiente revisión", cls: "bg-yellow-500/20 text-yellow-400" },
  APROBADA_ADMIN:     { label: "Aprobada por admin", cls: "bg-blue-500/20 text-blue-400" },
  RECHAZADA_ADMIN:    { label: "Rechazada por admin", cls: "bg-red-500/20 text-red-400" },
  ENVIADA_CLIENTE:    { label: "Enviada al cliente, esperando respuesta", cls: "bg-cyan-500/20 text-cyan-400" },
  ACEPTADA:           { label: "Aceptada por el cliente ✓", cls: "bg-green-500/20 text-green-400" },
  ACEPTADA_PARCIAL:   { label: "Aceptada parcialmente por el cliente", cls: "bg-orange-500/20 text-orange-400" },
  RECHAZADA_CLIENTE:  { label: "Rechazada por el cliente — OT cancelada", cls: "bg-red-500/20 text-red-400" },
};

function PanelDiagnostico({ fv, faseNext, ot, codigo, onGuardado, onCompletada, avisar, onAbrirIA }) {
  const { esCompletada, esActiva, meta } = useFaseBase(fv);
  const metaNext = faseNext ? FASES_META[faseNext.nombre] : null;

  // ── Carga catálogo + propuesta existente ──────────────────────────────────
  const [catalogo,        setCatalogo]        = useState([]);
  const [propuestaExistente, setPropuestaExistente] = useState(null);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);

  // ── Estado propuesta nueva ────────────────────────────────────────────────
  // serviciosProp: [{ servicioId, nombre, precioBase, descripcion, imagenes: [], subiendo }]
  const [serviciosProp,   setServiciosProp]   = useState([]);
  const [notaTecnico,     setNotaTecnico]     = useState("");
  const [servicioSelect,  setServicioSelect]  = useState("");

  // ── Estado fase (descripción global + fotos para completar) ───────────────
  const parsearObs = () => {
    try { const p = JSON.parse(fv.observaciones || "{}"); return typeof p === "object" && !Array.isArray(p) ? p : { diagnostico: "", diasEstimados: "" }; }
    catch { return { diagnostico: fv.observaciones || "", diasEstimados: "" }; }
  };
  const obs0 = parsearObs();
  const [diagnostico,  setDiagnostico]  = useState(obs0.diagnostico || "");
  const [diasEstimados,setDiasEstimados]= useState(obs0.diasEstimados || "");
  const [errDesc, setErrDesc] = useState(false);
  const [errDias, setErrDias] = useState(false);
  const textareaRef = useRef(null);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [guardando,   setGuardando]   = useState(false);
  const [completando, setCompletando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [enviandoProp,setEnviandoProp]= useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/api/servicios"),
      api.get(`/api/tecnicos/ordenes/${codigo}/propuesta`).catch(() => ({ data: null })),
    ]).then(([{ data: cat }, { data: prop }]) => {
      setCatalogo(Array.isArray(cat) ? cat : []);
      if (prop) {
        setPropuestaExistente(prop);
        // Pre-cargar servicios de la propuesta existente
        const loaded = prop.servicios.map(ps => ({
          servicioId:  ps.servicioId,
          nombre:      ps.nombre,
          precioBase:  ps.precioBase,
          descripcion: ps.descripcion,
          imagenes:    tryParse(ps.imagenes, []),
          subiendo:    false,
        }));
        setServiciosProp(loaded);
      } else {
        // Pre-cargar servicios originales del agendamiento
        const originales = ot.servicios || (ot.servicio ? [{ id: null, nombre: ot.servicio, precioBase: 0 }] : []);
        setServiciosProp(originales.map(s => ({
          servicioId:  s.id || null,
          nombre:      s.nombre || ot.servicio,
          precioBase:  s.precioBase || 0,
          descripcion: "",
          imagenes:    [],
          subiendo:    false,
        })));
      }
    }).finally(() => setCargandoCatalogo(false));
  }, [codigo]);

  const tryParse = (str, def) => { try { return JSON.parse(str); } catch { return def; } };

  // ── Gestión de servicios en propuesta ──────────────────────────────────────
  const agregarServicio = () => {
    if (!servicioSelect) return;
    const s = catalogo.find(c => c.id === servicioSelect);
    if (!s) return;
    if (serviciosProp.some(p => p.servicioId === s.id)) { avisar("Ese servicio ya está en la propuesta", "error"); return; }
    setServiciosProp(prev => [...prev, { servicioId: s.id, nombre: s.nombre, precioBase: s.precioBase, descripcion: "", imagenes: [], subiendo: false }]);
    setServicioSelect("");
  };

  const quitarServicio = (idx) => setServiciosProp(prev => prev.filter((_, i) => i !== idx));

  const actualizarDescripcion = (idx, val) =>
    setServiciosProp(prev => prev.map((s, i) => i === idx ? { ...s, descripcion: val } : s));

  const subirFotoServicio = async (idx, archivos) => {
    setServiciosProp(prev => prev.map((s, i) => i === idx ? { ...s, subiendo: true } : s));
    try {
      const urls = await subirArchivos(archivos, avisar);
      setServiciosProp(prev => prev.map((s, i) => i === idx ? { ...s, imagenes: [...s.imagenes, ...urls], subiendo: false } : s));
    } catch {
      setServiciosProp(prev => prev.map((s, i) => i === idx ? { ...s, subiendo: false } : s));
    }
  };

  const quitarFotoServicio = (idx, url) =>
    setServiciosProp(prev => prev.map((s, i) => i === idx ? { ...s, imagenes: s.imagenes.filter(u => u !== url) } : s));

  // ── Enviar propuesta al admin ─────────────────────────────────────────────
  const enviarPropuesta = async () => {
    // Validar que cada servicio tenga descripción y al menos una foto
    const invalidos = serviciosProp.filter(s => !s.descripcion.trim() || s.imagenes.length === 0);
    if (invalidos.length > 0) {
      avisar(`Cada servicio requiere descripción y al menos una foto. Faltan datos en: ${invalidos.map(s => s.nombre).join(", ")}`, "error");
      return;
    }
    if (!serviciosProp.some(s => s.servicioId)) {
      avisar("Selecciona al menos un servicio del catálogo", "error"); return;
    }
    setEnviandoProp(true);
    try {
      const body = {
        notaTecnico,
        servicios: serviciosProp.filter(s => s.servicioId).map(s => ({
          servicioId:  s.servicioId,
          descripcion: s.descripcion,
          imagenes:    JSON.stringify(s.imagenes),
        })),
      };
      const { data } = await api.post(`/api/tecnicos/ordenes/${codigo}/propuesta`, body);
      setPropuestaExistente({ estado: data.estado, servicios: serviciosProp });
      avisar("Propuesta enviada al admin para revisión");
    } catch (e) {
      avisar(e.response?.data?.message || "Error al enviar la propuesta", "error");
    } finally {
      setEnviandoProp(false);
    }
  };

  // ── Completar fase (cuando ya hay propuesta aprobada) ─────────────────────
  const payload = () => ({
    observaciones: JSON.stringify({ diagnostico, diasEstimados }),
    imagenes: "[]",
    diasEstimados: diasEstimados ? parseInt(diasEstimados, 10) : undefined,
  });

  const solicitarCompletar = () => {
    let ok = true;
    if (!diagnostico.trim()) { setErrDesc(true); textareaRef.current?.focus(); ok = false; }
    if (!diasEstimados || parseInt(diasEstimados, 10) < 1) { setErrDias(true); ok = false; }
    if (!ok) { avisar("Completa el resumen del diagnóstico y los días estimados", "error"); return; }
    setConfirmando(true);
  };

  const confirmarCompletar = async () => {
    setConfirmando(false); setCompletando(true);
    try {
      await api.post(`/api/tecnicos/fases/${fv.id}/completar`, payload());
      onCompletada({ ...fv, ...payload(), estado: "COMPLETADA", finAt: new Date().toLocaleString("es-CL") });
    } catch (e) {
      const msg = e.response?.data?.message ?? e.response?.data?.error ?? "Error al completar la fase";
      avisar(msg, "error");
    }
    finally { setCompletando(false); }
  };

  const totalPropuesta = serviciosProp.reduce((acc, s) => acc + (parseFloat(s.precioBase) || 0), 0);

  const propCanEditar = !propuestaExistente ||
    ["RECHAZADA_ADMIN", "RECHAZADA_CLIENTE"].includes(propuestaExistente.estado);

  if (cargandoCatalogo) return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 flex items-center gap-3">
      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-slate-400 text-sm">Cargando catálogo de servicios...</span>
    </div>
  );

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <FaseHeader meta={meta} esCompletada={esCompletada} esActiva={esActiva} />
      <div className="p-6 space-y-6">

        {/* Banner estado propuesta existente */}
        {propuestaExistente && (
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${ESTADO_PROPUESTA_LABEL[propuestaExistente.estado]?.cls || "bg-slate-700 text-slate-300"}`}>
            <CheckCircle size={15} />
            <span className="text-sm font-black">{ESTADO_PROPUESTA_LABEL[propuestaExistente.estado]?.label || propuestaExistente.estado}</span>
          </div>
        )}

        {/* ── Servicios propuestos ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Servicios propuestos al cliente</p>
            <span className="text-xs font-black text-orange-400">
              Total: ${totalPropuesta.toLocaleString("es-CL")}
            </span>
          </div>

          <div className="space-y-4">
            {serviciosProp.map((s, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
                {/* Cabecera servicio */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Tag size={13} className="text-orange-400 flex-shrink-0" />
                    <span className="text-sm font-black text-white truncate">{s.nombre}</span>
                    {s.precioBase > 0 && (
                      <span className="text-xs text-slate-400 flex-shrink-0">${parseFloat(s.precioBase).toLocaleString("es-CL")}</span>
                    )}
                  </div>
                  {propCanEditar && !esCompletada && (
                    <button onClick={() => quitarServicio(idx)} className="text-slate-500 hover:text-red-400 transition flex-shrink-0">
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Por qué aplica este servicio *
                  </label>
                  <textarea
                    rows={2}
                    disabled={esCompletada || !propCanEditar}
                    value={s.descripcion}
                    onChange={e => actualizarDescripcion(idx, e.target.value)}
                    placeholder="Ej: Se detectó desgaste en pastillas traseras por debajo del límite de seguridad..."
                    className={`mt-1 w-full bg-slate-800 border border-slate-600 focus:border-orange-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none resize-none disabled:opacity-50 ${
                      !s.descripcion.trim() && enviandoProp ? "border-red-500" : ""
                    }`}
                  />
                </div>

                {/* Fotos del servicio */}
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Foto evidencia *</p>
                  <div className="flex flex-wrap gap-2">
                    {s.imagenes.map((url, ui) => (
                      <div key={ui} className="relative group w-16 h-16">
                        <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                        {propCanEditar && !esCompletada && (
                          <button
                            onClick={() => quitarFotoServicio(idx, url)}
                            className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X size={10} className="text-white" />
                          </button>
                        )}
                      </div>
                    ))}
                    {propCanEditar && !esCompletada && (
                      <label className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition ${
                        s.imagenes.length === 0 && enviandoProp ? "border-red-500 bg-red-500/10" : "border-slate-600 hover:border-orange-500 bg-slate-800"
                      }`}>
                        {s.subiendo
                          ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          : <Camera size={16} className="text-slate-500" />}
                        <input type="file" accept="image/*" className="sr-only" multiple
                          onChange={e => subirFotoServicio(idx, Array.from(e.target.files))} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selector para agregar servicio del catálogo */}
          {propCanEditar && !esCompletada && (
            <div className="flex gap-2 mt-3">
              <select
                value={servicioSelect}
                onChange={e => setServicioSelect(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
              >
                <option value="">Agregar servicio del catálogo...</option>
                {catalogo
                  .filter(c => !serviciosProp.some(s => s.servicioId === c.id))
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}{c.precioBase ? ` — $${parseFloat(c.precioBase).toLocaleString("es-CL")}` : ""}
                    </option>
                  ))}
              </select>
              <button
                onClick={agregarServicio}
                disabled={!servicioSelect}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-4 py-2 rounded-xl transition"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Nota del técnico (para la propuesta) */}
        {propCanEditar && !esCompletada && (
          <div>
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-2">
              Nota para el cliente (opcional)
            </label>
            <textarea
              rows={2}
              value={notaTecnico}
              onChange={e => setNotaTecnico(e.target.value)}
              placeholder="Observación adicional que verá el cliente en el correo..."
              className="w-full bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none resize-none"
            />
          </div>
        )}

        {/* Botón enviar propuesta */}
        {propCanEditar && !esCompletada && (
          <button
            onClick={enviarPropuesta}
            disabled={enviandoProp || serviciosProp.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black py-3 rounded-xl transition text-sm"
          >
            {enviandoProp
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando...</>
              : <><Send size={15} /> Enviar propuesta al admin</>}
          </button>
        )}

        {/* ── Sección completar fase (resumen + días) — solo si propuesta aprobada ── */}
        {(esCompletada || propuestaExistente?.estado === "ACEPTADA" || propuestaExistente?.estado === "ACEPTADA_PARCIAL") && (
          <>
            <div className="h-px bg-slate-700" />

            {/* Resumen diagnóstico */}
            <div ref={textareaRef}>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Resumen del diagnóstico</label>
                {!esCompletada && <span className="text-red-500 text-xs font-black">* obligatorio</span>}
              </div>
              <textarea
                rows={3}
                value={diagnostico}
                onChange={e => { setDiagnostico(e.target.value); setErrDesc(false); }}
                disabled={esCompletada}
                placeholder="Resumen técnico del diagnóstico realizado..."
                className={`w-full bg-slate-900 border rounded-xl p-4 text-white placeholder-slate-500 outline-none resize-none disabled:opacity-50 text-sm ${
                  errDesc ? "border-red-500" : "border-slate-600 focus:border-orange-500"
                }`}
              />
              {errDesc && <p className="mt-1 text-xs font-black text-red-400 flex items-center gap-1"><X size={11} />El resumen es obligatorio.</p>}
            </div>

            {/* Días estimados */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Días estimados de reparación</label>
                {!esCompletada && <span className="text-red-500 text-xs font-black">* obligatorio</span>}
              </div>
              {esCompletada ? (
                <div className="flex items-center gap-2 bg-slate-900/60 rounded-xl px-4 py-3">
                  <Clock size={14} className="text-slate-500" />
                  <span className="text-sm text-slate-300">
                    {diasEstimados ? `${diasEstimados} día${diasEstimados != 1 ? "s" : ""} (+ 2 días de gracia)` : "No registrado"}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <input type="number" min="1" max="90" value={diasEstimados}
                      onChange={e => { setDiasEstimados(e.target.value); setErrDias(false); }}
                      placeholder="Ej: 3"
                      className={`w-32 bg-slate-900 border rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none text-sm font-black ${
                        errDias ? "border-red-500" : "border-slate-600 focus:border-orange-500"
                      }`}
                    />
                    <span className="text-sm text-slate-400">días hábiles <span className="text-slate-600">(+2 de gracia)</span></span>
                  </div>
                  {errDias && <p className="mt-1 text-xs font-black text-red-400 flex items-center gap-1"><X size={11} />Ingresa los días estimados.</p>}
                </>
              )}
            </div>

            <SeccionRepuestos codigo={codigo} avisar={avisar} onAbrirIA={onAbrirIA} soloLectura={esCompletada} />

            {!esCompletada && (
              <BotonesAccion
                meta={meta} metaNext={metaNext} esActiva={esActiva}
                guardando={guardando} completando={completando} confirmando={confirmando}
                onBorrador={async () => {
                  setGuardando(true);
                  try { await api.patch(`/api/tecnicos/fases/${fv.id}`, payload()); onGuardado({ ...fv, ...payload() }); }
                  catch { avisar("Error al guardar", "error"); }
                  finally { setGuardando(false); }
                }}
                onCompletar={solicitarCompletar}
                onConfirmar={confirmarCompletar}
                onCancelarConfirm={() => setConfirmando(false)}
              />
            )}
            {esCompletada && <FaseCompletadaBadge finAt={fv.finAt} />}
          </>
        )}
      </div>
    </div>
  );
}

// ── PANEL EN TRABAJO ──────────────────────────────────────────────────────────
// Registro de avance: entradas de texto + fotos que se acumulan

function PanelEnTrabajo({ fv, faseNext, ot, onGuardado, onCompletada, avisar, onAbrirIA }) {
  const { esCompletada, esActiva, meta } = useFaseBase(fv);
  const metaNext = faseNext ? FASES_META[faseNext.nombre] : null;

  const parsearLog = () => {
    try {
      const p = JSON.parse(fv.observaciones || "[]");
      return Array.isArray(p) ? p : [];
    } catch { return fv.observaciones ? [{ texto: fv.observaciones, imagenes: [], fecha: "" }] : []; }
  };

  const [entradas,    setEntradas]    = useState(parsearLog);
  const [nuevoTexto,  setNuevoTexto]  = useState("");
  const [nuevasFotos, setNuevasFotos] = useState([]);
  const [subiendo,    setSubiendo]    = useState(false);
  const [guardando,   setGuardando]   = useState(false);
  const [completando, setCompletando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const fileRef = useRef(null);

  const todasImagenes = entradas.flatMap((e) => e.imagenes || []);

  const handleSubirNuevas = async (archivos) => {
    setSubiendo(true);
    try { const urls = await subirArchivos(archivos, avisar); setNuevasFotos((p) => [...p, ...urls]); }
    catch { avisar("Error al subir la imagen", "error"); }
    finally { setSubiendo(false); }
  };

  const agregarEntrada = async () => {
    if (!nuevoTexto.trim() && nuevasFotos.length === 0) return;
    const entrada = {
      texto: nuevoTexto.trim(),
      imagenes: nuevasFotos,
      fecha: new Date().toLocaleString("es-CL"),
    };
    const nuevasEntradas = [...entradas, entrada];
    setEntradas(nuevasEntradas);
    setNuevoTexto("");
    setNuevasFotos([]);

    // Auto-guardar
    const p = {
      observaciones: JSON.stringify(nuevasEntradas),
      imagenes: JSON.stringify(nuevasEntradas.flatMap((e) => e.imagenes || [])),
    };
    try {
      await api.patch(`/api/tecnicos/fases/${fv.id}`, p);
      onGuardado({ ...fv, ...p });
      avisar("Avance registrado");
    } catch { avisar("Error al guardar el avance", "error"); }
  };

  const payload = () => ({
    observaciones: JSON.stringify(entradas),
    imagenes: JSON.stringify(todasImagenes),
  });

  const solicitarCompletar = () => {
    if (entradas.length === 0) { avisar("Registra al menos un avance antes de completar la fase", "error"); return; }
    setConfirmando(true);
  };

  const confirmarCompletar = async () => {
    setConfirmando(false); setCompletando(true);
    try {
      await api.post(`/api/tecnicos/fases/${fv.id}/completar`, payload());
      onCompletada({ ...fv, ...payload(), estado: "COMPLETADA", finAt: new Date().toLocaleString("es-CL") });
    } catch (e) {
      const msg = e.response?.data?.message ?? e.response?.data?.error ?? "Error al completar la fase";
      avisar(msg, "error");
    }
    finally { setCompletando(false); }
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <FaseHeader meta={meta} esCompletada={esCompletada} esActiva={esActiva} />
      <div className="p-6 space-y-6">

        {/* Log de avances */}
        {entradas.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Registro de trabajo</p>
            {entradas.map((entrada, i) => (
              <div key={i} className="bg-slate-900/60 rounded-xl p-4 border-l-2 border-orange-500/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-orange-400">Avance #{i + 1}</span>
                  {entrada.fecha && <span className="text-xs text-slate-500">{entrada.fecha}</span>}
                </div>
                {entrada.texto && <p className="text-sm text-slate-200 leading-relaxed mb-3">{entrada.texto}</p>}
                {entrada.imagenes?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entrada.imagenes.map((url) => (
                      <img key={url} src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-600" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Formulario nuevo avance */}
        {!esCompletada && (
          <div className="border border-slate-600 rounded-xl p-5 space-y-4">
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">
              {entradas.length === 0 ? "Primer avance" : "Nuevo avance"}
            </p>

            <div className="flex items-start gap-2">
              <textarea
                rows={3}
                value={nuevoTexto}
                onChange={(e) => setNuevoTexto(e.target.value)}
                placeholder="Describe los cambios o reparaciones realizadas en este avance..."
                className="flex-1 bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl p-3 text-white placeholder-slate-500 outline-none resize-none text-sm leading-relaxed"
              />
              <button
                onClick={() => onAbrirIA(`Estoy realizando: ${ot.servicio || "trabajo de taller"} en ${ot.vehiculo}. ¿Qué debo documentar en este avance de trabajo?`)}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-black text-orange-400 transition"
              >
                <Sparkles size={12} />
              </button>
            </div>

            {/* Fotos del avance */}
            {nuevasFotos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {nuevasFotos.map((url) => (
                  <div key={url} className="relative group w-20 h-20">
                    <img src={url} alt="" className="w-full h-full object-cover rounded-lg border border-slate-600" />
                    <button
                      onClick={() => setNuevasFotos((p) => p.filter((u) => u !== url))}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={subiendo}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-black text-slate-300 disabled:opacity-50 transition"
              >
                <Camera size={15} />
                {subiendo ? "Subiendo..." : "Agregar fotos"}
              </button>
              <button
                onClick={agregarEntrada}
                disabled={!nuevoTexto.trim() && nuevasFotos.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl font-black text-sm transition"
              >
                <CheckCircle size={15} /> Registrar avance
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={async (e) => { await handleSubirNuevas(Array.from(e.target.files || [])); e.target.value = ""; }}
            />
          </div>
        )}

        {!esCompletada && !confirmando && entradas.length > 0 && (
          <BotonesAccion
            meta={meta} metaNext={metaNext} esActiva={esActiva}
            guardando={guardando} completando={completando} confirmando={confirmando}
            onBorrador={null}
            onCompletar={solicitarCompletar}
            onConfirmar={confirmarCompletar}
            onCancelarConfirm={() => setConfirmando(false)}
          />
        )}
        {confirmando && (
          <BotonesAccion
            meta={meta} metaNext={metaNext} esActiva={esActiva}
            guardando={guardando} completando={completando} confirmando={confirmando}
            onBorrador={null}
            onCompletar={solicitarCompletar}
            onConfirmar={confirmarCompletar}
            onCancelarConfirm={() => setConfirmando(false)}
          />
        )}
        {esCompletada && <FaseCompletadaBadge finAt={fv.finAt} />}
      </div>
    </div>
  );
}

// ── PANEL CONTROL DE CALIDAD ──────────────────────────────────────────────────
// Checklist + log de EN_TRABAJO (Opción A) + flujo de aprobación admin (Opción B)

function PanelControlCalidad({ fv, fases, onGuardado, onCompletada, avisar }) {
  const { esCompletada, esActiva, meta } = useFaseBase(fv);

  const aprobacionEstado = fv.aprobacionEstado || null;
  const aprobacionNota   = fv.aprobacionNota   || null;

  const parsear = () => {
    try {
      const p = JSON.parse(fv.observaciones || "{}");
      if (p.items) return {
        ...p,
        items: p.items.map((it) => ({ fotos: [], ...it })),
      };
    } catch {}
    return { items: CHECKLIST_CALIDAD.map((c) => ({ ...c, estado: "pendiente", fotos: [] })), notas: "" };
  };

  const init = parsear();
  const [items,        setItems]        = useState(init.items);
  const [notas,        setNotas]        = useState(init.notas || "");
  const [subiendoItem, setSubiendoItem] = useState(null); // id del item subiendo foto
  const [guardando,    setGuardando]    = useState(false);
  const [enviando,     setEnviando]     = useState(false);
  const [confirmando,  setConfirmando]  = useState(false);
  const [logAbierto,   setLogAbierto]   = useState(false);

  const setEstadoItem = (id, estado) => setItems((prev) => prev.map((it) => it.id === id ? { ...it, estado } : it));
  const todosMarcados = items.every((it) => it.estado !== "pendiente");
  const countOk  = items.filter((it) => it.estado === "ok").length;
  const countNok = items.filter((it) => it.estado === "nok").length;

  const handleSubirFotoItem = async (itemId, archivos) => {
    setSubiendoItem(itemId);
    try {
      const urls = await subirArchivos(archivos, avisar);
      setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, fotos: [...(it.fotos || []), ...urls] } : it));
    } catch { avisar("Error al subir la imagen", "error"); }
    finally { setSubiendoItem(null); }
  };

  const eliminarFotoItem = (itemId, url) =>
    setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, fotos: (it.fotos || []).filter((u) => u !== url) } : it));

  const payload = () => ({
    observaciones: JSON.stringify({ items, notas }),
    imagenes: JSON.stringify(items.flatMap((it) => it.fotos || [])),
  });

  const guardarBorrador = async () => {
    setGuardando(true);
    try { await api.patch(`/api/tecnicos/fases/${fv.id}`, payload()); onGuardado({ ...fv, ...payload() }); }
    catch { avisar("Error al guardar", "error"); }
    finally { setGuardando(false); }
  };

  const solicitarRevision = () => {
    if (!todosMarcados) { avisar("Marca todos los ítems del checklist antes de enviar", "error"); return; }
    if (countNok > 0)   { avisar(`Hay ${countNok} ítem(s) en NOK — corrige antes de enviar`, "error"); return; }
    const sinFoto = items.filter((it) => it.estado !== "na" && (!it.fotos || it.fotos.length === 0));
    if (sinFoto.length > 0) { avisar(`Sube al menos 1 foto en cada ítem marcado (faltan ${sinFoto.length})`, "error"); return; }
    setConfirmando(true);
  };

  const confirmarEnvio = async () => {
    setConfirmando(false); setEnviando(true);
    try {
      await api.post(`/api/tecnicos/fases/${fv.id}/solicitar-aprobacion`, payload());
      onGuardado({ ...fv, ...payload(), aprobacionEstado: "PENDIENTE", aprobacionNota: null });
      avisar("Enviado al administrador para revisión");
    } catch { avisar("Error al enviar la solicitud", "error"); }
    finally { setEnviando(false); }
  };

  // ── Log de EN_TRABAJO (Opción A) ──
  const faseEnTrabajo = fases?.find((f) => f.nombre === "EN_TRABAJO");
  const logEntradas = (() => {
    try {
      const p = JSON.parse(faseEnTrabajo?.observaciones || "[]");
      return Array.isArray(p) ? p : [];
    } catch { return []; }
  })();

  const estadoColor = {
    ok:       "bg-green-500/20 text-green-400 border-green-500/50",
    nok:      "bg-red-500/20 text-red-400 border-red-500/50",
    na:       "bg-slate-600/50 text-slate-400 border-slate-600",
    pendiente:"bg-slate-700 text-slate-500 border-slate-600",
  };

  const esperando  = aprobacionEstado === "PENDIENTE" && !esCompletada;
  const rechazada  = aprobacionEstado === "RECHAZADA" && !esCompletada;
  const soloLectura = esCompletada || esperando;

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <FaseHeader meta={meta} esCompletada={esCompletada} esActiva={esActiva} />
      <div className="p-6 space-y-6">

        {/* Badge: rechazada */}
        {rechazada && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-red-400" />
              <p className="font-black text-red-400 text-sm">Control rechazado por el administrador</p>
            </div>
            {aprobacionNota && <p className="text-sm text-red-300 leading-relaxed pl-5">{aprobacionNota}</p>}
            <p className="text-xs text-slate-400 pl-5">Corrige los ítems indicados y vuelve a enviar.</p>
          </div>
        )}

        {/* Badge: esperando aprobación */}
        {esperando && (
          <div className="bg-amber-900/30 border border-amber-500/50 rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="font-black text-amber-400 text-sm">Esperando aprobación del administrador</p>
              <p className="text-xs text-slate-400 mt-1">El checklist fue enviado. El administrador revisará el trabajo y aprobará o pedirá correcciones.</p>
            </div>
          </div>
        )}

        {/* Log de EN_TRABAJO colapsable */}
        {logEntradas.length > 0 && (
          <div className="border border-slate-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setLogAbierto((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-700/40 hover:bg-slate-700/70 transition text-left"
            >
              <div className="flex items-center gap-2">
                <FileText size={13} className="text-slate-400" />
                <span className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  Trabajo realizado — {logEntradas.length} registro{logEntradas.length !== 1 ? "s" : ""}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-black">{logAbierto ? "Ocultar ▲" : "Ver ▼"}</span>
            </button>
            {logAbierto && (
              <div className="p-4 space-y-3 bg-slate-900/30">
                {logEntradas.map((entrada, i) => (
                  <div key={i} className="bg-slate-800 rounded-xl p-4 border-l-2 border-orange-500/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-orange-400">Avance #{i + 1}</span>
                      {entrada.fecha && <span className="text-xs text-slate-500">{entrada.fecha}</span>}
                    </div>
                    {entrada.texto && <p className="text-sm text-slate-200 leading-relaxed mb-2">{entrada.texto}</p>}
                    {entrada.imagenes?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entrada.imagenes.map((url) => (
                          <img key={url} src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-600" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resumen checklist */}
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-900/60 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-green-400">{countOk}</p>
            <p className="text-xs text-slate-500 font-black uppercase">OK</p>
          </div>
          <div className="flex-1 bg-slate-900/60 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-red-400">{countNok}</p>
            <p className="text-xs text-slate-500 font-black uppercase">NOK</p>
          </div>
          <div className="flex-1 bg-slate-900/60 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-slate-400">{items.filter((it) => it.estado === "pendiente").length}</p>
            <p className="text-xs text-slate-500 font-black uppercase">Pendiente</p>
          </div>
        </div>

        {/* Checklist con fotos por ítem */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListChecks size={15} className="text-slate-400" />
              <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Checklist de calidad</p>
            </div>
            {!soloLectura && (
              <p className="text-[10px] text-slate-500 font-black">* 1 foto mín. por ítem</p>
            )}
          </div>
          <div className="space-y-2">
            {items.map((item) => {
              const fotos = item.fotos || [];
              const necesitaFoto = item.estado !== "na" && item.estado !== "pendiente" && fotos.length === 0 && !soloLectura;
              return (
                <div key={item.id} className={`rounded-xl border overflow-hidden transition-colors ${estadoColor[item.estado] || estadoColor.pendiente}`}>
                  {/* Fila: label + botones estado */}
                  <div className="flex items-center justify-between p-3">
                    <span className="text-sm font-bold flex-1 mr-2">{item.label}</span>
                    {!soloLectura ? (
                      <div className="flex gap-1.5 flex-shrink-0">
                        {["ok", "nok", "na"].map((e) => (
                          <button key={e} onClick={() => setEstadoItem(item.id, e)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase border transition-all ${
                              item.estado === e
                                ? e === "ok"  ? "bg-green-500 text-white border-green-500"
                                : e === "nok" ? "bg-red-500 text-white border-red-500"
                                :               "bg-slate-600 text-white border-slate-500"
                                : "border-slate-600 text-slate-400 hover:border-slate-400"
                            }`}
                          >{e === "na" ? "N/A" : e.toUpperCase()}</button>
                        ))}
                      </div>
                    ) : (
                      <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                        item.estado === "ok"  ? "bg-green-500/30 text-green-400" :
                        item.estado === "nok" ? "bg-red-500/30 text-red-400" : "bg-slate-600 text-slate-400"
                      }`}>{item.estado === "na" ? "N/A" : item.estado.toUpperCase()}</span>
                    )}
                  </div>

                  {/* Zona fotos del ítem */}
                  {item.estado !== "na" && (
                    <div className="px-3 pb-3 border-t border-black/20">
                      {/* Thumbnails */}
                      {fotos.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {fotos.map((url) => (
                            <div key={url} className="relative group">
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-black/30 cursor-zoom-in" />
                              </a>
                              {!soloLectura && (
                                <button
                                  onClick={() => eliminarFotoItem(item.id, url)}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                >
                                  <X size={10} className="text-white" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Botón subir (solo edición) */}
                      {!soloLectura && (
                        <div className="pt-2">
                          <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg text-xs font-black transition w-fit ${
                            necesitaFoto
                              ? "bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
                              : "bg-slate-700/60 border border-slate-600 text-slate-400 hover:bg-slate-600"
                          }`}>
                            {subiendoItem === item.id ? (
                              <><Upload size={12} className="animate-pulse" /> Subiendo...</>
                            ) : (
                              <><Camera size={12} /> {fotos.length > 0 ? "Agregar foto" : "Subir foto"}{necesitaFoto && " *"}</>
                            )}
                            <input
                              type="file" accept="image/*" multiple className="hidden"
                              disabled={subiendoItem === item.id}
                              onChange={(e) => e.target.files?.length && handleSubirFotoItem(item.id, Array.from(e.target.files))}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {!todosMarcados && !soloLectura && (
            <p className="mt-2 text-xs text-amber-400 font-black flex items-center gap-1">
              <AlertCircle size={12} /> Marca todos los ítems antes de enviar a revisión.
            </p>
          )}
        </div>

        {/* Notas */}
        <div>
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2 block">Observaciones adicionales</label>
          <textarea rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} disabled={soloLectura}
            placeholder="Notas adicionales del control de calidad..."
            className="w-full bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl p-4 text-white placeholder-slate-500 outline-none resize-none disabled:opacity-50 text-sm leading-relaxed"
          />
        </div>

        {/* Botones */}
        {!esCompletada && !esperando && !confirmando && (
          <div className="flex gap-3 pt-1">
            <button onClick={guardarBorrador} disabled={guardando}
              className="px-6 py-3 rounded-xl font-black text-sm uppercase bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-50 transition">
              {guardando ? "Guardando..." : "Guardar borrador"}
            </button>
            <button onClick={solicitarRevision} disabled={!esActiva}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-black text-sm uppercase transition">
              <Send size={15} /> Enviar a revisión del administrador
            </button>
          </div>
        )}

        {!esCompletada && !esperando && confirmando && (
          <div className="bg-orange-950/40 border border-orange-500/50 rounded-xl p-5">
            <p className="font-black text-white mb-1">¿Enviar el control de calidad al administrador?</p>
            <p className="text-sm text-slate-400 mb-4">El administrador revisará el trabajo y aprobará o pedirá correcciones antes de avanzar a Listo para Entrega.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmando(false)} className="flex-1 px-4 py-2.5 rounded-xl font-black text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition">
                Cancelar
              </button>
              <button onClick={confirmarEnvio} disabled={enviando}
                className="flex-1 px-4 py-2.5 rounded-xl font-black text-sm bg-orange-500 hover:bg-orange-600 text-white transition flex items-center justify-center gap-2">
                {enviando ? "Enviando..." : <><Send size={15} /> Sí, enviar a revisión</>}
              </button>
            </div>
          </div>
        )}

        {esCompletada && (
          <div className="flex items-center gap-3 bg-green-900/20 border border-green-900/50 rounded-xl px-4 py-3">
            <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-black text-green-400">Control de calidad aprobado por el administrador</p>
              {fv.finAt && <p className="text-xs text-slate-500 mt-0.5">Aprobado el {fv.finAt}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PANEL LISTO PARA ENTREGA ──────────────────────────────────────────────────
// Resumen + fotos finales + confirmación de entrega

function PanelListoEntrega({ fv, fases, ot, onCompletada, avisar, onAbrirIA }) {
  const { esCompletada, esActiva, meta } = useFaseBase(fv);

  const [notasEntrega, setNotasEntrega] = useState(fv.observaciones || "");
  const [imagenes,     setImagenes]     = useState(() => { try { return JSON.parse(fv.imagenes || "[]"); } catch { return []; } });
  const [subiendo,     setSubiendo]     = useState(false);
  const [completando,  setCompletando]  = useState(false);
  const [confirmando,  setConfirmando]  = useState(false);
  const [errFoto,      setErrFoto]      = useState(false);

  useEffect(() => { if (imagenes.length > 0) setErrFoto(false); }, [imagenes]);

  const handleSubir = async (archivos) => {
    setSubiendo(true);
    try { const urls = await subirArchivos(archivos, avisar); setImagenes((p) => [...p, ...urls]); }
    catch { avisar("Error al subir la imagen", "error"); }
    finally { setSubiendo(false); }
  };

  const payload = () => ({ observaciones: notasEntrega, imagenes: JSON.stringify(imagenes) });

  const solicitarCompletar = () => {
    if (imagenes.length === 0) { setErrFoto(true); avisar("Sube al menos una foto del vehículo listo", "error"); return; }
    setConfirmando(true);
  };

  const confirmarCompletar = async () => {
    setConfirmando(false); setCompletando(true);
    try {
      await api.post(`/api/tecnicos/fases/${fv.id}/completar`, payload());
      onCompletada({ ...fv, ...payload(), estado: "COMPLETADA", finAt: new Date().toLocaleString("es-CL") });
    } catch (e) {
      const msg = e.response?.data?.message ?? e.response?.data?.error ?? "Error al completar la fase";
      avisar(msg, "error");
    }
    finally { setCompletando(false); }
  };

  // Resumen de fases completadas
  const fasesCompletadas = fases.filter((f) => f.estado === "COMPLETADA" && f.nombre !== "LISTO_ENTREGA");

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <FaseHeader meta={meta} esCompletada={esCompletada} esActiva={esActiva} />
      <div className="p-6 space-y-6">

        {/* Resumen del trabajo */}
        <div>
          <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Resumen del servicio completado</p>
          <div className="space-y-2">
            {fasesCompletadas.map((f) => {
              const m = FASES_META[f.nombre];
              return (
                <div key={f.id} className="flex items-center gap-3 bg-green-900/20 border border-green-900/40 rounded-xl px-4 py-3">
                  <CheckCircle size={15} className="text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white">{m?.label || f.nombre}</p>
                    {f.finAt && <p className="text-xs text-slate-500">Completada: {f.finAt}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notas de entrega al cliente */}
        <div>
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2 block">
            Notas para la entrega al cliente
          </label>
          <textarea
            rows={4}
            value={notasEntrega}
            onChange={(e) => setNotasEntrega(e.target.value)}
            disabled={esCompletada}
            placeholder="Instrucciones para el cliente, recomendaciones, próximo servicio sugerido..."
            className="w-full bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl p-4 text-white placeholder-slate-500 outline-none resize-none disabled:opacity-50 text-sm leading-relaxed"
          />
        </div>

        {/* Fotos finales del vehículo */}
        <ZonaFotos imagenes={imagenes} subiendo={subiendo} esCompletada={esCompletada}
          onSubir={handleSubir} onEliminar={(url) => setImagenes((p) => p.filter((u) => u !== url))}
          errFoto={errFoto} obligatorio={true}
        />

        {!esCompletada && !confirmando && (
          <button
            onClick={solicitarCompletar}
            disabled={completando || !esActiva}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-6 py-4 rounded-xl font-black text-sm uppercase transition"
          >
            <Car size={18} /> Marcar vehículo listo para entrega
          </button>
        )}

        {confirmando && (
          <div className="bg-green-950/40 border border-green-500/50 rounded-xl p-5">
            <p className="font-black text-white mb-1">¿Confirmas que el vehículo está listo para entrega al cliente?</p>
            <p className="text-sm text-slate-400 mb-4">Esta acción cerrará el proceso de trabajo en el taller.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmando(false)} className="flex-1 px-4 py-2.5 rounded-xl font-black text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition">
                Cancelar
              </button>
              <button onClick={confirmarCompletar} className="flex-1 px-4 py-2.5 rounded-xl font-black text-sm bg-green-600 hover:bg-green-700 text-white transition flex items-center justify-center gap-2">
                <CheckCircle size={15} /> Confirmar entrega
              </button>
            </div>
          </div>
        )}

        {esCompletada && (
          <div className="flex items-center gap-3 bg-green-900/20 border border-green-900/50 rounded-xl px-5 py-4">
            <Car size={20} className="text-green-400" />
            <div>
              <p className="font-black text-green-400">Vehículo listo para entrega</p>
              {fv.finAt && <p className="text-xs text-slate-500 mt-0.5">Completado el {fv.finAt}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Panel genérico (fallback) ─────────────────────────────────────────────────

function PanelGenerico({ fv, faseNext, onGuardado, onCompletada, avisar }) {
  const { esCompletada, esActiva, meta } = useFaseBase(fv);
  const metaNext = faseNext ? FASES_META[faseNext.nombre] : null;
  const [observaciones, setObservaciones] = useState(fv.observaciones || "");
  const [guardando,  setGuardando]  = useState(false);
  const [completando,setCompletando]= useState(false);

  const payload = () => ({ observaciones, imagenes: fv.imagenes || "[]" });

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <FaseHeader meta={meta} esCompletada={esCompletada} esActiva={esActiva} />
      <div className="p-6 space-y-4">
        <textarea rows={4} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} disabled={esCompletada}
          className="w-full bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl p-4 text-white placeholder-slate-500 outline-none resize-none text-sm" />
        {!esCompletada && (
          <div className="flex gap-3">
            <button onClick={async () => { setGuardando(true); try { await api.patch(`/api/tecnicos/fases/${fv.id}`, payload()); onGuardado({ ...fv, ...payload() }); } catch { avisar("Error", "error"); } finally { setGuardando(false); } }}
              disabled={guardando} className="px-5 py-2.5 rounded-xl font-black text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-50 transition">
              {guardando ? "..." : "Guardar"}
            </button>
            <button onClick={async () => { setCompletando(true); try { await api.post(`/api/tecnicos/fases/${fv.id}/completar`, payload()); onCompletada({ ...fv, ...payload(), estado: "COMPLETADA", finAt: new Date().toLocaleString("es-CL") }); } catch { avisar("Error", "error"); } finally { setCompletando(false); } }}
              disabled={completando || !esActiva} className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl font-black text-sm transition">
              <CheckCircle size={15} /> {metaNext ? `Avanzar a ${metaNext.labelCorto}` : "Completar"}
            </button>
          </div>
        )}
        {esCompletada && <FaseCompletadaBadge finAt={fv.finAt} />}
      </div>
    </div>
  );
}

// ── Sección Repuestos ─────────────────────────────────────────────────────────

function SeccionRepuestos({ codigo, avisar, onAbrirIA, soloLectura = false }) {
  const [repuestos,       setRepuestos]       = useState([]);
  const [cargando,        setCargando]        = useState(true);
  const [modo,            setModo]            = useState("lista");
  const [busqueda,        setBusqueda]        = useState("");
  const [resultados,      setResultados]      = useState([]);
  const [buscando,        setBuscando]        = useState(false);
  const [formManual,      setFormManual]      = useState({ nombre: "", cantidad: 1, precioUnitario: 0, origen: "CLIENTE" });
  const [guardandoManual, setGuardandoManual] = useState(false);

  useEffect(() => {
    api.get(`/api/tecnicos/ordenes/${codigo}/repuestos`)
      .then(({ data }) => setRepuestos(data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [codigo]);

  const buscarInventario = async (q) => {
    setBusqueda(q);
    if (q.length < 2) { setResultados([]); return; }
    setBuscando(true);
    try { const { data } = await api.get(`/api/tecnicos/productos?q=${encodeURIComponent(q)}`); setResultados(data); }
    catch { setResultados([]); }
    finally { setBuscando(false); }
  };

  const agregarDesdeInventario = async (producto) => {
    try {
      const { data } = await api.post(`/api/tecnicos/ordenes/${codigo}/repuestos`, {
        nombre: producto.nombre, cantidad: 1, precioUnitario: producto.precio, origen: "MECANIHUB", productoId: producto.id,
      });
      setRepuestos((p) => [...p, data]); setBusqueda(""); setResultados([]); avisar(`"${producto.nombre}" agregado`);
    } catch { avisar("Error al agregar el repuesto", "error"); }
  };

  const agregarManual = async () => {
    if (!formManual.nombre.trim()) return;
    setGuardandoManual(true);
    try {
      const { data } = await api.post(`/api/tecnicos/ordenes/${codigo}/repuestos`, formManual);
      setRepuestos((p) => [...p, data]); setFormManual({ nombre: "", cantidad: 1, precioUnitario: 0, origen: "CLIENTE" }); setModo("lista"); avisar("Repuesto agregado");
    } catch { avisar("Error al agregar", "error"); }
    finally { setGuardandoManual(false); }
  };

  const eliminar = async (id) => {
    try { await api.delete(`/api/tecnicos/repuestos/${id}`); setRepuestos((p) => p.filter((r) => r.id !== id)); avisar("Repuesto eliminado"); }
    catch { avisar("Error al eliminar", "error"); }
  };

  const total = repuestos.reduce((s, r) => s + parseFloat(r.precioUnitario || 0) * (r.cantidad || 1), 0);

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-5 py-3.5 bg-slate-700/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageSearch size={16} className="text-slate-400" />
          <span className="font-black text-white text-sm">Repuestos necesarios</span>
          <span className="text-xs text-slate-400">({repuestos.length})</span>
        </div>
        {!soloLectura && (
          <div className="flex items-center gap-2">
            <button onClick={() => onAbrirIA("Dame una lista de repuestos comunes para el servicio que se está realizando.")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-xs font-black text-orange-400 transition">
              <Sparkles size={11} /> IA
            </button>
            <button onClick={() => setModo(modo === "inventario" ? "lista" : "inventario")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black transition ${modo === "inventario" ? "bg-orange-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}`}>
              <SearchIcon size={11} /> Inventario
            </button>
            <button onClick={() => setModo(modo === "manual" ? "lista" : "manual")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black transition ${modo === "manual" ? "bg-orange-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}`}>
              <Plus size={11} /> Manual
            </button>
          </div>
        )}
      </div>

      <div className="p-5 space-y-3">
        {cargando ? <p className="text-slate-400 animate-pulse text-sm">Cargando...</p>
          : repuestos.length === 0 && modo === "lista" ? <p className="text-slate-500 text-center py-4 text-sm">Sin repuestos registrados aún</p>
          : (
            <div className="divide-y divide-slate-700">
              {repuestos.map((r) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-black text-white text-sm">{r.nombre}</p>
                    <p className="text-xs text-slate-500">{r.cantidad} × ${parseFloat(r.precioUnitario || 0).toLocaleString("es-CL")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${r.origen === "MECANIHUB" ? "bg-blue-900/50 text-blue-400" : "bg-amber-900/50 text-amber-400"}`}>
                      {r.origen === "MECANIHUB" ? "MecaniHub" : "Cliente"}
                    </span>
                    <span className="font-black text-white text-sm">${(parseFloat(r.precioUnitario || 0) * (r.cantidad || 1)).toLocaleString("es-CL")}</span>
                    {!soloLectura && <button onClick={() => eliminar(r.id)} className="text-slate-500 hover:text-red-400 transition"><Trash2 size={13} /></button>}
                  </div>
                </div>
              ))}
              {repuestos.length > 0 && (
                <div className="pt-3 flex justify-between">
                  <span className="text-slate-400 text-sm font-black uppercase tracking-wider">Total repuestos</span>
                  <span className="text-orange-400 font-black text-lg">${total.toLocaleString("es-CL")}</span>
                </div>
              )}
            </div>
          )}

        {modo === "inventario" && !soloLectura && (
          <div className="border-t border-slate-700 pt-3 space-y-2">
            <div className="relative">
              <SearchIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={busqueda} onChange={(e) => buscarInventario(e.target.value)} placeholder="Buscar en inventario..."
                className="w-full bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl pl-8 pr-4 py-2 text-white placeholder-slate-500 outline-none text-sm" />
            </div>
            {buscando && <p className="text-slate-400 text-xs animate-pulse">Buscando...</p>}
            <div className="divide-y divide-slate-700">
              {resultados.map((p) => (
                <div key={p.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-black text-white text-sm">{p.nombre}</p>
                    <p className="text-xs text-slate-500">SKU: {p.sku} · Stock: {p.stock}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-white text-sm">${parseFloat(p.precio || 0).toLocaleString("es-CL")}</span>
                    <button onClick={() => agregarDesdeInventario(p)} className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1.5 rounded-lg font-black text-xs transition">
                      <Plus size={11} /> Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {modo === "manual" && !soloLectura && (
          <div className="border-t border-slate-700 pt-3 space-y-3">
            <input value={formManual.nombre} onChange={(e) => setFormManual((p) => ({ ...p, nombre: e.target.value }))} placeholder="Nombre del repuesto"
              className="w-full bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl px-3 py-2 text-white placeholder-slate-500 outline-none text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min="1" value={formManual.cantidad} onChange={(e) => setFormManual((p) => ({ ...p, cantidad: parseInt(e.target.value) || 1 }))} placeholder="Cantidad"
                className="bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl px-3 py-2 text-white outline-none text-sm" />
              <input type="number" min="0" value={formManual.precioUnitario} onChange={(e) => setFormManual((p) => ({ ...p, precioUnitario: parseFloat(e.target.value) || 0 }))} placeholder="Precio"
                className="bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl px-3 py-2 text-white outline-none text-sm" />
            </div>
            <div className="flex gap-2">
              {["CLIENTE", "MECANIHUB"].map((o) => (
                <button key={o} onClick={() => setFormManual((p) => ({ ...p, origen: o }))}
                  className={`flex-1 py-1.5 rounded-xl font-black text-xs uppercase transition border ${formManual.origen === o ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-slate-600 text-slate-500"}`}>
                  {o === "CLIENTE" ? "Trae el cliente" : "MecaniHub"}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModo("lista")} className="px-4 py-2 rounded-xl font-black text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 transition">Cancelar</button>
              <button onClick={agregarManual} disabled={guardandoManual || !formManual.nombre.trim()} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-black text-xs transition">
                {guardandoManual ? "Guardando..." : "Agregar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Panel IA flotante ─────────────────────────────────────────────────────────

function PanelIAFlotante({ ot, contexto, onCerrar }) {
  const [mensajes, setMensajes] = useState(() => {
    const inicio = { rol: "bot", texto: `Hola, soy **MecaniBot**.\n\nEstoy listo para asistirte con la orden **${ot.codigo}** — ${ot.vehiculo} · ${ot.patente}.\n\nPuedes preguntarme sobre procedimientos, torques, códigos de falla o cualquier duda técnica.` };
    return contexto ? [inicio, { rol: "user", texto: contexto }] : [inicio];
  });
  const [pregunta, setPregunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensajes]);
  useEffect(() => { if (contexto) enviar(contexto); }, []);

  const enviar = async (textoForzado) => {
    const texto = (textoForzado || pregunta).trim();
    if (!texto || enviando) return;
    setPregunta("");
    if (!textoForzado) setMensajes((p) => [...p, { rol: "user", texto }]);
    setEnviando(true);
    const historial = mensajes.slice(-6).map((m) => `${m.rol === "user" ? "Técnico" : "MecaniBot"}: ${m.texto}`).join("\n");
    try {
      const { data } = await api.post("/api/tecnicos/ia/chat", { vehiculo: `${ot.vehiculo} ${ot.patente}`, servicio: ot.servicio || "", pregunta: texto, historial });
      setMensajes((p) => [...p, { rol: "bot", texto: data.respuesta }]);
    } catch { setMensajes((p) => [...p, { rol: "bot", texto: "No pude conectarme al asistente. Intenta nuevamente." }]); }
    finally { setEnviando(false); }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end p-4 sm:p-6 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={onCerrar} />
      <div className="relative pointer-events-auto w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl flex flex-col" style={{ height: "560px" }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700">
          <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center"><Bot size={18} className="text-orange-400" /></div>
          <div className="flex-1"><p className="font-black text-white text-sm">MecaniBot</p><p className="text-xs text-slate-500">{ot.vehiculo} · {ot.patente}</p></div>
          <span className="flex items-center gap-1.5 text-xs text-green-500 font-black"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />En línea</span>
          <button onClick={onCerrar} className="ml-2 text-slate-500 hover:text-white transition"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {mensajes.map((m, i) => (
            <div key={i} className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}>
              {m.rol === "bot" && <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center mr-2 mt-1 flex-shrink-0"><Bot size={13} className="text-orange-400" /></div>}
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.rol === "user" ? "bg-orange-500 text-white rounded-tr-sm" : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"}`}>{m.texto}</div>
            </div>
          ))}
          {enviando && (
            <div className="flex justify-start">
              <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center mr-2 flex-shrink-0"><Bot size={13} className="text-orange-400" /></div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-slate-400 animate-pulse">Pensando...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="px-5 py-4 border-t border-slate-700 flex gap-2">
          <textarea rows={1} value={pregunta} onChange={(e) => setPregunta(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
            placeholder="Pregunta algo técnico... (Enter para enviar)"
            className="flex-1 bg-slate-800 border border-slate-600 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 outline-none resize-none text-sm" />
          <button onClick={() => enviar()} disabled={!pregunta.trim() || enviando} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl transition">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers de UI ─────────────────────────────────────────────────────────────

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-900">
      <SidebarTecnico />
      <div className="flex-1 overflow-x-hidden"><TopbarTecnico />{children}</div>
    </div>
  );
}

function BtnVolver({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 text-slate-400 hover:text-orange-400 font-black text-sm mb-6 transition">
      <ArrowLeft size={16} /> Volver a órdenes
    </button>
  );
}

function InfoRow({ icono, label, valor }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-700 last:border-0">
      <span className="text-slate-500 mt-0.5">{icono}</span>
      <div>
        <p className="text-xs text-slate-500 font-black uppercase tracking-wider">{label}</p>
        <p className="text-sm text-white font-black mt-0.5">{valor || "—"}</p>
      </div>
    </div>
  );
}

function estadoBadgeClass(estado = "") {
  const e = estado.toUpperCase();
  if (e === "COMPLETADA")       return "bg-green-500/20 text-green-400 border border-green-500/30";
  if (e.includes("PROCESO"))    return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
  return "bg-slate-700 text-slate-400 border border-slate-600";
}
