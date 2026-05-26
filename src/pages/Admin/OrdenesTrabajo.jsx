import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import LineaTiempoOT from '../../components/seguimiento/LineaTiempoOT'
import * as svc from '../../services/adminOTService'
import { Eye, X, Sparkles, Loader2 } from 'lucide-react'

const ESTADO_COLOR = {
  ACTIVA:          'bg-gray-500/20 text-gray-300 border-gray-500/30',
  EN_PROCESO:      'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CONTROL_CALIDAD: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  LISTA_ENTREGA:   'bg-blue-500/20 text-blue-400 border-blue-500/30',
  COMPLETADA:      'bg-green-500/20 text-green-400 border-green-500/30',
}

const ESTADO_LABEL = {
  ACTIVA: 'Activa', EN_PROCESO: 'En proceso',
  CONTROL_CALIDAD: 'Control calidad', LISTA_ENTREGA: 'Lista entrega', COMPLETADA: 'Completada',
}

function fmt(f) {
  if (!f) return '—'
  return new Date(f).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
}

function StatCard({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  )
}

export default function OrdenesTrabajo() {
  const [ots, setOts]           = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [detalle, setDetalle]   = useState(null)
  const [cargandoDet, setCargandoDet] = useState(false)
  const [prediciendo, setPrediciendo] = useState(false)

  useEffect(() => {
    svc.obtenerOTs()
      .then(({ data }) => setOts(Array.isArray(data) ? data : []))
      .catch(() => setError('Error al cargar OTs'))
      .finally(() => setCargando(false))
  }, [])

  const abrirDetalle = async (ot) => {
    setCargandoDet(true)
    setDetalle({ cargando: true, codigoOt: ot.codigoOt })
    try {
      const { data } = await svc.obtenerOTDetalle(ot.codigoOt)
      setDetalle(data)
    } catch {
      setDetalle(null)
    } finally {
      setCargandoDet(false)
    }
  }

  const generarPrediccion = async () => {
    if (!detalle?.id) return
    setPrediciendo(true)
    try {
      const { data } = await svc.predecirTiempo(detalle.id)
      setDetalle(prev => ({ ...prev, prediccion: {
        tiempoEstimadoMin: data.tiempoEstimadoMin,
        horaFinEstimada:   data.horaFinEstimada,
        confianzaPct:      data.confianzaPct,
        desglosePorFase:   data.desglosePorFase,
      }}))
    } catch (e) {
      console.error('Error predicción IA:', e)
    } finally {
      setPrediciendo(false)
    }
  }

  const otsFiltradas = ots.filter(o => {
    const matchEstado  = !filtroEstado || o.estadoOt === filtroEstado
    const matchBusq    = !busqueda || [o.codigoOt, o.nombreCliente, o.vehiculoPatente, o.nombreTecnico]
      .some(v => v?.toLowerCase().includes(busqueda.toLowerCase()))
    return matchEstado && matchBusq
  })

  const stats = {
    total:      ots.length,
    activa:     ots.filter(o => o.estadoOt === 'ACTIVA').length,
    enProceso:  ots.filter(o => o.estadoOt === 'EN_PROCESO').length,
    completada: ots.filter(o => o.estadoOt === 'COMPLETADA').length,
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Órdenes de Trabajo</h2>
            <p className="text-gray-500 text-sm mt-0.5">Seguimiento de OT y fases de trabajo</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total OTs"     value={stats.total}      />
          <StatCard label="Activas"       value={stats.activa}     color="text-gray-300" />
          <StatCard label="En proceso"    value={stats.enProceso}  color="text-orange-400" />
          <StatCard label="Completadas"   value={stats.completada} color="text-green-400" />
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por código, cliente, patente..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-orange-500"
          />
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500 min-w-[160px]"
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Tabla */}
        {error ? (
          <p className="text-red-400 text-sm text-center py-8">{error}</p>
        ) : cargando ? (
          <p className="text-gray-500 text-center py-12 animate-pulse">Cargando órdenes de trabajo...</p>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                  {['Código', 'Estado', 'Cliente', 'Patente', 'Técnico', 'Servicio', 'Inicio', 'Total', ''].map((h, i) => (
                    <th key={i} className={`px-4 py-3 ${i === 8 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {otsFiltradas.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-10 text-gray-600">No hay órdenes de trabajo</td></tr>
                )}
                {otsFiltradas.map(ot => (
                  <tr key={ot.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-orange-400 font-bold text-xs">{ot.codigoOt}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${ESTADO_COLOR[ot.estadoOt] || 'bg-gray-700 text-gray-400'}`}>
                        {ESTADO_LABEL[ot.estadoOt] || ot.estadoOt || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">{ot.nombreCliente || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">{ot.vehiculoPatente || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{ot.nombreTecnico || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[160px] truncate">{ot.nombreServicio || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmt(ot.fechaInicio)}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{ot.total != null ? `$${Number(ot.total).toLocaleString('es-CL')}` : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => abrirDetalle(ot)}
                        className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-gray-800 rounded-lg transition-colors">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4"
          onClick={() => setDetalle(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Detalle de OT</p>
                <p className="text-xl font-black text-orange-400 font-mono">{detalle.codigoOt}</p>
              </div>
              <div className="flex items-center gap-3">
                {detalle.estadoOt && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${ESTADO_COLOR[detalle.estadoOt] || ''}`}>
                    {ESTADO_LABEL[detalle.estadoOt] || detalle.estadoOt}
                  </span>
                )}
                <button
                  onClick={generarPrediccion}
                  disabled={prediciendo || detalle.cargando}
                  title="Generar predicción con IA"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {prediciendo
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Sparkles size={13} />}
                  {prediciendo ? 'Prediciendo...' : 'Predecir IA'}
                </button>
                <button onClick={() => setDetalle(null)} className="text-gray-500 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>
            </div>

            {detalle.cargando ? (
              <div className="py-16 text-center text-gray-500 animate-pulse">Cargando detalle...</div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['Cliente',    detalle.nombreCliente],
                    ['Vehículo',   detalle.vehiculoPatente ? `${detalle.vehiculoDescripcion || ''} ${detalle.vehiculoPatente}`.trim() : null],
                    ['Técnico',    detalle.nombreTecnico],
                    ['Servicio',   detalle.nombreServicio],
                    ['Inicio',     fmt(detalle.fechaInicio)],
                    ['Cierre',     fmt(detalle.fechaCierre)],
                  ].map(([label, val]) => val ? (
                    <div key={label}>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
                      <p className="text-white font-medium mt-0.5">{val}</p>
                    </div>
                  ) : null)}
                </div>

                {/* Costos */}
                {(detalle.costoManoObra != null || detalle.costoRepuestos != null) && (
                  <div className="bg-gray-800 rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Mano de obra</p>
                      <p className="text-white font-bold">${Number(detalle.costoManoObra || 0).toLocaleString('es-CL')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Repuestos</p>
                      <p className="text-white font-bold">${Number(detalle.costoRepuestos || 0).toLocaleString('es-CL')}</p>
                    </div>
                    <div className="border-l border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">Total</p>
                      <p className="text-orange-400 font-black text-lg">${Number(detalle.total || 0).toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                )}

                {/* Diagnóstico */}
                {detalle.diagnostico && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Diagnóstico</p>
                    <p className="text-gray-300 text-sm bg-gray-800 rounded-lg p-3">{detalle.diagnostico}</p>
                  </div>
                )}

                {/* Línea de tiempo */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-4">Estado del servicio</p>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <LineaTiempoOT fases={detalle.fases ?? []} prediccion={detalle.prediccion} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}