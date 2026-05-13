import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import api from '../../api/axiosInstance'
import { useAuth } from '../../context/AuthContext'

export default function TabCrearCuenta({ onContinuar, vehiculo }) {
  const { login: loginCtx } = useAuth()
  const [form, setForm]             = useState({ nombre: '', apellido: '', email: '', telefono: '', password: '', repetir: '' })
  const [verPassword, setVerPassword] = useState(false)
  const [verRepetir, setVerRepetir]   = useState(false)
  const [cargando, setCargando]       = useState(false)
  const [error, setError]             = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const passwordsIguales   = form.password && form.repetir && form.password === form.repetir
  const passwordsDistintas = form.password && form.repetir && form.password !== form.repetir
  const todoCompleto = form.nombre && form.apellido && form.email && form.telefono && form.password && passwordsIguales

  const labelClass = 'block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5'
  const inputClass = 'w-full bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition-colors placeholder-gray-300'

  const handleSubmit = async () => {
    if (!todoCompleto) return
    setCargando(true)
    setError('')
    try {
      const payload = {
        nombre:      form.nombre,
        apellido:    form.apellido,
        email:       form.email,
        telefono:    form.telefono,
        password:    form.password,
        patente:     vehiculo?.patente  ?? null,
        marcaId:     vehiculo?.marcaId  ?? null,
        modeloId:    vehiculo?.modeloId ?? null,
        anio:        vehiculo?.anio     ? Number(vehiculo.anio) : null,
        kilometraje: vehiculo?.kilometraje ? Number(vehiculo.kilometraje) : null,
      }
      const { data } = await api.post('/api/auth/register-con-vehiculo', payload)
      loginCtx(data.token, { rol: data.rol, nombre: data.nombre, usuarioId: data.usuarioId })
      onContinuar()
    } catch (e) {
      setError(e.response?.data?.message ?? e.response?.data ?? 'Error al crear la cuenta. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">
        Información del solicitante
      </p>

      <div className="space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange}
              placeholder="Ej: José" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Apellido</label>
            <input name="apellido" value={form.apellido} onChange={handleChange}
              placeholder="Ej: Galvez" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Correo electrónico</label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="jose@correo.cl" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Teléfono</label>
            <input name="telefono" type="tel" value={form.telefono} onChange={handleChange}
              placeholder="+56 9 1234 5678" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Contraseña</label>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-3 gap-2 focus-within:border-orange-400 transition-colors">
              <input name="password" type={verPassword ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                placeholder="••••••••"
                className="bg-transparent outline-none text-sm text-gray-800 w-full placeholder-gray-300" />
              <button type="button" onClick={() => setVerPassword(!verPassword)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                {verPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Repetir contraseña</label>
          <div className={`flex items-center bg-white border rounded-lg px-4 py-3 gap-2 transition-colors ${passwordsDistintas ? 'border-red-300 focus-within:border-red-400' : 'border-gray-200 focus-within:border-orange-400'}`}>
            <input name="repetir" type={verRepetir ? 'text' : 'password'}
              value={form.repetir} onChange={handleChange}
              placeholder="••••••••"
              className="bg-transparent outline-none text-sm text-gray-800 w-full placeholder-gray-300" />
            <button type="button" onClick={() => setVerRepetir(!verRepetir)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              {verRepetir ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {passwordsDistintas && <p className="text-red-400 text-xs mt-1.5 font-semibold">Las contraseñas no coinciden</p>}
          {passwordsIguales   && <p className="text-green-500 text-xs mt-1.5 font-semibold">✓ Las contraseñas coinciden</p>}
        </div>

      </div>

      {error && (
        <p className="mt-4 text-red-500 text-xs font-semibold text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!todoCompleto || cargando}
        className="mt-8 w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl uppercase text-sm tracking-widest transition-colors"
      >
        {cargando ? 'Creando cuenta...' : 'Crear Cuenta y Confirmar →'}
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        Al crear una cuenta aceptas nuestros{' '}
        <span className="text-orange-500 font-semibold cursor-pointer hover:underline">términos de uso</span>
      </p>
    </div>
  )
}
