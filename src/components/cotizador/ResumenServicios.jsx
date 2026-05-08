import { useState, useEffect } from 'react'
import { Car } from 'lucide-react'
import { obtenerServicios } from '../../services/serviciosCatalogoService'
import CargandoAuto from '../shared/CargandoAuto'

export default function ResumenServicios({
  vehiculo,
  setVehiculo,
  serviciosSeleccionados,
  setServiciosSeleccionados
}) {
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    obtenerServicios()
      .then(({ data }) => {
        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data?.servicios)
          ? data.servicios
          : []

        setServicios(lista)
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setCargando(false))
  }, [])

  const handleChange = (e) => {
    setVehiculo({
      ...vehiculo,
      [e.target.name]: e.target.value
    })
  }

  const toggleServicio = (servicio) => {
    const yaSeleccionado = serviciosSeleccionados.find(
      s => s.id === servicio.id
    )

    if (yaSeleccionado) {
      setServiciosSeleccionados(
        serviciosSeleccionados.filter(s => s.id !== servicio.id)
      )
    } else {
      setServiciosSeleccionados([
        ...serviciosSeleccionados,
        servicio
      ])
    }
  }

  return (
    <div className="space-y-4">

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-gray-800 font-bold text-lg flex items-center gap-2 mb-4">
          <Car size={18} className="text-orange-500" />
          IDENTIFICACIÓN DEL VEHÍCULO
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'marca', label: 'MARCA', placeholder: 'Toyota' },
            { name: 'modelo', label: 'MODELO', placeholder: 'Corolla' },
            { name: 'anio', label: 'AÑO', placeholder: '2024' },
            { name: 'kilometraje', label: 'KILOMETRAJE', placeholder: '5.000 KM' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-xs text-gray-500 font-bold uppercase mb-1">
                {label}
              </label>

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

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-gray-800 font-bold text-lg flex items-center gap-2 mb-4">
          <span className="text-orange-500">≡</span>
          SERVICIOS DISPONIBLES
        </h2>

        {cargando ? (
          <CargandoAuto mensaje="Cargando servicios disponibles..." />
        ) : error ? (
          <p className="text-red-400 text-sm text-center py-6">
            No se pudieron cargar los servicios. Intenta recargar la página.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {servicios.map((servicio) => {
              const seleccionado = serviciosSeleccionados.find(
                s => s.id === servicio.id
              )

              return (
                <button
                  key={servicio.id}
                  onClick={() => toggleServicio(servicio)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    seleccionado
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-gray-800">
                        {servicio.nombre}
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {servicio.descripcion}
                      </p>

                      <p className={`text-sm font-bold mt-1 ${
                        seleccionado
                          ? 'text-orange-400'
                          : 'text-gray-400'
                      }`}>
                        ${servicio.precioBase?.toLocaleString('es-CL')}
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      seleccionado
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-600'
                    }`}>
                      {seleccionado && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}