import { Bot, Car } from 'lucide-react'

const URGENCIA_COLOR = {
  URGENTE: 'text-red-500',
  MEDIA:   'text-yellow-500',
  NORMAL:  'text-green-500',
}

export default function DiagnosticoIA({ vehiculo, setVehiculo, descripcionFallo, setDescripcionFallo, onAnalizar, cargando, resultado, error }) {
  const handleChange = (e) => setVehiculo({ ...vehiculo, [e.target.name]: e.target.value })

  return (
    <section className="text-gray-800 space-y-4">

      {/* Datos del vehículo */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-gray-800 font-bold text-lg flex items-center gap-2 mb-4">
          <Car size={18} className="text-orange-500" />
          IDENTIFICACIÓN DEL VEHÍCULO
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'marca',       label: 'MARCA',       placeholder: 'Toyota'   },
            { name: 'modelo',      label: 'MODELO',      placeholder: 'Corolla'  },
            { name: 'anio',        label: 'AÑO',         placeholder: '2024'     },
            { name: 'kilometraje', label: 'KILOMETRAJE', placeholder: '185.000'  },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-xs text-gray-500 font-bold uppercase mb-1">{label}</label>
              <input
                name={name}
                value={vehiculo[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full bg-gray-50 border border-gray-300 text-gray-800 px-3 py-2 rounded text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          ))}
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
          className="bg-orange-500 font-bold rounded-lg w-full py-3 flex items-center justify-center gap-2 hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Bot size={18} />
          {cargando ? 'Analizando...' : 'Analizar con IA'}
        </button>

        {error && (
          <p className="text-red-400 text-sm mt-3">{error}</p>
        )}

        {resultado && (
          <div className="mt-6 space-y-4">

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Resumen</p>
              <p className="text-sm text-gray-200">{resultado.resumenDiagnostico}</p>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400 uppercase font-bold">Urgencia:</p>
              <span className={`font-bold text-sm ${URGENCIA_COLOR[resultado.nivelUrgencia] || 'text-white'}`}>
                {resultado.nivelUrgencia}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">Recomendación</p>
              <p className="text-sm text-gray-200">{resultado.recomendacionGeneral}</p>
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

