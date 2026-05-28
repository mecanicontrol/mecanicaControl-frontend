import api from "../api/axiosInstance";

export const obtenerMiPerfil = () =>
  api.get("/api/usuarios/me");

export const actualizarPerfil = (datos) =>
  api.put("/api/usuarios/me/perfil", datos);

export const cambiarPassword = (datos) =>
  api.put("/api/usuarios/me/password", datos);
