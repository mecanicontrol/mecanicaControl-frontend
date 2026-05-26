import { useState, useEffect } from 'react'
import { obtenerDisponibilidad } from '../../services/disponibilidadService'
import CargandoAuto from '../shared/CargandoAuto'

export default function SelectorHorario({ fecha, servicioId, horaSeleccionada, onSeleccionar }) {
  const [slots, setSlots]       = useState([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!fecha) return
    const cargar = async () => {
      setCargando(true)
      try {
        const fechaStr = new Date(fecha).toISOString().split('T')[0]
        const { data } = await obtenerDisponibilidad(fechaStr, servicioId)
        setSlots(data.map(s => ({
          iso:     s.fechaHoraInicio,
          display: new Date(s.fechaHoraInicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          ocupado: !s.disponible,
        })))
      } catch {
        setSlots([])
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [fecha, servicioId])

  if (!fecha) {
    return (
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center justify-center h-48">
        <p className="text-gray-400 text-sm">Selecciona una fecha para ver los horarios</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <h3 className="font-bold text-gray-800 uppercase text-sm tracking-wide mb-4">
        Bloques Disponibles
      </h3>

      {cargando ? (
        <CargandoAuto mensaje="Buscando horarios disponibles..." />
      ) : slots.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">No hay horarios disponibles para este día</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {slots.map(({ iso, display, ocupado }) => (
            <button
              key={iso}
              disabled={ocupado}
              onClick={() => onSeleccionar(iso)}
              className={`py-3 rounded-lg text-sm font-semibold transition-colors
                ${ocupado
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : horaSeleccionada === iso
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-500'
                }`}
            >
              {display}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 text-center leading-relaxed">
        Los horarios mostrados son estimaciones de inicio de trabajo. El tiempo de entrega se confirmará en recepción.
      </p>
    </div>
  )
}
