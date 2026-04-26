import { useState } from "react";
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import InicioSesion from '../../components/login/InicioSesion'
import { login } from '../../services/authService'

export default function Login() {
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resultado, setResultado] = useState(null)

  const handleLogin = async (loginData) => {
    try {
      const { data } = await login({
        email,
        password,
      })

      setResultado(data)

    } catch (error) {
      console.log(error)
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
        />
      </div>

      <Footer />
    </div>
  )
}