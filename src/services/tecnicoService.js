import api from "../api/axiosInstance";

export const obtenerDashboardTecnico = () =>
  api.get("/api/tecnicos/dashboard");

export const obtenerMiPerfilTecnico = () => {
  return api.get("/api/tecnicos/me");
};