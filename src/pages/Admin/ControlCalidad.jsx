import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import api from '../../api/axiosInstance'
import { CheckCircle, XCircle, ShieldCheck, RefreshCw, Image } from 'lucide-react'

function Fotos({ imagenes }) {
  let urls = []
  try { urls = JSON.parse(imagenes || '[]') } catch { urls = [] }
  if (urls.length === 0) return <p className="text-xs text-gray-600 italic">Sin fotos adjuntas</p>
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {urls.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
          <img src={url} alt={`foto-${i}`} className="w-20 h-20 object-cover rounded-lg border border-gray-700 hover:border-orange-500 transition" />
        </a>
      ))}
    </div>
  )
}

function TarjetaCC({ item, onActualizar }) {
  const [nota, setNota]           = useState('')
  const [procesando, setProcesando] = useState(null)
  const [msg, setMsg]             = useState(null)

  const accion = async (tipo) => {
    if (tipo === 'rechazar' && !nota.trim()) {
      setMsg({ tipo: 'error', texto: 'Escribe el motivo del rechazo.' }); return
    }
    setProcesando(tipo)
    setMsg(null)
    try {
      await api.post(`/api/admin/control-calidad/${item.faseId}/${tipo}`, { nota: nota.trim() || null })
      setMsg({
        tipo: 'ok',
        texto: tipo === 'aprobar'
          ? 'Aprobado — OT avanza a Lista para entrega.'
          : 'Rechazado — el técnico debe corregir y volver a solicitar.'
      })
      setTimeout(() => onActualizar(), 1500)
    } catch (e) {
      setMsg({ tipo: 'error', texto: e.response?.data?.message ?? 'Error al procesar.' })
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-5">
      {/* Info OT */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-orange-500 font-black uppercase tracking-widest mb-0.5">Control de calidad</p>
          <p className="text-2xl font-black text-white font-mono">{item.codigoOt}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
            {item.patente  && <span className="text-xs text-gray-500">Patente: <span className="font-bold text-gray-300">{item.patente}</span></span>}
            {item.vehiculo && <span className="text-xs text-gray-500">Vehículo: <span className="font-bold text-gray-300">{item.vehiculo}</span></span>}
            {item.tecnico  && <span className="text-xs text-gray-500">Técnico: <span className="font-bold text-gray-300">{item.tecnico}</span></span>}
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
          Pendiente aprobación
        </span>
      </div>

      {/* Observaciones */}
      {item.observaciones && (
        <div className="bg-gray-800/50 rounded-xl px-4 py-3">
          <p className="text-xs font-black text-gray-400 uppercase mb-1">Observaciones del técnico</p>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{item.observaciones}</p>
        </div>
      )}

      {/* Fotos */}
      <div>
        <p className="text-xs font-black text-gray-400 uppercase mb-2 flex items-center gap-1.5">
          <Image size={12} /> Evidencia fotográfica
        </p>
        <Fotos imagenes={item.imagenes} />
      </div>

      {/* Nota y acciones */}
      <div className="space-y-3 pt-2 border-t border-gray-800">
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1.5">
            Nota (opcional al aprobar, obligatoria al rechazar)
          </label>
          <textarea
            value={nota}
            onChange={e => setNota(e.target.value)}
            rows={2}
            placeholder="Ej: Todo en orden. / Hay goteo de aceite, revisar sello."
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
            {procesando === 'rechazar' ? 'Rechazando...' : 'Rechazar — volver a técnico'}
          </button>
          <button
            onClick={() => accion('aprobar')}
            disabled={!!procesando}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 disabled:opacity-50 transition"
          >
            <CheckCircle size={15} />
            {procesando === 'aprobar' ? 'Aprobando...' : 'Aprobar — lista para entrega'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ControlCalidad() {
  const [items, setItems]     = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const { data } = await api.get('/api/admin/control-calidad/pendientes')
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-orange-500 font-black tracking-[0.3em] text-xs uppercase mb-1">Admin / Control</p>
            <h1 className="text-3xl font-black text-white uppercase">Control de Calidad</h1>
            <p className="text-gray-500 text-sm mt-1">
              Revisa las OT donde el técnico solicita aprobación final antes de entregar al cliente.
            </p>
          </div>
          <button onClick={cargar} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 transition">
            <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>

        {/* KPI */}
        {items.length > 0 && (
          <div className="mb-5 bg-purple-500/10 border border-purple-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-purple-400 font-black text-2xl">{items.length}</span>
            <span className="text-purple-400 text-sm font-semibold">
              OT{items.length !== 1 ? 's' : ''} pendiente{items.length !== 1 ? 's' : ''} de control de calidad
            </span>
          </div>
        )}

        {/* Lista */}
        {cargando ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="h-48 bg-gray-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-black uppercase text-sm">Sin órdenes pendientes de control</p>
            <p className="text-xs mt-1">Todas las OTs están al día.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map(item => (
              <TarjetaCC key={item.faseId} item={item} onActualizar={cargar} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}