import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Car, Wrench, User, Calendar, CheckCircle,
  ClipboardList, Search, ShieldCheck, Loader2, AlertCircle,
  Image, X, Clock, DollarSign, MessageCircle
} from 'lucide-react'
import SidebarCliente from '../../components/cliente/SidebarCliente'
import TopbarCliente from '../../components/cliente/TopbarCliente'
import { obtenerSeguimientoAgendamiento } from '../../services/agendamientoService'
import ChatOT from '../../components/shared/ChatOT'

const FASES_CONFIG = {
  RECEPCION:       { Icono: ClipboardList, label: 'Recepción',          color: 'blue'   },
  DIAGNOSTICO:     { Icono: Search,        label: 'Diagnóstico',        color: 'purple' },
  EN_TRABAJO:      { Icono: Wrench,        label: 'En Trabajo',         color: 'orange' },
  CONTROL_CALIDAD: { Icono: ShieldCheck,   label: 'Control de Calidad', color: 'cyan'   },
  LISTO_ENTREGA:   { Icono: Car,           label: 'Listo para Entrega', color: 'green'  },
}
const ORDEN_FASES = ['RECEPCION', 'DIAGNOSTICO', 'EN_TRABAJO', 'CONTROL_CALIDAD', 'LISTO_ENTREGA']

const COLOR_MAP = {
  blue:   { dot: 'bg-blue-500',   icon: 'bg-blue-500/15 text-blue-400 border-blue-500/30',   text: 'text-blue-400'   },
  purple: { dot: 'bg-purple-500', icon: 'bg-purple-500/15 text-purple-400 border-purple-500/30', text: 'text-purple-400' },
  orange: { dot: 'bg-orange-500', icon: 'bg-orange-500/15 text-orange-400 border-orange-500/30', text: 'text-orange-400' },
  cyan:   { dot: 'bg-cyan-500',   icon: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',   text: 'text-cyan-400'   },
  green:  { dot: 'bg-green-500',  icon: 'bg-green-500/15 text-green-400 border-green-500/30', text: 'text-green-400'  },
}

function fmt(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtHora(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}
function fmtPrecio(n) {
  return n != null ? `$${Number(n).toLocaleString('es-CL')}` : '$0'
}

function parsearImagenes(imagenes) {
  if (!imagenes) return []
  try {
    const arr = JSON.parse(imagenes)
    return Array.isArray(arr) ? arr.filter(Boolean) : []
  } catch { return [] }
}

function parsearObservaciones(fase, observaciones) {
  if (!observaciones) return null
  try {
    const parsed = JSON.parse(observaciones)
    if (fase === 'DIAGNOSTICO' && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const partes = []
      if (parsed.diagnostico) partes.push(parsed.diagnostico)
      if (Array.isArray(parsed.serviciosExtra) && parsed.serviciosExtra.length > 0)
        partes.push('Servicios adicionales: ' + parsed.serviciosExtra.join(', '))
      return partes.join(' — ') || null
    }
    if (fase === 'EN_TRABAJO' && Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((e, i) => `${i + 1}. ${e.texto}`).filter(Boolean).join('\n')
    }
    return observaciones
  } catch { return observaciones }
}

function Lightbox({ url, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-5 right-5 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2.5 transition" onClick={onClose}>
        <X size={20} />
      </button>
      <img src={url} alt="foto ampliada" className="max-w-full max-h-[88vh] rounded-xl object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
    </div>
  )
}

// ── Línea de tiempo vertical ──────────────────────────────────────────────────
function LineaTiempo({ fasesMap, primeraActiva, onVerFoto }) {
  return (
    <div className="relative">
      {/* línea vertical */}
      <div className="absolute left-[19px] top-5 bottom-5 w-px bg-gray-800" />

      <div className="space-y-2">
        {ORDEN_FASES.map((nombre, idx) => {
          const { Icono, label, color } = FASES_CONFIG[nombre]
          const c = COLOR_MAP[color]
          const fv = fasesMap[nombre]
          const completada = fv?.finAt != null
          const activa = fv && !fv.finAt && fv === primeraActiva
          const pendiente = !fv
          const fotos = parsearImagenes(fv?.imagenes)
          const obs   = parsearObservaciones(nombre, fv?.observaciones)
          const esUltima = idx === ORDEN_FASES.length - 1

          return (
            <div key={nombre} className="flex gap-4">
              {/* Dot + línea */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: 40 }}>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                  completada ? `${c.icon} border-2` :
                  activa     ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-400' :
                               'bg-gray-900 border border-gray-800 text-gray-700'
                }`}>
                  {completada ? <CheckCircle size={17} /> : <Icono size={16} />}
                </div>
              </div>

              {/* Contenido */}
              <div className={`flex-1 mb-2 rounded-xl border transition-all ${
                completada ? 'bg-gray-900 border-gray-800' :
                activa     ? 'bg-gray-900 border-orange-500/30 shadow-sm shadow-orange-500/10' :
                             'bg-gray-950 border-gray-900'
              }`}>
                {/* Header de la fase */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-black uppercase tracking-wide ${
                      completada ? c.text : activa ? 'text-orange-400' : 'text-gray-600'
                    }`}>{label}</span>

                    {activa && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                        En curso
                      </span>
                    )}
                    {completada && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        ✓ Completada
                      </span>
                    )}
                    {pendiente && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-600">
                        Pendiente
                      </span>
                    )}
                  </div>

                  {fv?.finAt && (
                    <span className="text-[10px] text-gray-600 flex items-center gap-1 flex-shrink-0">
                      <Clock size={10} />
                      {fmt(fv.finAt)} {fmtHora(fv.finAt)}
                    </span>
                  )}
                </div>

                {/* Notas + fotos */}
                {(obs || fotos.length > 0) && (
                  <div className="border-t border-gray-800 px-4 pb-4 pt-3 space-y-3">
                    {obs && (
                      <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{obs}</p>
                    )}
                    {fotos.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Image size={10} /> {fotos.length} foto{fotos.length > 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-5 gap-1.5">
                          {fotos.map((url, i) => (
                            <button
                              key={i}
                              onClick={() => onVerFoto(url)}
                              className="aspect-square rounded-lg overflow-hidden border border-gray-800 hover:border-orange-500/60 transition-all group"
                            >
                              <img src={url} alt={`foto ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function SeguimientoDetalle() {
  const { agendamientoId } = useParams()
  const navigate = useNavigate()
  const [seguimiento, setSeguimiento] = useState(null)
  const [cargando, setCargando]       = useState(true)
  const [sinOT, setSinOT]             = useState(false)
  const [fotoAmpliada, setFotoAmpliada] = useState(null)

  useEffect(() => {
    obtenerSeguimientoAgendamiento(agendamientoId)
      .then(({ data }) => setSeguimiento(data))
      .catch(err => { if (err?.response?.status === 404) setSinOT(true) })
      .finally(() => setCargando(false))
  }, [agendamientoId])

  const fases = seguimiento?.fases ?? []
  const fasesMap = Object.fromEntries(fases.map(f => [f.fase, f]))
  const primeraActiva = fases.find(f => f.finAt === null)
  const completadas = fases.filter(f => f.finAt != null).length
  const progreso = Math.round((completadas / 5) * 100)

  return (
    <div className="flex min-h-screen bg-gray-950">
      <SidebarCliente />

      <div className="flex-1 flex flex-col min-w-0">
        <TopbarCliente />

        <main className="flex-1 p-5 lg:p-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => navigate('/cliente/agendamientos')}
              className="flex items-center gap-1.5 text-gray-500 hover:text-orange-400 text-sm font-semibold transition-colors"
            >
              <ArrowLeft size={15} />
              Mis agendamientos
            </button>
            <span className="text-gray-700">/</span>
            <span className="text-gray-400 text-sm font-semibold">
              {seguimiento?.codigoOt ?? 'Seguimiento'}
            </span>
          </div>

          {cargando ? (
            <div className="flex items-center justify-center py-32 gap-3 text-gray-500">
              <Loader2 size={24} className="animate-spin text-orange-500" />
              <span className="text-sm">Cargando seguimiento...</span>
            </div>

          ) : sinOT ? (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex gap-4 max-w-xl">
              <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-300">Orden de trabajo aún no generada</p>
                <p className="text-sm text-gray-400 mt-1">La línea de tiempo estará disponible cuando el taller confirme y reciba tu vehículo.</p>
              </div>
            </div>

          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">

              {/* ── Columna izquierda ── */}
              <div className="space-y-4 min-w-0">

                {/* Hero: OT + info */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-0.5">Orden de trabajo</p>
                      <p className="text-2xl font-black text-orange-400 font-mono leading-none">{seguimiento.codigoOt}</p>
                    </div>
                    <span className="text-xs font-black uppercase px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex-shrink-0">
                      {seguimiento.estado?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: Car,      label: 'Vehículo', val: seguimiento.vehiculo },
                      { icon: Wrench,   label: 'Servicio', val: seguimiento.nombreServicio },
                      { icon: User,     label: 'Técnico',  val: seguimiento.nombreTecnico || 'Por asignar' },
                      { icon: Calendar, label: 'Ingreso',  val: fmt(seguimiento.fechaInicio) },
                    ].map(({ icon: Icon, label, val }) => (
                      <div key={label} className="bg-gray-800/50 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] text-gray-600 flex items-center gap-1 mb-0.5"><Icon size={10} /> {label}</p>
                        <p className="text-xs font-bold text-white truncate">{val || '—'}</p>
                      </div>
                    ))}
                  </div>

                  {/* Barra de progreso integrada */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Progreso</p>
                      <p className="text-xs font-black text-orange-400">{completadas}/5 fases · {progreso}%</p>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-700"
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Línea de tiempo */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Detalle por fase</p>
                  <LineaTiempo
                    fasesMap={fasesMap}
                    primeraActiva={primeraActiva}
                    onVerFoto={setFotoAmpliada}
                  />
                </div>
              </div>

              {/* ── Columna derecha (sticky) ── */}
              <div className="space-y-4 xl:sticky xl:top-6">

                {/* Resumen de costos */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Resumen de costos</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 flex items-center gap-1.5"><DollarSign size={11} /> Mano de obra</p>
                      <p className="text-sm font-bold text-white">{fmtPrecio(seguimiento.costoManoObra)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 flex items-center gap-1.5"><DollarSign size={11} /> Repuestos</p>
                      <p className="text-sm font-bold text-white">{fmtPrecio(seguimiento.costoRepuestos)}</p>
                    </div>
                    <div className="h-px bg-gray-800" />
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-white">Total estimado</p>
                      <p className="text-xl font-black text-orange-400">{fmtPrecio(seguimiento.total)}</p>
                    </div>
                  </div>
                </div>

                {/* Chat */}
                {seguimiento?.codigoOt && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                      <MessageCircle size={14} className="text-orange-400" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consultas al taller</p>
                    </div>
                    <ChatOT codigoOt={seguimiento.codigoOt} embedded />
                  </div>
                )}
              </div>

            </div>
          )}
        </main>
      </div>

      {fotoAmpliada && <Lightbox url={fotoAmpliada} onClose={() => setFotoAmpliada(null)} />}
    </div>
  )
}