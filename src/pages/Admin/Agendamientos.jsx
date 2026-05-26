import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import * as svc from '../../services/adminAgendamientoService'
import { obtenerServicios } from '../../services/adminCatalogosService'
import { obtenerUsuarios } from '../../services/adminUsuariosService'
import {
  Search, Filter, Eye, CheckCircle, XCircle, Plus, Calendar,
  AlertTriangle, Info
} from 'lucide-react'

const ESTADOS = ['PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO']
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

  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFecha, setFiltroFecha]   = useState('')

  const [detalle, setDetalle]           = useState(null)
  const [confirmarModal, setConfirmarModal] = useState(null)
  const [cancelarModal, setCancelarModal]   = useState(null)
  const [crearModal, setCrearModal]         = useState(false)

  const [accionando, setAccionando] = useState(false)
  const [mensaje, setMensaje]       = useState(null)

  const cargar = async () => {
    setCargando(true)
    setError(null)
    try {
      const params = {}
      if (filtroEstado) params.estado = filtroEstado
      if (filtroFecha)  params.fecha  = filtroFecha
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
    setFiltroEstado(''); setFiltroFecha('')
    setTimeout(cargar, 0)
  }

  const abrirConfirmar = (a) => {
    if (a.estadoAgendamiento !== 'PENDIENTE') {
      setMensaje({ tipo: 'error', texto: `Solo se pueden confirmar agendamientos PENDIENTE (actual: ${a.estadoAgendamiento})` })
      return
    }
    setConfirmarModal(a)
  }

  const handleConfirmar = async (tecnicoId) => {
    if (!confirmarModal) return
    setAccionando(true)
    try {
      await svc.confirmarAgendamiento(confirmarModal.idAgendamiento, tecnicoId)
      setMensaje({ tipo: 'ok', texto: 'Agendamiento confirmado correctamente.' })
      setConfirmarModal(null)
      cargar()
    } catch (e) {
      const msg = e.response?.data?.message ?? e.response?.data ?? 'Error al confirmar.'
      setMensaje({ tipo: 'error', texto: typeof msg === 'string' ? msg : 'Error al confirmar.' })
    } finally {
      setAccionando(false)
    }
  }

  const abrirCancelar = (a) => {
    if (a.estadoAgendamiento === 'COMPLETADO') {
      setMensaje({ tipo: 'error', texto: 'No se puede cancelar un agendamiento COMPLETADO' })
      return
    }
    if (a.estadoAgendamiento === 'CANCELADO') {
      setMensaje({ tipo: 'error', texto: 'El agendamiento ya está CANCELADO' })
      return
    }
    setCancelarModal(a)
  }

  const handleCancelar = async () => {
    if (!cancelarModal) return
    setAccionando(true)
    try {
      await svc.cancelarAgendamientoAdmin(cancelarModal.idAgendamiento)
      setMensaje({ tipo: 'ok', texto: 'Agendamiento cancelado' })
      setCancelarModal(null)
      cargar()
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al cancelar' })
    } finally {
      setAccionando(false)
    }
  }

  const fmt = (f) => f ? new Date(f).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

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
            <Plus size={16} /> Crear agendamiento
          </button>
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
            mensaje.tipo === 'ok'
              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
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
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-gray-500 font-semibold block mb-1">Fecha</label>
              <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              />
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
          <div className="space-y-2">
            {[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-800 rounded-xl animate-pulse" />)}
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
                    <tr key={a.idAgendamiento} className="hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{a.nombreCliente || '—'}</p>
                        <p className="text-gray-500 text-xs">{a.emailCliente || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-mono">{a.patenteVehiculo || '—'}</p>
                        <p className="text-gray-500 text-xs">{[a.marcaVehiculo, a.modeloVehiculo].filter(Boolean).join(' ')}</p>
                      </td>
                      <td className="px-4 py-3 text-white">{a.nombreServicio || '—'}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{fmt(a.fechaInicio)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          ESTADO_COLORS[a.estadoAgendamiento] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}>
                          {a.estadoAgendamiento || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setDetalle(detalle?.idAgendamiento === a.idAgendamiento ? null : a)}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" title="Ver detalle"
                          >
                            <Eye size={15} />
                          </button>
                          {a.estadoAgendamiento === 'PENDIENTE' && (
                            <button onClick={() => abrirConfirmar(a)}
                              className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors" title="Confirmar"
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          {a.estadoAgendamiento !== 'COMPLETADO' && a.estadoAgendamiento !== 'CANCELADO' && (
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
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Detalle del Agendamiento</h3>
                <button onClick={() => setDetalle(null)} className="text-gray-500 hover:text-white text-xl leading-none">&times;</button>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ['Cliente',       detalle.nombreCliente],
                  ['Email',         detalle.emailCliente],
                  ['Teléfono',      detalle.telefonoCliente],
                  ['Vehículo',      `${detalle.patenteVehiculo || '—'} — ${[detalle.marcaVehiculo, detalle.modeloVehiculo, detalle.anioVehiculo].filter(Boolean).join(' ')}`],
                  ['Servicio',      detalle.nombreServicio],
                  ['Técnico',       detalle.nombreTecnico || 'Sin asignar'],
                  ['Fecha inicio',  fmt(detalle.fechaInicio)],
                  ['Fecha fin',     fmt(detalle.fechaFin)],
                  ['Precio',        detalle.precioAcordado != null ? `$${detalle.precioAcordado.toLocaleString('es-CL')}` : '—'],
                ].map(([label, valor]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-gray-400 flex-shrink-0">{label}</span>
                    <span className="text-white text-right">{valor || '—'}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${ESTADO_COLORS[detalle.estadoAgendamiento] || ''}`}>
                    {detalle.estadoAgendamiento}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL CONFIRMAR ─── */}
        {confirmarModal && (
          <ModalConfirmar
            agendamiento={confirmarModal}
            accionando={accionando}
            onClose={() => setConfirmarModal(null)}
            onConfirmar={handleConfirmar}
            fmt={fmt}
          />
        )}

        {/* ─── MODAL CANCELAR ─── */}
        {cancelarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setCancelarModal(null)}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <XCircle size={20} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cancelar Agendamiento</h3>
                  <p className="text-gray-500 text-xs">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-5">
                <div className="flex justify-between"><span className="text-gray-400">Cliente</span><span className="text-white">{cancelarModal.nombreCliente}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Servicio</span><span className="text-white">{cancelarModal.nombreServicio}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Fecha</span><span className="text-white">{fmt(cancelarModal.fechaInicio)}</span></div>
              </div>
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

        {/* ─── MODAL CREAR ─── */}
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

// ─── Modal Confirmar con selector de técnico ───
function ModalConfirmar({ agendamiento, accionando, onClose, onConfirmar, fmt }) {
  const [tecnicos, setTecnicos] = useState([])
  const [tecnicoId, setTecnicoId] = useState('')
  const [cargandoTec, setCargandoTec] = useState(true)

  useEffect(() => {
    obtenerUsuarios()
      .then(({ data }) => {
        const lista = Array.isArray(data) ? data : []
        setTecnicos(lista.filter(u => u.rol === 'TECNICO'))
      })
      .catch(() => {})
      .finally(() => setCargandoTec(false))
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Confirmar Agendamiento</h3>
            <p className="text-gray-500 text-xs">Asigna un técnico para confirmar la cita</p>
          </div>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between"><span className="text-gray-400">Cliente</span><span className="text-white">{agendamiento.nombreCliente}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Servicio</span><span className="text-white">{agendamiento.nombreServicio}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Fecha</span><span className="text-white">{fmt(agendamiento.fechaInicio)}</span></div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-400 font-semibold block mb-1.5 uppercase tracking-wider">Técnico asignado *</label>
          {cargandoTec ? (
            <div className="h-10 bg-gray-700 rounded-lg animate-pulse" />
          ) : tecnicos.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
              <Info size={14} /> No hay técnicos registrados. Crea usuarios con rol TECNICO primero.
            </div>
          ) : (
            <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
            >
              <option value="">Seleccionar técnico...</option>
              {tecnicos.map(t => (
                <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-blue-400/80 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 mb-4">
          <Info size={13} /> La confirmación genera automáticamente la Orden de Trabajo.
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(tecnicoId || null)}
            disabled={accionando || tecnicos.length === 0}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {accionando ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Crear Agendamiento Manual ───
function ModalCrearAgendamiento({ onClose, onCreado }) {
  const [form, setForm] = useState({ patente: '', servicioId: '', fecha: '', hora: '', nota: '' })
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
      await svc.crearAgendamientoAdmin({
        patente: form.patente.toUpperCase().trim(),
        idServicio: form.servicioId,
        fechaInicio: `${form.fecha}T${form.hora}:00`,
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
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">&times;</button>
        </div>
        {error && <p className="text-red-400 text-sm mb-3 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 font-semibold block mb-1">Patente *</label>
            <input name="patente" value={form.patente} onChange={handleChange} placeholder="ABCD12"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500 uppercase"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold block mb-1">Servicio *</label>
            <select name="servicioId" value={form.servicioId} onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
            >
              <option value="">Seleccionar servicio</option>
              {servicios.map(s => (
                <option key={s.id} value={s.id}>{s.nombre} — ${s.precioBase?.toLocaleString?.('es-CL') || s.precioBase}</option>
              ))}
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