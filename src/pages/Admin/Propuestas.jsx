import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axiosInstance'
import { CheckCircle, XCircle, ChevronDown, ChevronUp, ClipboardList, RefreshCw } from 'lucide-react'

const ESTADO_LABEL = {
  PENDIENTE_ADMIN: { label: 'Pendiente revisión', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  ENVIADA_CLIENTE: { label: 'Enviada al cliente', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  RECHAZADA_ADMIN: { label: 'Rechazada por admin', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

function BadgeEstado({ estado }) {
  const e = ESTADO_LABEL[estado] || { label: estado, cls: 'bg-gray-500/20 text-gray-400' }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase border ${e.cls}`}>{e.label}</span>
  )
}

function TarjetaPropuesta({ p, onActualizar }) {
  const [expandido, setExpandido] = useState(p.estado === 'PENDIENTE_ADMIN')
  const [nota, setNota] = useState('')
  const [procesando, setProcesando] = useState(null) // 'aprobar' | 'rechazar'
  const [msg, setMsg] = useState(null)

  const accion = async (tipo) => {
    if (tipo === 'rechazar' && !nota.trim()) {
      setMsg({ tipo: 'error', texto: 'Escribe una nota antes de rechazar.' }); return
    }
    setProcesando(tipo)
    setMsg(null)
    try {
      await api.post(`/api/admin/propuestas/${p.id}/${tipo}`, { nota: nota.trim() || null })
      setMsg({ tipo: 'ok', texto: tipo === 'aprobar' ? 'Aprobada — email enviado al cliente.' : 'Rechazada.' })
      setTimeout(() => onActualizar(), 1500)
    } catch (e) {
      setMsg({ tipo: 'error', texto: e.response?.data?.message ?? 'Error al procesar.' })
    } finally {
      setProcesando(null)
    }
  }

  const total = (p.servicios || []).reduce((s, sv) => s + Number(sv.precioBase ?? 0), 0)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-800/50 transition text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <ClipboardList size={16} className="text-orange-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className="font-black text-white font-mono">{p.codigoOt}</span>
            <span className="text-gray-500 text-xs ml-2">{p.patente}</span>
            {p.vehiculo && <span className="text-gray-500 text-xs ml-1">· {p.vehiculo}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <BadgeEstado estado={p.estado} />
          {p.tecnico && <span className="text-xs text-gray-500 hidden sm:block">{p.tecnico}</span>}
          {expandido ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </div>
      </button>

      {expandido && (
        <div className="border-t border-gray-800 px-5 py-5 space-y-5">
          {/* Servicios propuestos */}
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Servicios propuestos</p>
            <div className="space-y-2">
              {(p.servicios || []).map(s => (
                <div key={s.id} className="flex items-start justify-between gap-3 bg-gray-800/60 rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-black text-sm text-white">{s.nombre}</p>
                    {s.descripcion && <p className="text-xs text-gray-400 mt-0.5">{s.descripcion}</p>}
                    {!s.incluidoEnOriginal && (
                      <span className="inline-block mt-1 text-[10px] font-black uppercase bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                        Servicio adicional
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-black text-white flex-shrink-0">
                    ${Number(s.precioBase ?? 0).toLocaleString('es-CL')}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
              <span className="text-sm text-gray-400 font-semibold">Total estimado</span>
              <span className="text-lg font-black text-orange-400">${total.toLocaleString('es-CL')}</span>
            </div>
          </div>

          {/* Nota del técnico */}
          {p.notaTecnico && (
            <div className="bg-gray-800/40 rounded-xl px-4 py-3">
              <p className="text-xs font-black text-gray-400 uppercase mb-1">Nota del técnico</p>
              <p className="text-sm text-gray-300">{p.notaTecnico}</p>
            </div>
          )}

          {/* Nota admin (si ya fue procesada) */}
          {p.notaAdmin && (
            <div className="bg-gray-800/40 rounded-xl px-4 py-3">
              <p className="text-xs font-black text-gray-400 uppercase mb-1">Nota admin</p>
              <p className="text-sm text-gray-300">{p.notaAdmin}</p>
            </div>
          )}

          {/* Acciones solo si está pendiente */}
          {p.estado === 'PENDIENTE_ADMIN' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                  Nota para el técnico (opcional al aprobar, obligatoria al rechazar)
                </label>
                <textarea
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  rows={2}
                  placeholder="Ej: Revisar el presupuesto del ítem 2..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              {msg && (
                <p className={`text-xs font-semibold px-3 py-2 rounded-lg ${msg.tipo === 'ok' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {msg.texto}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => accion('rechazar')}
                  disabled={!!procesando}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 disabled:opacity-50 transition"
                >
                  <XCircle size={15} />
                  {procesando === 'rechazar' ? 'Rechazando...' : 'Rechazar'}
                </button>
                <button
                  onClick={() => accion('aprobar')}
                  disabled={!!procesando}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 disabled:opacity-50 transition"
                >
                  <CheckCircle size={15} />
                  {procesando === 'aprobar' ? 'Aprobando...' : 'Aprobar y enviar al cliente'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Propuestas() {
  const [propuestas, setPropuestas] = useState([])
  const [cargando, setCargando]     = useState(true)
  const [filtro, setFiltro]         = useState('PENDIENTE_ADMIN')

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const estado = filtro === 'TODAS' ? 'TODAS' : filtro
      const { data } = await api.get(`/api/admin/propuestas?estado=${estado}`)
      setPropuestas(data)
    } catch {
      setPropuestas([])
    } finally {
      setCargando(false)
    }
  }, [filtro])

  useEffect(() => { cargar() }, [cargar])

  const pendientes = propuestas.filter(p => p.estado === 'PENDIENTE_ADMIN').length

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-orange-500 font-black tracking-[0.3em] text-xs uppercase mb-1">Admin / Propuestas</p>
            <h1 className="text-3xl font-black text-white uppercase">Propuestas de diagnóstico</h1>
            <p className="text-gray-500 text-sm mt-1">
              El técnico propone servicios → el admin aprueba → el cliente responde.
            </p>
          </div>
          <button onClick={cargar} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 transition">
            <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>

        {/* KPI pendientes */}
        {pendientes > 0 && (
          <div className="mb-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-yellow-400 font-black text-2xl">{pendientes}</span>
            <span className="text-yellow-400 text-sm font-semibold">
              propuesta{pendientes !== 1 ? 's' : ''} pendiente{pendientes !== 1 ? 's' : ''} de revisión
            </span>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-5">
          {['PENDIENTE_ADMIN', 'ENVIADA_CLIENTE', 'RECHAZADA_ADMIN', 'TODAS'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${
                filtro === f ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f === 'PENDIENTE_ADMIN' ? 'Pendientes' : f === 'ENVIADA_CLIENTE' ? 'Al cliente' : f === 'RECHAZADA_ADMIN' ? 'Rechazadas' : 'Todas'}
            </button>
          ))}
        </div>

        {/* Lista */}
        {cargando ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : propuestas.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-black uppercase text-sm">Sin propuestas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {propuestas.map(p => (
              <TarjetaPropuesta key={p.id} p={p} onActualizar={cargar} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}