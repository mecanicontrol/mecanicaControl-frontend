import api from '../api/axiosInstance'

export const crearAgendamiento = (datos) =>
  api.post('/api/agendamientos', datos)

export const obtenerMisAgendamientos = () =>
  api.get('/api/agendamientos/mis')

export const obtenerDisponibilidad = (fecha, servicioId) =>
  api.get('/api/disponibilidad', {
    params: {
      fecha,
      servicioId
    }
  })

export const cancelarAgendamiento = (id) =>
  api.delete(`/api/agendamientos/${id}`)

export const confirmarAgendamiento = (id) =>
  api.patch(`/api/agendamientos/${id}/confirmar`)

export const obtenerSeguimientoAgendamiento = (agendamientoId) =>
  api.get(`/api/seguimiento/agendamiento/${agendamientoId}`)