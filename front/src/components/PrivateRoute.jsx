// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth"; // Функция, которая проверяет токен

const PrivateRoute = ({ children }) => {
  // Проверяем, есть ли токен
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;  // Перенаправляем на страницу логина
  }
  
  return children;  // Если пользователь авторизован, показываем дочерние компоненты
};

export default PrivateRoute;
