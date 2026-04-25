import api from '../api/axiosInstance'

export const login = (credenciales) =>
  api.post('/api/auth/login', credenciales)

export const register = (datos) =>
  api.post('/api/auth/register', datos)
