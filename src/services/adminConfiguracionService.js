import api from '../api/axiosInstance'

export const obtenerConfiguracion = () =>
  api.get('/api/admin/configuracion')

export const actualizarConfiguracion = (datos) =>
  api.put('/api/admin/configuracion', datos)
