// pages/Publico/Cotizador.jsx
import DiagnosticoIA    from '../../components/cotizador/DiagnosticoIA'
import ServicioCard     from '../../components/cotizador/ServicioCard'
import ResumenServicios from '../../components/cotizador/ResumenServicios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import HeroCotizador from '../../components/cotizador/HeroCotizador'


export default function Cotizador() {
  return (
    <div>
      <Navbar />
      <HeroCotizador />
      <div className="grid grid-cols-10 gap-6 px-6 py-8 bg-gray-100">
        <div className="col-span-6">
          <ServicioCard />
          <ResumenServicios />
        </div>
        <div className="col-span-4">
          <DiagnosticoIA />
        </div>
      </div>
      <Footer />
    </div>
  )
}