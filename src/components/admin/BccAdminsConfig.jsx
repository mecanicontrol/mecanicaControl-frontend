import { useState, useEffect } from "react";
import { Mail, Plus, Trash2, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { getBccAdmins, setBccAdmins } from "../../services/configuracionService";

export default function BccAdminsConfig() {
  const [correos, setCorreos]   = useState([]);
  const [nuevo,   setNuevo]     = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ok,      setOk]        = useState(false);
  const [error,   setError]     = useState("");
  const [errInput, setErrInput] = useState("");

  useEffect(() => {
    getBccAdmins()
      .then(({ data }) => setCorreos(data.correos ?? []))
      .catch(() => setError("No se pudieron cargar los correos"))
      .finally(() => setCargando(false));
  }, []);

  const validarEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const agregar = () => {
    const val = nuevo.trim();
    if (!val) return;
    if (!validarEmail(val)) { setErrInput("Email no válido"); return; }
    if (correos.includes(val)) { setErrInput("Ya está en la lista"); return; }
    setCorreos((prev) => [...prev, val]);
    setNuevo("");
    setErrInput("");
  };

  const eliminar = (correo) => setCorreos((prev) => prev.filter((c) => c !== correo));

  const guardar = async () => {
    setGuardando(true);
    setOk(false);
    setError("");
    try {
      await setBccAdmins(correos);
      setOk(true);
      setTimeout(() => setOk(false), 3000);
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-[#1a2744] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-xl bg-orange-500/10">
          <Mail size={18} className="text-orange-400" />
        </div>
        <div>
          <h3 className="font-black text-white text-base">Correos de notificación (BCC)</h3>
          <p className="text-gray-400 text-xs mt-0.5">
            Estos correos reciben copia oculta de todas las notificaciones del sistema
          </p>
        </div>
      </div>

      <div className="mt-5">
        {cargando ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
            <Loader2 size={15} className="animate-spin" /> Cargando...
          </div>
        ) : (
          <>
            {/* Lista de correos actuales */}
            <div className="space-y-2 mb-4">
              {correos.length === 0 && (
                <p className="text-gray-500 text-sm italic py-2">Sin correos configurados</p>
              )}
              {correos.map((correo) => (
                <div
                  key={correo}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-200 font-medium">{correo}</span>
                  </div>
                  <button
                    onClick={() => eliminar(correo)}
                    className="text-gray-500 hover:text-red-400 transition ml-3 p-1 rounded-lg hover:bg-red-500/10"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Input para agregar */}
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="email"
                  value={nuevo}
                  onChange={(e) => { setNuevo(e.target.value); setErrInput(""); }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregar())}
                  placeholder="nuevo@correo.cl"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition
                    ${errInput ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"}`}
                />
                {errInput && <p className="text-xs text-red-400 mt-1">{errInput}</p>}
              </div>
              <button
                onClick={agregar}
                className="flex-shrink-0 bg-white/10 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/40 text-white px-3 py-2.5 rounded-xl transition flex items-center gap-1.5 text-sm font-semibold"
              >
                <Plus size={15} /> Agregar
              </button>
            </div>

            {/* Mensajes de estado */}
            {ok && (
              <div className="mt-3 flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
                <CheckCircle size={15} /> Correos guardados correctamente
              </div>
            )}
            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* Botón guardar */}
            <button
              onClick={guardar}
              disabled={guardando}
              className="mt-4 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              {guardando
                ? <><Loader2 size={15} className="animate-spin" /> Guardando...</>
                : <><Save size={15} /> Guardar cambios</>
              }
            </button>
          </>
        )}
      </div>
    </div>
  );
}