import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import InicioSesion from '../../components/login/InicioSesion'
import { register } from '../../services/authService'

export default function Register() {

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    console.log("CLICK REGISTER")

    try {
      await register({
        email,
        password,
        nombre,
        apellido,
        rolNombre: "CLIENTE"
      })

      alert("Usuario registrado exitosamente")

      navigate("/login")

    } catch (error) {
      console.log(error)
      alert("Error en registro")
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
          handleLogin={handleRegister}  

          
          nombre={nombre}
          apellido={apellido}
          setNombre={setNombre}
          setApellido={setApellido}
          esRegistro={true}
        />
      </div>

      <Footer />
    </div>
  )
}