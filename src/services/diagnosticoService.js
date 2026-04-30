import api from '../api/axiosInstance'

export const diagnosticarVehiculo = (datos) =>
  api.post('/api/ia/diagnosticar', datos)
