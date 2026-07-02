import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { ExternalLink, RefreshCw, Monitor, Smartphone } from 'lucide-react'

export default function VerTienda() {
  const [modo, setModo] = useState('desktop')
  const [key, setKey] = useState(0)

  const recargar = () => setKey(k => k + 1)

  const anchoIframe = modo === 'desktop' ? '100%' : '390px'

  return (
    <AdminLayout>
      <div className="flex flex-col h-full space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Vista de la Tienda</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Así es como tu cliente ve la tienda pública
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Modo desktop / móvil */}
            <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1">
              <button
                onClick={() => setModo('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  modo === 'desktop' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Monitor size={13} />
                Desktop
              </button>
              <button
                onClick={() => setModo('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  modo === 'mobile' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone size={13} />
                Móvil
              </button>
            </div>

            <button
              onClick={recargar}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 rounded-lg text-xs font-medium transition-colors"
            >
              <RefreshCw size={13} />
              Recargar
            </button>

            <a
              href="/tienda"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-orange-500 rounded-lg text-xs font-medium transition-colors"
            >
              <ExternalLink size={13} />
              Abrir en pestaña
            </a>
          </div>
        </div>

        {/* Barra URL falsa */}
        <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 flex-shrink-0">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 bg-gray-900 rounded-lg px-3 py-1.5 text-xs text-gray-400 font-mono">
            {window.location.origin}/tienda
          </div>
        </div>

        {/* Marco del iframe */}
        <div className={`flex-1 min-h-0 flex ${modo === 'mobile' ? 'justify-center' : ''}`}>
          <div
            className={`bg-white rounded-xl overflow-hidden border border-gray-700 shadow-2xl transition-all duration-300 ${
              modo === 'mobile' ? 'w-[390px]' : 'w-full'
            }`}
            style={{ height: 'calc(100vh - 280px)' }}
          >
            <iframe
              key={key}
              src="/tienda"
              title="Vista previa de la tienda"
              className="w-full h-full border-0"
              style={{ width: anchoIframe }}
            />
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}