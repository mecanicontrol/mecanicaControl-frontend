import { useState, useEffect } from 'react'
import { Car, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { obtenerMisVehiculos, guardarVehiculo } from '../../services/vehiculoService'
import { obtenerMarcas, obtenerModelos } from '../../services/marcasService'
import SidebarCliente from '../../components/cliente/SidebarCliente'
import TopbarCliente from '../../components/cliente/TopbarCliente'

export default function MisVehiculos() {
  const { usuario, authListo } = useAuth()
  const navigate = useNavigate()

  const [vehiculos, setVehiculos] = useState([])
  const [marcas, setMarcas] = useState([])
  const [modelos, setModelos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)

  const [form, setForm] = useState({
    patente: '',
    marcaId: '',
    modeloId: '',
    anio: '',
    kilometraje: '',
    alias: ''
  })

  useEffect(() => {
    if (!authListo) return
    if (!usuario) {
      navigate('/login')
      return
    }

    cargarVehiculos()
    obtenerMarcas().then(({ data }) => setMarcas(data)).catch(() => {})
  }, [authListo, usuario])

  useEffect(() => {
    if (!form.marcaId) {
      setModelos([])
      setForm(f => ({ ...f, modeloId: '' }))
      return
    }

    obtenerModelos(form.marcaId)
      .then(({ data }) => setModelos(data))
      .catch(() => setModelos([]))
  }, [form.marcaId])

  const cargarVehiculos = () => {
    setCargando(true)

    obtenerMisVehiculos()
      .then(({ data }) => setVehiculos(data))
      .catch(() => setError('No se pudieron cargar los vehículos.'))
      .finally(() => setCargando(false))
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleGuardar = async () => {
    if (!form.patente.trim()) {
      setError('La patente es obligatoria.')
      return
    }

    setGuardando(true)
    setError('')

    try {
      await guardarVehiculo({
        patente: form.patente.toUpperCase().trim(),
        marcaId: form.marcaId || null,
        modeloId: form.modeloId || null,
        anio: form.anio ? Number(form.anio) : null,
        kilometraje: form.kilometraje ? Number(form.kilometraje) : null,
        alias: form.alias || null
      })

      setForm({
        patente: '',
        marcaId: '',
        modeloId: '',
        anio: '',
        kilometraje: '',
        alias: ''
      })

      setMostrarForm(false)
      cargarVehiculos()
    } catch (e) {
      setError(
        e.response?.data?.message ??
        e.response?.data ??
        'Error al guardar el vehículo.'
      )
    } finally {
      setGuardando(false)
    }
  }

  const input =
    'w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl'

  const label =
    'block text-xs font-bold text-gray-500 uppercase mb-2'

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <SidebarCliente />

      <div className="flex-1 flex flex-col">
        <TopbarCliente />

        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900">
                MIS VEHÍCULOS
              </h1>
              <p className="text-gray-500 mt-2">
                Bienvenido, {usuario?.nombre}
              </p>
            </div>

            <button
              onClick={() => {
                setMostrarForm(!mostrarForm)
                setError('')
              }}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-xl font-black uppercase transition"
            >
              <Plus size={18} />
              Nuevo vehículo
            </button>
          </div>

          {mostrarForm && (
            <div className="bg-white rounded-2xl shadow p-8 mb-8">
              <h2 className="text-2xl font-black mb-6">
                Registrar vehículo
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={label}>Patente *</label>
                  <input
                    name="patente"
                    value={form.patente}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        patente: e.target.value.toUpperCase()
                      })
                    }
                    className={input}
                  />
                </div>

                <div>
                  <label className={label}>Alias</label>
                  <input
                    name="alias"
                    value={form.alias}
                    onChange={handleChange}
                    className={input}
                  />
                </div>

                <div>
                  <label className={label}>Marca</label>
                  <select
                    name="marcaId"
                    value={form.marcaId}
                    onChange={handleChange}
                    className={input}
                  >
                    <option value="">Selecciona</option>
                    {marcas.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={label}>Modelo</label>
                  <select
                    name="modeloId"
                    value={form.modeloId}
                    onChange={handleChange}
                    disabled={!form.marcaId}
                    className={input}
                  >
                    <option value="">Selecciona</option>
                    {modelos.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={label}>Año</label>
                  <input
                    name="anio"
                    type="number"
                    value={form.anio}
                    onChange={handleChange}
                    className={input}
                  />
                </div>

                <div>
                  <label className={label}>Kilometraje</label>
                  <input
                    name="kilometraje"
                    type="number"
                    value={form.kilometraje}
                    onChange={handleChange}
                    className={input}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 mt-4 font-semibold">
                  {error}
                </p>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleGuardar}
                  disabled={guardando}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-black"
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>

                <button
                  onClick={() => setMostrarForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 px-8 py-4 rounded-xl font-bold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {cargando ? (
            <div className="space-y-6 animate-pulse">
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <Car className="text-orange-400 animate-bounce" size={28} />
                  </div>

                  <div className="flex-1">
                    <div className="h-6 w-64 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-2xl shadow p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gray-200"></div>

                      <div className="flex-1">
                        <div className="h-5 w-48 bg-gray-200 rounded mb-3"></div>
                        <div className="h-4 w-28 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-20 bg-orange-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-4">
                <p className="text-gray-500 font-medium text-lg">
                  Cargando tus vehículos...
                </p>

                <p className="text-gray-400 text-sm mt-1">
                  Preparando tu garage digital
                </p>
              </div>
            </div>
          ) : vehiculos.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-16 text-center">
              <Car size={50} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                No tienes vehículos registrados
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {vehiculos.map(v => {
                const descripcion =
                  [v.marcaNombre, v.modeloNombre, v.anio]
                    .filter(Boolean)
                    .join(' ') || '—'

                return (
                  <div
                    key={v.id}
                    onClick={() => navigate(`/cliente/vehiculo/${v.id}`)}
                    className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition duration-300 border border-transparent hover:border-orange-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                        <Car className="text-orange-500" />
                      </div>

                      <div>
                        <h3 className="font-black text-lg">
                          {descripcion}
                        </h3>

                        <p className="text-gray-500">
                          {v.patente}
                        </p>

                        {v.alias && (
                          <p className="text-orange-500 font-semibold">
                            {v.alias}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}