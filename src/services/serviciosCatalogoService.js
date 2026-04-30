import api from '../api/axiosInstance'

export const obtenerServicios = () =>
  api.get('/api/catalogos/servicios')

export const obtenerCategorias = () =>
  api.get('/api/catalogos/categorias')
