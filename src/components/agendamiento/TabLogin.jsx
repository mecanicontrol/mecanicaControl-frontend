import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import api from '../../api/axiosInstance'
import { useAuth } from '../../context/AuthContext'

export default function TabLogin({ onContinuar }) {
  const { login: loginCtx } = useAuth()
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [cargando, setCargando]       = useState(false)
  const [error, setError]             = useState('')

  const labelClass = 'block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5'
  const inputClass = 'w-full bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-orange-400 transition-colors placeholder-gray-300'

  const handleSubmit = async () => {
    if (!email || !password) return
    setCargando(true)
    setError('')
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      loginCtx(data.token, { rol: data.rol, nombre: data.nombre, usuarioId: data.usuarioId })
      onContinuar()
    } catch (e) {
      setError(e.response?.status === 401
        ? 'Correo o contraseña incorrectos.'
        : 'Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">
        Ingresa tus credenciales
      </p>

      <div className="space-y-4">

        <div>
          <label className={labelClass}>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@correo.cl"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Contraseña</label>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-3 gap-2 focus-within:border-orange-400 transition-colors">
            <input
              type={verPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-transparent outline-none text-sm text-gray-800 w-full placeholder-gray-300"
            />
            <button type="button" onClick={() => setVerPassword(!verPassword)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              {verPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <p className="text-right mt-1.5">
            <span className="text-xs text-orange-500 font-semibold cursor-pointer hover:underline">
              ¿Olvidaste tu contraseña?
            </span>
          </p>
        </div>

      </div>

      {error && (
        <p className="mt-4 text-red-500 text-xs font-semibold text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!email || !password || cargando}
        className="mt-8 w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl uppercase text-sm tracking-widest transition-colors"
      >
        {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión y Confirmar →'}
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        ¿No tienes cuenta?{' '}
        <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
          Crea una gratis
        </span>
      </p>
    </div>
  )
}
