import { Calculator, Bot } from 'lucide-react'

export default function HeroCotizador({ modo, setModo }) {
  return (
    <main
      className="text-white px-6 relative flex items-center justify-center"
      style={{
        backgroundImage: "url('/img/Cotizador/herosection_cotizador.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 15%',
        minHeight: '300px',
      }}
    >
      <div className="absolute inset-0 bg-gray-900/85" />
      <div className="text-center relative z-10 w-full max-w-2xl">
        <h1 className="text-3xl font-black uppercase mb-8 tracking-wide">
          ¿Cómo quieres cotizar tu servicio hoy?
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setModo('manual')}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 font-bold uppercase text-sm tracking-wider transition-all
              ${modo === 'manual'
                ? 'border-orange-500 bg-orange-500/10 text-white'
                : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-400'
              }`}
          >
            <Calculator size={20} className={modo === 'manual' ? 'text-orange-500' : 'text-gray-400'} />
            Cotizador Manual
          </button>

          <button
            onClick={() => setModo('ia')}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 font-bold uppercase text-sm tracking-wider transition-all
              ${modo === 'ia'
                ? 'border-orange-500 bg-orange-500/10 text-white'
                : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-400'
              }`}
          >
            <Bot size={20} className={modo === 'ia' ? 'text-orange-500' : 'text-gray-400'} />
            Cotizador Inteligente IA
          </button>
        </div>
      </div>
    </main>
  )
}
