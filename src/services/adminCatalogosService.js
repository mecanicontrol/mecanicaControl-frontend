import api from '../api/axiosInstance'

// ─── Servicios (read-only from backend) ───
export const obtenerServicios = () =>
  api.get('/api/servicios')

// ─── Categorías de servicio (read-only) ───
export const obtenerCategorias = () =>
  api.get('/api/catalogos/categorias-servicio')

// ─── Marcas de vehículo (read + create) ───
export const obtenerMarcas = () =>
  api.get('/api/marcas/listar')

export const crearMarca = (datos) =>
  api.post('/api/marcas/save/marca', datos)

// ─── Modelos de vehículo (read + create) ───
export const obtenerModelos = () =>
  api.get('/api/modelos/listar')

export const crearModelo = (datos) =>
  api.post('/api/modelos/save/modelo', datos)

// ─── Niveles de fidelización (read-only) ───
export const obtenerNiveles = () =>
  api.get('/api/catalogos/niveles-fidelizacion')

// ─── CRUD Servicios (ADMIN) ───
export const obtenerServiciosTodos = ()           => api.get('/api/servicios/todos')
export const crearServicio         = (datos)      => api.post('/api/servicios', datos)
export const actualizarServicio    = (id, datos)  => api.put(`/api/servicios/${id}`, datos)
export const eliminarServicio      = (id)         => api.delete(`/api/servicios/${id}`)

// ─── CRUD Categorías de servicio (ADMIN) ───
export const obtenerCategoriasAdmin = ()          => api.get('/api/admin/categorias-servicio')
export const crearCategoria        = (datos)      => api.post('/api/admin/categorias-servicio', datos)
export const actualizarCategoria   = (id, datos)  => api.put(`/api/admin/categorias-servicio/${id}`, datos)
export const eliminarCategoria     = (id)         => api.delete(`/api/admin/categorias-servicio/${id}`)
