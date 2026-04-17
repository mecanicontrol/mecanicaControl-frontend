import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        <div>
          <h3 className="text-white font-bold mb-3">MecánicaHub</h3>
          <p className="text-sm">Servicio técnico automotriz en Santiago, Chile.</p>
        </div>

        <div>
          <h3 className="text-white font-bold mb-3">Navegación</h3>
          <ul className="text-sm space-y-2">
            <li><Link to="/servicios" className="hover:text-white">Servicios</Link></li>
            <li><Link to="/cotizador" className="hover:text-white">Cotizador</Link></li>
            <li><Link to="/agendar" className="hover:text-white">Agendar Cita</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-3">Contacto</h3>
          <p className="text-sm">Av. Santa Rosa 1234, Santiago</p>
          <p className="text-sm mt-1">+56 2 2345 6789</p>
          <p className="text-sm mt-1">contacto@mecanicahub.cl</p>
        </div>

      </div>
      <div className="border-t border-gray-700 text-center py-4 text-xs text-gray-600">
        © 2024 MecánicaHub Chile
      </div>
    </footer>
  )
}
