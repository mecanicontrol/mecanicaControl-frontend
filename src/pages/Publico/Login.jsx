import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import InicioSesion from '../../components/login/InicioSesion'

export default function Login() {
  return (
    <div>
        <Navbar />
        <div>
        <InicioSesion />
        </div>

        <Footer />
    </div>
  )
}