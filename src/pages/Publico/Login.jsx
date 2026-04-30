import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import InicioSesion from '../../components/login/InicioSesion'
import { login } from '../../services/authService'

export default function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resultado, setResultado] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log("CLICK LOGIN")

    try {
      const { data } = await login({
        email,
        password,
      })

      localStorage.setItem("token", data.token)
      localStorage.setItem("rol", data.rol)
      localStorage.setItem("nombre", data.nombre)

      setResultado(data)

      alert("Login exitoso ")

      navigate("/dashboard")

    } catch (error) {
      console.log(error)
      alert("Error en login ")
    }
  }

  return (
    <div>
      <Navbar />
      
      <div>
        <InicioSesion 
          email={email} 
          password={password}
          setEmail={setEmail}
          setPassword={setPassword} 
          handleLogin={handleLogin}
        />
      </div>

      <Footer />
    </div>
  )
}