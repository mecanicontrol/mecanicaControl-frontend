import api from '../api/axiosInstance'

export const getBccAdmins = () => api.get('/api/admin/configuracion/bcc-admins')
export const setBccAdmins = (correos) => api.put('/api/admin/configuracion/bcc-admins', { correos })

export const getCapacidadTaller = () => api.get('/api/admin/configuracion/capacidad-taller')
export const setCapacidadTaller = (capacidad) => api.put('/api/admin/configuracion/capacidad-taller', { capacidad })