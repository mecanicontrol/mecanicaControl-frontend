import { useState, useEffect } from 'react'
import { Car, ChevronRight } from 'lucide-react'
import { obtenerMisVehiculos } from '../../services/vehiculoService'
import { obtenerModelos }      from '../../services/marcasService'
import { useAuth }             from '../../context/AuthContext'

export default function SelectorVehiculoPerfil({ vehiculo, setVehiculo }) {
  const { usuario }                       = useAuth()
  const [misVehiculos, setMisVehiculos]   = useState([])
  const [cargando, setCargando]           = useState(false)
  const [seleccionado, setSeleccionado]   = useState(null)

  useEffect(() => {
    if (!usuario) return
    setCargando(true)
    obtenerMisVehiculos()
      .then(({ data }) => setMisVehiculos(data))
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [usuario])

  if (!usuario) return null
  if (!cargando && misVehiculos.length === 0) return null

  const elegir = (v) => {
    // Si se vuelve a clicar el mismo, deselecciona y limpia los campos
    if (seleccionado === v.id) {
      setSeleccionado(null)
      setVehiculo({ marcaId: '', marca: '', modeloId: '', modelo: '', anio: '', kilometraje: '', patente: '' })
      return
    }
    setSeleccionado(v.id)
    if (v.marcaVehiculoId) {
      obtenerModelos(v.marcaVehiculoId).catch(() => {})
    }
    setVehiculo(prev => ({
      ...prev,
      marcaId:     v.marcaVehiculoId   ?? '',
      marca:       v.marcaNombre       ?? '',
      modeloId:    v.modeloVehiculoId  ?? '',
      modelo:      v.modeloNombre      ?? '',
      anio:        v.anio              ?? '',
      kilometraje: v.kilometrajeIngreso ?? '',
      patente:     v.patente           ?? '',
    }))
  }

  return (
    <div className="mb-5 rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
          <Car size={12} className="text-white" />
        </div>
        <p className="text-xs font-black text-orange-600 uppercase tracking-widest">
          Tus vehículos registrados
        </p>
      </div>

      {cargando ? (
        <div className="flex gap-2">
          {[1, 2].map(i => (
            <div key={i} className="h-16 w-36 rounded-xl bg-orange-100 animate-pulse flex-shrink-0" />
          ))}
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {misVehiculos.map(v => {
            const titulo = [v.marcaNombre, v.modeloNombre].filter(Boolean).join(' ') || 'Sin descripción'
            const activo = seleccionado === v.id
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => elegir(v)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left
                  ${activo
                    ? 'border-orange-500 bg-orange-500 shadow-md shadow-orange-200'
                    : 'border-orange-200 bg-white hover:border-orange-400 hover:shadow-sm'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                  ${activo ? 'bg-white/20' : 'bg-orange-100'}`}>
                  <Car size={14} className={activo ? 'text-white' : 'text-orange-500'} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-black uppercase leading-tight truncate max-w-[110px]
                    ${activo ? 'text-white' : 'text-gray-800'}`}>
                    {titulo}
                  </p>
                  {v.anio && (
                    <p className={`text-xs leading-tight ${activo ? 'text-orange-100' : 'text-gray-400'}`}>
                      {v.anio}
                    </p>
                  )}
                  {v.patente && (
                    <p className={`text-xs font-bold leading-tight ${activo ? 'text-orange-200' : 'text-orange-400'}`}>
                      {v.patente}
                    </p>
                  )}
                </div>
                {activo && <ChevronRight size={14} className="text-white/70 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      )}

      {seleccionado && (
        <p className="text-xs text-orange-500 font-semibold mt-2 flex items-center gap-1">
          <span>✓</span> Campos rellenados — puedes modificarlos si es necesario
        </p>
      )}
    </div>
  )
}
