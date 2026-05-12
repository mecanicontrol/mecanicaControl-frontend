import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { User, Mail, Phone, MapPin, FileText, Shield, Save } from 'lucide-react'

export default function PerfilUsuario() {
  const { usuario } = useAuth()

  const [editando, setEditando] = useState(false)
  const [telefono, setTelefono] = useState(usuario?.telefono ?? '')
  const [direccion, setDireccion] = useState(usuario?.direccion ?? '')
  const [rut, setRut] = useState(usuario?.rut ?? '')
  const [guardado, setGuardado] = useState(false)

  const rolLabel = {
    ADMIN: 'Administrador',
    CLIENTE: 'Cliente',
    TECNICO: 'Técnico',
  }

  const handleGuardar = () => {
    setGuardado(true)
    setEditando(false)
    setTimeout(() => setGuardado(false), 3000)
  }

  if (!usuario) {
    return <p className="text-gray-400 text-center py-8">Debes iniciar sesión para ver tu perfil.</p>
  }

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">

      {/* Cabecera */}
      <div className="bg-gradient-to-r from-orange-500/20 to-orange-500/5 px-8 py-6 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
            <User size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{usuario.nombre ?? 'Usuario'}</h2>
            <span className="inline-block mt-1 px-3 py-0.5 text-xs font-bold uppercase rounded-full bg-orange-500/20 text-orange-400">
              {rolLabel[usuario.rol] ?? usuario.rol}
            </span>
          </div>
        </div>
      </div>

      {/* Datos de cuenta */}
      <div className="px-8 py-6 space-y-6">

        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Datos de la Cuenta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 flex items-center gap-3">
              <User size={18} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="text-sm font-medium">{usuario.nombre ?? '—'}</p>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 flex items-center gap-3">
              <Mail size={18} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Correo electrónico</p>
                <p className="text-sm font-medium">{usuario.email ?? '—'}</p>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 flex items-center gap-3">
              <Shield size={18} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Rol</p>
                <p className="text-sm font-medium">{rolLabel[usuario.rol] ?? usuario.rol}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Datos de perfil */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Datos del Perfil
            </h3>
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="text-xs text-orange-500 hover:text-orange-400 font-medium"
              >
                Editar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 flex items-center gap-3">
              <Phone size={18} className="text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Teléfono</p>
                {editando ? (
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="bg-gray-800 rounded px-2 py-1 text-sm w-full mt-1 border border-gray-700 focus:border-orange-500 outline-none"
                  />
                ) : (
                  <p className="text-sm font-medium">{telefono || '—'}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 flex items-center gap-3">
              <MapPin size={18} className="text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Dirección</p>
                {editando ? (
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Av. Siempre Viva 742"
                    className="bg-gray-800 rounded px-2 py-1 text-sm w-full mt-1 border border-gray-700 focus:border-orange-500 outline-none"
                  />
                ) : (
                  <p className="text-sm font-medium">{direccion || '—'}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 flex items-center gap-3">
              <FileText size={18} className="text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">RUT</p>
                {editando ? (
                  <input
                    type="text"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    placeholder="12.345.678-9"
                    className="bg-gray-800 rounded px-2 py-1 text-sm w-full mt-1 border border-gray-700 focus:border-orange-500 outline-none"
                  />
                ) : (
                  <p className="text-sm font-medium">{rut || '—'}</p>
                )}
              </div>
            </div>
          </div>

          {editando && (
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setEditando(false)
                  setTelefono(usuario?.telefono ?? '')
                  setDireccion(usuario?.direccion ?? '')
                  setRut(usuario?.rut ?? '')
                }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="px-4 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save size={14} />
                Guardar cambios
              </button>
            </div>
          )}

          {guardado && (
            <p className="text-sm text-green-400 mt-3">Perfil actualizado correctamente.</p>
          )}
        </div>
      </div>
    </div>
  )
}
