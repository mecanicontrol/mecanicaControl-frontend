import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar       from '../../components/Navbar'
import Footer       from '../../components/Footer'
import InicioSesion from '../../components/login/InicioSesion'
import { login }    from '../../services/authService'
import { useAuth }  from '../../context/AuthContext'

export default function Login() {
  const navigate         = useNavigate()
  const { login: loginCtx } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [cargando, setCargando] = useState(false)

  const handleLogin = async (e) => {
    e?.preventDefault()
    setError(null)
    setCargando(true)

    try {
      const { data } = await login({ email, password })

      loginCtx(data.token, {
        token: data.token,
        rol: data.rol,
        nombre: data.nombre,
        email: data.email ?? email,
        usuarioId: data.usuarioId,
      })

      if (data.rol === 'ADMIN' || data.rol === 'TECNICO') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div>
      <Navbar />
      <InicioSesion
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        handleLogin={handleLogin}
        error={error}
        cargando={cargando}
      />
      <Footer />
    </div>
  )
}
