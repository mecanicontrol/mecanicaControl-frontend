import api from '../api/axiosInstance'

export const obtenerOTs       = ()        => api.get('/api/ot')
export const obtenerOTDetalle = (codigo)  => api.get(`/api/ot/${codigo}`)
export const predecirTiempo   = (otId)    => api.post(`/api/ia/predecir-tiempo?otId=${otId}`)
export const obtenerPrediccion= (otId)    => api.get(`/api/ia/prediccion/${otId}`)