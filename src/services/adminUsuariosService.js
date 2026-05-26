import api from '../api/axiosInstance'

export const obtenerUsuarios = () =>
  api.get('/api/usuarios')

// Los siguientes endpoints no existen aún en el backend.
// Requieren implementación en UsuarioController.
export const crearUsuario       = (datos)             => api.post('/api/admin/usuarios', datos)
export const actualizarUsuario  = (id, datos)         => api.put(`/api/admin/usuarios/${id}`, datos)
export const toggleUsuario      = (id)                => api.put(`/api/admin/usuarios/${id}/toggle`)
export const cambiarPassword    = (id, nuevaPassword) => api.put(`/api/admin/usuarios/${id}/cambiar-password`, { nuevaPassword })