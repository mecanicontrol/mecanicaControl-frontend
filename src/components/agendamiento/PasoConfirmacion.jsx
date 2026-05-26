import { useState, useEffect } from 'react'
import { Car, CheckCircle, AlertTriangle } from 'lucide-react'
import { obtenerMisVehiculos, guardarVehiculo } from '../../services/vehiculoService'
import { crearAgendamiento } from '../../services/agendamientoService'

function formatearFechaHora(horaStr) {
  if (!horaStr) return '—'
  const d = new Date(horaStr)
  if (isNaN(d.getTime())) return horaStr
  return d.toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function hayCambios(vCotizador, vDB) {
  if (!vCotizador || !vDB) return false
  const marcaDiferente  = vCotizador.marcaId  && vDB.marcaVehiculoId  && vCotizador.marcaId  !== vDB.marcaVehiculoId
  const modeloDiferente = vCotizador.modeloId && vDB.modeloVehiculoId && vCotizador.modeloId !== vDB.modeloVehiculoId
  const anioDiferente   = vCotizador.anio && vDB.anio && Number(vCotizador.anio) !== vDB.anio
  return marcaDiferente || modeloDiferente || anioDiferente
}

export default function PasoConfirmacion({ vehiculo, servicios, fecha, hora, onVolver }) {
  const [misVehiculos, setMisVehiculos]   = useState([])
  const [vehiculoSelId, setVehiculoSelId] = useState(null)
  const [conflicto, setConflicto]         = useState(null) // { vDB } cuando hay patente coincidente con datos distintos
  const [guardando, setGuardando]         = useState(false)
  const [confirmado, setConfirmado]       = useState(false)
  const [error, setError]                 = useState('')
  const [cargandoVeh, setCargandoVeh]     = useState(true)

  useEffect(() => {
    obtenerMisVehiculos()
      .then(({ data }) => {
        setMisVehiculos(data)

        if (vehiculo?.patente) {
          const match = data.find(v => v.patente === vehiculo.patente)
          if (match) {
            if (hayCambios(vehiculo, match)) {
              // Misma patente, datos distintos → conflicto
              setConflicto(match)
              setVehiculoSelId('__cotizador__') // por defecto, lo que ingresó el usuario
            } else {
              setVehiculoSelId(match.id)
            }
            return
          }
        }

        if (vehiculo?.patente || vehiculo?.marca) {
          setVehiculoSelId('__cotizador__')
          return
        }

        if (data.length === 1) setVehiculoSelId(data[0].id)
      })
      .catch(() => {})
      .finally(() => setCargandoVeh(false))
  }, [vehiculo?.patente])

  const vehiculoDelCotizador = (vehiculo?.patente || vehiculo?.marca)
    ? { id: '__cotizador__', patente: vehiculo.patente, marcaNombre: vehiculo.marca, modeloNombre: vehiculo.modelo, anio: vehiculo.anio }
    : null

  const cotizadorYaGuardado = vehiculoDelCotizador?.patente
    && misVehiculos.some(v => v.patente === vehiculoDelCotizador.patente)
    && !conflicto  // si hay conflicto, igual mostramos ambos

  const listaVehiculos = [
    ...(vehiculoDelCotizador && !cotizadorYaGuardado ? [vehiculoDelCotizador] : []),
    ...misVehiculos,
  ]

  const confirmar = async () => {
    if (!vehiculoSelId) { setError('Selecciona un vehículo para continuar.'); return }
    setGuardando(true)
    setError('')
    try {
      let idVehiculoFinal = vehiculoSelId

      if (vehiculoSelId === '__cotizador__') {
        if (conflicto) {
          // Misma patente que un vehículo guardado → usar el ID guardado
          // (es el mismo auto físicamente, los datos distintos son del cotizador)
          idVehiculoFinal = conflicto.id
        } else {
          const { data: vGuardado } = await guardarVehiculo({
            patente:     vehiculo.patente   ?? null,
            marcaId:     vehiculo.marcaId   ?? null,
            modeloId:    vehiculo.modeloId  ?? null,
            anio:        vehiculo.anio      ? Number(vehiculo.anio) : null,
            kilometraje: vehiculo.kilometraje ? Number(vehiculo.kilometraje) : null,
          })
          idVehiculoFinal = vGuardado.id
        }
      }

      for (const servicio of servicios) {
        await crearAgendamiento({
          idVehiculo:  idVehiculoFinal,
          idServicio:  servicio.id,
          fechaInicio: hora,
          notaCliente: null,
          patente:     null,
        })
      }
      setConfirmado(true)
    } catch (e) {
      setError(e.response?.data?.message ?? e.response?.data ?? 'Error al confirmar. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  if (confirmado) {
    return (
      <div className="text-center py-16">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-gray-800 uppercase mb-2">¡Agendamiento Confirmado!</h2>
        <p className="text-gray-500 text-sm">Tu hora ha sido reservada exitosamente.</p>
        <p className="text-gray-400 text-xs mt-4">Recibirás una confirmación en tu correo electrónico.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="border-l-4 border-orange-500 pl-4 mb-8">
        <h2 className="text-2xl font-black text-gray-800 uppercase">Confirmar Agendamiento</h2>
        <p className="text-gray-500 text-sm mt-1">Selecciona el vehículo para este servicio.</p>
      </div>

      {/* Banner de conflicto de datos */}
      {conflicto && (
        <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 flex gap-3">
          <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-yellow-700 mb-1">
              La patente <span className="font-mono bg-yellow-100 px-1.5 py-0.5 rounded">{vehiculo.patente}</span> ya está registrada con datos distintos a los que ingresaste.
            </p>
            <p className="text-xs text-yellow-600">
              Revisa las opciones abajo y confirma con cuál vehículo deseas agendar. Puedes actualizar los datos de tu perfil en "Mis Vehículos".
            </p>
          </div>
        </div>
      )}

      {/* Selección de vehículo */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100">
          Vehículo a revisar
        </p>

        {cargandoVeh ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : listaVehiculos.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No tienes vehículos disponibles.</p>
        ) : (
          <div className="space-y-3">
            {listaVehiculos.map((v) => {
              const etiqueta    = [v.marcaNombre, v.modeloNombre, v.anio].filter(Boolean).join(' ') || 'Vehículo sin descripción'
              const esCotizador = v.id === '__cotizador__'
              const esConflicto = esCotizador && !!conflicto
              const esSelec     = vehiculoSelId === v.id
              return (
                <button
                  key={v.id}
                  onClick={() => setVehiculoSelId(v.id)}
                  className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    esSelec
                      ? 'border-orange-500 bg-orange-500/5'
                      : esConflicto
                        ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Car size={20} className={esSelec ? 'text-orange-500' : esConflicto ? 'text-yellow-500' : 'text-gray-400'} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-gray-800 uppercase">{etiqueta}</p>
                    {v.patente && <p className="text-xs text-gray-500 mt-0.5">Patente: <span className="font-bold">{v.patente}</span></p>}
                    {esCotizador && !conflicto && (
                      <p className="text-xs text-orange-400 mt-0.5 font-semibold">Ingresado en el cotizador — se guardará al confirmar</p>
                    )}
                    {esCotizador && conflicto && (
                      <p className="text-xs text-yellow-600 mt-0.5 font-semibold">Datos ingresados en el cotizador</p>
                    )}
                    {!esCotizador && conflicto && v.id === conflicto.id && (
                      <p className="text-xs text-gray-400 mt-0.5 font-semibold">Datos registrados en tu perfil</p>
                    )}
                    {!esCotizador && !conflicto && (
                      <p className="text-xs text-gray-400 mt-0.5">Vehículo registrado en tu perfil</p>
                    )}
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    esSelec ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                  }`}>
                    {esSelec && <span className="text-white text-xs">✓</span>}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Detalle */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100">
          Detalle del agendamiento
        </p>
        <div className="space-y-2 text-sm">
          {servicios.map(s => (
            <div key={s.id} className="flex justify-between text-xs">
              <span className="text-gray-500">{s.nombre}</span>
              <span className="text-gray-700 font-semibold">${(s.precioBase ?? 0).toLocaleString('es-CL')}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t border-gray-100">
            <span className="text-gray-500 text-xs font-semibold">Fecha y hora</span>
            <span className="font-black text-xs">{formatearFechaHora(hora)}</span>
          </div>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-red-500 text-xs font-semibold text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      <button
        onClick={confirmar}
        disabled={!vehiculoSelId || guardando}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl uppercase text-sm tracking-widest transition-colors"
      >
        {guardando ? 'Confirmando...' : 'Confirmar Agendamiento →'}
      </button>

      <button
        onClick={onVolver}
        className="mt-4 flex items-center gap-2 text-gray-400 font-bold uppercase text-xs hover:text-gray-700 transition-colors"
      >
        ← Volver al paso anterior
      </button>
    </div>
  )
}
