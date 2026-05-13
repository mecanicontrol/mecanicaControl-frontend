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
