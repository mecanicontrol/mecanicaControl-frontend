import api from '../api/axiosInstance'

export const obtenerMisVehiculos = () =>
  api.get('/api/vehiculos/mis-vehiculos')

export const guardarVehiculo = (datos) =>
  api.post('/api/vehiculos', datos)
