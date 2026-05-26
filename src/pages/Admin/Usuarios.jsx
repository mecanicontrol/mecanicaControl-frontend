import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import * as svc from '../../services/adminUsuariosService'
import {
  Plus, Edit3, ToggleLeft, ToggleRight, Key, Search, Mail, User, Shield,
  AlertTriangle, CheckCircle, Eye, EyeOff
} from 'lucide-react'

const ROLES = ['CLIENTE', 'TECNICO', 'ADMIN']
const ROL_COLORS = {
  ADMIN:   'bg-purple-500/20 text-purple-400 border-purple-500/30',
  CLIENTE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TECNICO: 'bg-green-500/20 text-green-400 border-green-500/30',
}

export default function Usuarios() {
  const { usuario: yo } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  // Filtros
  const [filtroRol, setFiltroRol] = useState('')
  const [filtroBuscar, setFiltroBuscar] = useState('')

  // Modal crear/editar
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', rolNombre: 'CLIENTE', telefono: '' })
  const [guardando, setGuardando] = useState(false)
  const [formError, setFormError] = useState(null)

  // Modal cambiar password
  const [passModal, setPassModal] = useState(null)
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const cargar = async () => {
    setCargando(true)
    setError(null)
    try {
      const { data } = await svc.obtenerUsuarios()
      let lista = Array.isArray(data) ? data : data?.content ?? []
      if (filtroRol) lista = lista.filter(u => (u.rol || u.rolNombre) === filtroRol)
      if (filtroBuscar) {
        const q = filtroBuscar.toLowerCase()
        lista = lista.filter(u => `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(q))
      }
      setUsuarios(lista)
    } catch {
      setError('Error al cargar usuarios')
      setUsuarios([])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiltrar = (e) => { e.preventDefault(); cargar() }

  // ─── Crear / Editar ───
  const abrirCrear = () => {
    setModal('crear')
    setForm({ nombre: '', apellido: '', email: '', password: '', rolNombre: 'CLIENTE', telefono: '' })
    setFormError(null)
  }

  const abrirEditar = (u) => {
    setModal('editar')
    setForm({ id: u.id, nombre: u.nombre || '', apellido: u.apellido || '', email: u.email || '', rolNombre: u.rol || u.rolNombre || 'CLIENTE', telefono: u.telefono || '' })
    setFormError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.email) { setFormError('Nombre y email son requeridos'); return }
    if (modal === 'crear' && !form.password) { setFormError('La contraseña es requerida'); return }
    setGuardando(true)
    try {
      const payload = { ...form }
      if (modal === 'editar') delete payload.password
      if (modal === 'crear') await svc.crearUsuario(payload)
      else await svc.actualizarUsuario(form.id, payload)
      setMensaje({ tipo: 'ok', texto: modal === 'crear' ? 'Usuario creado. Perfil generado automáticamente.' : 'Usuario actualizado' })
      setModal(null); cargar()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || ''
      setFormError(msg.includes('email') || msg.includes('Email') ? 'Ya existe un usuario con ese email' : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  // ─── Activar / Desactivar ───
  const handleToggle = async (u) => {
    if (u.id === yo?.usuarioId) {
      setMensaje({ tipo: 'error', texto: 'No puedes desactivar tu propio usuario' })
      return
    }
    try {
      await svc.toggleUsuario(u.id)
      setMensaje({ tipo: 'ok', texto: `Usuario ${u.activo ? 'desactivado' : 'activado'}` })
      cargar()
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al cambiar estado' })
    }
  }

  // ─── Cambiar contraseña ───
  const abrirCambiarPass = (u) => {
    setPassModal(u)
    setNuevaPassword('')
  }

  const handleCambiarPass = async () => {
    if (!nuevaPassword || nuevaPassword.length < 8) {
      setMensaje({ tipo: 'error', texto: 'La contraseña debe tener al menos 8 caracteres' })
      return
    }
    setGuardando(true)
    try {
      await svc.cambiarPassword(passModal.id, nuevaPassword)
      setMensaje({ tipo: 'ok', texto: 'Contraseña actualizada' })
      setPassModal(null)
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al cambiar contraseña' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Usuarios</h2>
            <p className="text-gray-500 text-sm mt-0.5">Gestión de accesos y roles</p>
          </div>
          <button onClick={abrirCrear}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={16} /> Crear usuario
          </button>
        </div>

        {mensaje && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
            mensaje.tipo === 'ok' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {mensaje.tipo === 'ok' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {mensaje.texto}
            <button onClick={() => setMensaje(null)} className="ml-auto text-gray-500 hover:text-white">&times;</button>
          </div>
        )}

        {/* Filtros */}
        <form onSubmit={handleFiltrar} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-gray-500 font-semibold block mb-1">Rol</label>
            <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
            >
              <option value="">Todos</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="text-xs text-gray-500 font-semibold block mb-1">Buscar</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" value={filtroBuscar} onChange={(e) => setFiltroBuscar(e.target.value)}
                placeholder="Nombre o email..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              />
            </div>
          </div>
          <button type="submit"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Filtrar
          </button>
        </form>

        {/* Tabla */}
        {cargando ? (
          <p className="text-gray-500 text-center py-12 animate-pulse">Cargando usuarios...</p>
        ) : error ? (
          <div className="text-center py-12"><p className="text-red-400">{error}</p><button onClick={cargar} className="text-orange-500 text-sm mt-2 hover:underline">Reintentar</button></div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Usuario</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Rol</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-right px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {usuarios.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">No se encontraron usuarios</td></tr>
                )}
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{u.nombre} {u.apellido || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${ROL_COLORS[u.rol || u.rolNombre] || ''}`}>
                        {u.rol || u.rolNombre}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${u.activo !== false ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {u.activo !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => abrirEditar(u)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded" title="Editar"
                        ><Edit3 size={14} /></button>
                        <button onClick={() => abrirCambiarPass(u)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded" title="Cambiar contraseña"
                        ><Key size={14} /></button>
                        <button onClick={() => handleToggle(u)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                          title={u.activo !== false ? (u.id === yo?.usuarioId ? 'No puedes desactivarte' : 'Desactivar') : 'Activar'}
                        >
                          {u.activo !== false ? <ToggleRight size={14} className="text-green-400" /> : <ToggleLeft size={14} className="text-gray-500" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── MODAL CREAR / EDITAR ─── */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setModal(null)}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{modal === 'crear' ? 'Crear Usuario' : 'Editar Usuario'}</h3>
                <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white">&times;</button>
              </div>
              {formError && <p className="text-red-400 text-sm mb-3 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{formError}</p>}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
                  <input placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
                </div>
                <input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
                {modal === 'crear' && (
                  <input type="password" placeholder="Contraseña *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
                )}
                <input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">Rol</label>
                  <select value={form.rolNombre} onChange={(e) => setForm({ ...form, rolNombre: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                    disabled={modal === 'editar'}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {modal === 'editar' && <p className="text-xs text-gray-600 mt-1">El rol no se puede cambiar una vez creado</p>}
                </div>
                {modal === 'crear' && (
                  <p className="text-xs text-gray-500 bg-gray-900/50 rounded-lg px-3 py-2">
                    {form.rolNombre === 'TECNICO' && 'Se creará automáticamente el perfil de técnico.'}
                    {form.rolNombre === 'CLIENTE' && 'Se creará automáticamente el perfil de cliente.'}
                    {form.rolNombre === 'ADMIN' && 'Se creará con acceso total al panel.'}
                  </p>
                )}
                <button type="submit" disabled={guardando}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {guardando ? 'Guardando...' : modal === 'crear' ? 'Crear usuario' : 'Guardar cambios'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ─── MODAL CAMBIAR CONTRASEÑA ─── */}
        {passModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPassModal(null)}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Cambiar Contraseña</h3>
                <button onClick={() => setPassModal(null)} className="text-gray-500 hover:text-white">&times;</button>
              </div>
              <p className="text-sm text-gray-400 mb-4">Usuario: <span className="text-white">{passModal.nombre} ({passModal.email})</span></p>
              <div className="relative mb-4">
                <input type={showPass ? 'text' : 'password'} value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Nueva contraseña (mín. 8 caracteres)"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 pr-10 text-sm text-white outline-none focus:border-orange-500"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPassModal(null)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button onClick={handleCambiarPass} disabled={guardando}
                  className="flex-1 px-4 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {guardando ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
