import api from '../api/axiosInstance'

export const obtenerDisponibilidad = (fecha) =>
  api.get('/api/disponibilidad', { params: { fecha } })
