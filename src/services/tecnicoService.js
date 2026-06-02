import api from "../api/axiosInstance";

export const obtenerDashboardTecnico      = ()             => api.get("/api/tecnicos/dashboard");
export const obtenerMiPerfilTecnico       = ()             => api.get("/api/tecnicos/me");
export const actualizarMiPerfil           = (datos)        => api.patch("/api/tecnicos/me", datos);
export const toggleDisponibilidadTecnico  = ()             => api.patch("/api/tecnicos/disponibilidad");
export const obtenerMisOrdenesTecnico     = ()             => api.get("/api/tecnicos/ordenes");
export const obtenerDetalleOrdenTecnico   = (codigo)       => api.get(`/api/tecnicos/ordenes/${codigo}`);
export const guardarDiagnosticoOrden      = (codigo, diag) => api.patch(`/api/tecnicos/ordenes/${codigo}/diagnostico`, { diagnostico: diag });
export const actualizarEstadoOrden        = (codigo, est)  => api.patch(`/api/tecnicos/ordenes/${codigo}/estado`, { estado: est });
export const obtenerInventarioTecnico     = (params)       => api.get("/api/tecnicos/inventario", { params });
