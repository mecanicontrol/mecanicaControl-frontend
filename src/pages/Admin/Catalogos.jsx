import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import useLista from './useLista'
import * as svc from '../../services/adminCatalogosService'
import { Plus, Wrench, Tag, Car, List, Star, AlertTriangle, CheckCircle } from 'lucide-react'

const TABS = [
  { key: 'servicios',   label: 'Servicios',   icon: Wrench },
  { key: 'categorias',  label: 'Categorías',   icon: Tag },
  { key: 'marcas',      label: 'Marcas',       icon: Car },
  { key: 'modelos',     label: 'Modelos',      icon: List },
  { key: 'niveles',     label: 'Fidelización', icon: Star },
]

export default function Catalogos() {
  const [tab, setTab] = useState('servicios')
  const [mensaje, setMensaje] = useState(null)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">Catálogos</h2>
          <p className="text-gray-500 text-sm mt-0.5">Gestión de datos maestros del sistema</p>
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

        <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-xl p-1 overflow-x-auto">
          {TABS.map((item) => {
            const Icon = item.icon
            return (
            <button key={item.key} onClick={() => setTab(item.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                tab === item.key ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon size={14} /> {item.label}
            </button>
            )
          })}
        </div>

        {tab === 'servicios'   && <TabServicios   mensaje={setMensaje} />}
        {tab === 'categorias'  && <TabCategorias  mensaje={setMensaje} />}
        {tab === 'marcas'      && <TabMarcas      mensaje={setMensaje} />}
        {tab === 'modelos'     && <TabModelos      mensaje={setMensaje} />}
        {tab === 'niveles'     && <TabNiveles      mensaje={setMensaje} />}
      </div>
    </AdminLayout>
  )
}

function Tabla({ columnas, datos, cargando, vacio }) {
  if (cargando) return <p className="text-gray-500 text-center py-8 animate-pulse">Cargando...</p>
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
            {columnas.map((c, i) => <th key={i} className={`px-4 py-3 ${i === columnas.length - 1 ? 'text-right' : 'text-left'}`}>{c}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          {datos.length === 0 && <tr><td colSpan={columnas.length} className="text-center py-8 text-gray-500">{vacio || 'Sin datos'}</td></tr>}
          {datos}
        </tbody>
      </table>
    </div>
  )
}

function ModalForm({ titulo, onClose, onSubmit, guardando, error, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{titulo}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">&times;</button>
        </div>
        {error && <p className="text-red-400 text-sm mb-3 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-3">
          {children}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">Cancelar</button>
            <button type="submit" disabled={guardando} className="flex-1 px-4 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors">
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── TAB: SERVICIOS (CRUD) ───
function TabServicios({ mensaje: setMsj }) {
  const { datos, cargando, recargar } = useLista(svc.obtenerServiciosTodos)
  const { datos: categorias } = useLista(svc.obtenerCategoriasAdmin)
  const [modal, setModal] = useState(null) // null | 'crear' | servicio_obj
  const [form, setForm] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState(null)

  const abrirCrear = () => { setForm({ nombre: '', descripcion: '', duracionMinutos: '', precioBase: '', categoriaId: '', activo: true }); setModal('crear'); setErrorForm(null) }
  const abrirEditar = (s) => { setForm({ nombre: s.nombre, descripcion: s.descripcion || '', duracionMinutos: s.duracionMinutos || '', precioBase: s.precioBase || '', categoriaId: '', activo: true }); setModal(s); setErrorForm(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.categoriaId) return setErrorForm('Nombre y categoría son requeridos')
    setGuardando(true)
    try {
      const datos = { nombre: form.nombre, descripcion: form.descripcion, duracionMinutos: form.duracionMinutos ? Number(form.duracionMinutos) : null, precioBase: form.precioBase ? Number(form.precioBase) : 0, categoriaId: form.categoriaId }
      if (modal === 'crear') { await svc.crearServicio(datos); setMsj({ tipo: 'ok', texto: 'Servicio creado' }) }
      else { await svc.actualizarServicio(modal.id, datos); setMsj({ tipo: 'ok', texto: 'Servicio actualizado' }) }
      setModal(null); recargar()
    } catch { setErrorForm('Error al guardar el servicio') }
    finally { setGuardando(false) }
  }

  const eliminar = async (s) => {
    if (!confirm(`¿Desactivar "${s.nombre}"?`)) return
    try { await svc.eliminarServicio(s.id); setMsj({ tipo: 'ok', texto: 'Servicio desactivado' }); recargar() }
    catch { setMsj({ tipo: 'err', texto: 'Error al desactivar' }) }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={abrirCrear} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={14} /> Nuevo servicio
        </button>
      </div>
      <Tabla columnas={['Nombre', 'Precio base', 'Duración', 'Categoría', 'Acciones']} cargando={cargando} vacio="No hay servicios"
        datos={datos.map(s => (
          <tr key={s.id} className="hover:bg-gray-750">
            <td className="px-4 py-3 text-white">{s.nombre}</td>
            <td className="px-4 py-3 text-gray-300">{s.precioBase ? `$${Number(s.precioBase).toLocaleString('es-CL')}` : '—'}</td>
            <td className="px-4 py-3 text-gray-300">{s.duracionMinutos ? `${s.duracionMinutos} min` : '—'}</td>
            <td className="px-4 py-3 text-gray-400 text-xs">{s.categoriaNombre || '—'}</td>
            <td className="px-4 py-3 text-right">
              <button onClick={() => abrirEditar(s)} className="text-xs text-blue-400 hover:text-blue-300 mr-3">Editar</button>
              <button onClick={() => eliminar(s)} className="text-xs text-red-400 hover:text-red-300">Desactivar</button>
            </td>
          </tr>
        ))}
      />
      {modal && (
        <ModalForm titulo={modal === 'crear' ? 'Nuevo Servicio' : 'Editar Servicio'} onClose={() => setModal(null)} onSubmit={handleSubmit} guardando={guardando} error={errorForm}>
          <input placeholder="Nombre *" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
          <input placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Duración (min)" value={form.duracionMinutos} onChange={e => setForm({...form, duracionMinutos: e.target.value})} className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
            <input type="number" placeholder="Precio base" value={form.precioBase} onChange={e => setForm({...form, precioBase: e.target.value})} className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
          </div>
          <select value={form.categoriaId} onChange={e => setForm({...form, categoriaId: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500">
            <option value="">Seleccionar categoría *</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </ModalForm>
      )}
    </div>
  )
}

// ─── TAB: CATEGORÍAS (CRUD) ───
function TabCategorias({ mensaje: setMsj }) {
  const { datos, cargando, recargar } = useLista(svc.obtenerCategoriasAdmin)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState(null)

  const abrirCrear  = () => { setForm({ nombre: '', descripcion: '' }); setModal('crear'); setErrorForm(null) }
  const abrirEditar = (c) => { setForm({ nombre: c.nombre, descripcion: c.descripcion || '' }); setModal(c); setErrorForm(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre) return setErrorForm('El nombre es requerido')
    setGuardando(true)
    try {
      if (modal === 'crear') { await svc.crearCategoria(form); setMsj({ tipo: 'ok', texto: 'Categoría creada' }) }
      else { await svc.actualizarCategoria(modal.id, form); setMsj({ tipo: 'ok', texto: 'Categoría actualizada' }) }
      setModal(null); recargar()
    } catch { setErrorForm('Error al guardar') }
    finally { setGuardando(false) }
  }

  const eliminar = async (c) => {
    if (!confirm(`¿Eliminar "${c.nombre}"?`)) return
    try { await svc.eliminarCategoria(c.id); setMsj({ tipo: 'ok', texto: 'Categoría eliminada' }); recargar() }
    catch { setMsj({ tipo: 'err', texto: 'Error al eliminar (puede tener servicios asociados)' }) }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={abrirCrear} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={14} /> Nueva categoría
        </button>
      </div>
      <Tabla columnas={['Nombre', 'Descripción', 'Acciones']} cargando={cargando} vacio="No hay categorías"
        datos={datos.map(c => (
          <tr key={c.id} className="hover:bg-gray-750">
            <td className="px-4 py-3 text-white">{c.nombre}</td>
            <td className="px-4 py-3 text-gray-400 text-xs">{c.descripcion || '—'}</td>
            <td className="px-4 py-3 text-right">
              <button onClick={() => abrirEditar(c)} className="text-xs text-blue-400 hover:text-blue-300 mr-3">Editar</button>
              <button onClick={() => eliminar(c)} className="text-xs text-red-400 hover:text-red-300">Eliminar</button>
            </td>
          </tr>
        ))}
      />
      {modal && (
        <ModalForm titulo={modal === 'crear' ? 'Nueva Categoría' : 'Editar Categoría'} onClose={() => setModal(null)} onSubmit={handleSubmit} guardando={guardando} error={errorForm}>
          <input placeholder="Nombre *" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
          <input placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
        </ModalForm>
      )}
    </div>
  )
}

// ─── TAB: MARCAS (read + create) ───
function TabMarcas({ mensaje: setMsj }) {
  const { datos, cargando, recargar } = useLista(svc.obtenerMarcas)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nombre: '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre) return setError('El nombre es requerido')
    setGuardando(true)
    try {
      await svc.crearMarca(form)
      setMsj({ tipo: 'ok', texto: 'Marca creada' })
      setModal(false); recargar()
    } catch { setError('Error al crear la marca') }
    finally { setGuardando(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setModal(true); setForm({ nombre: '' }); setError(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={14} /> Nueva marca
        </button>
      </div>
      <Tabla columnas={['Nombre']} cargando={cargando} vacio="No hay marcas registradas"
        datos={datos.map((m) => (
          <tr key={m.id} className="hover:bg-gray-750">
            <td className="px-4 py-3 text-white">{m.nombre}</td>
          </tr>
        ))}
      />
      {modal && (
        <ModalForm titulo="Nueva Marca" onClose={() => setModal(false)} onSubmit={handleSubmit} guardando={guardando} error={error}>
          <input placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ nombre: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
        </ModalForm>
      )}
    </div>
  )
}

// ─── TAB: MODELOS (read + create) ───
function TabModelos({ mensaje: setMsj }) {
  const { datos: modelos, cargando, recargar } = useLista(svc.obtenerModelos)
  const { datos: marcas } = useLista(svc.obtenerMarcas)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', marcaVehiculoId: '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.marcaVehiculoId) return setError('Nombre y marca son requeridos')
    setGuardando(true)
    try {
      const marcaObj = marcas.find(m => m.id === form.marcaVehiculoId || String(m.id) === String(form.marcaVehiculoId))
      await svc.crearModelo({ nombre: form.nombre, marca: marcaObj || { id: form.marcaVehiculoId } })
      setMsj({ tipo: 'ok', texto: 'Modelo creado' })
      setModal(false); recargar()
    } catch { setError('Error al crear el modelo') }
    finally { setGuardando(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setModal(true); setForm({ nombre: '', marcaVehiculoId: '' }); setError(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={14} /> Nuevo modelo
        </button>
      </div>
      <Tabla columnas={['Nombre', 'Marca']} cargando={cargando} vacio="No hay modelos registrados"
        datos={modelos.map((m) => (
          <tr key={m.id} className="hover:bg-gray-750">
            <td className="px-4 py-3 text-white">{m.nombre}</td>
            <td className="px-4 py-3 text-gray-400">{m.marca?.nombre || m.nombreMarca || '—'}</td>
          </tr>
        ))}
      />
      {modal && (
        <ModalForm titulo="Nuevo Modelo" onClose={() => setModal(false)} onSubmit={handleSubmit} guardando={guardando} error={error}>
          <input placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
          <select value={form.marcaVehiculoId} onChange={(e) => setForm({ ...form, marcaVehiculoId: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500">
            <option value="">Seleccionar marca *</option>
            {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </ModalForm>
      )}
    </div>
  )
}

// ─── TAB: NIVELES DE FIDELIZACIÓN (read-only) ───
function TabNiveles() {
  const { datos, cargando } = useLista(svc.obtenerNiveles)
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Los niveles de fidelización son fijos del sistema (solo lectura).</p>
      <Tabla columnas={['Nombre', 'Puntos mín', 'Puntos máx', '% Descuento']} cargando={cargando} vacio="No hay niveles configurados"
        datos={datos.map((n) => (
          <tr key={n.id || n.nombre} className="hover:bg-gray-750">
            <td className="px-4 py-3 text-white font-medium">{n.nombre}</td>
            <td className="px-4 py-3 text-gray-300">{n.puntosMin?.toLocaleString?.('es-CL') || n.puntosMin || '—'}</td>
            <td className="px-4 py-3 text-gray-300">{n.puntosMax?.toLocaleString?.('es-CL') || n.puntosMax || '—'}</td>
            <td className="px-4 py-3 text-orange-400 font-semibold">{n.descuentoPct != null ? `${n.descuentoPct}%` : '—'}</td>
          </tr>
        ))}
      />
    </div>
  )
}
