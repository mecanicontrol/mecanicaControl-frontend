import api from '../api/axiosInstance'

export const obtenerAgendamientosAdmin = (filtros = {}) =>
  api.get('/api/agendamientos', { params: filtros })

export const obtenerAgendamientoAdmin = (id) =>
  api.get(`/api/agendamientos/${id}`)

export const crearAgendamientoAdmin = (datos) =>
  api.post('/api/agendamientos', datos)

export const confirmarAgendamiento = (id, tecnicoId) =>
  api.put(`/api/agendamientos/${id}/confirmar`, { tecnicoId })

export const cancelarAgendamientoAdmin = (id) =>
  api.put(`/api/agendamientos/${id}/cancelar`)

export const completarAgendamiento = (id) =>
  api.put(`/api/agendamientos/${id}/completar`)
