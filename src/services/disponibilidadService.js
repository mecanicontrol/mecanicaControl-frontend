import api from '../api/axiosInstance'

export const obtenerDisponibilidad = (fecha, servicioId) =>
  api.get('/api/disponibilidad', { params: { fecha, servicioId } })
