import { useState } from 'react'
import { Search, Car, User, Wrench, AlertCircle } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import LineaTiempoOT from '../../components/seguimiento/LineaTiempoOT'
import { buscarOT } from '../../services/seguimientoService'

const ESTADO_OT_LABEL = {
  ACTIVA:          'Activa',
  EN_PROCESO:      'En proceso',
  CONTROL_CALIDAD: 'Control de calidad',
  LISTA_ENTREGA:   'Lista para entrega',
  COMPLETADA:      'Completada',
}

const ESTADO_OT_COLOR = {
  ACTIVA:          'bg-gray-100 text-gray-600',
  EN_PROCESO:      'bg-orange-100 text-orange-700',
  CONTROL_CALIDAD: 'bg-purple-100 text-purple-700',
  LISTA_ENTREGA:   'bg-blue-100 text-blue-700',
  COMPLETADA:      'bg-green-100 text-green-700',
}

function fmt(f) {
  if (!f) return null
  return new Date(f).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function Seguimiento() {
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const buscar = async (e) => {
    e.preventDefault()
    if (!codigo.trim()) return
    setCargando(true)
    setError('')
    setResultado(null)
    try {
      const { data } = await buscarOT(codigo)
      setResultado(data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Código no encontrado. Verifica que el código esté escrito correctamente (ej: OT-2026-0001).')
      } else {
        setError('Error al buscar. Intenta nuevamente.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[220px] flex items-center justify-center text-white overflow-hidden shrink-0">
        <img
          src="/hero-taller.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => { e.target.style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-blue-950/85" />
        <div className="relative z-10 text-center px-4">
          <p className="text-xs uppercase tracking-[3px] mb-3 text-orange-400 font-semibold">
            MecaniControl
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Seguimiento de tu Vehículo
          </h1>
          <p className="text-sm text-gray-300 mt-2">
            Ingresa tu código de orden de trabajo para ver el estado en tiempo real
          </p>
        </div>
      </section>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">

        {/* Buscador */}
        <form onSubmit={buscar} className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej: OT-2026-0001"
              maxLength={20}
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={cargando || !codigo.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black px-8 py-3.5 rounded-xl uppercase text-sm tracking-wider transition-colors shadow-sm"
          >
            {cargando ? '...' : 'Buscar'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 mb-6">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Resultado */}
        {resultado && (
          <div className="space-y-5">

            {/* Cabecera OT */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-5 pb-5 border-b border-gray-100">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                    Orden de Trabajo
                  </p>
                  <p className="text-2xl font-black text-gray-800 font-mono tracking-wide">
                    {resultado.codigoOt}
                  </p>
                </div>
                {resultado.estadoOt && (
                  <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide ${
                    ESTADO_OT_COLOR[resultado.estadoOt] ?? 'bg-gray-100 text-gray-600'
                  }`}>
                    {ESTADO_OT_LABEL[resultado.estadoOt] ?? resultado.estadoOt}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {resultado.vehiculoPatente && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <Car size={14} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Vehículo</p>
                      {resultado.vehiculoDescripcion && (
                        <p className="font-bold text-gray-800">{resultado.vehiculoDescripcion}</p>
                      )}
                      <p className="text-xs font-mono text-gray-500 mt-0.5">{resultado.vehiculoPatente}</p>
                    </div>
                  </div>
                )}

                {resultado.nombreServicio && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <Wrench size={14} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Servicio</p>
                      <p className="font-bold text-gray-800">{resultado.nombreServicio}</p>
                    </div>
                  </div>
                )}

                {resultado.nombreTecnico && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <User size={14} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Técnico asignado</p>
                      <p className="font-bold text-gray-800">{resultado.nombreTecnico}</p>
                    </div>
                  </div>
                )}

                {resultado.fechaInicio && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <Search size={14} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Inicio</p>
                      <p className="font-bold text-gray-800">{fmt(resultado.fechaInicio)}</p>
                      {resultado.fechaCierre && (
                        <p className="text-xs text-gray-500">Cerrado: {fmt(resultado.fechaCierre)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Línea de tiempo */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                Estado del servicio
              </p>
              <LineaTiempoOT fases={resultado.fases ?? []} prediccion={resultado.prediccion} />
            </div>

          </div>
        )}

        {/* Vacío inicial */}
        {!resultado && !error && !cargando && (
          <div className="text-center py-20 text-gray-400">
            <Search size={44} className="mx-auto mb-4 text-gray-300" />
            <p className="text-sm font-semibold">Ingresa el código de tu OT para comenzar</p>
            <p className="text-xs mt-2 max-w-xs mx-auto leading-relaxed">
              El código fue enviado por email al confirmar tu agendamiento (formato: OT-2026-XXXX)
            </p>
          </div>
        )}

      </div>

      <Footer />
    </div>
  )
}