import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import * as svc from '../../services/adminConfiguracionService'
import { Save, Building2, MapPin, Phone, Mail, Clock, Truck, Gift, Bell, BellOff } from 'lucide-react'

export default function Configuracion() {
  const [config, setConfig] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  const cargar = async () => {
    setCargando(true)
    try {
      const { data } = await svc.obtenerConfiguracion()
      setConfig(data)
    } catch {
      setError('Error al cargar configuración')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const handleChange = (seccion, campo, valor) => {
    setConfig(prev => ({
      ...prev,
      [seccion]: { ...prev[seccion], [campo]: valor }
    }))
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      await svc.actualizarConfiguracion(config)
      setMensaje('Configuración guardada correctamente')
      setTimeout(() => setMensaje(null), 4000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al guardar la configuración')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">Configuración</h2>
          <p className="text-gray-500 animate-pulse">Cargando configuración...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error && !config) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">Configuración</h2>
          <p className="text-red-400">{error}</p>
          <button onClick={cargar} className="text-orange-500 text-sm hover:underline">Reintentar</button>
        </div>
      </AdminLayout>
    )
  }

  const taller = config?.taller || config || {}
  const fidelizacion = config?.fidelizacion || {}
  const notificaciones = config?.notificaciones || {}

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">Configuración</h2>
          <p className="text-gray-500 text-sm mt-0.5">Parámetros generales del sistema</p>
        </div>

        {mensaje && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/30">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleGuardar} className="space-y-6">

          {/* ─── DATOS DEL TALLER ─── */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
              <Building2 size={18} className="text-orange-500" />
              <h3 className="text-base font-bold text-white uppercase tracking-wide">Datos del Taller</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Nombre del taller</label>
                <input value={taller.nombre || ''} onChange={(e) => handleChange('taller', 'nombre', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Email de contacto</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" value={taller.email || ''} onChange={(e) => handleChange('taller', 'email', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Dirección</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={taller.direccion || ''} onChange={(e) => handleChange('taller', 'direccion', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Teléfono de contacto</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={taller.telefono || ''} onChange={(e) => handleChange('taller', 'telefono', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Hora de apertura</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="time" value={taller.horaApertura || ''} onChange={(e) => handleChange('taller', 'horaApertura', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Hora de cierre</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="time" value={taller.horaCierre || ''} onChange={(e) => handleChange('taller', 'horaCierre', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Capacidad máxima simultánea</label>
                <div className="relative">
                  <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="number" min="1" value={taller.capacidadMaxima || ''} onChange={(e) => handleChange('taller', 'capacidadMaxima', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">Afecta inmediatamente la disponibilidad de slots.</p>
              </div>
            </div>
          </div>

          {/* ─── FIDELIZACIÓN ─── */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
              <Gift size={18} className="text-orange-500" />
              <h3 className="text-base font-bold text-white uppercase tracking-wide">Fidelización</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Sistema de puntos activo</p>
                  <p className="text-xs text-gray-500 mt-0.5">Los clientes acumulan puntos por cada servicio</p>
                </div>
                <button type="button"
                  onClick={() => handleChange('fidelizacion', 'activo', !fidelizacion.activo)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${fidelizacion.activo !== false ? 'bg-orange-500' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${fidelizacion.activo !== false ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">
                    Puntos otorgados por cada $1.000 gastados
                  </label>
                  <input type="number" min="0" value={fidelizacion.puntosPorMil || ''}
                    onChange={(e) => handleChange('fidelizacion', 'puntosPorMil', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─── NOTIFICACIONES ─── */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
              <Bell size={18} className="text-orange-500" />
              <h3 className="text-base font-bold text-white uppercase tracking-wide">Notificaciones</h3>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'emailConfirmacion', label: 'Email al confirmar agendamiento', desc: 'Se envía cuando el admin confirma la cita' },
                { key: 'emailRecordatorio', label: 'Email de recordatorio', desc: 'Recordatorio 24h antes de la cita' },
                { key: 'emailOTCompletada', label: 'Email al completar OT', desc: 'Se envía cuando la orden de trabajo se completa' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <button type="button"
                    onClick={() => handleChange('notificaciones', key, !notificaciones[key])}
                    className={`w-12 h-6 rounded-full transition-colors relative ${notificaciones[key] ? 'bg-orange-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notificaciones[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ─── BOTÓN GUARDAR ─── */}
          <div className="flex justify-end">
            <button type="submit" disabled={guardando}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Save size={16} />
              {guardando ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  )
}
