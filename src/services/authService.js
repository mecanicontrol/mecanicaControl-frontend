import axios from "axios";

const API = "http://localhost:8080/api/auth";

export const login = (credenciales) => {
  return axios.post(`${API}/login`, credenciales);
};

export const register = (datos) => {
  return axios.post(`${API}/register`, datos);
};