import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Car,
  Wrench,
  Calendar,
  Activity,
  ArrowLeft,
  Brain
} from 'lucide-react'
import SidebarCliente from '../../components/cliente/SidebarCliente'
import TopbarCliente from '../../components/cliente/TopbarCliente'
import { obtenerMisVehiculos } from '../../services/vehiculoService'
import { obtenerMisAgendamientos } from '../../services/agendamientoService'

export default function DetalleVehiculo() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [vehiculo, setVehiculo] = useState(null)
  const [agendamientos, setAgendamientos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [vehiculosRes, agRes] = await Promise.all([
        obtenerMisVehiculos(),
        obtenerMisAgendamientos()
      ])

      const encontrado = vehiculosRes.data.find(v => v.id === id)

      if (!encontrado) {
        navigate('/mis-vehiculos')
        return
      }

      setVehiculo(encontrado)

      const historial = (agRes.data || []).filter(
        ag =>
          ag.idVehiculo === encontrado.id ||
          ag.patenteVehiculo === encontrado.patente
      )

      setAgendamientos(historial)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <SidebarCliente />

        <div className="flex-1 flex flex-col">
          <TopbarCliente />

          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>

            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900">
                Cargando vehículo...
              </h2>

              <p className="text-gray-500 mt-2">
                Obteniendo historial y datos del vehículo
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!vehiculo) return null

  const descripcion =
    [vehiculo.marcaNombre, vehiculo.modeloNombre, vehiculo.anio]
      .filter(Boolean)
      .join(' ')

  const proximacita = agendamientos.find(
    ag => String(ag.estadoAgendamiento) !== 'COMPLETADO'
  )

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <SidebarCliente />

      <div className="flex-1 flex flex-col">
        <TopbarCliente />

        <main className="p-8">
          <button
            onClick={() => navigate('/mis-vehiculos')}
            className="flex items-center gap-2 mb-6 font-bold text-orange-500 hover:text-orange-600"
          >
            <ArrowLeft size={20} />
            Volver
          </button>

          <div className="bg-white rounded-3xl shadow-xl p-10 mb-8">
            <div className="flex justify-between items-start">
              <div className="flex gap-8">
                <div className="w-28 h-28 bg-orange-100 rounded-3xl flex items-center justify-center">
                  <Car size={50} className="text-orange-500" />
                </div>

                <div>
                  <h1 className="text-5xl font-black text-slate-900">
                    {descripcion}
                  </h1>

                  <p className="text-2xl text-gray-500 mt-3">
                    {vehiculo.patente}
                  </p>

                  {vehiculo.alias && (
                    <p className="text-orange-500 font-bold text-lg mt-2">
                      {vehiculo.alias}
                    </p>
                  )}

                  <p className="text-gray-500 mt-3">
                    Kilometraje: {vehiculo.kilometrajeIngreso || 0} KM
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/agendar')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-xl font-bold transition"
                >
                  Agendar servicio
                </button>

                <button
                  onClick={() => navigate('/cotizador')}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition"
                >
                  <Brain size={18} />
                  Diagnóstico IA
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow p-8">
              <Wrench className="text-orange-500 mb-4" />
              <p className="text-gray-500 uppercase text-sm">Servicios</p>
              <h2 className="text-4xl font-black mt-3">
                {agendamientos.length}
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow p-8">
              <Calendar className="text-orange-500 mb-4" />
              <p className="text-gray-500 uppercase text-sm">Próxima cita</p>
              <h2 className="text-xl font-black mt-3">
                {proximacita
                  ? String(proximacita.nombreServicio || 'Servicio agendado')
                  : 'Sin citas pendientes'}
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow p-8">
              <Activity className="text-orange-500 mb-4" />
              <p className="text-gray-500 uppercase text-sm">Estado</p>
              <h2 className="text-2xl font-black mt-3 text-green-600">
                ACTIVO
              </h2>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-8">
            <h2 className="text-3xl font-black mb-8">
              Historial del vehículo
            </h2>

            {agendamientos.length === 0 ? (
              <p className="text-gray-500">
                Este vehículo aún no tiene historial.
              </p>
            ) : (
              <div className="space-y-4">
                {agendamientos.map((ag, index) => (
                  <div
                    key={ag.idAgendamiento || index}
                    className="border rounded-2xl p-6 flex justify-between items-center hover:shadow-md transition"
                  >
                    <div>
                      <h3 className="font-black text-xl">
                        {String(ag.nombreServicio || 'Servicio')}
                      </h3>

                      <p className="text-gray-500">
                        Técnico: {ag.nombreTecnico || 'Aún no asignado'}
                      </p>

                      <p className="text-gray-400 font-medium">
                        {typeof ag.estadoAgendamiento === 'object'
                          ? ag.estadoAgendamiento?.nombre || 'Pendiente'
                          : ag.estadoAgendamiento || 'Pendiente'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-orange-500">
                        $
                        {ag.precioAcordado
                          ? Number(ag.precioAcordado).toLocaleString()
                          : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}