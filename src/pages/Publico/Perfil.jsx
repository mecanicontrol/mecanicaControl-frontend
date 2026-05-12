import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import PerfilUsuario from '../../components/perfil/PerfilUsuario'

export default function Perfil() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
        <PerfilUsuario />
      </div>
      <Footer />
    </div>
  )
}
