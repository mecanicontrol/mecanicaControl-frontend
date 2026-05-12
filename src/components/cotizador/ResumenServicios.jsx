import { useState, useEffect } from 'react'
import { Car } from 'lucide-react'
import { obtenerServicios }              from '../../services/serviciosCatalogoService'
import { obtenerMarcas, obtenerModelos } from '../../services/marcasService'
import CargandoAuto                      from '../shared/CargandoAuto'
import SelectorVehiculoPerfil            from '../shared/SelectorVehiculoPerfil'

export default function ResumenServicios({ vehiculo, setVehiculo, serviciosSeleccionados, setServiciosSeleccionados }) {
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(false)
  const [marcas, setMarcas]       = useState([])
  const [modelos, setModelos]     = useState([])

  useEffect(() => {
    obtenerMarcas().then(({ data }) => setMarcas(data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!vehiculo.marcaId) { setModelos([]); return }
    obtenerModelos(vehiculo.marcaId).then(({ data }) => setModelos(data)).catch(() => setModelos([]))
  }, [vehiculo.marcaId])

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

  const handleMarca = (e) => {
    const marcaId     = e.target.value
    const marcaNombre = marcas.find(m => m.id === marcaId)?.nombre ?? ''
    setVehiculo({ ...vehiculo, marcaId, marca: marcaNombre, modeloId: '', modelo: '' })
  }

  const handleModelo = (e) => {
    const modeloId    = e.target.value
    const modeloNombre = modelos.find(m => m.id === modeloId)?.nombre ?? ''
    setVehiculo({ ...vehiculo, modeloId, modelo: modeloNombre })
  }

  const handleChange = (e) => setVehiculo({ ...vehiculo, [e.target.name]: e.target.value })

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

  const inputClass = 'w-full bg-gray-50 border border-gray-300 text-gray-800 px-3 py-2 rounded text-sm focus:outline-none focus:border-orange-500'
  const labelClass = 'block text-xs text-gray-500 font-bold uppercase mb-1'

  return (
    <div className="space-y-4">

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-gray-800 font-bold text-lg flex items-center gap-2 mb-4">
          <Car size={18} className="text-orange-500" />
          IDENTIFICACIÓN DEL VEHÍCULO
        </h2>

        {/* Selector de vehículos del perfil */}
        <SelectorVehiculoPerfil vehiculo={vehiculo} setVehiculo={setVehiculo} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div>
            <label className={labelClass}>MARCA</label>
            <select value={vehiculo.marcaId ?? ''} onChange={handleMarca} className={inputClass}>
              <option value="">Selecciona</option>
              {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>MODELO</label>
            <select value={vehiculo.modeloId ?? ''} onChange={handleModelo}
              disabled={!vehiculo.marcaId} className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}>
              <option value="">Selecciona</option>
              {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>AÑO</label>
            <input type="number" name="anio" value={vehiculo.anio ?? ''}
              onChange={(e) => { if (e.target.value.length <= 4) handleChange(e) }}
              placeholder="2024" min="1900" max="2100" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>KILOMETRAJE</label>
            <input type="number" name="kilometraje" value={vehiculo.kilometraje ?? ''}
              onChange={(e) => { if (e.target.value.length <= 6) handleChange(e) }}
              placeholder="50000" min="0" className={inputClass} />
          </div>

        </div>

        <div className="mt-4 max-w-xs">
          <label className={labelClass}>PATENTE</label>
          <input type="text" name="patente" value={vehiculo.patente ?? ''}
            onChange={(e) => handleChange({ target: { name: 'patente', value: e.target.value.toUpperCase() } })}
            placeholder="Ej: ABCD12" maxLength={8} className={inputClass} />
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
                <button key={servicio.id} onClick={() => toggleServicio(servicio)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    seleccionado ? 'border-orange-500 bg-orange-500/10' : 'border-gray-200 bg-gray-50 hover:border-gray-400'
                  }`}>
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