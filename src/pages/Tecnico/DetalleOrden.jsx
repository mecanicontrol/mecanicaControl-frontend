import { useEffect, useRef, useState } from "react";
import SidebarTecnico from "../../components/Tecnico/SidebarTecnico";
import TopbarTecnico from "../../components/Tecnico/TopbarTecnico";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Car, User, Wrench, Clock,
  CheckCircle, ClipboardList, Search as SearchIcon, ShieldCheck,
  Upload, X, Plus, Trash2, Send, Bot, PackageSearch, PackagePlus,
  Sparkles, StickyNote, Camera,
} from "lucide-react";
import {
  obtenerDetalleOrdenTecnico,
  guardarDiagnosticoOrden,
  actualizarEstadoOrden,
} from "../../services/tecnicoService";
import api from "../../api/axiosInstance";
import { supabase } from "../../lib/supabaseClient";

// ── Orden de fases ────────────────────────────────────────────────────────────

const FASES_ORDER = ["RECEPCION", "DIAGNOSTICO", "EN_TRABAJO", "CONTROL_CALIDAD", "LISTO_ENTREGA"];

const FASES_META = {
  RECEPCION:       { label: "Recepción",        labelCorto: "Recepción",  Icono: ClipboardList },
  DIAGNOSTICO:     { label: "Diagnóstico",      labelCorto: "Diagnóstico",Icono: SearchIcon    },
  EN_TRABAJO:      { label: "En trabajo",       labelCorto: "Trabajo",    Icono: Wrench        },
  CONTROL_CALIDAD: { label: "Control de calidad",labelCorto: "Control",   Icono: ShieldCheck   },
  LISTO_ENTREGA:   { label: "Listo para entrega",labelCorto: "Entrega",   Icono: Car           },
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function DetalleOrden() {
  const { codigo } = useParams();
  const navigate   = useNavigate();

  const [ot,          setOt]          = useState(null);
  const [fases,       setFases]       = useState([]);
  const [idxFase,     setIdxFase]     = useState(0);
  const [cargando,    setCargando]    = useState(true);
  const [mensaje,     setMensaje]     = useState({ texto: "", tipo: "ok" });
  const [panelIA,     setPanelIA]     = useState(false);
  const [contextoIA,  setContextoIA]  = useState("");

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

  const abrirIA = (contexto = "") => {
    setContextoIA(contexto);
    setPanelIA(true);
  };

  if (cargando) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400 animate-pulse text-lg">Cargando orden...</p>
        </div>
      </Layout>
    );
  }

  if (!ot) {
    return (
      <Layout>
        <div className="p-8">
          <BtnVolver onClick={() => navigate("/tecnico/ordenes")} />
          <p className="text-slate-400 mt-4">Orden no encontrada o sin acceso.</p>
        </div>
      </Layout>
    );
  }

  const faseActual = fases[idxFase] || null;
  const fasePrev   = idxFase > 0 ? fases[idxFase - 1] : null;
  const faseNext   = idxFase < fases.length - 1 ? fases[idxFase + 1] : null;
  const completadas = fases.filter((f) => f.estado === "COMPLETADA").length;
  const progresoPct = fases.length > 0 ? Math.round((completadas / fases.length) * 100) : 0;

  return (
    <Layout>
      {/* Toast de notificación */}
      {mensaje.texto && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl font-black text-sm shadow-2xl transition-all ${
          mensaje.tipo === "error"
            ? "bg-red-600 text-white"
            : "bg-green-500 text-white"
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Panel IA flotante */}
      {panelIA && (
        <PanelIAFlotante
          ot={ot}
          contexto={contextoIA}
          onCerrar={() => setPanelIA(false)}
        />
      )}

      <div className="p-6 lg:p-8 max-w-screen-xl mx-auto">
        {/* Encabezado */}
        <BtnVolver onClick={() => navigate("/tecnico/ordenes")} />

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-orange-500 font-black tracking-widest text-xs uppercase mb-1">
              {ot.servicio || "Servicio de taller"}
            </p>
            <h1 className="text-4xl font-black text-white">{ot.codigo}</h1>
            <p className="text-slate-400 mt-1 text-sm">
              {ot.vehiculo} &middot; {ot.patente}
              {ot.cliente ? ` — ${ot.cliente}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider ${estadoBadgeClass(ot.estado)}`}>
              {ot.estado?.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-black text-slate-400 mb-2">
            <span className="uppercase tracking-wider">Progreso del servicio</span>
            <span className="text-orange-400">{completadas}/{fases.length} fases · {progresoPct}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-700"
              style={{ width: `${progresoPct}%` }}
            />
          </div>
          {/* Dots de fases */}
          <div className="flex justify-between mt-3">
            {fases.map((f, i) => {
              const meta = FASES_META[f.nombre] || { labelCorto: f.nombre };
              const esActual = i === idxFase;
              return (
                <button
                  key={f.id}
                  onClick={() => setIdxFase(i)}
                  className="flex flex-col items-center group"
                >
                  <div className={`w-3 h-3 rounded-full transition-all ${
                    f.estado === "COMPLETADA"
                      ? "bg-green-500"
                      : esActual
                      ? "bg-orange-500 ring-4 ring-orange-500/30"
                      : "bg-slate-600"
                  }`} />
                  <span className={`text-xs mt-1 font-bold transition-colors ${
                    esActual ? "text-orange-400" : f.estado === "COMPLETADA" ? "text-green-500" : "text-slate-500"
                  }`}>
                    {meta.labelCorto}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid principal: contenido + sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── Columna principal ── */}
          <div className="xl:col-span-2 space-y-6">

            {/* Navegación de fases */}
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIdxFase((p) => Math.max(0, p - 1))}
                  disabled={!fasePrev}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition font-black text-sm text-slate-300"
                >
                  <ChevronLeft size={16} />
                  {fasePrev ? (FASES_META[fasePrev.nombre]?.labelCorto || fasePrev.nombre) : "Anterior"}
                </button>

                <div className="text-center">
                  {faseActual && (
                    <>
                      <p className="text-xs font-black uppercase text-orange-500 tracking-widest">
                        {faseActual.estado === "ACTIVA" ? "Trabajo actual" : faseActual.estado === "COMPLETADA" ? "Completada" : "Pendiente"}
                      </p>
                      <p className="text-xl font-black text-white mt-0.5">
                        {FASES_META[faseActual.nombre]?.label || faseActual.nombre}
                      </p>
                      {faseActual.inicioAt && (
                        <p className="text-xs text-slate-500 mt-0.5">Inicio: {faseActual.inicioAt}</p>
                      )}
                    </>
                  )}
                </div>

                <button
                  onClick={() => setIdxFase((p) => Math.min(fases.length - 1, p + 1))}
                  disabled={!faseNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition font-black text-sm text-slate-300"
                >
                  {faseNext ? (FASES_META[faseNext.nombre]?.labelCorto || faseNext.nombre) : "Siguiente"}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Panel editable de la fase actual */}
            {faseActual && (
              <PanelFase
                key={faseActual.id}
                fv={faseActual}
                faseNext={faseNext}
                ot={ot}
                onGuardado={(updated) => {
                  setFases((prev) => prev.map((f) => f.id === updated.id ? updated : f));
                  avisar("Borrador guardado");
                }}
                onCompletada={(updated) => {
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
                }}
                avisar={avisar}
                onAbrirIA={abrirIA}
              />
            )}

            {/* Repuestos */}
            <SeccionRepuestos codigo={codigo} avisar={avisar} onAbrirIA={abrirIA} />

            {/* Diagnóstico general */}
            <SeccionDiagnostico codigo={codigo} diagnosticoInicial={ot.diagnostico} avisar={avisar} />
          </div>

          {/* ── Sidebar derecho ── */}
          <div className="space-y-6">
            {/* Info del vehículo */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">
                Información del vehículo
              </h3>
              <InfoRow icono={<Car size={14} />} label="Vehículo" valor={ot.vehiculo} />
              <InfoRow icono={<Car size={14} />} label="Patente" valor={ot.patente} />
              <InfoRow icono={<User size={14} />} label="Cliente" valor={ot.cliente || "—"} />
              <InfoRow icono={<Wrench size={14} />} label="Servicio" valor={ot.servicio || "—"} />
              <InfoRow icono={<Clock size={14} />} label="Ingreso" valor={ot.fechaInicio ? new Date(ot.fechaInicio).toLocaleDateString("es-CL") : "—"} />
            </div>

            {/* Costos */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">
                Resumen de costos
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mano de obra</span>
                  <span className="text-white font-black">
                    ${parseFloat(ot.costoManoObra || 0).toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Repuestos</span>
                  <span className="text-white font-black">
                    ${parseFloat(ot.costoRepuestos || 0).toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="h-px bg-slate-700" />
                <div className="flex justify-between">
                  <span className="text-white font-black">Total estimado</span>
                  <span className="text-orange-400 font-black text-lg">
                    ${(parseFloat(ot.costoManoObra || 0) + parseFloat(ot.costoRepuestos || 0)).toLocaleString("es-CL")}
                  </span>
                </div>
              </div>
            </div>

            {/* MecaniBot acceso rápido */}
            <button
              onClick={() => abrirIA("")}
              className="w-full bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 hover:border-orange-500 rounded-2xl p-6 text-left transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Bot size={20} className="text-orange-400" />
                </div>
                <div>
                  <p className="font-black text-white group-hover:text-orange-400 transition-colors">MecaniBot</p>
                  <p className="text-xs text-slate-500">Asistente técnico IA</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Consulta procedimientos, torques, códigos de falla o cualquier duda técnica del vehículo.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-black text-orange-500">
                <Sparkles size={12} />
                Abrir asistente
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ── Panel editable de fase ────────────────────────────────────────────────────

function PanelFase({ fv, faseNext, ot, onGuardado, onCompletada, avisar, onAbrirIA }) {
  const [observaciones, setObservaciones] = useState(fv.observaciones || "");
  const [imagenes,      setImagenes]      = useState(() => {
    try { return JSON.parse(fv.imagenes || "[]"); } catch { return []; }
  });
  const [subiendo,       setSubiendo]       = useState(false);
  const [guardando,      setGuardando]      = useState(false);
  const [completando,    setCompletando]    = useState(false);
  const [confirmando,    setConfirmando]    = useState(false);
  const [errDesc,        setErrDesc]        = useState(false);
  const [errFoto,        setErrFoto]        = useState(false);
  const fileRef    = useRef(null);
  const textareaRef = useRef(null);
  const fotoRef    = useRef(null);

  const esCompletada = fv.estado === "COMPLETADA";
  const esActiva     = fv.estado === "ACTIVA";
  const meta         = FASES_META[fv.nombre] || { label: fv.nombre };
  const metaNext     = faseNext ? FASES_META[faseNext.nombre] : null;

  // Limpiar errores al corregir
  useEffect(() => { if (observaciones.trim()) setErrDesc(false); }, [observaciones]);
  useEffect(() => { if (imagenes.length > 0)  setErrFoto(false); }, [imagenes]);

  const subirImagen = async (e) => {
    const archivos = Array.from(e.target.files || []);
    if (!archivos.length) return;
    setSubiendo(true);
    try {
      const nuevas = [];
      for (const archivo of archivos) {
        const ruta = `ot-imagenes/${Date.now()}-${archivo.name.replace(/\s/g, "_")}`;
        const { error } = await supabase.storage.from("ot-imagenes").upload(ruta, archivo, { upsert: false });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("ot-imagenes").getPublicUrl(ruta);
        nuevas.push(urlData.publicUrl);
      }
      setImagenes((prev) => [...prev, ...nuevas]);
    } catch {
      avisar("Error al subir la imagen", "error");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  };

  const eliminarImagen = (url) => setImagenes((prev) => prev.filter((u) => u !== url));

  const payload = () => ({ observaciones, imagenes: JSON.stringify(imagenes) });

  const guardarBorrador = async () => {
    setGuardando(true);
    try {
      await api.patch(`/api/tecnicos/fases/${fv.id}`, payload());
      onGuardado({ ...fv, observaciones, imagenes: JSON.stringify(imagenes) });
    } catch {
      avisar("Error al guardar", "error");
    } finally {
      setGuardando(false);
    }
  };

  const solicitarCompletar = () => {
    let valido = true;
    if (!observaciones.trim()) {
      setErrDesc(true);
      textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      textareaRef.current?.focus();
      valido = false;
    }
    if (imagenes.length === 0) {
      setErrFoto(true);
      if (valido) fotoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      valido = false;
    }
    if (!valido) {
      avisar("Completa la descripción y sube al menos una foto para avanzar", "error");
      return;
    }
    setConfirmando(true);
  };

  const confirmarYCompletar = async () => {
    setConfirmando(false);
    setCompletando(true);
    try {
      await api.post(`/api/tecnicos/fases/${fv.id}/completar`, payload());
      onCompletada({
        ...fv,
        observaciones,
        imagenes: JSON.stringify(imagenes),
        estado: "COMPLETADA",
        finAt: new Date().toLocaleString("es-CL"),
      });
    } catch {
      avisar("Error al completar la fase", "error");
    } finally {
      setCompletando(false);
    }
  };

  const pedirSugerenciaIA = () => {
    onAbrirIA(`Estoy en la fase "${meta.label}" del vehículo ${ot.vehiculo} (${ot.patente}). Servicio: ${ot.servicio || "taller"}. Dame una lista de las tareas o verificaciones que debo realizar en esta fase, y qué observaciones son importantes documentar.`);
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header de fase */}
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

      <div className="p-6 space-y-6">

        {/* ── Descripción / Observaciones ── */}
        <div ref={textareaRef}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Descripción / Observaciones
              </label>
              {!esCompletada && (
                <span className="text-red-500 text-xs font-black">* obligatorio</span>
              )}
            </div>
            {!esCompletada && (
              <button
                onClick={pedirSugerenciaIA}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-black text-orange-400 hover:text-orange-300 transition"
              >
                <Sparkles size={12} />
                Sugerir con IA
              </button>
            )}
          </div>

          <textarea
            rows={5}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            disabled={esCompletada}
            placeholder={`Describe el trabajo realizado en la fase de ${meta.label.toLowerCase()}...`}
            className={`w-full bg-slate-900 border rounded-xl p-4 text-white placeholder-slate-500 outline-none resize-none disabled:opacity-50 transition-colors text-sm leading-relaxed ${
              errDesc
                ? "border-red-500 focus:border-red-400"
                : "border-slate-600 focus:border-orange-500"
            }`}
          />
          {errDesc && (
            <p className="mt-1.5 text-xs font-black text-red-400 flex items-center gap-1">
              <X size={11} />
              La descripción es obligatoria para completar la fase.
            </p>
          )}
        </div>

        {/* ── Documentación fotográfica ── */}
        <div ref={fotoRef}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Camera size={14} className={errFoto ? "text-red-400" : "text-slate-400"} />
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Evidencia fotográfica
              </label>
              {!esCompletada && (
                <span className="text-red-500 text-xs font-black">* mínimo 1 foto</span>
              )}
            </div>
            {imagenes.length > 0 && (
              <span className="text-xs font-black text-green-400">
                {imagenes.length} foto{imagenes.length !== 1 ? "s" : ""} subida{imagenes.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Zona de fotos + botón agregar */}
          <div className={`rounded-xl border-2 p-4 transition-colors ${
            errFoto
              ? "border-red-500 bg-red-950/20"
              : imagenes.length > 0
              ? "border-slate-600 bg-slate-900/50"
              : "border-dashed border-slate-600"
          }`}>
            <div className="flex flex-wrap gap-3">
              {imagenes.map((url) => (
                <div key={url} className="relative group w-28 h-28 flex-shrink-0">
                  <img
                    src={url}
                    alt="trabajo"
                    className="w-full h-full object-cover rounded-xl border border-slate-600"
                  />
                  {!esCompletada && (
                    <button
                      onClick={() => eliminarImagen(url)}
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
                  {subiendo ? (
                    <span className="text-xs animate-pulse text-slate-400 text-center px-2">Subiendo...</span>
                  ) : (
                    <>
                      <Upload size={20} />
                      <span className="text-xs mt-1 font-black">Agregar foto</span>
                    </>
                  )}
                </button>
              )}

              {imagenes.length === 0 && !esCompletada && (
                <div className="flex-1 flex items-center justify-center py-4 text-center">
                  <div>
                    <Camera size={28} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-xs text-slate-500 font-black">Sin fotos</p>
                    <p className="text-xs text-slate-600 mt-0.5">Toca el botón para agregar</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={subirImagen}
          />

          {errFoto && (
            <p className="mt-1.5 text-xs font-black text-red-400 flex items-center gap-1">
              <X size={11} />
              Debes subir al menos una foto para completar la fase.
            </p>
          )}
        </div>

        {/* ── Modal de confirmación inline ── */}
        {confirmando && (
          <div className="bg-orange-950/40 border border-orange-500/50 rounded-xl p-5">
            <p className="font-black text-white mb-1">
              ¿Confirmas que la fase <span className="text-orange-400">{meta.label}</span> está completada?
            </p>
            <p className="text-sm text-slate-400 mb-4">
              Esta acción no se puede deshacer.{faseNext && ` Se activará la fase "${metaNext?.label}".`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmando(false)}
                className="flex-1 px-4 py-2.5 rounded-xl font-black text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarYCompletar}
                className="flex-1 px-4 py-2.5 rounded-xl font-black text-sm bg-orange-500 hover:bg-orange-600 text-white transition flex items-center justify-center gap-2"
              >
                <CheckCircle size={15} />
                Sí, completar fase
              </button>
            </div>
          </div>
        )}

        {/* ── Botones principales ── */}
        {!esCompletada && !confirmando && (
          <div className="flex gap-3 pt-1">
            <button
              onClick={guardarBorrador}
              disabled={guardando}
              className="px-6 py-3 rounded-xl font-black text-sm uppercase bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-50 transition"
            >
              {guardando ? "Guardando..." : "Guardar borrador"}
            </button>

            <button
              onClick={solicitarCompletar}
              disabled={completando || !esActiva}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-black text-sm uppercase transition"
            >
              {completando ? (
                "Completando..."
              ) : metaNext ? (
                <>
                  <CheckCircle size={16} />
                  Completar y avanzar a {metaNext.labelCorto || metaNext.label}
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Completar fase final
                </>
              )}
            </button>
          </div>
        )}

        {esCompletada && (
          <div className="flex items-center gap-2 text-green-400 text-sm font-black bg-green-900/20 rounded-xl px-4 py-3 border border-green-900/50">
            <CheckCircle size={16} />
            {fv.finAt ? `Completada el ${fv.finAt}` : "Fase completada"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sección Repuestos ─────────────────────────────────────────────────────────

function SeccionRepuestos({ codigo, avisar, onAbrirIA }) {
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
    try {
      const { data } = await api.get(`/api/tecnicos/productos?q=${encodeURIComponent(q)}`);
      setResultados(data);
    } catch { setResultados([]); }
    finally { setBuscando(false); }
  };

  const agregarDesdeInventario = async (producto) => {
    try {
      const { data } = await api.post(`/api/tecnicos/ordenes/${codigo}/repuestos`, {
        nombre: producto.nombre, cantidad: 1,
        precioUnitario: producto.precio, origen: "MECANIHUB", productoId: producto.id,
      });
      setRepuestos((p) => [...p, data]);
      setBusqueda(""); setResultados([]);
      avisar(`"${producto.nombre}" agregado`);
    } catch { avisar("Error al agregar el repuesto", "error"); }
  };

  const agregarManual = async () => {
    if (!formManual.nombre.trim()) return;
    setGuardandoManual(true);
    try {
      const { data } = await api.post(`/api/tecnicos/ordenes/${codigo}/repuestos`, formManual);
      setRepuestos((p) => [...p, data]);
      setFormManual({ nombre: "", cantidad: 1, precioUnitario: 0, origen: "CLIENTE" });
      setModo("lista");
      avisar("Repuesto agregado");
    } catch { avisar("Error al agregar", "error"); }
    finally { setGuardandoManual(false); }
  };

  const eliminar = async (id) => {
    try {
      await api.delete(`/api/tecnicos/repuestos/${id}`);
      setRepuestos((p) => p.filter((r) => r.id !== id));
      avisar("Repuesto eliminado");
    } catch { avisar("Error al eliminar", "error"); }
  };

  const total = repuestos.reduce((s, r) => s + parseFloat(r.precioUnitario || 0) * (r.cantidad || 1), 0);

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PackageSearch size={18} className="text-slate-400" />
          <span className="font-black text-white">Repuestos</span>
          <span className="text-xs text-slate-400">({repuestos.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAbrirIA("Tengo un vehículo en taller. Dame una lista de los repuestos más comunes que se utilizan para el servicio que se está realizando, con nombres genéricos.")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-xs font-black text-orange-400 hover:text-orange-300 transition"
          >
            <Sparkles size={12} />
            Sugerir con IA
          </button>
          <button
            onClick={() => setModo(modo === "inventario" ? "lista" : "inventario")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition ${
              modo === "inventario" ? "bg-orange-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            <SearchIcon size={12} />
            Inventario
          </button>
          <button
            onClick={() => setModo(modo === "manual" ? "lista" : "manual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition ${
              modo === "manual" ? "bg-orange-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            <Plus size={12} />
            Manual
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Lista de repuestos */}
        {cargando ? (
          <p className="text-slate-400 animate-pulse text-sm">Cargando...</p>
        ) : repuestos.length === 0 && modo === "lista" ? (
          <p className="text-slate-500 text-center py-6 text-sm">Sin repuestos registrados aún</p>
        ) : (
          <div className="divide-y divide-slate-700">
            {repuestos.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-black text-white text-sm">{r.nombre}</p>
                  <p className="text-xs text-slate-500">
                    {r.cantidad} × ${parseFloat(r.precioUnitario || 0).toLocaleString("es-CL")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                    r.origen === "MECANIHUB" ? "bg-blue-900/50 text-blue-400" : "bg-amber-900/50 text-amber-400"
                  }`}>
                    {r.origen === "MECANIHUB" ? "MecaniHub" : "Cliente"}
                  </span>
                  <span className="font-black text-white text-sm w-24 text-right">
                    ${(parseFloat(r.precioUnitario || 0) * (r.cantidad || 1)).toLocaleString("es-CL")}
                  </span>
                  <button onClick={() => eliminar(r.id)} className="text-slate-500 hover:text-red-400 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {repuestos.length > 0 && (
              <div className="pt-3 flex justify-between items-center">
                <span className="text-slate-400 text-sm font-black uppercase tracking-wider">Total repuestos</span>
                <span className="text-orange-400 font-black text-lg">${total.toLocaleString("es-CL")}</span>
              </div>
            )}
          </div>
        )}

        {/* Buscar en inventario */}
        {modo === "inventario" && (
          <div className="border-t border-slate-700 pt-4 space-y-3">
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Buscar en inventario</p>
            <div className="relative">
              <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={busqueda}
                onChange={(e) => buscarInventario(e.target.value)}
                placeholder="Nombre del producto..."
                className="w-full bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 outline-none text-sm"
              />
            </div>
            {buscando && <p className="text-slate-400 text-xs animate-pulse">Buscando...</p>}
            <div className="divide-y divide-slate-700">
              {resultados.map((p) => (
                <div key={p.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-black text-white text-sm">{p.nombre}</p>
                    <p className="text-xs text-slate-500">SKU: {p.sku} · Stock: {p.stock}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-white text-sm">${parseFloat(p.precio).toLocaleString("es-CL")}</span>
                    <button
                      onClick={() => agregarDesdeInventario(p)}
                      className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-black text-xs transition"
                    >
                      <Plus size={12} /> Agregar
                    </button>
                  </div>
                </div>
              ))}
              {busqueda.length >= 2 && !buscando && resultados.length === 0 && (
                <p className="text-slate-500 text-sm pt-3">Sin resultados para "{busqueda}"</p>
              )}
            </div>
          </div>
        )}

        {/* Agregar manual */}
        {modo === "manual" && (
          <div className="border-t border-slate-700 pt-4 space-y-4">
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Agregar manualmente</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-500 mb-1">Nombre del repuesto</label>
                <input
                  value={formManual.nombre}
                  onChange={(e) => setFormManual((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Filtro de aceite, Pastillas de freno..."
                  className="w-full bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 mb-1">Cantidad</label>
                <input
                  type="number" min="1" value={formManual.cantidad}
                  onChange={(e) => setFormManual((p) => ({ ...p, cantidad: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 mb-1">Precio unitario ($)</label>
                <input
                  type="number" min="0" value={formManual.precioUnitario}
                  onChange={(e) => setFormManual((p) => ({ ...p, precioUnitario: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white outline-none text-sm"
                />
              </div>
              <div className="col-span-2 flex gap-2">
                {["CLIENTE", "MECANIHUB"].map((orig) => (
                  <button
                    key={orig}
                    onClick={() => setFormManual((p) => ({ ...p, origen: orig }))}
                    className={`flex-1 py-2 rounded-xl font-black text-xs uppercase transition border ${
                      formManual.origen === orig
                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                        : "border-slate-600 text-slate-500 hover:border-slate-500"
                    }`}
                  >
                    {orig === "CLIENTE" ? "Trae el cliente" : "MecaniHub"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModo("lista")}
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={agregarManual}
                disabled={guardandoManual || !formManual.nombre.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase transition"
              >
                {guardandoManual ? "Guardando..." : "Agregar repuesto"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Diagnóstico general ───────────────────────────────────────────────────────

function SeccionDiagnostico({ codigo, diagnosticoInicial, avisar }) {
  const [diagnostico, setDiagnostico] = useState(diagnosticoInicial || "");
  const [guardando,   setGuardando]   = useState(false);

  const guardar = async () => {
    setGuardando(true);
    try {
      await guardarDiagnosticoOrden(codigo, diagnostico);
      avisar("Diagnóstico guardado");
    } catch { avisar("Error al guardar el diagnóstico", "error"); }
    finally { setGuardando(false); }
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 bg-slate-700/50 flex items-center gap-3">
        <StickyNote size={18} className="text-slate-400" />
        <span className="font-black text-white">Diagnóstico general de la OT</span>
      </div>
      <div className="p-6">
        <textarea
          rows={5}
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
          placeholder="Diagnóstico técnico general de la orden de trabajo..."
          className="w-full bg-slate-900 border border-slate-600 focus:border-orange-500 rounded-xl p-4 text-white placeholder-slate-500 outline-none resize-none text-sm leading-relaxed transition-colors"
        />
        <button
          onClick={guardar}
          disabled={guardando}
          className="mt-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-black text-sm uppercase transition"
        >
          {guardando ? "Guardando..." : "Guardar diagnóstico"}
        </button>
      </div>
    </div>
  );
}

// ── Panel IA flotante ─────────────────────────────────────────────────────────

function PanelIAFlotante({ ot, contexto, onCerrar }) {
  const [mensajes, setMensajes] = useState(() => {
    const inicio = {
      rol: "bot",
      texto: `Hola, soy **MecaniBot**.\n\nEstoy listo para asistirte con la orden **${ot.codigo}** — ${ot.vehiculo} · ${ot.patente}.\n\nPuedes preguntarme sobre procedimientos, torques, códigos de falla, tiempos estimados o cualquier duda técnica.`,
    };
    if (contexto) {
      return [inicio, { rol: "user", texto: contexto }];
    }
    return [inicio];
  });
  const [pregunta, setPregunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // Auto-enviar el contexto inicial si fue provisto
  useEffect(() => {
    if (contexto) enviar(contexto);
  }, []);

  const enviar = async (textoForzado) => {
    const texto = (textoForzado || pregunta).trim();
    if (!texto || enviando) return;
    setPregunta("");
    if (!textoForzado) setMensajes((p) => [...p, { rol: "user", texto }]);
    setEnviando(true);

    const historial = mensajes
      .slice(-6)
      .map((m) => `${m.rol === "user" ? "Técnico" : "MecaniBot"}: ${m.texto}`)
      .join("\n");

    try {
      const { data } = await api.post("/api/tecnicos/ia/chat", {
        vehiculo: `${ot.vehiculo} ${ot.patente}`,
        servicio: ot.servicio || "",
        pregunta: texto,
        historial,
      });
      setMensajes((p) => [...p, { rol: "bot", texto: data.respuesta }]);
    } catch {
      setMensajes((p) => [...p, { rol: "bot", texto: "No pude conectarme al asistente. Intenta nuevamente." }]);
    } finally {
      setEnviando(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end p-4 sm:p-6 pointer-events-none">
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={onCerrar} />

      {/* Panel */}
      <div className="relative pointer-events-auto w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl flex flex-col" style={{ height: "560px" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700">
          <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center">
            <Bot size={18} className="text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="font-black text-white text-sm">MecaniBot</p>
            <p className="text-xs text-slate-500">{ot.vehiculo} · {ot.patente}</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-green-500 font-black">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            En línea
          </span>
          <button onClick={onCerrar} className="ml-2 text-slate-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {mensajes.map((m, i) => (
            <div key={i} className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}>
              {m.rol === "bot" && (
                <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <Bot size={13} className="text-orange-400" />
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.rol === "user"
                  ? "bg-orange-500 text-white rounded-tr-sm"
                  : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
              }`}>
                {m.texto}
              </div>
            </div>
          ))}
          {enviando && (
            <div className="flex justify-start">
              <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                <Bot size={13} className="text-orange-400" />
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-slate-400 animate-pulse">
                Pensando...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-slate-700 flex gap-2">
          <textarea
            rows={1}
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Pregunta algo técnico... (Enter para enviar)"
            className="flex-1 bg-slate-800 border border-slate-600 focus:border-orange-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 outline-none resize-none text-sm"
          />
          <button
            onClick={() => enviar()}
            disabled={!pregunta.trim() || enviando}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl transition"
          >
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
      <div className="flex-1 overflow-x-hidden">
        <TopbarTecnico />
        {children}
      </div>
    </div>
  );
}

function BtnVolver({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-slate-400 hover:text-orange-400 font-black text-sm mb-6 transition"
    >
      <ArrowLeft size={16} />
      Volver a órdenes
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
  if (e === "COMPLETADA")  return "bg-green-500/20 text-green-400 border border-green-500/30";
  if (e.includes("PROCESO")) return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
  return "bg-slate-700 text-slate-400 border border-slate-600";
}
