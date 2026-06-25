import api from '../api/axiosInstance'

export const obtenerDashboard = () => api.get('/api/admin/dashboard')

// ── Módulo Reportes ─────────────────────────────────────────────────────────
export const obtenerReporteDashboard = () => api.get('/api/reportes/dashboard')
export const obtenerReporteIngresos  = (params = {}) => api.get('/api/reportes/ingresos', { params })
export const obtenerReporteServicios = (params = {}) => api.get('/api/reportes/servicios', { params })
export const obtenerReporteTecnicos  = () => api.get('/api/reportes/tecnicos')