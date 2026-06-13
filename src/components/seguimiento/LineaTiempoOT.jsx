import { useState } from 'react'
import { CheckCircle, Clock, ClipboardList, Search, Wrench, ShieldCheck, Car, ChevronDown, ChevronUp, Image, FileText } from 'lucide-react'

const FASES_CONFIG = {
  RECEPCION:       { Icono: ClipboardList, label: 'Recepción'       },
  DIAGNOSTICO:     { Icono: Search,        label: 'Diagnóstico'     },
  EN_TRABAJO:      { Icono: Wrench,        label: 'En Trabajo'      },
  CONTROL_CALIDAD: { Icono: ShieldCheck,   label: 'Control Calidad' },
  LISTO_ENTREGA:   { Icono: Car,           label: 'Listo Entrega'   },
}

const NOMBRES_FASES = ['RECEPCION', 'DIAGNOSTICO', 'EN_TRABAJO', 'CONTROL_CALIDAD', 'LISTO_ENTREGA']

function fmt(f) {
  if (!f) return null
  return new Date(f).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
}

function FaseDetalle({ fase }) {
  const [abierto, setAbierto]   = useState(false)
  const [fotoAmpliada, setFoto] = useState(null)

  const imagenes = (() => {
    try { return JSON.parse(fase.imagenes || '[]') } catch { return [] }
  })()

  const tieneDetalle = fase.observaciones || imagenes.length > 0

  if (!tieneDetalle) return null

  return (
    <div className="mt-3 border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-xs font-black text-gray-500 uppercase tracking-wider"
      >
        <span className="flex items-center gap-2">
          {imagenes.length > 0 && <Image size={13} className="text-orange-400" />}
          {fase.observaciones && <FileText size={13} className="text-blue-400" />}
          Ver detalle de fase
        </span>
        {abierto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {abierto && (
        <div className="p-4 bg-white space-y-4">

          {/* Timestamps */}
          <div className="flex gap-6 text-xs text-gray-400">
            {fase.inicioAt && (
              <span><span className="font-black text-gray-500">Inicio:</span> {fmt(fase.inicioAt)}</span>
            )}
            {fase.finAt && (
              <span><span className="font-black text-gray-500">Fin:</span> {fmt(fase.finAt)}</span>
            )}
            {fase.duracionMinutos && (
              <span><span className="font-black text-gray-500">Duración:</span> {fase.duracionMinutos} min</span>
            )}
          </div>

          {/* Observaciones */}
          {fase.observaciones && (
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
                Observaciones del técnico
              </p>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                {fase.observaciones}
              </p>
            </div>
          )}

          {/* Fotos */}
          {imagenes.length > 0 && (
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                Evidencia fotográfica ({imagenes.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {imagenes.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setFoto(url)}
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-orange-400 transition-colors"
                  >
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {fotoAmpliada && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFoto(null)}
        >
          <img
            src={fotoAmpliada}
            alt="Foto ampliada"
            className="max-w-full max-h-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  )
}

export default function LineaTiempoOT({ fases = [], prediccion = null }) {
  const fasesMap = Object.fromEntries(fases.map(f => [f.nombre ?? f.fase, f]))

  const fasesCompletas = NOMBRES_FASES.map(nombre => {
    const config = FASES_CONFIG[nombre]
    const fv = fasesMap[nombre]
    return {
      nombre,
      label:             config.label,
      Icono:             config.Icono,
      estado:            fv?.estado ?? 'PENDIENTE',
      inicioAt:          fv?.inicioAt ?? null,
      finAt:             fv?.finAt ?? null,
      observaciones:     fv?.observaciones ?? null,
      imagenes:          fv?.imagenes ?? '[]',
      duracionMinutos:   fv?.duracionMinutos ?? null,
      tiempoEstimadoMin: prediccion?.desglosePorFase?.[nombre] ?? fv?.tiempoEstimadoMin ?? null,
    }
  })

  const completadas  = fasesCompletas.filter(f => f.estado === 'COMPLETADA').length
  const progresoPct  = Math.round((completadas / 5) * 100)

  return (
    <div>
      {/* Barra de progreso */}
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
      <div className="relative flex items-start justify-between mb-8">
        {fasesCompletas.map(({ nombre, label, Icono, estado, tiempoEstimadoMin }, idx) => {
          const esCompletada = estado === 'COMPLETADA'
          const esActiva     = estado === 'ACTIVA'

          return (
            <div key={nombre} className="flex flex-col items-center flex-1 relative">
              {idx < 4 && (
                <div className={`absolute top-5 left-1/2 w-full h-0.5 transition-colors ${
                  esCompletada ? 'bg-green-400' : 'bg-gray-200'
                }`} />
              )}
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                esCompletada
                  ? 'bg-green-500 border-green-500 text-white'
                  : esActiva
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {esActiva && (
                  <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-40" />
                )}
                {esCompletada ? <CheckCircle size={18} /> : <Icono size={16} />}
              </div>
              <p className={`text-xs font-bold text-center mt-2 leading-tight px-1 ${
                esActiva     ? 'text-orange-500' :
                esCompletada ? 'text-green-600'  : 'text-gray-400'
              }`}>
                {label}
              </p>
              {tiempoEstimadoMin != null && (
                <p className="text-xs text-gray-400 text-center mt-0.5">~{tiempoEstimadoMin} min</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Detalle por fase completada */}
      {fasesCompletas.some(f => f.estado === 'COMPLETADA') && (
        <div className="space-y-3 border-t border-gray-100 pt-6">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
            Registro por fase
          </p>
          {fasesCompletas
            .filter(f => f.estado === 'COMPLETADA')
            .map(fase => (
              <div key={fase.nombre} className="rounded-xl border border-green-100 bg-green-50/40 p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span className="text-sm font-black text-gray-700">{fase.label}</span>
                  </div>
                  {fase.finAt && (
                    <span className="text-xs text-gray-400">{fmt(fase.finAt)}</span>
                  )}
                </div>
                <FaseDetalle fase={fase} />
              </div>
            ))
          }
        </div>
      )}

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