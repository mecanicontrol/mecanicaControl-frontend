import api from '../api/axiosInstance'

export const obtenerMarcas = () =>
  api.get('/api/marcas')

export const obtenerModelos = (marcaId) =>
  api.get(`/api/modelos/marca/${marcaId}`)
