import api from '../api/axiosInstance'

export const obtenerServicios = () =>
  api.get('/api/servicios')
