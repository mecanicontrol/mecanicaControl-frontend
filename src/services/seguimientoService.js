import api from '../api/axiosInstance'

export const buscarOT = (codigo) =>
  api.get(`/api/seguimiento/${encodeURIComponent(codigo.trim().toUpperCase())}`)