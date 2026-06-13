import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../api/axiosInstance";
import {
  ShieldCheck, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Car, Wrench, FileText, ListChecks, Camera, AlertCircle, Clock
} from "lucide-react";

const CHECKLIST_LABELS = {
  motor:      "Motor y sistema de transmisión",
  frenos:     "Sistema de frenos",
  electrico:  "Sistema eléctrico y luces",
  fluidos:    "Niveles de fluidos",
  neumaticos: "Neumáticos y ruedas",
  limpieza:   "Limpieza del vehículo",
  ruta:       "Prueba de ruta",
};

export default function ControlCalidad() {
  const [pendientes, setPendientes] = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [abierto,    setAbierto]    = useState(null); // faseId expandida
  const [notaModal,  setNotaModal]  = useState(null); // { faseId, accion: 'aprobar'|'rechazar' }
  const [nota,       setNota]       = useState("");
  const [procesando, setProcesando] = useState(false);
  const [mensaje,    setMensaje]    = useState("");

  const cargar = async () => {
    setCargando(true);
    try {
      const { data } = await api.get("/api/admin/control-calidad/pendientes");
      setPendientes(data);
    } catch {
      setPendientes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const avisar = (txt) => { setMensaje(txt); setTimeout(() => setMensaje(""), 3500); };

  const abrir = (id) => setAbierto((prev) => (prev === id ? null : id));

  const iniciarAccion = (faseId, accion) => {
    setNota("");
    setNotaModal({ faseId, accion });
  };

  const confirmarAccion = async () => {
    if (!notaModal) return;
    if (notaModal.accion === "rechazar" && !nota.trim()) {
      alert("Debes indicar el motivo del rechazo.");
      return;
    }
    setProcesando(true);
    try {
      await api.post(`/api/admin/control-calidad/${notaModal.faseId}/${notaModal.accion}`, { nota });
      avisar(notaModal.accion === "aprobar" ? "Control aprobado — fase completada" : "Control rechazado");
      setNotaModal(null);
      api.invalidar("/api/admin/control-calidad/pendientes");
      cargar();
    } catch {
      avisar("Error al procesar la acción");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <AdminLayout>
      {mensaje && (
        <div className="fixed top-6 right-6 z-50 px-6 py-3 rounded-2xl font-black text-sm shadow-2xl bg-green-600 text-white">
          {mensaje}
        </div>
      )}

      {/* Modal aprobar / rechazar */}
      {notaModal && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-black text-white text-lg mb-1">
              {notaModal.accion === "aprobar" ? "Aprobar control de calidad" : "Rechazar control de calidad"}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {notaModal.accion === "aprobar"
                ? "El técnico recibirá confirmación y la fase avanzará a Listo para Entrega."
                : "Indica el motivo del rechazo para que el técnico lo corrija."}
            </p>
            <textarea
              rows={3}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder={notaModal.accion === "aprobar" ? "Nota opcional (ej: Trabajo excelente)" : "Motivo del rechazo (obligatorio)..."}
              className="w-full bg-gray-800 border border-gray-600 focus:border-orange-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setNotaModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl font-black text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                disabled={procesando}
                className={`flex-1 px-4 py-2.5 rounded-xl font-black text-sm text-white transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                  notaModal.accion === "aprobar"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {procesando ? "Procesando..." : notaModal.accion === "aprobar"
                  ? <><CheckCircle size={15} /> Confirmar aprobación</>
                  : <><XCircle size={15} /> Confirmar rechazo</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6">
          <p className="text-orange-500 font-black tracking-widest text-xs uppercase mb-1">Administración</p>
          <h1 className="text-2xl font-black text-white">Control de Calidad</h1>
          <p className="text-gray-400 text-sm mt-1">
            Revisiones pendientes de aprobación antes de entregar el vehículo al cliente.
          </p>
        </div>

        {/* Contador */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
            <Clock size={16} className="text-amber-400" />
            <span className="font-black text-amber-400 text-sm">
              {cargando ? "..." : `${pendientes.length} revisión${pendientes.length !== 1 ? "es" : ""} pendiente${pendientes.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>

        {/* Lista */}
        {cargando ? (
          <div className="text-center py-16 text-gray-500 animate-pulse">Cargando revisiones...</div>
        ) : pendientes.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-12 text-center">
            <ShieldCheck size={40} className="mx-auto text-green-500 mb-3" />
            <p className="font-black text-white text-lg">Sin revisiones pendientes</p>
            <p className="text-gray-400 text-sm mt-1">Todos los controles de calidad están al día.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendientes.map((item) => (
              <TarjetaRevision
                key={item.faseId}
                item={item}
                expandida={abierto === item.faseId}
                onToggle={() => abrir(item.faseId)}
                onAprobar={() => iniciarAccion(item.faseId, "aprobar")}
                onRechazar={() => iniciarAccion(item.faseId, "rechazar")}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function TarjetaRevision({ item, expandida, onToggle, onAprobar, onRechazar }) {
  const checklist = (() => {
    try {
      const p = JSON.parse(item.observaciones || "{}");
      return p.items || [];
    } catch { return []; }
  })();

  const imagenes = (() => {
    try { return JSON.parse(item.imagenes || "[]"); } catch { return []; }
  })();

  const countOk  = checklist.filter((it) => it.estado === "ok").length;
  const countNok = checklist.filter((it) => it.estado === "nok").length;
  const countNa  = checklist.filter((it) => it.estado === "na").length;

  const estadoColor = {
    ok:       "bg-green-500/20 text-green-400",
    nok:      "bg-red-500/20 text-red-400",
    na:       "bg-gray-600/50 text-gray-400",
    pendiente:"bg-gray-700 text-gray-500",
  };

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-white text-sm">{item.codigoOt}</p>
            <p className="text-xs text-gray-400 truncate">
              {item.patente}{item.vehiculo ? ` · ${item.vehiculo}` : ""}{item.servicio ? ` — ${item.servicio}` : ""}
            </p>
            {item.tecnico && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Wrench size={10} /> {item.tecnico}
              </p>
            )}
          </div>
        </div>

        {/* Resumen OK/NOK */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-black">{countOk} OK</span>
          {countNok > 0 && <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-black">{countNok} NOK</span>}
          {countNa  > 0 && <span className="px-2 py-1 rounded-lg bg-gray-700 text-gray-400 text-xs font-black">{countNa} N/A</span>}
        </div>

        <button onClick={onToggle} className="text-gray-400 hover:text-white transition flex-shrink-0">
          {expandida ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Detalle expandido */}
      {expandida && (
        <div className="border-t border-gray-700 p-5 space-y-5">

          {/* Checklist con fotos por ítem */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListChecks size={14} className="text-gray-400" />
              <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Checklist del técnico</p>
            </div>
            <div className="space-y-2">
              {checklist.map((it) => {
                const fotos = it.fotos || [];
                return (
                  <div key={it.id} className={`rounded-xl overflow-hidden ${estadoColor[it.estado] || estadoColor.pendiente}`}>
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <span className="text-sm font-bold">{CHECKLIST_LABELS[it.id] || it.label || it.id}</span>
                      <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-black/20">
                        {it.estado === "na" ? "N/A" : it.estado?.toUpperCase()}
                      </span>
                    </div>
                    {fotos.length > 0 && (
                      <div className="px-3 pb-3 border-t border-black/20">
                        <p className="text-[10px] font-black uppercase text-current opacity-60 mt-2 mb-1.5 flex items-center gap-1">
                          <Camera size={9} /> {fotos.length} foto{fotos.length !== 1 ? "s" : ""}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {fotos.map((url) => (
                            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                              <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-black/30 hover:border-white/50 transition cursor-zoom-in" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {fotos.length === 0 && it.estado !== "na" && (
                      <div className="px-3 pb-2.5 border-t border-black/10">
                        <p className="text-[10px] text-current opacity-40 mt-1.5 flex items-center gap-1 font-bold">
                          <Camera size={9} /> Sin fotos
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fotos generales (compatibilidad datos anteriores) */}
          {imagenes.length > 0 && checklist.every((it) => !it.fotos?.length) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Camera size={14} className="text-gray-400" />
                <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Evidencia general</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {imagenes.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt="" className="w-24 h-24 object-cover rounded-xl border border-gray-600 hover:border-orange-500 transition cursor-zoom-in" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Botones aprobar / rechazar */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onRechazar}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 px-5 py-3 rounded-xl font-black text-sm transition"
            >
              <XCircle size={16} /> Rechazar y pedir corrección
            </button>
            <button
              onClick={onAprobar}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-black text-sm transition"
            >
              <CheckCircle size={16} /> Aprobar — listo para entrega
            </button>
          </div>
        </div>
      )}
    </div>
  );
}