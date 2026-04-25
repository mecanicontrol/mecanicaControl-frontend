import { FileText, Calendar } from 'lucide-react'

export default function ResumenCotizacion({ vehiculo, serviciosSeleccionados }) {
  const idCotizacion = '#49202-MAN'
  const total = serviciosSeleccionados.reduce((sum, s) => sum + s.precio, 0)

  const vehiculoLabel = [vehiculo.marca, vehiculo.modelo, vehiculo.anio]
    .filter(Boolean)
    .join(' ')
    .toUpperCase() || 'SIN VEHÍCULO'

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 sticky top-4">

      <div className="flex items-center justify-between mb-1">
        <h2 className="text-white font-black uppercase text-sm tracking-wider">Resumen de Cotización</h2>
        <FileText size={16} className="text-orange-500" />
      </div>
      <p className="text-gray-500 text-xs mb-5">{idCotizacion}</p>

      {/* Vehículo */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={14} className="text-orange-500 flex-shrink-0" />
        <span className="text-white text-sm font-bold">{vehiculoLabel}</span>
      </div>

      {/* Servicios seleccionados */}
      {serviciosSeleccionados.length === 0 ? (
        <p className="text-gray-600 text-xs text-center py-4">
          Selecciona un servicio para ver el resumen
        </p>
      ) : (
        <div className="space-y-2 mb-4">
          {serviciosSeleccionados.map(s => (
            <div key={s.id} className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">{s.nombre}</span>
              <span className="text-white text-sm font-semibold">
                ${s.precio.toLocaleString('es-CL')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Totales */}
      <div className="border-t border-gray-800 pt-4 space-y-2 mb-5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 uppercase text-xs font-bold">Subtotal</span>
          <span className="text-gray-300">${total.toLocaleString('es-CL')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 uppercase text-xs font-bold">Impuestos</span>
          <span className="text-gray-300">Incluidos</span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-gray-500 uppercase text-xs font-black">Total</span>
          <span className="text-orange-500 text-2xl font-black">
            ${total.toLocaleString('es-CL')} CLP
          </span>
        </div>
      </div>

      {/* Botón */}
      <button
        disabled={serviciosSeleccionados.length === 0}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black py-3 rounded-lg uppercase text-sm tracking-wider transition-colors"
      >
        {serviciosSeleccionados.length === 0
          ? 'Selecciona un servicio'
          : `Agendar ${serviciosSeleccionados.length} servicio${serviciosSeleccionados.length > 1 ? 's' : ''}`
        }
      </button>
      <p className="text-center text-gray-600 text-xs mt-2">Sujeto a confirmación técnica en taller</p>
    </div>
  )
}
