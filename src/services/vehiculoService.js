import api from '../api/axiosInstance'

export const obtenerVehiculos = () =>
  api.get('/api/vehiculos')

export const crearVehiculo = (datos) =>
  api.post('/api/vehiculos', datos)
