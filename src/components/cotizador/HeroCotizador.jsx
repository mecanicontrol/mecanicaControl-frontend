import { Link } from "react-router-dom"

export default function HeroCotizador() {
  return(
    <main
      className="text-white px-6 relative flex items-center justify-center"
      style={{
        backgroundImage: "url('/img/Cotizador/herosection_cotizador.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 15%',
        minHeight: '500px',
      }}
    >
      <div className="absolute inset-0 bg-gray-900/70" />
        <div className="text-center relative z-10">
            <h1 className="text-7xl font-bold">
                <span>COTIZA TU SERVICIO</span>
                <span className="text-orange-500"> SIN <br /> COMPROMISO</span>
            </h1>
            <p className="text-gray-300">
                Obtén presupuestos precisos en segundos. Usa nuestro cotizador rápido o<br /> 
                deja que nuestra IA analice el estado de tu vehiculo.<br />
            </p>
        </div>
    </main>

  ) 
}
