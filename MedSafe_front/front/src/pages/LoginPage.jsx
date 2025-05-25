import { useState } from "react";
import { useDispatch } from "react-redux";
import { saveToken } from "../store/tokenSlice";
import { login, loginWithKey } from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "", privateKey: "" });
  const [error, setError] = useState("");
  const [loginMethod, setLoginMethod] = useState("password"); // "password" или "key"
  const [keyFileName, setKeyFileName] = useState(""); // Для имени загруженного файла
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "privateKey") {
      setKeyFileName(""); // Сбрасываем имя файла при ручном вводе ключа
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm({ ...form, privateKey: event.target.result });
        setKeyFileName(file.name);
      };
      reader.onerror = () => {
        setError("Кілт файлын оқу мүмкін болмады.");
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let response;
      if (loginMethod === "password") {
        if (!form.username || !form.password) {
          throw new Error("Пайдаланушы аты мен құпия сөзді енгізіңіз.");
        }
        response = await login({ username: form.username, password: form.password });
      } else {
        if (!form.username || !form.privateKey) {
          throw new Error("Пайдаланушы аты мен жеке кілтті енгізіңіз.");
        }
        response = await loginWithKey({ username: form.username, privateKey: form.privateKey });
      }

      console.log("Login: Received response:", response);

      // Проверяем наличие ошибки
      if (response.error) {
        throw new Error(response.error);
      }

      const jwt = response.jwt; // Извлекаем токен
      if (!jwt || typeof jwt !== "string") {
        throw new Error("Жарамсыз JWT алынды.");
      }

      // Извлекаем роли
      const roles = response.roles.map((role) => role.roleName);
      console.log("Login: Extracted roles:", roles);

      // Сохраняем токен и роли в Redux
      dispatch(saveToken({ token: jwt, roles }));
      localStorage.setItem("token", jwt); // Для совместимости

      // Проверяем, есть ли роль ROLE_ADMIN
      const redirectTo = roles.includes("ROLE_ADMIN") ? "/admin" : location.state?.from || "/dashboard";
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || "Қате мәліметтер. Қайтадан тексеріңіз.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105">
        <div className="flex justify-center mb-6">
          <svg
            className="w-12 h-12 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 11c0-1.1-.9-2-2-2s-2 .9-2 2 2 4 2 4 2-2.9 2-4zm0 0c0-1.1.9-2 2-2s2 .9 2 2-2 4-2 4-2-2.9-2-4zm-7 7h14M5 5h14"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Қауіпсіз Кіру</h2>
        <p className="text-center text-gray-500 mb-8">Жеке Деректерді Қорғау Жүйесі</p>

        {/* Вкладки для выбора метода входа */}
        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 mx-2 rounded-lg ${loginMethod === "password" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setLoginMethod("password")}
          >
            Құпия сөз
          </button>
          <button
            className={`px-4 py-2 mx-2 rounded-lg ${loginMethod === "key" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setLoginMethod("key")}
          >
            Жеке Кілт
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Пайдаланушы аты
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Пайдаланушы атын енгізіңіз"
              value={form.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              required
            />
          </div>

          {loginMethod === "password" ? (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Құпия сөз
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Құпия сөзді енгізіңіз"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
              />
            </div>
          ) : (
            <div>
              <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700 mb-1">
                Жеке Кілт
              </label>
              <textarea
                id="privateKey"
                name="privateKey"
                placeholder="Жеке кілтті енгізіңіз немесе файлды жүктеңіз"
                value={form.privateKey}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 h-24 resize-none"
                required
              />
              <label
                htmlFor="keyFile"
                className="mt-2 inline-block bg-gray-100 text-gray-700 p-2 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-200"
              >
                {keyFileName || "Кілт файлын жүктеу"}
              </label>
              <input
                id="keyFile"
                type="file"
                accept=".txt,.pem"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          >
            Кіру
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          Жетілдірілген шифрлау стандарттарымен қорғалған
        </p>
      </div>
    </div>
  );
};

export default Login;