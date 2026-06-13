import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SidebarCliente from '../../components/cliente/SidebarCliente'
import TopbarCliente from '../../components/cliente/TopbarCliente'
import { obtenerMisAgendamientos } from '../../services/agendamientoService'
import { Calendar, Car, User, ChevronRight, Loader2 } from 'lucide-react'

const ESTADO_STYLE = {
  PENDIENTE:  { bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', punto: 'bg-yellow-400' },
  CONFIRMADO: { bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',       punto: 'bg-blue-400'   },
  COMPLETADO: { bg: 'bg-green-500/15 text-green-400 border-green-500/30',    punto: 'bg-green-400'  },
  CANCELADO:  { bg: 'bg-red-500/15 text-red-400 border-red-500/30',          punto: 'bg-red-400'    },
  ACTIVA:     { bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30', punto: 'bg-orange-400' },
}

function fmtHora(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}
function fmtPrecio(n) {
  return n != null ? `$${Number(n).toLocaleString('es-CL')}` : null
}

export default function Agendamientos() {
  const navigate = useNavigate()
  const [agendamientos, setAgendamientos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerMisAgendamientos()
      .then(r => setAgendamientos(r.data || []))
      .catch(err => console.error('Error cargando agendamientos:', err))
      .finally(() => setCargando(false))
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-950">
      <SidebarCliente />

      <div className="flex-1 flex flex-col">
        <TopbarCliente />

        <main className="flex-1 p-6 space-y-6 max-w-4xl w-full mx-auto">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wide">Mis Agendamientos</h1>
            <p className="text-gray-500 text-sm mt-0.5">Historial y seguimiento de tus servicios</p>
          </div>

          {cargando ? (
            <div className="flex items-center gap-3 text-gray-500 py-12 justify-center">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm">Cargando agendamientos...</span>
            </div>
          ) : agendamientos.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
              <Calendar size={40} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 font-semibold">No tienes agendamientos registrados</p>
              <p className="text-gray-600 text-sm mt-1">Reserva tu primera cita desde la sección de servicios</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agendamientos.map(ag => {
                const estado = typeof ag.estadoAgendamiento === 'object'
                  ? ag.estadoAgendamiento?.nombre || 'PENDIENTE'
                  : ag.estadoAgendamiento || 'PENDIENTE'
                const estilo = ESTADO_STYLE[estado] || ESTADO_STYLE.PENDIENTE
                const precio = fmtPrecio(ag.precioAcordado)

                return (
                  <div
                    key={ag.idAgendamiento}
                    className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors"
                  >
                    <div className="flex">
                      <div className="w-1 bg-orange-500 flex-shrink-0" />

                      <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Bloque fecha */}
                        <div className="flex-shrink-0 text-center bg-gray-800 rounded-xl px-4 py-3 min-w-[76px]">
                          <p className="text-2xl font-black text-white leading-none">
                            {new Date(ag.fechaInicio).getDate()}
                          </p>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">
                            {new Date(ag.fechaInicio).toLocaleDateString('es-CL', { month: 'short' })}
                          </p>
                          <p className="text-xs text-orange-400 font-bold mt-1">{fmtHora(ag.fechaInicio)}</p>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <h3 className="text-base font-black text-white">
                              {ag.nombreServicio || 'Servicio agendado'}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${estilo.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${estilo.punto}`} />
                              {estado}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                            {ag.patenteVehiculo && (
                              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Car size={12} className="text-gray-600" />
                                {ag.patenteVehiculo}
                              </span>
                            )}
                            {ag.nombreTecnico && (
                              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                <User size={12} className="text-gray-600" />
                                {ag.nombreTecnico}
                              </span>
                            )}
                            {precio && (
                              <span className="text-xs text-gray-400">{precio} CLP</span>
                            )}
                          </div>
                        </div>

                        {/* Botón → navega a la página dedicada */}
                        <button
                          onClick={() => navigate(`/cliente/seguimiento/${ag.idAgendamiento}`)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-orange-500/10 border border-gray-700 hover:border-orange-500/40 text-gray-300 hover:text-orange-400 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
                        >
                          Ver seguimiento
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}