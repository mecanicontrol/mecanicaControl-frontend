import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import * as svc from '../../services/adminClientesService'
import { User, Star, Eye, X, TrendingUp, Users, Award, Activity } from 'lucide-react'

const NIVEL_COLOR = {
  BASICO:   'bg-gray-500/20 text-gray-300 border-gray-500/30',
  SILVER:   'bg-slate-400/20 text-slate-300 border-slate-400/30',
  GOLD:     'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PLATINUM: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('')
  const [detalle, setDetalle]  = useState(null)

  useEffect(() => {
    svc.obtenerClientes()
      .then(({ data }) => setClientes(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  const filtrados = clientes.filter(c => {
    const nombre = `${c.usuario?.nombre ?? ''} ${c.usuario?.apellido ?? ''}`.toLowerCase()
    const email  = c.usuario?.email?.toLowerCase() ?? ''
    const matchBusq  = !busqueda  || nombre.includes(busqueda.toLowerCase()) || email.includes(busqueda.toLowerCase())
    const matchNivel = !filtroNivel || c.nivelFidelizacion === filtroNivel
    return matchBusq && matchNivel
  })

  const stats = {
    total:    clientes.length,
    gold:     clientes.filter(c => c.nivelFidelizacion === 'GOLD').length,
    platinum: clientes.filter(c => c.nivelFidelizacion === 'PLATINUM').length,
    puntosProm: clientes.length
      ? Math.round(clientes.reduce((s, c) => s + (c.puntos || 0), 0) / clientes.length)
      : 0,
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">Clientes</h2>
          <p className="text-gray-500 text-sm mt-0.5">Gestión de clientes y fidelización</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total clientes', value: stats.total,    icon: Users,    color: 'text-white' },
            { label: 'Gold',           value: stats.gold,     icon: Star,     color: 'text-yellow-400' },
            { label: 'Platinum',       value: stats.platinum, icon: Award,    color: 'text-purple-400' },
            { label: 'Puntos prom.',   value: stats.puntosProm, icon: TrendingUp, color: 'text-orange-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
                <Icon size={14} className="text-gray-600" />
              </div>
              <p className={`text-2xl font-black ${color}`}>{value.toLocaleString('es-CL')}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-orange-500"
          />
          <select
            value={filtroNivel}
            onChange={e => setFiltroNivel(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500 min-w-[160px]"
          >
            <option value="">Todos los niveles</option>
            {['BASICO', 'SILVER', 'GOLD', 'PLATINUM'].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* Tabla */}
        {cargando ? (
          <p className="text-gray-500 text-center py-12 animate-pulse">Cargando clientes...</p>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                  {['Cliente', 'Email', 'Nivel', 'Puntos', 'Descuento', ''].map((h, i) => (
                    <th key={i} className={`px-4 py-3 ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtrados.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-600">No hay clientes</td></tr>
                )}
                {filtrados.map(c => (
                  <tr key={c.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                          <User size={13} className="text-orange-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-xs">{c.usuario?.nombre} {c.usuario?.apellido}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{c.usuario?.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${NIVEL_COLOR[c.nivelFidelizacion] || 'bg-gray-700 text-gray-400'}`}>
                        {c.nivelFidelizacion || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-orange-400 font-bold text-xs">{(c.puntos || 0).toLocaleString('es-CL')} pts</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{c.descuento != null ? `${c.descuento}%` : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDetalle(c)}
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

      {/* Modal detalle cliente */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setDetalle(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <User size={18} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-black">{detalle.usuario?.nombre} {detalle.usuario?.apellido}</p>
                  <p className="text-gray-500 text-xs">{detalle.usuario?.email}</p>
                </div>
              </div>
              <button onClick={() => setDetalle(null)} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Nivel</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${NIVEL_COLOR[detalle.nivelFidelizacion] || ''}`}>
                    {detalle.nivelFidelizacion || '—'}
                  </span>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Puntos</p>
                  <p className="text-orange-400 font-black">{(detalle.puntos || 0).toLocaleString('es-CL')}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Descuento</p>
                  <p className="text-white font-bold">{detalle.descuento != null ? `${detalle.descuento}%` : '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Estado</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  detalle.usuario?.activo ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {detalle.usuario?.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}