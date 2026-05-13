import api from '../api/axiosInstance'

export const obtenerDashboard = () => api.get('/api/admin/dashboard')
