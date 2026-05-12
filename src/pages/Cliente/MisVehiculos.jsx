import { useState, useEffect } from 'react'
import { Car, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { obtenerMisVehiculos, guardarVehiculo } from '../../services/vehiculoService'
import { obtenerMarcas, obtenerModelos } from '../../services/marcasService'
import Navbar from '../../components/Navbar'

export default function MisVehiculos() {
  const { usuario, authListo } = useAuth()
  const navigate               = useNavigate()

  const [vehiculos, setVehiculos] = useState([])
  const [marcas, setMarcas]       = useState([])
  const [modelos, setModelos]     = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)

  const [form, setForm] = useState({ patente: '', marcaId: '', modeloId: '', anio: '', kilometraje: '', alias: '' })

  useEffect(() => {
    if (!authListo) return          // esperar a que se lea el localStorage
    if (!usuario) { navigate('/login'); return }
    cargarVehiculos()
    obtenerMarcas().then(({ data }) => setMarcas(data)).catch(() => {})
  }, [authListo, usuario])

  useEffect(() => {
    if (!form.marcaId) { setModelos([]); setForm(f => ({ ...f, modeloId: '' })); return }
    obtenerModelos(form.marcaId).then(({ data }) => setModelos(data)).catch(() => setModelos([]))
  }, [form.marcaId])

  const cargarVehiculos = () => {
    setCargando(true)
    obtenerMisVehiculos()
      .then(({ data }) => setVehiculos(data))
      .catch(() => setError('No se pudieron cargar los vehículos.'))
      .finally(() => setCargando(false))
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleGuardar = async () => {
    if (!form.patente.trim()) { setError('La patente es obligatoria.'); return }
    setGuardando(true)
    setError('')
    try {
      await guardarVehiculo({
        patente:     form.patente.toUpperCase().trim(),
        marcaId:     form.marcaId     || null,
        modeloId:    form.modeloId    || null,
        anio:        form.anio        ? Number(form.anio) : null,
        kilometraje: form.kilometraje ? Number(form.kilometraje) : null,
        alias:       form.alias       || null,
      })
      setForm({ patente: '', marcaId: '', modeloId: '', anio: '', kilometraje: '', alias: '' })
      setMostrarForm(false)
      cargarVehiculos()
    } catch (e) {
      setError(e.response?.data?.message ?? e.response?.data ?? 'Error al guardar el vehículo.')
    } finally {
      setGuardando(false)
    }
  }

  const input = 'w-full bg-gray-50 border border-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition-colors'
  const label = 'block text-xs font-bold text-gray-500 uppercase mb-1'

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800 uppercase">Mis Vehículos</h1>
            <p className="text-gray-500 text-sm mt-1">Hola, {usuario?.nombre} — vehículos vinculados a tu cuenta</p>
          </div>
          <button
            onClick={() => { setMostrarForm(!mostrarForm); setError('') }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} /> Agregar
          </button>
        </div>

        {/* Formulario para agregar */}
        {mostrarForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100">
              Nuevo vehículo
            </p>
            <div className="space-y-4">

              <div>
                <label className={label}>Patente *</label>
                <input name="patente" value={form.patente}
                  onChange={(e) => setForm({ ...form, patente: e.target.value.toUpperCase() })}
                  placeholder="Ej: ABCD12" maxLength={8} className={input} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Marca</label>
                  <select name="marcaId" value={form.marcaId} onChange={handleChange} className={input}>
                    <option value="">Selecciona</option>
                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label}>Modelo</label>
                  <select name="modeloId" value={form.modeloId} onChange={handleChange}
                    disabled={!form.marcaId} className={`${input} disabled:opacity-50`}>
                    <option value="">Selecciona</option>
                    {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Año</label>
                  <input name="anio" type="number" value={form.anio} onChange={handleChange}
                    placeholder="2024" min="1900" max="2100" className={input} />
                </div>
                <div>
                  <label className={label}>Kilometraje</label>
                  <input name="kilometraje" type="number" value={form.kilometraje} onChange={handleChange}
                    placeholder="50000" min="0" className={input} />
                </div>
              </div>

              <div>
                <label className={label}>Alias (opcional)</label>
                <input name="alias" value={form.alias} onChange={handleChange}
                  placeholder='Ej: "Mi Corolla rojo"' className={input} />
              </div>

              {error && (
                <p className="text-red-500 text-xs font-semibold bg-red-50 border border-red-100 rounded-lg py-2 px-3 text-center">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handleGuardar} disabled={guardando}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black text-sm uppercase py-3 rounded-xl transition-colors">
                  {guardando ? 'Guardando...' : 'Guardar Vehículo'}
                </button>
                <button onClick={() => { setMostrarForm(false); setError('') }}
                  className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm rounded-xl transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de vehículos */}
        {cargando ? (
          <p className="text-center text-gray-400 py-10">Cargando...</p>
        ) : vehiculos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
            <Car size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-semibold">No tienes vehículos vinculados aún.</p>
            <p className="text-gray-300 text-xs mt-1">Presiona "Agregar" para registrar el primero.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vehiculos.map(v => {
              const descripcion = [v.marcaNombre, v.modeloNombre, v.anio].filter(Boolean).join(' ') || '—'
              return (
                <div key={v.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Car size={18} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-gray-800 uppercase">{descripcion}</p>
                    {v.patente    && <p className="text-xs text-gray-500 mt-0.5">Patente: <span className="font-bold">{v.patente}</span></p>}
                    {v.kilometrajeIngreso && <p className="text-xs text-gray-400">{v.kilometrajeIngreso.toLocaleString('es-CL')} km</p>}
                    {v.alias      && <p className="text-xs text-orange-400 font-semibold mt-0.5">"{v.alias}"</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
