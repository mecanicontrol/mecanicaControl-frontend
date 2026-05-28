import api from '../api/axiosInstance'

export const obtenerClientes  = ()              => api.get('/api/clientes')
export const obtenerCliente   = (id)             => api.get(`/api/clientes/${id}`)
export const ajustarPuntos    = (id, puntos)    => api.patch(`/api/clientes/${id}/puntos?puntos=${puntos}`)