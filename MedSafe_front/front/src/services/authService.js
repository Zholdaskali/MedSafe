import api from "../../utils/api";

export const login = async (credentials) => {
  try {
    // Очищаем старый токен перед логином
    localStorage.removeItem("token");

    const res = await api.post("/api/auth/login", credentials);
    const { jwt } = res.data;

    // Проверяем, что токен валидный
    if (!jwt || typeof jwt !== "string" || jwt.split(".").length !== 3) {
      console.error("Invalid JWT received:", jwt);
      throw new Error("Invalid or missing JWT token from server");
    }

    console.log("Received JWT:", jwt); // Для отладки
    localStorage.setItem("token", jwt); // Сохраняем как "token" для консистентности
    return res.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

export const loginWithKey = async (credentials) => {
  try {
    // Очищаем старый токен перед логином
    localStorage.removeItem("token");

    const res = await api.post("/api/auth/login/key", credentials);
    const { jwt } = res.data;

    // Проверяем, что токен валидный
    if (!jwt || typeof jwt !== "string" || jwt.split(".").length !== 3) {
      console.error("Invalid JWT received:", jwt);
      throw new Error("Invalid or missing JWT token from server");
    }

    console.log("Received JWT:", jwt); // Для отладки
    localStorage.setItem("token", jwt); // Сохраняем как "token" для консистентности
    return res.data;
  } catch (error) {
    console.error("Login with key error:", error.response?.data || error.message);
    throw error;
  }
};

export const register = async (data) => {
  try {
    const res = await api.post("/api/auth/register", data);
    return res.data;
  } catch (error) {
    console.error("Register error:", error.response?.data || error.message);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
};