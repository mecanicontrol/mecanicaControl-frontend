import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar       from '../../components/Navbar'
import Footer       from '../../components/Footer'
import InicioSesion from '../../components/login/InicioSesion'
import { register } from '../../services/authService'
import { Mail } from 'lucide-react'

export default function Register() {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [nombre, setNombre]       = useState('')
  const [apellido, setApellido]   = useState('')
  const [telefono, setTelefono]   = useState('')
  const [direccion, setDireccion] = useState('')
  const [rut, setRut]             = useState('')
  const [error, setError]         = useState(null)
  const [cargando, setCargando]   = useState(false)
  const [enviado, setEnviado]     = useState(false)

  const handleRegister = async (e) => {
    e?.preventDefault()
    setError(null)
    setCargando(true)

    try {
      await register({
        email,
        password,
        nombre,
        apellido,
        telefono,
        direccion,
        rut,
        rolNombre: 'CLIENTE',
      })
      setEnviado(true)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al registrar. Verifica tus datos e intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
            <Mail size={52} className="mx-auto text-orange-400 mb-4" />
            <h2 className="text-2xl font-black text-gray-800 mb-2">Revisa tu correo</h2>
            <p className="text-gray-500 text-sm mb-2">
              Te enviamos un enlace de verificación a <strong>{email}</strong>.
            </p>
            <p className="text-gray-400 text-xs mb-8">El enlace expira en 24 horas.</p>
            <Link
              to="/login"
              className="inline-block text-orange-500 hover:text-orange-600 font-semibold text-sm underline"
            >
              Ir al inicio de sesión
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <InicioSesion
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        handleLogin={handleRegister}
        nombre={nombre}
        apellido={apellido}
        setNombre={setNombre}
        setApellido={setApellido}
        telefono={telefono}
        direccion={direccion}
        rut={rut}
        setTelefono={setTelefono}
        setDireccion={setDireccion}
        setRut={setRut}
        esRegistro={true}
        error={error}
        cargando={cargando}
      />
      <Footer />
    </div>
  )
}
