import api from '../api/axiosInstance'

export const crearAgendamiento = (datos) =>
  api.post('/api/agendamientos', datos)

export const obtenerAgendamientos = () =>
  api.get('/api/agendamientos')

export const cancelarAgendamiento = (id) =>
  api.delete(`/api/agendamientos/${id}`)
