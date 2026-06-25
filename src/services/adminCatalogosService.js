import api from '../api/axiosInstance'

// ─── Servicios (read-only from backend) ───
export const obtenerServicios = () =>
  api.get('/api/servicios')

// ─── Categorías de servicio (read-only) ───
export const obtenerCategorias = () =>
  api.get('/api/catalogos/categorias-servicio')

// ─── Marcas de vehículo (CRUD) ───
export const obtenerMarcas    = ()           => api.get('/api/marcas/listar')
export const crearMarca       = (datos)      => api.post('/api/marcas/save/marca', datos)
export const actualizarMarca  = (id, datos)  => api.put(`/api/marcas/${id}`, datos)
export const eliminarMarca    = (id)         => api.delete(`/api/marcas/${id}`)

// ─── Modelos de vehículo (CRUD) ───
export const obtenerModelos   = ()           => api.get('/api/modelos/listar')
export const crearModelo      = (datos)      => api.post('/api/modelos/save/modelo', datos)
export const actualizarModelo = (id, datos)  => api.put(`/api/modelos/${id}`, datos)
export const eliminarModelo   = (id)         => api.delete(`/api/modelos/${id}`)

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
