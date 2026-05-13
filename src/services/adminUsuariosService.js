import api from '../api/axiosInstance'

export const obtenerUsuarios = (filtros = {}) =>
  api.get('/api/admin/usuarios', { params: filtros })

export const obtenerUsuario = (id) =>
  api.get(`/api/admin/usuarios/${id}`)

export const crearUsuario = (datos) =>
  api.post('/api/admin/usuarios', datos)

export const actualizarUsuario = (id, datos) =>
  api.put(`/api/admin/usuarios/${id}`, datos)

export const toggleUsuario = (id) =>
  api.put(`/api/admin/usuarios/${id}/toggle`)

export const cambiarPassword = (id, nuevaPassword) =>
  api.put(`/api/admin/usuarios/${id}/cambiar-password`, { nuevaPassword })
