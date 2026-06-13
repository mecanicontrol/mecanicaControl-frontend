import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../api/axiosInstance";
import {
  CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  Eye, Send, AlertTriangle,
} from "lucide-react";

const ESTADO_INFO = {
  PENDIENTE_ADMIN:   { label: "Pendiente revisión", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  ENVIADA_CLIENTE:   { label: "Enviada al cliente",  cls: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  ACEPTADA:          { label: "Aceptada",             cls: "bg-green-500/20 text-green-400 border-green-500/30" },
  ACEPTADA_PARCIAL:  { label: "Aceptada parcial",    cls: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  RECHAZADA_ADMIN:   { label: "Rechazada por admin", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
  RECHAZADA_CLIENTE: { label: "Rechazada por cliente", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
};

function Badge({ estado }) {
  const info = ESTADO_INFO[estado] || { label: estado, cls: "bg-slate-700 text-slate-400 border-slate-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black border ${info.cls}`}>
      {info.label}
    </span>
  );
}

function ModalPropuesta({ propuesta, onCerrar, onAprobar, onRechazar }) {
  const [nota,      setNota]      = useState("");
  const [accion,    setAccion]    = useState(null); // "aprobar" | "rechazar"
  const [guardando, setGuardando] = useState(false);
  const [fotosExp,  setFotosExp]  = useState({});

  const toggleFotos = (id) => setFotosExp(p => ({ ...p, [id]: !p[id] }));

  const confirmar = async () => {
    setGuardando(true);
    try {
      if (accion === "aprobar") await onAprobar(propuesta.id, nota);
      else await onRechazar(propuesta.id, nota);
      onCerrar();
    } finally {
      setGuardando(false);
    }
  };

  const total = propuesta.servicios.reduce((acc, s) => acc + (parseFloat(s.precioBase) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase">Propuesta — {propuesta.codigoOt}</p>
            <p className="text-sm text-white font-black">{propuesta.patente} · {propuesta.tecnico}</p>
          </div>
          <Badge estado={propuesta.estado} />
        </div>

        <div className="p-6 space-y-5">
          {/* Nota técnico */}
          {propuesta.notaTecnico && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-xs font-black text-slate-500 uppercase mb-1">Nota del técnico</p>
              <p className="text-sm text-slate-300">{propuesta.notaTecnico}</p>
            </div>
          )}

          {/* Servicios */}
          <div className="space-y-3">
            {propuesta.servicios.map((s) => {
              const fotos = (() => { try { return JSON.parse(s.imagenes); } catch { return []; } })();
              return (
                <div key={s.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white text-sm">{s.nombre}</p>
                      <p className="text-sm text-slate-400 mt-1 leading-relaxed">{s.descripcion}</p>
                    </div>
                    {s.precioBase && (
                      <span className="text-sm font-black text-orange-400 flex-shrink-0">
                        ${parseFloat(s.precioBase).toLocaleString("es-CL")}
                      </span>
                    )}
                  </div>
                  {fotos.length > 0 && (
                    <div className="mt-3">
                      <button onClick={() => toggleFotos(s.id)}
                        className="flex items-center gap-1 text-xs font-black text-slate-500 hover:text-slate-300 transition">
                        {fotosExp[s.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {fotos.length} foto{fotos.length > 1 ? "s" : ""}
                      </button>
                      {fotosExp[s.id] && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {fotos.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-black text-slate-400">Total estimado</span>
              <span className="text-lg font-black text-orange-400">${total.toLocaleString("es-CL")}</span>
            </div>
          </div>

          {/* Acciones — solo si PENDIENTE_ADMIN */}
          {propuesta.estado === "PENDIENTE_ADMIN" && (
            <div className="space-y-3 pt-2 border-t border-slate-700">
              <div className="flex gap-3">
                <button
                  onClick={() => setAccion("aprobar")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm border transition ${
                    accion === "aprobar"
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-green-500/40 text-green-400 hover:bg-green-500/10"
                  }`}
                >
                  <Send size={14} /> Aprobar y enviar al cliente
                </button>
                <button
                  onClick={() => setAccion("rechazar")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm border transition ${
                    accion === "rechazar"
                      ? "bg-red-500 border-red-500 text-white"
                      : "border-red-500/40 text-red-400 hover:bg-red-500/10"
                  }`}
                >
                  <XCircle size={14} /> Rechazar
                </button>
              </div>

              {accion && (
                <div className="space-y-3">
                  <textarea
                    rows={2}
                    value={nota}
                    onChange={e => setNota(e.target.value)}
                    placeholder={accion === "aprobar" ? "Nota para el cliente (opcional)..." : "Motivo del rechazo (opcional)..."}
                    className="w-full bg-slate-800 border border-slate-600 focus:border-orange-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none resize-none"
                  />
                  {accion === "aprobar" && (
                    <div className="flex items-start gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
                      <Send size={13} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-cyan-300">
                        Se enviará un correo al cliente con el detalle de los servicios y un enlace para que responda.
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={() => setAccion(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-400 text-sm font-black hover:bg-slate-800 transition">
                      Cancelar
                    </button>
                    <button
                      onClick={confirmar}
                      disabled={guardando}
                      className={`flex-1 py-2.5 rounded-xl text-white text-sm font-black transition disabled:opacity-50 ${
                        accion === "aprobar" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {guardando ? "Procesando..." : (accion === "aprobar" ? "Confirmar y enviar" : "Confirmar rechazo")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-5">
          <button onClick={onCerrar}
            className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-black hover:bg-slate-800 transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Propuestas() {
  const [propuestas, setPropuestas] = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [filtro,     setFiltro]     = useState("PENDIENTE_ADMIN");
  const [modal,      setModal]      = useState(null);
  const [aviso,      setAviso]      = useState(null);

  const avisar = (msg, tipo = "ok") => {
    setAviso({ msg, tipo });
    setTimeout(() => setAviso(null), 4000);
  };

  const cargar = (estado = filtro) => {
    setCargando(true);
    api.get(`/api/admin/propuestas?estado=${estado}`)
      .then(({ data }) => setPropuestas(Array.isArray(data) ? data : []))
      .catch(() => avisar("Error al cargar propuestas", "error"))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(filtro); }, [filtro]);

  const aprobar = async (id, nota) => {
    await api.post(`/api/admin/propuestas/${id}/aprobar`, { nota });
    avisar("Propuesta aprobada y correo enviado al cliente");
    cargar();
  };

  const rechazar = async (id, nota) => {
    await api.post(`/api/admin/propuestas/${id}/rechazar`, { nota });
    avisar("Propuesta rechazada");
    cargar();
  };

  const pendientes = propuestas.filter(p => p.estado === "PENDIENTE_ADMIN").length;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white">Propuestas de diagnóstico</h1>
                {pendientes > 0 && (
                  <p className="text-sm text-yellow-400 font-black mt-0.5">
                    {pendientes} propuesta{pendientes > 1 ? "s" : ""} pendiente{pendientes > 1 ? "s" : ""} de revisión
                  </p>
                )}
              </div>
            </div>

            {/* Aviso */}
            {aviso && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-black ${
                aviso.tipo === "error" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
              }`}>
                {aviso.tipo === "error" ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                {aviso.msg}
              </div>
            )}

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              {[
                { val: "PENDIENTE_ADMIN", label: "Pendientes" },
                { val: "ENVIADA_CLIENTE", label: "Enviadas al cliente" },
                { val: "ACEPTADA,ACEPTADA_PARCIAL", label: "Aceptadas" },
                { val: "RECHAZADA_ADMIN,RECHAZADA_CLIENTE", label: "Rechazadas" },
                { val: "TODAS", label: "Todas" },
              ].map(({ val, label }) => (
                <button key={val}
                  onClick={() => setFiltro(val)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition border ${
                    filtro === val
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Lista */}
            {cargando ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : propuestas.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <Clock size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-black">No hay propuestas en este estado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {propuestas.map(p => (
                  <div key={p.id}
                    className="bg-slate-900 border border-slate-700 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-slate-600 transition cursor-pointer"
                    onClick={() => setModal(p)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-black text-white text-sm">{p.codigoOt}</span>
                        <span className="text-slate-400 text-xs">{p.patente}</span>
                        {p.tecnico && <span className="text-slate-500 text-xs">· {p.tecnico}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <Badge estado={p.estado} />
                        <span className="text-xs text-slate-500">
                          {p.servicios?.length || 0} servicio{p.servicios?.length !== 1 ? "s" : ""}
                        </span>
                        {p.creadoAt && (
                          <span className="text-xs text-slate-600">
                            {new Date(p.creadoAt).toLocaleDateString("es-CL")}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-orange-400 transition flex-shrink-0">
                      <Eye size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
      </div>

      {modal && (
        <ModalPropuesta
          propuesta={modal}
          onCerrar={() => setModal(null)}
          onAprobar={aprobar}
          onRechazar={rechazar}
        />
      )}
    </AdminLayout>
  );
}