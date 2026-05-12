import { useState, useEffect } from 'react'
import { Bot, Car } from 'lucide-react'
import { obtenerMarcas, obtenerModelos } from '../../services/marcasService'
import SelectorVehiculoPerfil            from '../shared/SelectorVehiculoPerfil'

const URGENCIA_COLOR = {
  URGENTE: 'text-red-500',
  MEDIA:   'text-yellow-500',
  NORMAL:  'text-green-500',
}

const inputClass = 'w-full bg-gray-50 border border-gray-300 text-gray-800 px-3 py-2 rounded text-sm focus:outline-none focus:border-orange-500'

export default function DiagnosticoIA({ vehiculo, setVehiculo, descripcionFallo, setDescripcionFallo, onAnalizar, cargando, resultado, error }) {
  const [marcas, setMarcas]   = useState([])
  const [modelos, setModelos] = useState([])

  useEffect(() => {
    obtenerMarcas().then(({ data }) => setMarcas(data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!vehiculo.marcaId) { setModelos([]); return }
    obtenerModelos(vehiculo.marcaId).then(({ data }) => setModelos(data)).catch(() => setModelos([]))
  }, [vehiculo.marcaId])

  const handleMarca = (e) => {
    const marcaId = e.target.value
    const marcaNombre = marcas.find(m => m.id === marcaId)?.nombre ?? ''
    setVehiculo({ ...vehiculo, marcaId, marca: marcaNombre, modeloId: '', modelo: '' })
  }

  const handleModelo = (e) => {
    const modeloId = e.target.value
    const modeloNombre = modelos.find(m => m.id === modeloId)?.nombre ?? ''
    setVehiculo({ ...vehiculo, modeloId, modelo: modeloNombre })
  }

  const handleChange = (e) => setVehiculo({ ...vehiculo, [e.target.name]: e.target.value })

  return (
    <section className="text-gray-800 space-y-4">

      {/* Datos del vehículo */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-gray-800 font-bold text-lg flex items-center gap-2 mb-4">
          <Car size={18} className="text-orange-500" />
          IDENTIFICACIÓN DEL VEHÍCULO
        </h2>

        {/* Selector de vehículos del perfil */}
        <SelectorVehiculoPerfil vehiculo={vehiculo} setVehiculo={setVehiculo} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {/* MARCA */}
          <div>
            <label className="block text-xs text-gray-500 font-bold uppercase mb-1">MARCA</label>
            <select
              value={vehiculo.marcaId ?? ''}
              onChange={handleMarca}
              className={inputClass}
            >
              <option value="">Selecciona</option>
              {marcas.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          {/* MODELO */}
          <div>
            <label className="block text-xs text-gray-500 font-bold uppercase mb-1">MODELO</label>
            <select
              value={vehiculo.modeloId ?? ''}
              onChange={handleModelo}
              disabled={!vehiculo.marcaId}
              className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">Selecciona</option>
              {modelos.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          {/* AÑO */}
          <div>
            <label className="block text-xs text-gray-500 font-bold uppercase mb-1">AÑO</label>
            <input
              type="number"
              name="anio"
              value={vehiculo.anio ?? ''}
              onChange={(e) => { if (e.target.value.length <= 4) handleChange(e) }}
              placeholder="2024"
              min="1900"
              max="2100"
              className={inputClass}
            />
          </div>

          {/* KILOMETRAJE */}
          <div>
            <label className="block text-xs text-gray-500 font-bold uppercase mb-1">KILOMETRAJE</label>
            <input
              type="number"
              name="kilometraje"
              value={vehiculo.kilometraje ?? ''}
              onChange={(e) => { if (e.target.value.length <= 6) handleChange(e) }}
              placeholder="50000"
              min="0"
              className={inputClass}
            />
          </div>

        </div>

        {/* PATENTE */}
        <div className="mt-4 max-w-xs">
          <label className="block text-xs text-gray-500 font-bold uppercase mb-1">PATENTE</label>
          <input
            type="text"
            name="patente"
            value={vehiculo.patente ?? ''}
            onChange={(e) => handleChange({ target: { name: 'patente', value: e.target.value.toUpperCase() } })}
            placeholder="Ej: ABCD12"
            maxLength={8}
            className={inputClass}
          />
        </div>

      </div>

      {/* Diagnóstico IA */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 w-full">
        <h1 className="text-3xl font-bold mb-1">Diagnóstico Inteligente</h1>
        <p className="text-gray-400 mb-4 text-sm">
          Describe los síntomas o ruidos de tu vehículo y deja que nuestra IA prediga la falla técnica.
        </p>

        <textarea
          className="w-full h-40 p-4 rounded-lg text-gray-800 bg-gray-50 border border-gray-300 resize-none mb-4 focus:outline-none focus:border-orange-500"
          placeholder="Ej: Escucho un chillido metálico al frenar y el pedal se siente esponjoso..."
          value={descripcionFallo}
          onChange={(e) => setDescripcionFallo(e.target.value)}
        />

        <button
          onClick={onAnalizar}
          disabled={cargando || !descripcionFallo.trim()}
          className="bg-orange-500 font-bold rounded-lg w-full py-3 flex items-center justify-center gap-2 hover:bg-orange-600 transition disabled:opacity-75 disabled:cursor-not-allowed overflow-hidden relative"
        >
          {cargando ? (
            <span className="flex items-center gap-3">
              <span className="relative w-24 h-6 overflow-hidden flex items-end">
                <span className="absolute bottom-0 left-0 right-0 h-px bg-white/30 rounded" />
                <span className="absolute animate-drive-btn" style={{ bottom: '1px' }}>
                  <svg viewBox="0 0 52 22" width="52" height="22" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 14 L8 6 L38 6 L48 14 Z" fill="white" />
                    <path d="M14 6 L18 1 L34 1 L38 6 Z" fill="#ffe0cc" />
                    <path d="M18 1 L15 6 L22 6 Z" fill="#bfdbfe" opacity="0.9" />
                    <path d="M34 1 L37 6 L30 6 Z" fill="#bfdbfe" opacity="0.9" />
                    <rect x="22" y="1" width="8" height="5" rx="0.5" fill="#bfdbfe" opacity="0.9" />
                    <rect x="44" y="12" width="6" height="3" rx="1.5" fill="#fef08a" />
                    <rect x="2" y="12" width="4" height="3" rx="1.5" fill="#fca5a5" />
                    <path d="M2 14 L4 17 L6 17 L4 14 Z" fill="#e5e7eb" />
                    <rect x="3" y="5" width="6" height="1.5" rx="0.5" fill="white" />
                    <rect x="5" y="6.5" width="1.5" height="2" fill="white" />
                    <circle cx="13" cy="17" r="5" fill="#1f2937" />
                    <circle cx="13" cy="17" r="3" fill="#374151" />
                    <circle cx="13" cy="17" r="1.2" fill="#9ca3af" />
                    <circle cx="37" cy="17" r="5" fill="#1f2937" />
                    <circle cx="37" cy="17" r="3" fill="#374151" />
                    <circle cx="37" cy="17" r="1.2" fill="#9ca3af" />
                  </svg>
                </span>
              </span>
            </span>
          ) : (
            <>
              <Bot size={18} />
              Analizar con IA
            </>
          )}
        </button>

        <style>{`
          @keyframes driveBtn {
            0%   { transform: translateX(-60px); }
            100% { transform: translateX(110px); }
          }
          .animate-drive-btn {
            animation: driveBtn 1.2s linear infinite;
          }
        `}</style>

        {error && (
          <p className="text-red-400 text-sm mt-3">{error}</p>
        )}

        {resultado && (
          <div className="mt-6 space-y-4">

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-black uppercase font-bold mb-1">Resumen</p>
              <p className="text-sm text-gray-400">{resultado.resumenDiagnostico}</p>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400 uppercase font-bold">Urgencia:</p>
              <span className={`font-bold text-sm ${URGENCIA_COLOR[resultado.nivelUrgencia] || 'text-white'}`}>
                {resultado.nivelUrgencia}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-black uppercase font-bold mb-1">Recomendación</p>
              <p className="text-sm text-gray-400">{resultado.recomendacionGeneral}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-bold mb-2">Servicios recomendados</p>
              <div className="space-y-2">
                {resultado.serviciosRecomendados?.map((s, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">{s.nombre}</p>
                      <p className="text-xs text-gray-400">{s.descripcion}</p>
                      <span className={`text-xs font-bold ${URGENCIA_COLOR[s.urgencia] || 'text-white'}`}>
                        {s.urgencia} · {s.probabilidad}
                      </span>
                    </div>
                    <p className="text-orange-400 font-bold text-sm whitespace-nowrap ml-4">
                      ${s.precioBase?.toLocaleString('es-CL')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  )
}
