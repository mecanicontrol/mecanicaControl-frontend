import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import api from '../../api/axiosInstance'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function VerificarEmail() {
  const [searchParams] = useSearchParams()
  const [estado, setEstado] = useState('cargando') // 'cargando' | 'ok' | 'error'
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setEstado('error')
      setMensaje('El enlace de verificación no es válido.')
      return
    }

    api.get(`/api/auth/verificar?token=${token}`)
      .then(() => {
        setEstado('ok')
        setMensaje('Tu correo ha sido verificado correctamente. Ya puedes iniciar sesión.')
      })
      .catch((e) => {
        setEstado('error')
        const msg = e.response?.data?.mensaje ?? e.response?.data?.message
        setMensaje(msg ?? 'El enlace es inválido o ya expiró. Regístrate de nuevo.')
      })
  }, [searchParams])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">

          {estado === 'cargando' && (
            <>
              <Loader size={48} className="mx-auto text-orange-400 animate-spin mb-4" />
              <h2 className="text-xl font-bold text-gray-700">Verificando tu correo...</h2>
            </>
          )}

          {estado === 'ok' && (
            <>
              <CheckCircle size={52} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-black text-gray-800 mb-2">¡Cuenta verificada!</h2>
              <p className="text-gray-500 text-sm mb-8">{mensaje}</p>
              <Link
                to="/login"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-black py-3 px-8 rounded-xl uppercase text-sm tracking-widest transition-colors"
              >
                Iniciar sesión
              </Link>
            </>
          )}

          {estado === 'error' && (
            <>
              <XCircle size={52} className="mx-auto text-red-400 mb-4" />
              <h2 className="text-2xl font-black text-gray-800 mb-2">Enlace inválido</h2>
              <p className="text-gray-500 text-sm mb-8">{mensaje}</p>
              <Link
                to="/register"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-black py-3 px-8 rounded-xl uppercase text-sm tracking-widest transition-colors"
              >
                Registrarse de nuevo
              </Link>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
