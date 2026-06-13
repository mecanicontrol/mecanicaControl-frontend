import { useState, useEffect } from "react";
import { Car, Save, Loader2, CheckCircle, AlertCircle, Minus, Plus } from "lucide-react";
import { getCapacidadTaller, setCapacidadTaller } from "../../services/configuracionService";
import api from "../../api/axiosInstance";

export default function CapacidadTallerConfig() {
  const [capacidad, setCapacidad] = useState(15);
  const [cargando, setCargando]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk]               = useState(false);
  const [error, setError]         = useState("");
  const [taller, setTaller]       = useState(null);

  useEffect(() => {
    Promise.all([
      getCapacidadTaller(),
      api.get('/api/taller/estado').catch(() => ({ data: null })),
    ])
      .then(([{ data: cfg }, { data: est }]) => {
        setCapacidad(cfg.capacidad ?? 15);
        setTaller(est);
      })
      .catch(() => setError("No se pudo cargar la configuración"))
      .finally(() => setCargando(false));
  }, []);

  const guardar = async () => {
    if (capacidad < 1) return;
    setGuardando(true);
    setOk(false);
    setError("");
    try {
      await setCapacidadTaller(capacidad);
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
          <Car size={18} className="text-orange-400" />
        </div>
        <div>
          <h3 className="font-black text-white text-base">Capacidad máxima del taller</h3>
          <p className="text-gray-400 text-xs mt-0.5">
            Número máximo de vehículos que pueden estar en reparación al mismo tiempo
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
            {/* Estado actual */}
            {taller && (
              <div className="mb-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Estado actual</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${taller.tallerLleno ? 'bg-red-500' : taller.disponibles <= 3 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, Math.round((taller.vehiculosEnTaller / taller.capacidadMaxima) * 100))}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-white flex-shrink-0">
                    {taller.vehiculosEnTaller}<span className="text-gray-500">/{taller.capacidadMaxima}</span>
                  </span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0 ${taller.tallerLleno ? 'bg-red-500/20 text-red-400' : taller.disponibles <= 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                    {taller.tallerLleno ? 'LLENO' : `${taller.disponibles} libre${taller.disponibles !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => setCapacidad((v) => Math.max(1, v - 1))}
                disabled={capacidad <= 1}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white flex items-center justify-center transition"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 text-center">
                <span className="text-5xl font-black text-orange-400">{capacidad}</span>
                <p className="text-xs text-gray-500 mt-1">vehículos</p>
              </div>
              <button
                onClick={() => setCapacidad((v) => Math.min(100, v + 1))}
                disabled={capacidad >= 100}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white flex items-center justify-center transition"
              >
                <Plus size={16} />
              </button>
            </div>

            <input
              type="range"
              min={1}
              max={50}
              value={Math.min(capacidad, 50)}
              onChange={(e) => setCapacidad(parseInt(e.target.value, 10))}
              className="w-full accent-orange-500 mb-4"
            />

            {ok && (
              <div className="mb-3 flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
                <CheckCircle size={15} /> Capacidad guardada correctamente
              </div>
            )}
            {error && (
              <div className="mb-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <button
              onClick={guardar}
              disabled={guardando || capacidad < 1}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              {guardando
                ? <><Loader2 size={15} className="animate-spin" /> Guardando...</>
                : <><Save size={15} /> Guardar capacidad</>
              }
            </button>
          </>
        )}
      </div>
    </div>
  );
}