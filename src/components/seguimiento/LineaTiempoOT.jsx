import { CheckCircle, Clock, ClipboardList, Search, Wrench, ShieldCheck, Car } from 'lucide-react'

const FASES_CONFIG = {
  RECEPCION:       { Icono: ClipboardList, label: 'Recepción'       },
  DIAGNOSTICO:     { Icono: Search,        label: 'Diagnóstico'     },
  EN_TRABAJO:      { Icono: Wrench,        label: 'En Trabajo'      },
  CONTROL_CALIDAD: { Icono: ShieldCheck,   label: 'Control Calidad' },
  LISTO_ENTREGA:   { Icono: Car,           label: 'Listo Entrega'   },
}

const NOMBRES_FASES = ['RECEPCION', 'DIAGNOSTICO', 'EN_TRABAJO', 'CONTROL_CALIDAD', 'LISTO_ENTREGA']

export default function LineaTiempoOT({ fases = [], prediccion = null }) {
  // Mapa de fases que ya tienen registro en BD
  const fasesMap = Object.fromEntries(fases.map(f => [f.nombre, f]))

  // Lista completa de las 5 fases, incluyendo las pendientes
  const fasesCompletas = NOMBRES_FASES.map(nombre => {
    const config = FASES_CONFIG[nombre]
    const fv = fasesMap[nombre]
    return {
      nombre,
      label: config.label,
      Icono: config.Icono,
      estado: fv?.estado ?? 'PENDIENTE',
      inicioAt: fv?.inicioAt ?? null,
      finAt: fv?.finAt ?? null,
      tiempoEstimadoMin: prediccion?.desglosePorFase?.[nombre] ?? fv?.tiempoEstimadoMin ?? null,
    }
  })

  const completadas = fasesCompletas.filter(f => f.estado === 'COMPLETADA').length
  const progresoPct = Math.round((completadas / 5) * 100)

  return (
    <div>
      {/* Barra de progreso general */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span className="font-semibold">Progreso del servicio</span>
          <span className="font-black text-gray-700">{progresoPct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-700"
            style={{ width: `${progresoPct}%` }}
          />
        </div>
      </div>

      {/* Nodos de fases */}
      <div className="relative flex items-start justify-between">
        {fasesCompletas.map(({ nombre, label, Icono, estado, tiempoEstimadoMin }, idx) => {
          const esCompletada = estado === 'COMPLETADA'
          const esActiva     = estado === 'ACTIVA'

          return (
            <div key={nombre} className="flex flex-col items-center flex-1 relative">
              {/* Línea conectora hacia el siguiente nodo */}
              {idx < 4 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 transition-colors ${
                    esCompletada ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Círculo del nodo */}
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                esCompletada
                  ? 'bg-green-500 border-green-500 text-white'
                  : esActiva
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {/* Pulso animado en la fase activa */}
                {esActiva && (
                  <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-40" />
                )}
                {esCompletada
                  ? <CheckCircle size={18} />
                  : <Icono size={16} />
                }
              </div>

              {/* Label */}
              <p className={`text-xs font-bold text-center mt-2 leading-tight px-1 ${
                esActiva     ? 'text-orange-500' :
                esCompletada ? 'text-green-600'  :
                               'text-gray-400'
              }`}>
                {label}
              </p>

              {/* Tiempo estimado por IA */}
              {tiempoEstimadoMin != null && (
                <p className="text-xs text-gray-400 text-center mt-0.5">
                  ~{tiempoEstimadoMin} min
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Hora estimada de entrega */}
      {prediccion?.horaFinEstimada && (
        <div className="mt-8 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2 text-sm">
          <Clock size={14} className="text-orange-500" />
          <span className="text-gray-500">Hora estimada de entrega:</span>
          <span className="font-black text-gray-800">
            {new Date(prediccion.horaFinEstimada).toLocaleTimeString('es-CL', {
              hour: '2-digit', minute: '2-digit'
            })}
          </span>
          {prediccion.confianzaPct != null && (
            <span className="text-xs text-gray-400">
              ({Math.round(prediccion.confianzaPct)}% confianza)
            </span>
          )}
        </div>
      )}
    </div>
  )
}