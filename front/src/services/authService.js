// src/services/authService.js
import api from "../utils/api";

export const login = async (credentials) => {
  const res = await api.post("/api/auth/login", credentials);
  const { token } = res.data;
  localStorage.setItem("token", token);
  return res.data;
};

export const register = async (data) => {
  const res = await api.post("/api/auth/register", data);
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};
