import { useEffect, useState } from 'react'
import SidebarCliente from '../../components/cliente/SidebarCliente'
import TopbarCliente from '../../components/cliente/TopbarCliente'
import { obtenerMisAgendamientos, obtenerSeguimientoAgendamiento } from '../../services/agendamientoService'
import {
  Calendar, Car, Wrench, User, ChevronRight,
  CheckCircle, ClipboardList, Search, ShieldCheck, Loader2, AlertCircle, ArrowLeft,
} from 'lucide-react'

// ── Configuración de fases ────────────────────────────────────────────────────
const FASES_CONFIG = {
  RECEPCION:       { Icono: ClipboardList, label: 'Recepción'       },
  DIAGNOSTICO:     { Icono: Search,        label: 'Diagnóstico'     },
  EN_TRABAJO:      { Icono: Wrench,        label: 'En Trabajo'      },
  CONTROL_CALIDAD: { Icono: ShieldCheck,   label: 'Control Calidad' },
  LISTO_ENTREGA:   { Icono: Car,           label: 'Lista Entrega'   },
}
const ORDEN_FASES = ['RECEPCION', 'DIAGNOSTICO', 'EN_TRABAJO', 'CONTROL_CALIDAD', 'LISTO_ENTREGA']

const ESTADO_STYLE = {
  PENDIENTE:  { bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', punto: 'bg-yellow-400' },
  CONFIRMADO: { bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',       punto: 'bg-blue-400'   },
  COMPLETADO: { bg: 'bg-green-500/15 text-green-400 border-green-500/30',    punto: 'bg-green-400'  },
  CANCELADO:  { bg: 'bg-red-500/15 text-red-400 border-red-500/30',          punto: 'bg-red-400'    },
}

function fmt(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}
function fmtHora(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}
function fmtPrecio(n) {
  return n != null ? `$${Number(n).toLocaleString('es-CL')}` : 'Por definir'
}

// ── Línea de tiempo ───────────────────────────────────────────────────────────
function LineaTiempo({ fases = [] }) {
  const fasesMap = Object.fromEntries(fases.map(f => [f.fase, f]))
  const primeraActiva = fases.find(f => f.finAt === null)

  const items = ORDEN_FASES.map(nombre => {
    const { Icono, label } = FASES_CONFIG[nombre]
    const fv = fasesMap[nombre]
    const completada = fv?.finAt != null
    const activa = fv && !fv.finAt && fv === primeraActiva
    return { nombre, Icono, label, completada, activa, fv }
  })

  const completadas = items.filter(i => i.completada).length
  const progresoPct = Math.round((completadas / 5) * 100)

  return (
    <div className="space-y-5">
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span className="font-semibold uppercase tracking-wider">Progreso general</span>
          <span className="font-black text-orange-400">{progresoPct}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-700"
            style={{ width: `${progresoPct}%` }}
          />
        </div>
      </div>

      <div>
        {items.map(({ nombre, Icono, label, completada, activa, fv }, idx) => (
          <div key={nombre} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                completada ? 'bg-green-500 border-green-500 text-white'
                  : activa   ? 'bg-orange-500 border-orange-500 text-white'
                             : 'bg-gray-800 border-gray-700 text-gray-600'
              }`}>
                {activa && <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-30" />}
                {completada ? <CheckCircle size={16} /> : <Icono size={15} />}
              </div>
              {idx < 4 && (
                <div className={`w-0.5 flex-1 min-h-[28px] my-1 ${completada ? 'bg-green-500/40' : 'bg-gray-800'}`} />
              )}
            </div>

            <div className={`flex-1 ${idx < 4 ? 'pb-2' : ''}`}>
              <div className="flex items-center justify-between pt-1.5">
                <p className={`text-sm font-black uppercase tracking-wide ${
                  completada ? 'text-green-400' : activa ? 'text-orange-400' : 'text-gray-600'
                }`}>
                  {label}
                  {activa && (
                    <span className="ml-2 text-xs font-semibold normal-case tracking-normal bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                      En curso
                    </span>
                  )}
                </p>
                {fv?.finAt && (
                  <span className="text-xs text-gray-600 font-mono">{fmt(fv.finAt)} {fmtHora(fv.finAt)}</span>
                )}
              </div>
              {fv?.observaciones && (
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{fv.observaciones}</p>
              )}
              {activa && !fv?.observaciones && (
                <p className="text-xs text-gray-600 mt-1 italic">Tu vehículo está siendo atendido.</p>
              )}
              {!fv && <p className="text-xs text-gray-700 mt-1">Pendiente de inicio</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tile de info ──────────────────────────────────────────────────────────────
function InfoTile({ icon, label, valor }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-3">
      <span className="text-gray-500 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-bold text-white truncate">{valor || '—'}</p>
      </div>
    </div>
  )
}

// ── Panel de seguimiento ──────────────────────────────────────────────────────
function PanelSeguimiento({ agendamiento, onCerrar }) {
  const [seguimiento, setSeguimiento] = useState(null)
  const [cargando, setCargando]       = useState(true)
  const [sinOT, setSinOT]             = useState(false)

  useEffect(() => {
    setCargando(true)
    setSinOT(false)
    setSeguimiento(null)
    obtenerSeguimientoAgendamiento(agendamiento.idAgendamiento)
      .then(({ data }) => setSeguimiento(data))
      .catch(err => { if (err?.response?.status === 404) setSinOT(true) })
      .finally(() => setCargando(false))
  }, [agendamiento.idAgendamiento])

  const estado = typeof agendamiento.estadoAgendamiento === 'object'
    ? agendamiento.estadoAgendamiento?.nombre || 'PENDIENTE'
    : agendamiento.estadoAgendamiento || 'PENDIENTE'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Cabecera del panel */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Seguimiento</p>
          {seguimiento ? (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-lg font-black text-orange-400 font-mono">{seguimiento.codigoOt}</p>
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {seguimiento.estado?.replace(/_/g, ' ')}
              </span>
            </div>
          ) : (
            <p className="text-base font-bold text-white mt-1 truncate">
              {agendamiento.nombreServicio || 'Servicio agendado'}
            </p>
          )}
        </div>
        <button
          onClick={onCerrar}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors flex-shrink-0 mt-1"
        >
          <ArrowLeft size={14} />
          Volver
        </button>
      </div>

      {/* Cuerpo */}
      <div className="flex-1 overflow-y-auto p-5">
        {cargando ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm">Cargando seguimiento...</span>
          </div>
        ) : sinOT ? (
          <div className="space-y-5">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
              <AlertCircle size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-300">Orden de trabajo aún no generada</p>
                <p className="text-xs text-gray-400 mt-1">
                  Tu agendamiento está{' '}
                  <span className="font-semibold text-gray-300">{estado}</span>.
                  La línea de tiempo estará disponible cuando el taller confirme y reciba tu vehículo.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoTile icon={<Wrench size={14} />}   label="Servicio" valor={agendamiento.nombreServicio} />
              <InfoTile icon={<Car size={14} />}       label="Patente"  valor={agendamiento.patenteVehiculo} />
              <InfoTile icon={<User size={14} />}      label="Técnico"  valor={agendamiento.nombreTecnico || 'Por asignar'} />
              <InfoTile icon={<Calendar size={14} />}  label="Fecha"    valor={`${fmt(agendamiento.fechaInicio)} ${fmtHora(agendamiento.fechaInicio)}`} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <InfoTile icon={<Car size={14} />}      label="Vehículo" valor={seguimiento.vehiculo} />
              <InfoTile icon={<Wrench size={14} />}   label="Servicio" valor={seguimiento.nombreServicio} />
              <InfoTile icon={<User size={14} />}     label="Técnico"  valor={seguimiento.nombreTecnico || 'Por asignar'} />
              <InfoTile
                icon={<Calendar size={14} />}
                label="Ingreso"
                valor={seguimiento.fechaInicio ? `${fmt(seguimiento.fechaInicio)} ${fmtHora(seguimiento.fechaInicio)}` : '—'}
              />
            </div>

            {(seguimiento.costoManoObra != null || seguimiento.total != null) && (
              <div className="bg-gray-800 rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mano de obra</p>
                  <p className="text-sm font-bold text-white">{fmtPrecio(seguimiento.costoManoObra)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Repuestos</p>
                  <p className="text-sm font-bold text-white">{fmtPrecio(seguimiento.costoRepuestos)}</p>
                </div>
                <div className="border-l border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <p className="text-base font-black text-orange-400">{fmtPrecio(seguimiento.total)}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-5">
                Línea de progreso
              </p>
              <LineaTiempo fases={seguimiento.fases ?? []} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Card de agendamiento ──────────────────────────────────────────────────────
function AgendamientoCard({ ag, activo, onClick }) {
  const estado = typeof ag.estadoAgendamiento === 'object'
    ? ag.estadoAgendamiento?.nombre || 'PENDIENTE'
    : ag.estadoAgendamiento || 'PENDIENTE'
  const estilo = ESTADO_STYLE[estado] || ESTADO_STYLE.PENDIENTE

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-gray-900 border rounded-2xl overflow-hidden transition-all ${
        activo ? 'border-orange-500/50 ring-1 ring-orange-500/20' : 'border-gray-800 hover:border-gray-700'
      }`}
    >
      <div className="flex">
        <div className={`w-1 flex-shrink-0 ${activo ? 'bg-orange-500' : 'bg-gray-700'}`} />
        <div className="flex-1 p-4 flex items-center gap-4">
          {/* Bloque fecha */}
          <div className="flex-shrink-0 text-center bg-gray-800 rounded-xl px-3 py-2.5 min-w-[68px]">
            <p className="text-xl font-black text-white leading-none">
              {new Date(ag.fechaInicio).getDate()}
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">
              {new Date(ag.fechaInicio).toLocaleDateString('es-CL', { month: 'short' })}
            </p>
            <p className="text-xs text-orange-400 font-bold mt-0.5">{fmtHora(ag.fechaInicio)}</p>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-white truncate">
              {ag.nombreServicio || 'Servicio agendado'}
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              {ag.patenteVehiculo && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Car size={11} />{ag.patenteVehiculo}
                </span>
              )}
              {ag.nombreTecnico && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <User size={11} />{ag.nombreTecnico}
                </span>
              )}
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border mt-1.5 ${estilo.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${estilo.punto}`} />
              {estado}
            </span>
          </div>

          <ChevronRight size={16} className={`flex-shrink-0 transition-colors ${activo ? 'text-orange-400' : 'text-gray-600'}`} />
        </div>
      </div>
    </button>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Agendamientos() {
  const [agendamientos, setAgendamientos] = useState([])
  const [cargando, setCargando]           = useState(true)
  const [seleccionado, setSeleccionado]   = useState(null)

  useEffect(() => {
    obtenerMisAgendamientos()
      .then(r => setAgendamientos(r.data || []))
      .catch(err => console.error('Error cargando agendamientos:', err))
      .finally(() => setCargando(false))
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-950">
      <SidebarCliente />

      <div className="flex-1 flex flex-col min-w-0">
        <TopbarCliente />

        <main className="flex-1 p-6">
          <div className="mb-6">
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
            /* Layout split: lista | panel */
            <div className={`flex gap-5 items-start transition-all duration-300 ${
              seleccionado ? 'flex-col lg:flex-row' : ''
            }`}>

              {/* Lista */}
              <div className={`space-y-3 transition-all duration-300 ${
                seleccionado ? 'w-full lg:w-80 xl:w-96 flex-shrink-0' : 'w-full'
              }`}>
                {agendamientos.map(ag => (
                  <AgendamientoCard
                    key={ag.idAgendamiento}
                    ag={ag}
                    activo={seleccionado?.idAgendamiento === ag.idAgendamiento}
                    onClick={() => setSeleccionado(
                      seleccionado?.idAgendamiento === ag.idAgendamiento ? null : ag
                    )}
                  />
                ))}
              </div>

              {/* Panel de seguimiento */}
              {seleccionado && (
                <div className="flex-1 w-full min-w-0 sticky top-6">
                  <PanelSeguimiento
                    agendamiento={seleccionado}
                    onCerrar={() => setSeleccionado(null)}
                  />
                </div>
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  )
}