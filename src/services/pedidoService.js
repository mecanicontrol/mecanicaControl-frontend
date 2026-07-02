import api from '../api/axiosInstance'

export const registrarPedido = (body) => api.post('/api/tienda/pedido', body)

export const obtenerReporteVentas = (dias = 30) =>
  api.get(`/api/admin/reportes/ventas?dias=${dias}`)