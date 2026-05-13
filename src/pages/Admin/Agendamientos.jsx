import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import * as svc from '../../services/adminAgendamientoService'
import { obtenerServicios } from '../../services/adminCatalogosService'
import {
  Search, Filter, Eye, CheckCircle, XCircle, Plus, Calendar,
  Clock, User, Car, Wrench, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react'

const ESTADOS = ['', 'PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO']
const ESTADO_COLORS = {
  PENDIENTE:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CONFIRMADO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  COMPLETADO: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELADO:  'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function Agendamientos() {
  const [agendamientos, setAgendamientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')
  const [filtroBuscar, setFiltroBuscar] = useState('')

  // Modal detalle
  const [detalle, setDetalle] = useState(null)

  // Modal confirmar
  const [confirmarModal, setConfirmarModal] = useState(null)

  // Modal cancelar
  const [cancelarModal, setCancelarModal] = useState(null)

  // Modal crear
  const [crearModal, setCrearModal] = useState(false)

  // Acción en progreso
  const [accionando, setAccionando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const cargar = async () => {
    setCargando(true)
    setError(null)
    try {
      const params = {}
      if (filtroEstado) params.estado = filtroEstado
      if (filtroDesde) params.desde = filtroDesde
      if (filtroHasta) params.hasta = filtroHasta
      if (filtroBuscar) params.buscar = filtroBuscar
      const { data } = await svc.obtenerAgendamientosAdmin(params)
      setAgendamientos(Array.isArray(data) ? data : data?.content ?? [])
    } catch {
      setError('Error al cargar agendamientos')
      setAgendamientos([])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiltrar = (e) => { e.preventDefault(); cargar() }
  const handleLimpiar = () => {
    setFiltroEstado(''); setFiltroDesde(''); setFiltroHasta(''); setFiltroBuscar('')
    setTimeout(cargar, 0)
  }

  // ─── Confirmar ───
  const abrirConfirmar = (a) => {
    if (a.estado === 'COMPLETADO' || a.estado === 'CANCELADO') {
      setMensaje({ tipo: 'error', texto: `No se puede confirmar un agendamiento ${a.estado}` })
      return
    }
    setConfirmarModal(a)
  }

  const handleConfirmar = async () => {
    if (!confirmarModal) return
    setAccionando(true)
    try {
      await svc.confirmarAgendamiento(confirmarModal.id, null)
      setMensaje({ tipo: 'ok', texto: 'Agendamiento confirmado. OT generada automáticamente.' })
      setConfirmarModal(null)
      cargar()
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al confirmar. Verifica disponibilidad.' })
    } finally {
      setAccionando(false)
    }
  }

  // ─── Cancelar ───
  const abrirCancelar = (a) => {
    if (a.estado === 'COMPLETADO') {
      setMensaje({ tipo: 'error', texto: 'No se puede cancelar un agendamiento COMPLETADO' })
      return
    }
    if (a.estado === 'CANCELADO') {
      setMensaje({ tipo: 'error', texto: 'El agendamiento ya está CANCELADO' })
      return
    }
    setCancelarModal(a)
  }

  const handleCancelar = async () => {
    if (!cancelarModal) return
    setAccionando(true)
    try {
      await svc.cancelarAgendamientoAdmin(cancelarModal.id)
      setMensaje({ tipo: 'ok', texto: 'Agendamiento cancelado' })
      setCancelarModal(null)
      cargar()
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al cancelar' })
    } finally {
      setAccionando(false)
    }
  }

  const formatFecha = (f) => {
    if (!f) return '—'
    return new Date(f).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Agendamientos</h2>
            <p className="text-gray-500 text-sm mt-0.5">Gestión de citas y reservas</p>
          </div>
          <button
            onClick={() => setCrearModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={16} />
            Crear agendamiento
          </button>
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
            mensaje.tipo === 'ok' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {mensaje.tipo === 'ok' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {mensaje.texto}
            <button onClick={() => setMensaje(null)} className="ml-auto text-gray-500 hover:text-white">&times;</button>
          </div>
        )}

        {/* Filtros */}
        <form onSubmit={handleFiltrar} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs text-gray-500 font-semibold block mb-1">Estado</label>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              >
                <option value="">Todos</option>
                {ESTADOS.filter(Boolean).map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs text-gray-500 font-semibold block mb-1">Desde</label>
              <input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs text-gray-500 font-semibold block mb-1">Hasta</label>
              <input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex-[2] min-w-[200px]">
              <label className="text-xs text-gray-500 font-semibold block mb-1">Buscar</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={filtroBuscar} onChange={(e) => setFiltroBuscar(e.target.value)}
                  placeholder="Cliente, patente, servicio..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Filter size={14} /> Filtrar
              </button>
              <button type="button" onClick={handleLimpiar}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        </form>

        {/* Tabla */}
        {cargando ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
            <p className="text-gray-500 animate-pulse">Cargando agendamientos...</p>
          </div>
        ) : error ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
            <p className="text-red-400">{error}</p>
            <button onClick={cargar} className="mt-2 text-orange-500 text-sm hover:underline">Reintentar</button>
          </div>
        ) : agendamientos.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
            <Calendar size={32} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500">No se encontraron agendamientos</p>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Cliente</th>
                    <th className="text-left px-4 py-3">Vehículo</th>
                    <th className="text-left px-4 py-3">Servicio</th>
                    <th className="text-left px-4 py-3">Fecha / Hora</th>
                    <th className="text-left px-4 py-3">Estado</th>
                    <th className="text-right px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {agendamientos.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{a.clienteNombre || '—'}</p>
                        <p className="text-gray-500 text-xs">{a.clienteEmail || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white">{a.vehiculoPatente || '—'}</p>
                        <p className="text-gray-500 text-xs">{a.vehiculoMarca || ''} {a.vehiculoModelo || ''}</p>
                      </td>
                      <td className="px-4 py-3 text-white">{a.servicioNombre || '—'}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{formatFecha(a.fechaInicio)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${ESTADO_COLORS[a.estado] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                          {a.estado || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setDetalle(detalle?.id === a.id ? null : a)}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Ver detalle"
                          >
                            <Eye size={15} />
                          </button>
                          {a.estado === 'PENDIENTE' && (
                            <button onClick={() => abrirConfirmar(a)}
                              className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors" title="Confirmar"
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          {a.estado !== 'COMPLETADO' && a.estado !== 'CANCELADO' && (
                            <button onClick={() => abrirCancelar(a)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors" title="Cancelar"
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── MODAL DETALLE ─── */}
        {detalle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDetalle(null)}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Detalle del Agendamiento</h3>
                <button onClick={() => setDetalle(null)} className="text-gray-500 hover:text-white">&times;</button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Cliente</span><span className="text-white">{detalle.clienteNombre || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-white">{detalle.clienteEmail || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Vehículo</span><span className="text-white">{detalle.vehiculoPatente || '—'} — {detalle.vehiculoMarca || ''} {detalle.vehiculoModelo || ''}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Servicio</span><span className="text-white">{detalle.servicioNombre || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Fecha inicio</span><span className="text-white">{formatFecha(detalle.fechaInicio)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Fecha fin</span><span className="text-white">{formatFecha(detalle.fechaFin)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Estado</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${ESTADO_COLORS[detalle.estado] || ''}`}>{detalle.estado}</span>
                </div>
                <div className="flex justify-between"><span className="text-gray-400">Precio</span><span className="text-white">${detalle.precioAcordado?.toLocaleString?.('es-CL') || '—'}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL CONFIRMAR ─── */}
        {confirmarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setConfirmarModal(null)}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <CheckCircle size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Confirmar Agendamiento</h3>
                  <p className="text-gray-500 text-xs">Al confirmar se generará automáticamente la OT</p>
                </div>
              </div>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between"><span className="text-gray-400">Cliente</span><span className="text-white">{confirmarModal.clienteNombre}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Servicio</span><span className="text-white">{confirmarModal.servicioNombre}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Fecha</span><span className="text-white">{formatFecha(confirmarModal.fechaInicio)}</span></div>
              </div>
              <p className="text-xs text-yellow-400/80 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 mb-4">
                La asignación de técnico se habilitará cuando la entidad esté disponible en el backend.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmarModal(null)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button onClick={handleConfirmar} disabled={accionando}
                  className="flex-1 px-4 py-2 text-sm font-semibold bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {accionando ? 'Confirmando...' : 'Confirmar y generar OT'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL CANCELAR ─── */}
        {cancelarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setCancelarModal(null)}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle size={20} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cancelar Agendamiento</h3>
                  <p className="text-gray-500 text-xs">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">¿Estás seguro de cancelar este agendamiento?</p>
              <div className="flex gap-3">
                <button onClick={() => setCancelarModal(null)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Volver
                </button>
                <button onClick={handleCancelar} disabled={accionando}
                  className="flex-1 px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {accionando ? 'Cancelando...' : 'Cancelar agendamiento'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL CREAR (manual) ─── */}
        {crearModal && (
          <ModalCrearAgendamiento
            onClose={() => setCrearModal(false)}
            onCreado={() => { setCrearModal(false); cargar() }}
          />
        )}

      </div>
    </AdminLayout>
  )
}

// ─── Sub-componente: Modal Crear Agendamiento Manual ───
function ModalCrearAgendamiento({ onClose, onCreado }) {
  const [form, setForm] = useState({
    patente: '', servicioId: '', fecha: '', hora: '', nota: ''
  })
  const [servicios, setServicios] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    obtenerServicios().then(({ data }) => setServicios(Array.isArray(data) ? data : [])).catch(() => {})
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.patente || !form.servicioId || !form.fecha || !form.hora) {
      setError('Completa todos los campos requeridos')
      return
    }
    setGuardando(true)
    setError(null)
    try {
      const fechaInicio = `${form.fecha}T${form.hora}:00`
      await svc.crearAgendamientoAdmin({
        patente: form.patente.toUpperCase().trim(),
        idServicio: form.servicioId,
        fechaInicio,
        notaCliente: form.nota || undefined,
      })
      onCreado()
    } catch {
      setError('Error al crear el agendamiento')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Crear Agendamiento Manual</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">&times;</button>
        </div>
        {error && <p className="text-red-400 text-sm mb-3 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 font-semibold block mb-1">Patente *</label>
            <input name="patente" value={form.patente} onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500 uppercase"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold block mb-1">Servicio *</label>
            <select name="servicioId" value={form.servicioId} onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
            >
              <option value="">Seleccionar servicio</option>
              {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre} — ${s.precioBase?.toLocaleString?.('es-CL') || s.precioBase}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">Fecha *</label>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">Hora *</label>
              <input type="time" name="hora" value={form.hora} onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold block mb-1">Nota</label>
            <textarea name="nota" value={form.nota} onChange={handleChange} rows={2}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500 resize-none"
            />
          </div>
          <button type="submit" disabled={guardando}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {guardando ? 'Creando...' : 'Crear agendamiento'}
          </button>
        </form>
      </div>
    </div>
  )
}
