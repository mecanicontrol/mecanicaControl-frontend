import { useEffect, useRef, useState } from 'react'
import { Send, MessageCircle, Loader2 } from 'lucide-react'
import { obtenerMensajesChat, enviarMensajeChat } from '../../services/chatService'
import { useAuth } from '../../context/AuthContext'

function fmtHora(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

const ROL_STYLE = {
  TECNICO: { burbuja: 'bg-blue-500/20 border-blue-500/30 text-blue-100', etiqueta: 'text-blue-400' },
  ADMIN:   { burbuja: 'bg-purple-500/20 border-purple-500/30 text-purple-100', etiqueta: 'text-purple-400' },
  CLIENTE: { burbuja: 'bg-orange-500/20 border-orange-500/30 text-orange-100', etiqueta: 'text-orange-400' },
}

export default function ChatOT({ codigoOt, embedded = false }) {
  const { usuario } = useAuth()
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto]       = useState('')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!codigoOt) return
    obtenerMensajesChat(codigoOt)
      .then(r => setMensajes(r.data || []))
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [codigoOt])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const enviar = async () => {
    const contenido = texto.trim()
    if (!contenido || enviando) return
    setEnviando(true)
    setTexto('')
    try {
      const { data } = await enviarMensajeChat(codigoOt, contenido)
      setMensajes(prev => [...prev, data])
    } catch {
      setTexto(contenido)
    } finally {
      setEnviando(false)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() }
  }

  const esPropio = (m) => m.autor === usuario?.nombre

  return (
    <div className={`flex flex-col ${embedded ? '' : 'bg-gray-900 border border-gray-800 rounded-2xl'}`} style={{ minHeight: embedded ? 280 : 320, maxHeight: embedded ? 420 : 480 }}>
      {/* Header — solo cuando no está embebido */}
      {!embedded && (
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800 flex-shrink-0">
          <MessageCircle size={16} className="text-orange-400" />
          <p className="text-sm font-black text-white uppercase tracking-wide">Chat con el taller</p>
          <span className="ml-auto text-xs text-gray-600">OT {codigoOt}</span>
        </div>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {cargando ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-gray-600" />
          </div>
        ) : mensajes.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle size={28} className="text-gray-700 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Aún no hay mensajes. ¡Inicia la conversación!</p>
          </div>
        ) : (
          mensajes.map(m => {
            const propio = esPropio(m)
            const estilo = ROL_STYLE[m.rol] || ROL_STYLE.CLIENTE
            return (
              <div key={m.id} className={`flex flex-col gap-0.5 ${propio ? 'items-end' : 'items-start'}`}>
                <p className={`text-xs font-bold ${estilo.etiqueta}`}>{m.autor}</p>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl border text-sm leading-relaxed ${estilo.burbuja} ${propio ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                  {m.contenido}
                </div>
                <p className="text-xs text-gray-700">{fmtHora(m.creadoAt)}</p>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4 flex gap-3 flex-shrink-0">
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={onKey}
          placeholder="Escribe un mensaje... (Enter para enviar)"
          rows={1}
          className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-600 text-sm rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:border-orange-500/50 transition"
        />
        <button
          onClick={enviar}
          disabled={!texto.trim() || enviando}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-400 disabled:bg-gray-800 disabled:text-gray-600 text-white transition"
        >
          {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}