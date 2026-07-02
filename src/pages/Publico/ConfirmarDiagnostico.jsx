import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function ConfirmarDiagnostico() {
  const { token } = useParams();

  const [propuesta, setPropuesta]   = useState(null);
  const [cargando,  setCargando]    = useState(true);
  const [error,     setError]       = useState(null);
  const [respondida, setRespondida] = useState(false);
  const [resultado,  setResultado]  = useState(null);

  // UI state
  const [decision,          setDecision]          = useState(null); // ACEPTAR_TODO | ACEPTAR_PARCIAL | RECHAZAR
  const [serviciosAceptados, setServiciosAceptados] = useState({});
  const [aceptaDisclaimer,   setAceptaDisclaimer]   = useState(false);
  const [notaCliente,        setNotaCliente]        = useState("");
  const [enviando,           setEnviando]           = useState(false);
  const [errores,            setErrores]            = useState({});
  const [fotosExpandidas,    setFotosExpandidas]    = useState({});

  useEffect(() => {
    axios.get(`${BASE}/api/propuestas/${token}`)
      .then(({ data }) => {
        setPropuesta(data);
        // Pre-marcar todos como aceptados
        const init = {};
        data.servicios.forEach(s => { init[s.id] = true; });
        setServiciosAceptados(init);
        if (["ACEPTADA", "ACEPTADA_PARCIAL", "RECHAZADA_CLIENTE"].includes(data.estado)) {
          setRespondida(true);
          setResultado(data.estado);
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || "Propuesta no encontrada o ya no disponible.");
      })
      .finally(() => setCargando(false));
  }, [token]);

  const toggleFoto = (svcId) =>
    setFotosExpandidas(prev => ({ ...prev, [svcId]: !prev[svcId] }));

  const toggleServicio = (id) =>
    setServiciosAceptados(prev => ({ ...prev, [id]: !prev[id] }));

  const validar = () => {
    const errs = {};
    if (!decision) { errs.decision = "Debes seleccionar una opción"; }
    if (decision === "ACEPTAR_PARCIAL") {
      const alguno = Object.values(serviciosAceptados).some(Boolean);
      if (!alguno) errs.servicios = "Selecciona al menos un servicio para continuar";
      if (!aceptaDisclaimer) errs.disclaimer = "Debes aceptar el descargo de responsabilidad";
    }
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const enviar = async () => {
    if (!validar()) return;
    setEnviando(true);
    try {
      const body = {
        decision,
        notaCliente,
        aceptaDisclaimer,
        serviciosAceptados: decision === "ACEPTAR_PARCIAL"
          ? Object.entries(serviciosAceptados).filter(([, v]) => v).map(([k]) => k)
          : [],
      };
      const { data } = await axios.post(`${BASE}/api/propuestas/${token}/responder`, body);
      setResultado(data.estado);
      setRespondida(true);
    } catch (e) {
      setErrores({ submit: e.response?.data?.message || "Error al enviar tu respuesta. Intenta de nuevo." });
    } finally {
      setEnviando(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (cargando) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
        <XCircle size={40} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-white font-black text-xl mb-2">Enlace no disponible</h2>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    </div>
  );

  // ── Ya respondida ─────────────────────────────────────────────────────────────
  if (respondida) {
    const info = {
      ACEPTADA:          { icon: <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />,  title: "¡Propuesta aceptada!",           msg: "Hemos notificado al taller. El técnico procederá con los servicios acordados.", cls: "border-green-500/30" },
      ACEPTADA_PARCIAL:  { icon: <AlertTriangle size={48} className="text-orange-400 mx-auto mb-4" />, title: "Propuesta aceptada parcialmente", msg: "El taller ha sido notificado. Trabajará solo con los servicios que aceptaste.", cls: "border-orange-500/30" },
      RECHAZADA_CLIENTE: { icon: <XCircle size={48} className="text-red-400 mx-auto mb-4" />,         title: "Has rechazado la propuesta",      msg: "La orden de trabajo ha sido cancelada. Si tienes dudas, contacta directamente al taller.", cls: "border-red-500/30" },
    }[resultado] || { icon: null, title: "Respuesta registrada", msg: "", cls: "border-slate-700" };

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className={`bg-slate-900 border ${info.cls} rounded-2xl p-8 max-w-md text-center`}>
          {info.icon}
          <h2 className="text-white font-black text-xl mb-2">{info.title}</h2>
          <p className="text-slate-400 text-sm">{info.msg}</p>
          <p className="mt-4 text-xs text-slate-600">OT: {propuesta?.codigoOt || resultado}</p>
        </div>
      </div>
    );
  }

  const total = propuesta.servicios.reduce((acc, s) => acc + (parseFloat(s.precioBase) || 0), 0);

  // ── Formulario principal ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-orange-400 tracking-wider mb-1">Propuesta de diagnóstico</p>
              <h1 className="text-2xl font-black text-white">Revisión técnica</h1>
              <p className="text-slate-400 text-sm mt-1">
                OT: <span className="font-black text-slate-300">{propuesta.codigoOt}</span>
                {propuesta.patente && <> · Patente: <span className="font-black text-slate-300">{propuesta.patente}</span></>}
              </p>
            </div>
          </div>
          {propuesta.notaTecnico && (
            <div className="mt-4 bg-slate-800 rounded-xl p-3 text-sm text-slate-300 border border-slate-700">
              <span className="text-xs font-black text-slate-500 uppercase">Nota del técnico:</span>
              <p className="mt-1">{propuesta.notaTecnico}</p>
            </div>
          )}
        </div>

        {/* Servicios */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase text-slate-500 tracking-wider px-1">Servicios propuestos</p>
          {propuesta.servicios.map((s) => {
            const fotos = (() => { try { return JSON.parse(s.imagenes); } catch { return []; } })();
            const expanded = fotosExpandidas[s.id];
            return (
              <div key={s.id} className={`bg-slate-900 border rounded-2xl overflow-hidden transition-colors ${
                decision === "ACEPTAR_PARCIAL" && !serviciosAceptados[s.id] ? "border-slate-700 opacity-60" : "border-slate-700"
              }`}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Checkbox solo visible en ACEPTAR_PARCIAL */}
                    {decision === "ACEPTAR_PARCIAL" && (
                      <button
                        onClick={() => toggleServicio(s.id)}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                          serviciosAceptados[s.id] ? "bg-orange-500 border-orange-500" : "border-slate-600 bg-transparent"
                        }`}
                      >
                        {serviciosAceptados[s.id] && <CheckCircle size={12} className="text-white" />}
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-black text-white text-sm">{s.nombre}</p>
                        {s.precioBase && (
                          <span className="text-sm font-black text-orange-400 flex-shrink-0">
                            ${parseFloat(s.precioBase).toLocaleString("es-CL")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-1 leading-relaxed">{s.descripcion}</p>
                    </div>
                  </div>

                  {/* Fotos evidencia */}
                  {fotos.length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() => toggleFoto(s.id)}
                        className="flex items-center gap-1 text-xs font-black text-slate-500 hover:text-slate-300 transition"
                      >
                        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {fotos.length} foto{fotos.length > 1 ? "s" : ""} de evidencia
                      </button>
                      {expanded && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {fotos.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg hover:opacity-90 transition" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-black text-slate-400">Total estimado</span>
            <span className="text-xl font-black text-orange-400">${total.toLocaleString("es-CL")}</span>
          </div>
        </div>

        {/* Decisión */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <p className="text-xs font-black uppercase text-slate-500 tracking-wider">Tu decisión</p>

          {/* Opciones */}
          <div className="space-y-3">
            {[
              { val: "ACEPTAR_TODO",    label: "Acepto todos los servicios",       desc: "El técnico realizará todos los servicios propuestos.", cls: "border-green-500 bg-green-500/10" },
              { val: "ACEPTAR_PARCIAL", label: "Acepto algunos servicios",         desc: "Elige qué servicios quieres realizar.", cls: "border-orange-500 bg-orange-500/10" },
              { val: "RECHAZAR",        label: "No acepto — cancelar la OT",       desc: "La orden de trabajo será cancelada.", cls: "border-red-500 bg-red-500/10" },
            ].map(({ val, label, desc, cls }) => (
              <button
                key={val}
                onClick={() => { setDecision(val); setErrores(e => ({ ...e, decision: null })); }}
                className={`w-full text-left rounded-xl border p-4 transition ${
                  decision === val ? cls : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    decision === val ? "border-current bg-current" : "border-slate-600"
                  }`} />
                  <div>
                    <p className="font-black text-white text-sm">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {errores.decision && <p className="text-xs text-red-400 font-black">{errores.decision}</p>}

          {/* Selector servicios parcial */}
          {decision === "ACEPTAR_PARCIAL" && (
            <div className="bg-slate-800 rounded-xl p-4 space-y-2 border border-orange-500/30">
              <p className="text-xs font-black text-orange-400 uppercase tracking-wider">Selecciona los servicios que aceptas:</p>
              {propuesta.servicios.map(s => (
                <label key={s.id} className="flex items-center gap-3 cursor-pointer py-1">
                  <input type="checkbox" checked={!!serviciosAceptados[s.id]} onChange={() => toggleServicio(s.id)}
                    className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm text-white font-bold">{s.nombre}</span>
                  {s.precioBase && <span className="text-xs text-slate-400">${parseFloat(s.precioBase).toLocaleString("es-CL")}</span>}
                </label>
              ))}
              {errores.servicios && <p className="text-xs text-red-400 font-black">{errores.servicios}</p>}

              {/* Disclaimer */}
              <div className="mt-3 bg-orange-500/10 border border-orange-500/30 rounded-xl p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={aceptaDisclaimer} onChange={e => setAceptaDisclaimer(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-orange-500" />
                  <p className="text-xs text-orange-300 leading-relaxed">
                    <strong>Descargo de responsabilidad:</strong> Entiendo que al no aceptar todos los servicios propuestos,
                    el taller no se hace responsable si el vehículo continúa presentando fallas relacionadas con los servicios
                    que he rechazado. Los servicios propuestos fueron identificados como necesarios para el correcto funcionamiento del vehículo.
                  </p>
                </label>
                {errores.disclaimer && <p className="mt-1 text-xs text-red-400 font-black">{errores.disclaimer}</p>}
              </div>
            </div>
          )}

          {/* Advertencia cancelar */}
          {decision === "RECHAZAR" && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">
                  Al rechazar, la orden de trabajo será cancelada y el vehículo será devuelto sin reparar.
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
          )}

          {/* Nota opcional */}
          {decision && (
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Nota para el taller (opcional)</label>
              <textarea
                rows={2}
                value={notaCliente}
                onChange={e => setNotaCliente(e.target.value)}
                placeholder="Escribe alguna observación o consulta..."
                className="w-full bg-slate-800 border border-slate-600 focus:border-orange-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none resize-none"
              />
            </div>
          )}

          {errores.submit && <p className="text-sm text-red-400 font-black">{errores.submit}</p>}

          <button
            onClick={enviar}
            disabled={!decision || enviando}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-black py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {enviando
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando...</>
              : "Confirmar mi decisión"}
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 pb-8">
          Este enlace es personal e intransferible. Si tienes dudas, contacta directamente al taller.
        </p>
      </div>
    </div>
  );
}