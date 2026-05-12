import { useState } from 'react'
import TabLogin       from './TabLogin'
import TabCrearCuenta from './TabCrearCuenta'

export default function PasoCuenta({ onVolver, onContinuar, vehiculo }) {
  const [modo, setModo] = useState('login')

  return (
    <div>
      <div className="border-l-4 border-orange-500 pl-4 mb-8">
        <h2 className="text-2xl font-black text-gray-800 uppercase">Confirma tu identidad</h2>
        <p className="text-gray-500 text-sm mt-1">Inicia sesión o crea una cuenta para reservar tu hora.</p>
      </div>

      <div className="flex gap-0 mb-8 border-b border-gray-200">
        <button
          onClick={() => setModo('login')}
          className={`px-6 py-3 font-black text-sm uppercase tracking-wider transition-all duration-200 border-b-2 -mb-px
            ${modo === 'login'
              ? 'border-orange-500 text-orange-500'
              : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => setModo('crearCuenta')}
          className={`px-6 py-3 font-black text-sm uppercase tracking-wider transition-all duration-200 border-b-2 -mb-px
            ${modo === 'crearCuenta'
              ? 'border-orange-500 text-orange-500'
              : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
        >
          Crear Cuenta
        </button>
      </div>

      {modo === 'login'       && <TabLogin       onContinuar={onContinuar} />}
      {modo === 'crearCuenta' && <TabCrearCuenta onContinuar={onContinuar} vehiculo={vehiculo} />}

      <button
        onClick={onVolver}
        className="mt-6 flex items-center gap-2 text-gray-400 font-bold uppercase text-xs hover:text-gray-700 transition-colors"
      >
        ← Volver al paso anterior
      </button>
    </div>
  )
}
