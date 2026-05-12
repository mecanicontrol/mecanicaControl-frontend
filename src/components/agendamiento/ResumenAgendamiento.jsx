import { Car, Wrench, Calendar, MapPin } from 'lucide-react'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_SEMANA = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']

function formatHora(iso) {
  if (!iso) return null
  const d = new Date(iso.includes('Z') || iso.includes('+') ? iso : iso + 'Z')
  if (isNaN(d.getTime())) return iso
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' })
}

export default function ResumenAgendamiento({ vehiculo, servicios, fecha, hora }) {
  const total = servicios?.reduce((sum, s) => sum + (s.precio || s.precioBase || 0), 0) ?? 0

  const fechaTexto = fecha
    ? `${DIAS_SEMANA[new Date(fecha).getDay()]} ${new Date(fecha).getDate()} ${MESES[new Date(fecha).getMonth()]}, ${new Date(fecha).getFullYear()}`
    : null
  const horaTexto = formatHora(hora)

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 sticky top-4 space-y-5">

      <div>
        <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1">Resumen de Agendamiento</p>
        <h3 className="text-white font-black text-lg uppercase">MecánicaHub Industrial</h3>
      </div>

      {/* Vehículo */}
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Car size={12} className="text-orange-500" /> Vehículo Registrado
        </p>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-white font-bold text-sm uppercase">
            {[vehiculo?.marca, vehiculo?.modelo, vehiculo?.anio].filter(Boolean).join(' ') || 'Sin vehículo'}
          </p>
          {vehiculo?.kilometraje && (
            <p className="text-gray-400 text-xs mt-1">{vehiculo.kilometraje} KM</p>
          )}
        </div>
      </div>

      {/* Servicios */}
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Wrench size={12} className="text-orange-500" /> Servicios Seleccionados
        </p>
        <div className="space-y-2">
          {servicios?.length > 0 ? servicios.map((s, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-gray-300 text-sm uppercase font-medium">{s.nombre}</span>
              <span className="text-orange-400 font-bold text-sm">
                ${(s.precio || s.precioBase || 0).toLocaleString('es-CL')}
              </span>
            </div>
          )) : (
            <p className="text-gray-600 text-xs">Sin servicios seleccionados</p>
          )}
        </div>
      </div>

      {/* Fecha y hora */}
      {(fechaTexto || hora) && (
        <div className="bg-gray-800 rounded-lg p-4 border-l-2 border-orange-500">
          <p className="text-orange-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Calendar size={12} /> Cita Programada
          </p>
          {fechaTexto && <p className="text-white font-black uppercase">{fechaTexto}</p>}
          {horaTexto && <p className="text-orange-400 font-black text-lg">{horaTexto}</p>}
        </div>
      )}

      {/* Total */}
      <div className="border-t border-gray-800 pt-4">
        <div className="flex justify-between items-end">
          <span className="text-gray-500 text-xs font-bold uppercase">Total Estimado</span>
          <span className="text-xs text-gray-500">IVA incluido</span>
        </div>
        <p className="text-white font-black text-3xl mt-1">
          ${total.toLocaleString('es-CL')}
        </p>
      </div>

      {/* Sucursal */}
      <div className="flex items-start gap-3 pt-2 border-t border-gray-800">
        <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
          <MapPin size={16} className="text-orange-500" />
        </div>
        <div>
          <p className="text-white text-xs font-bold uppercase">Sucursal Central</p>
          <p className="text-gray-500 text-xs">Av. Santa Rosa 1234, Santiago</p>
        </div>
      </div>

    </div>
  )
}
