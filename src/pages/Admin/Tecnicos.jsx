import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { obtenerUsuarios } from '../../services/adminUsuariosService'
import { User, CheckCircle, XCircle, RefreshCw, Users } from 'lucide-react'

export default function Tecnicos() {
  const [tecnicos, setTecnicos]   = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  const cargar = async () => {
    setCargando(true)
    setError(null)
    try {
      const { data } = await obtenerUsuarios()
      const lista = Array.isArray(data) ? data : []
      setTecnicos(lista.filter(u => u.rol === 'TECNICO'))
    } catch {
      setError('Error al cargar técnicos')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Técnicos</h2>
            <p className="text-gray-500 text-sm mt-0.5">Personal técnico registrado en el sistema</p>
          </div>
          <button
            onClick={cargar}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total técnicos</p>
            <p className="text-3xl font-black text-white mt-1">{cargando ? '—' : tecnicos.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Activos</p>
            <p className="text-3xl font-black text-green-400 mt-1">
              {cargando ? '—' : tecnicos.filter(t => t.activo).length}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Inactivos</p>
            <p className="text-3xl font-black text-red-400 mt-1">
              {cargando ? '—' : tecnicos.filter(t => !t.activo).length}
            </p>
          </div>
        </div>

        {/* Tabla */}
        {cargando ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button onClick={cargar} className="text-orange-500 text-sm hover:underline">Reintentar</button>
          </div>
        ) : tecnicos.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <Users size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No hay técnicos registrados</p>
            <p className="text-gray-600 text-sm mt-1">Los usuarios con rol TÉCNICO aparecerán aquí.</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Técnico</th>
                    <th className="text-left px-5 py-3">Correo</th>
                    <th className="text-left px-5 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {tecnicos.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <User size={15} className="text-orange-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">{t.nombre} {t.apellido}</p>
                            <p className="text-gray-500 text-xs mt-0.5">ID: {t.id?.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-300">{t.email}</td>
                      <td className="px-5 py-4">
                        {t.activo ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                            <CheckCircle size={11} /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            <XCircle size={11} /> Inactivo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Nota informativa */}
        <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3">
          <User size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-400/80">
            Esta vista muestra todos los usuarios con rol <strong>TÉCNICO</strong> registrados en el sistema.
            Para gestionar disponibilidad horaria o especialidades, se requiere un endpoint adicional en el backend.
          </p>
        </div>

      </div>
    </AdminLayout>
  )
}