import { useState } from "react";
import { login } from "../../services/authService";  // Предположим, что у вас есть такая функция
import { useNavigate, useLocation } from "react-router-dom";  // Для перенаправления и возврата на предыдущую страницу

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");  // Для отображения ошибок
  const navigate = useNavigate();
  const location = useLocation();  // Для получения состояния предыдущего маршрута

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(form);  // Предположим, что login возвращает объект с токеном
      localStorage.setItem("token", response.token);  // Сохраняем токен в localStorage

      // Если в состоянии есть путь, то перенаправляем на него, иначе на /dashboard
      const from = location.state?.from || "/dashboard";
      navigate(from);  // Возвращаем пользователя на исходную страницу
    } catch (err) {
      setError("Ошибка входа. Проверьте свои данные.");  // Отображаем ошибку
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form className="bg-white p-8 rounded shadow-md w-96 space-y-6" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold">Вход</h2>
        {error && <p className="text-red-500">{error}</p>}  {/* Отображаем ошибку, если она есть */}
        <input
          className="w-full border p-2 rounded"
          name="username"
          placeholder="Имя пользователя"
          value={form.username}
          onChange={handleChange}
        />
        <input
          className="w-full border p-2 rounded"
          name="password"
          type="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Войти
        </button>
      </form>
    </div>
  );
};

export default Login;
