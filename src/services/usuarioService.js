import api from '../api/axiosInstance'

export const getMiPerfil      = ()      => api.get('/api/usuarios/me')
export const updatePerfil     = (datos) => api.put('/api/usuarios/me/perfil', datos)
export const cambiarPassword  = (datos) => api.put('/api/usuarios/me/password', datos)