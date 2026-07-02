import AdminLayout from '../../components/admin/AdminLayout'
import { useEffect, useState, useCallback } from 'react'
import api from '../../api/axiosInstance'
import {
  Search, Plus, Edit2, Trash2, Package, AlertTriangle,
  ToggleLeft, ToggleRight, X, ChevronUp, ChevronDown, History,
} from 'lucide-react'

const FILTROS = [
  { id: 'todos',      label: 'Todos'      },
  { id: 'activos',    label: 'Activos'    },
  { id: 'inactivos',  label: 'Inactivos'  },
  { id: 'stock_bajo', label: 'Stock bajo' },
  { id: 'sin_stock',  label: 'Sin stock'  },
]

const FORM_INICIAL = {
  nombre: '', sku: '', descripcion: '',
  precioCosto: '', precioVenta: '',
  stockActual: '0', stockMinimo: '0',
  ubicacionBodega: '', categoriaId: '', marcaId: '',
}

export default function Inventario() {
  const [productos,    setProductos]    = useState([])
  const [categorias,   setCategorias]   = useState([])
  const [marcas,       setMarcas]       = useState([])
  const [tiposMov,     setTiposMov]     = useState([])
  const [cargando,     setCargando]     = useState(true)
  const [busqueda,     setBusqueda]     = useState('')
  const [filtro,       setFiltro]       = useState('todos')
  const [busqTimer,    setBusqTimer]    = useState(null)
  const [modal,        setModal]        = useState(null)   // null | 'crear' | producto (editar)
  const [form,         setForm]         = useState(FORM_INICIAL)
  const [errForm,      setErrForm]      = useState({})
  const [guardando,    setGuardando]    = useState(false)
  const [confirmDel,   setConfirmDel]   = useState(null)
  const [mensaje,      setMensaje]      = useState({ texto: '', tipo: 'ok' })
  const [modalStock,   setModalStock]   = useState(null)   // { id, nombre, stock }
  const [movForm,      setMovForm]      = useState({ tipo: 'ENTRADA', cantidad: 1, motivo: '' })
  const [movHistorial, setMovHistorial] = useState(null)   // { producto, movs }

  const avisar = (texto, tipo = 'ok') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje({ texto: '', tipo: 'ok' }), 3500)
  }

  const cargar = useCallback(async (q, f) => {
    setCargando(true)
    try {
      const { data } = await api.get('/api/admin/inventario', { params: { q, filtro: f } })
      setProductos(data)
    } catch { setProductos([]) }
    finally { setCargando(false) }
  }, [])

  useEffect(() => {
    cargar('', 'todos')
    api.get('/api/admin/inventario/categorias').then(({ data }) => setCategorias(data)).catch(() => {})
    api.get('/api/admin/inventario/marcas').then(({ data }) => setMarcas(data)).catch(() => {})
    api.get('/api/admin/inventario/tipos-movimiento').then(({ data }) => setTiposMov(data)).catch(() => {})
  }, [cargar])

  const handleBusqueda = (val) => {
    setBusqueda(val)
    clearTimeout(busqTimer)
    setBusqTimer(setTimeout(() => cargar(val, filtro), 350))
  }

  const handleFiltro = (f) => { setFiltro(f); cargar(busqueda, f) }

  const abrirCrear = () => { setForm(FORM_INICIAL); setErrForm({}); setModal('crear') }

  const abrirEditar = (p) => {
    setForm({
      nombre:          p.nombre,
      sku:             p.sku,
      descripcion:     p.descripcion,
      precioCosto:     p.precioCosto,
      precioVenta:     p.precioVenta,
      stockActual:     p.stock,     // solo en crear
      stockMinimo:     p.stockMinimo,
      ubicacionBodega: p.ubicacion,
      categoriaId:     p.categoriaId || '',
      marcaId:         p.marcaId    || '',
    })
    setErrForm({})
    setModal(p)
  }

  const validarForm = () => {
    const err = {}
    if (!form.nombre.trim())    err.nombre    = 'El nombre es obligatorio'
    if (!form.sku.trim())       err.sku       = 'El SKU es obligatorio y único'
    if (!form.categoriaId)      err.categoriaId = 'Selecciona una categoría'
    setErrForm(err)
    return Object.keys(err).length === 0
  }

  const guardar = async () => {
    if (!validarForm()) return
    setGuardando(true)
    try {
      const payload = {
        nombre:          form.nombre.trim(),
        sku:             form.sku.trim(),
        descripcion:     form.descripcion,
        precioCosto:     parseFloat(form.precioCosto)  || 0,
        precioVenta:     parseFloat(form.precioVenta)  || 0,
        stockActual:     parseInt(form.stockActual)    || 0,
        stockMinimo:     parseInt(form.stockMinimo)    || 0,
        ubicacionBodega: form.ubicacionBodega,
        categoriaId:     form.categoriaId || null,
        marcaId:         form.marcaId     || null,
      }
      if (modal === 'crear') {
        const { data } = await api.post('/api/admin/inventario', payload)
        setProductos((prev) => [data, ...prev])
        avisar('Producto creado correctamente')
      } else {
        const { data } = await api.put(`/api/admin/inventario/${modal.id}`, payload)
        setProductos((prev) => prev.map((p) => p.id === modal.id ? data : p))
        avisar('Producto actualizado')
      }
      setModal(null)
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar el producto'
      avisar(msg, 'error')
    } finally { setGuardando(false) }
  }

  const toggleActivo = async (id) => {
    try {
      const { data } = await api.patch(`/api/admin/inventario/${id}/toggle`)
      setProductos((prev) => prev.map((p) => p.id === id ? { ...p, activo: data.activo } : p))
    } catch { avisar('Error al cambiar el estado', 'error') }
  }

  const registrarMovimiento = async () => {
    if (!modalStock) return
    const cantidad = parseInt(movForm.cantidad)
    if (!cantidad || cantidad <= 0) return avisar('La cantidad debe ser mayor a 0', 'error')
    try {
      const { data } = await api.post(`/api/admin/inventario/${modalStock.id}/movimiento`, {
        tipo:     movForm.tipo,
        cantidad,
        motivo:   movForm.motivo,
      })
      setProductos((prev) => prev.map((p) => p.id === modalStock.id ? { ...p, stock: data.stock } : p))
      setModalStock(null)
      setMovForm({ tipo: 'ENTRADA', cantidad: 1, motivo: '' })
      avisar('Movimiento registrado')
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar el movimiento'
      avisar(msg, 'error')
    }
  }

  const verHistorial = async (p) => {
    try {
      const { data } = await api.get(`/api/admin/inventario/${p.id}/movimientos`)
      setMovHistorial({ producto: p, movs: data })
    } catch { avisar('Error al cargar el historial', 'error') }
  }

  const eliminar = async (id) => {
    try {
      await api.delete(`/api/admin/inventario/${id}`)
      setProductos((prev) => prev.filter((p) => p.id !== id))
      setConfirmDel(null)
      avisar('Producto eliminado')
    } catch { avisar('Error al eliminar el producto', 'error') }
  }

  const total     = productos.length
  const sinStock  = productos.filter((p) => p.stock <= 0 && p.activo).length
  const stockBajo = productos.filter((p) => p.stock > 0 && p.stockMinimo > 0 && p.stock <= p.stockMinimo && p.activo).length
  const inactivos = productos.filter((p) => !p.activo).length

  return (
    <AdminLayout>
      <div className="space-y-6">

        {mensaje.texto && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl font-black text-sm shadow-xl ${
            mensaje.tipo === 'error' ? 'bg-red-600 text-white' : 'bg-green-500 text-white'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Inventario</h2>
            <p className="text-gray-500 text-sm mt-0.5">Gestión de productos y stock del taller</p>
          </div>
          <button onClick={abrirCrear}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-black text-sm uppercase transition">
            <Plus size={16} /> Nuevo producto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total productos" valor={total}     color="text-white"       />
          <StatCard label="Sin stock"       valor={sinStock}  color="text-red-400"   alerta={sinStock > 0}  />
          <StatCard label="Stock bajo"      valor={stockBajo} color="text-amber-400" alerta={stockBajo > 0} />
          <StatCard label="Inactivos"       valor={inactivos} color="text-gray-400"  />
        </div>

        {/* Buscador + filtros */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-64">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={busqueda} onChange={(e) => handleBusqueda(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-orange-500 text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTROS.map((f) => (
              <button key={f.id} onClick={() => handleFiltro(f.id)}
                className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase transition ${
                  filtro === f.id ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
              {productos.length} producto{productos.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-600">Haz clic en el stock para registrar movimientos</span>
          </div>

          {cargando ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 animate-pulse font-black">Cargando inventario...</p>
            </div>
          ) : productos.length === 0 ? (
            <div className="p-16 text-center">
              <Package size={48} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 font-black text-sm uppercase">
                {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay productos. Crea el primero o ejecuta el script SQL de datos iniciales.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase">Categoría / Marca</th>
                    <th className="px-4 py-3 text-right text-xs font-black text-gray-500 uppercase">Costo</th>
                    <th className="px-4 py-3 text-right text-xs font-black text-gray-500 uppercase">Venta</th>
                    <th className="px-4 py-3 text-center text-xs font-black text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase">Ubicación</th>
                    <th className="px-4 py-3 text-center text-xs font-black text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-black text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {productos.map((p) => {
                    const sinSt = p.stock <= 0
                    const bajSt = p.stock > 0 && p.stockMinimo > 0 && p.stock <= p.stockMinimo
                    return (
                      <tr key={p.id} className={`hover:bg-gray-800/50 transition ${!p.activo ? 'opacity-50' : ''}`}>
                        <td className="px-6 py-4">
                          <p className="font-black text-white">{p.nombre}</p>
                          {p.descripcion && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{p.descripcion}</p>}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-gray-400">{p.sku || '—'}</td>
                        <td className="px-4 py-4">
                          <p className="text-gray-300 text-xs">{p.categoria || '—'}</p>
                          <p className="text-gray-500 text-xs">{p.marca || '—'}</p>
                        </td>
                        <td className="px-4 py-4 text-right text-gray-400 font-black text-xs">
                          ${parseFloat(p.precioCosto || 0).toLocaleString('es-CL')}
                        </td>
                        <td className="px-4 py-4 text-right text-white font-black">
                          ${parseFloat(p.precioVenta || 0).toLocaleString('es-CL')}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => { setModalStock({ id: p.id, nombre: p.nombre, stock: p.stock }); setMovForm({ tipo: 'ENTRADA', cantidad: 1, motivo: '' }) }}
                            title="Registrar movimiento de stock"
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black transition hover:ring-2 hover:ring-orange-500 cursor-pointer ${
                              sinSt ? 'bg-red-900/50 text-red-400' :
                              bajSt ? 'bg-amber-900/50 text-amber-400' :
                                      'bg-green-900/50 text-green-400'
                            }`}>
                            {(sinSt || bajSt) && <AlertTriangle size={10} />}
                            {p.stock}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-xs">{p.ubicacion || '—'}</td>
                        <td className="px-4 py-4 text-center">
                          <button onClick={() => toggleActivo(p.id)} title={p.activo ? 'Desactivar' : 'Activar'}>
                            {p.activo
                              ? <ToggleRight size={24} className="text-green-500 hover:text-green-400" />
                              : <ToggleLeft  size={24} className="text-gray-600 hover:text-gray-400" />}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => verHistorial(p)} title="Historial" className="text-gray-500 hover:text-blue-400 transition">
                              <History size={15} />
                            </button>
                            <button onClick={() => abrirEditar(p)} title="Editar" className="text-gray-500 hover:text-orange-400 transition">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => setConfirmDel(p)} title="Eliminar" className="text-gray-500 hover:text-red-400 transition">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal crear / editar ─────────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModal(null)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-800">
              <h2 className="text-xl font-black text-white uppercase">
                {modal === 'crear' ? 'Nuevo producto' : `Editar: ${modal.nombre}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="px-8 py-6 grid grid-cols-2 gap-5">
              {/* Nombre */}
              <div className="col-span-2">
                <FormField label="Nombre del producto *" value={form.nombre}
                  onChange={(v) => setForm((p) => ({ ...p, nombre: v }))}
                  error={errForm.nombre} />
              </div>

              {/* SKU */}
              <div>
                <FormField label="SKU / Código *" value={form.sku}
                  onChange={(v) => setForm((p) => ({ ...p, sku: v }))}
                  error={errForm.sku} />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                  Categoría *
                </label>
                <select value={form.categoriaId}
                  onChange={(e) => setForm((p) => ({ ...p, categoriaId: e.target.value }))}
                  className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 text-sm ${errForm.categoriaId ? 'border-red-500' : 'border-gray-700'}`}>
                  <option value="">— Seleccionar —</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                {errForm.categoriaId && <p className="text-red-400 text-xs mt-1">{errForm.categoriaId}</p>}
              </div>

              {/* Marca */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Marca</label>
                <select value={form.marcaId}
                  onChange={(e) => setForm((p) => ({ ...p, marcaId: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 text-sm">
                  <option value="">— Sin marca —</option>
                  {marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>

              {/* Ubicación */}
              <FormField label="Ubicación en bodega" value={form.ubicacionBodega}
                onChange={(v) => setForm((p) => ({ ...p, ubicacionBodega: v }))} />

              {/* Precios */}
              <FormField label="Precio costo ($)" type="number" value={form.precioCosto}
                onChange={(v) => setForm((p) => ({ ...p, precioCosto: v }))} />
              <FormField label="Precio venta ($)" type="number" value={form.precioVenta}
                onChange={(v) => setForm((p) => ({ ...p, precioVenta: v }))} />

              {/* Stock */}
              {modal === 'crear' && (
                <FormField label="Stock inicial" type="number" value={form.stockActual}
                  onChange={(v) => setForm((p) => ({ ...p, stockActual: v }))} />
              )}
              <FormField label="Stock mínimo (alerta)" type="number" value={form.stockMinimo}
                onChange={(v) => setForm((p) => ({ ...p, stockMinimo: v }))} />

              {/* Descripción */}
              <div className="col-span-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Descripción</label>
                <textarea rows={3} value={form.descripcion}
                  onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Descripción del producto..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-orange-500 text-sm resize-none" />
              </div>

              {modal === 'crear' && (
                <p className="col-span-2 text-xs text-gray-500">
                  * El stock inicial creará un movimiento de <strong className="text-gray-300">ENTRADA</strong> automáticamente.
                </p>
              )}
              {modal !== 'crear' && (
                <p className="col-span-2 text-xs text-gray-500">
                  Para ajustar el stock usa el botón de stock en la tabla (registra movimientos auditables).
                </p>
              )}
            </div>

            <div className="px-8 py-5 border-t border-gray-800 flex justify-end gap-3">
              <button onClick={() => setModal(null)}
                className="px-6 py-3 rounded-xl font-black text-sm uppercase bg-gray-800 hover:bg-gray-700 text-gray-300 transition">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="px-8 py-3 rounded-xl font-black text-sm uppercase bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white transition">
                {guardando ? 'Guardando...' : modal === 'crear' ? 'Crear producto' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal movimiento de stock ─────────────────────────────────────────── */}
      {modalStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModalStock(null)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl p-8">
            <h2 className="text-lg font-black text-white uppercase mb-1">Movimiento de stock</h2>
            <p className="text-gray-400 text-sm mb-6">
              {modalStock.nombre} · Stock actual: <strong className="text-white">{modalStock.stock}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Tipo</label>
                <select value={movForm.tipo}
                  onChange={(e) => setMovForm((p) => ({ ...p, tipo: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 text-sm">
                  {tiposMov.length > 0
                    ? tiposMov.map((t) => <option key={t.id} value={t.nombre}>{t.nombre} ({t.signo > 0 ? '+' : '-'})</option>)
                    : <>
                        <option value="ENTRADA">ENTRADA (+)</option>
                        <option value="SALIDA">SALIDA (-)</option>
                        <option value="AJUSTE">AJUSTE (+)</option>
                        <option value="DEVOLUCION">DEVOLUCION (+)</option>
                        <option value="MERMA">MERMA (-)</option>
                      </>
                  }
                </select>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => setMovForm((p) => ({ ...p, cantidad: Math.max(1, p.cantidad - 1) }))}
                  className="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white font-black text-xl transition">
                  <ChevronDown size={20} />
                </button>
                <div className="flex-1 text-center">
                  <p className="text-xs text-gray-500 font-black uppercase mb-1">Cantidad</p>
                  <p className="text-4xl font-black text-white">{movForm.cantidad}</p>
                </div>
                <button onClick={() => setMovForm((p) => ({ ...p, cantidad: p.cantidad + 1 }))}
                  className="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white font-black text-xl transition">
                  <ChevronUp size={20} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Motivo (opcional)</label>
                <input value={movForm.motivo} onChange={(e) => setMovForm((p) => ({ ...p, motivo: e.target.value }))}
                  placeholder="Ej: Compra OC-2024-001, ajuste conteo físico..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-orange-500 text-sm" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalStock(null)}
                className="flex-1 py-3 rounded-xl font-black text-sm uppercase bg-gray-800 hover:bg-gray-700 text-gray-300 transition">
                Cancelar
              </button>
              <button onClick={registrarMovimiento}
                className="flex-1 py-3 rounded-xl font-black text-sm uppercase bg-orange-500 hover:bg-orange-600 text-white transition">
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Historial de movimientos ──────────────────────────────────────────── */}
      {movHistorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMovHistorial(null)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-black text-white uppercase">Historial de movimientos</h2>
                <p className="text-gray-400 text-sm">{movHistorial.producto.nombre}</p>
              </div>
              <button onClick={() => setMovHistorial(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto max-h-96">
              {movHistorial.movs.length === 0 ? (
                <p className="text-gray-500 text-center py-12 font-black">Sin movimientos registrados</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="px-5 py-3 text-left text-xs font-black text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-center text-xs font-black text-gray-500 uppercase">Cant.</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase">Motivo</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase">Usuario</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {movHistorial.movs.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-800/50">
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                            m.signo > 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                          }`}>
                            {m.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-black text-white">
                          {m.signo > 0 ? '+' : '-'}{m.cantidad}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{m.motivo || '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{m.usuario}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {m.fecha ? new Date(m.fecha).toLocaleString('es-CL') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmar eliminación ─────────────────────────────────────────────── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setConfirmDel(null)} />
          <div className="relative bg-gray-900 border border-red-900 rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
            <Trash2 size={40} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-black text-white mb-2">¿Eliminar producto?</h2>
            <p className="text-gray-400 text-sm mb-6">
              <strong className="text-white">{confirmDel.nombre}</strong> será eliminado permanentemente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 py-3 rounded-xl font-black text-sm uppercase bg-gray-800 hover:bg-gray-700 text-gray-300 transition">
                Cancelar
              </button>
              <button onClick={() => eliminar(confirmDel.id)}
                className="flex-1 py-3 rounded-xl font-black text-sm uppercase bg-red-600 hover:bg-red-700 text-white transition">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function StatCard({ label, valor, color, alerta }) {
  return (
    <div className={`bg-gray-900 border rounded-2xl p-5 ${alerta ? 'border-amber-800' : 'border-gray-800'}`}>
      <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <h3 className={`text-4xl font-black ${color}`}>{valor}</h3>
    </div>
  )
}

function FormField({ label, value, onChange, type = 'text', error }) {
  return (
    <div>
      <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 text-sm transition ${
          error ? 'border-red-500' : 'border-gray-700'
        }`} />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
