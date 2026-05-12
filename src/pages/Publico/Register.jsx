import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar       from '../../components/Navbar'
import Footer       from '../../components/Footer'
import InicioSesion from '../../components/login/InicioSesion'
import { register } from '../../services/authService'

export default function Register() {
  const navigate = useNavigate()

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [nombre, setNombre]       = useState('')
  const [apellido, setApellido]   = useState('')
  const [telefono, setTelefono]   = useState('')
  const [direccion, setDireccion] = useState('')
  const [rut, setRut]             = useState('')
  const [error, setError]         = useState(null)
  const [cargando, setCargando]   = useState(false)

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

      alert('Usuario registrado exitosamente')
      navigate('/login')
    } catch {
      setError('Error al registrar. Verifica tus datos e intenta nuevamente.')
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
