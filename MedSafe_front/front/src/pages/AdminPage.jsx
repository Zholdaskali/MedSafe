import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    roleId: "",
  });
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const authToken = useSelector((state) => state.token.token);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  // Список ролей, соответствующий таблице roles
  const roles = [
    { id: 1, name: "ROLE_ADMIN", displayName: "Администратор" },
    { id: 2, name: "ROLE_DOCTOR", displayName: "Врач" },
    { id: 3, name: "ROLE_USER", displayName: "Пользователь" },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!authToken) {
          throw new Error("Токен не найден. Пожалуйста, войдите снова.");
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/users/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Non-JSON response:", text);
          throw new Error("Сервер вернул не JSON-ответ. Проверьте конфигурацию API.");
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Ошибка HTTP: ${response.status}`);
        }

        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Ошибка при загрузке данных.");
        setLoading(false);
        console.error("AdminPanel error:", err);
      }
    };

    fetchUsers();
  }, [authToken]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.username || !form.password || !form.email || !form.firstName || !form.lastName || !form.roleId) {
      setFormError("Все поля должны быть заполнены.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...form,
          roleId: parseInt(form.roleId),
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Сервер вернул не JSON-ответ.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при регистрации пользователя.");
      }

      // Добавляем нового пользователя в таблицу
      setUsers([
        ...users,
        {
          userId: data.userId || Date.now(),
          username: form.username,
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          roles: [{ roleId: parseInt(form.roleId), roleName: roles.find((r) => r.id === parseInt(form.roleId)).name }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      // Закрываем модальное окно и сбрасываем форму
      setShowModal(false);
      setForm({
        username: "",
        password: "",
        email: "",
        firstName: "",
        lastName: "",
        roleId: "",
      });
    } catch (err) {
      setFormError(err.message || "Ошибка при добавлении пользователя.");
      console.error("Add user error:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/delete/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        const data = contentType && contentType.includes("application/json") ? await response.json() : {};
        throw new Error(data.error || `Ошибка HTTP: ${response.status}`);
      }

      // Удаляем пользователя из состояния
      setUsers(users.filter((user) => user.userId !== userId));
    } catch (err) {
      setError(err.message || "Ошибка при удалении пользователя.");
      console.error("Delete user error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 flex justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-[95%]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <svg
              className="w-12 h-12 text-blue-600 mr-4"
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
            <h2 className="text-3xl font-bold text-gray-800">Админ-панель</h2>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 min-w-[160px] text-sm"
            >
              Добавить пользователя
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 mb-6 text-lg">Управление пользователями</p>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 text-lg">Загрузка...</div>
        ) : (
          <div className="w-full">
            <table className="w-full bg-white border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 border-b min-w-[80px]">ID</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 border-b min-w-[150px]">
                    Имя пользователя
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 border-b min-w-[200px]">Email</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 border-b min-w-[120px]">Имя</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 border-b min-w-[120px]">
                    Фамилия
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 border-b min-w-[150px]">Роли</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 border-b min-w-[180px]">
                    Создан
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 border-b min-w-[180px]">
                    Обновлен
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 border-b min-w-[120px]">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="py-4 px-6 border-b text-gray-700">{user.userId}</td>
                    <td className="py-4 px-6 border-b text-gray-700">{user.username}</td>
                    <td className="py-4 px-6 border-b text-gray-700">{user.email}</td>
                    <td className="py-4 px-6 border-b text-gray-700">{user.firstName}</td>
                    <td className="py-4 px-6 border-b text-gray-700">{user.lastName}</td>
                    <td className="py-4 px-6 border-b text-gray-700">
                      {user.roles.map((role) => role.roleName).join(", ")}
                    </td>
                    <td className="py-4 px-6 border-b text-gray-700">
                      {new Date(user.createdAt).toLocaleString("ru-RU")}
                    </td>
                    <td className="py-4 px-6 border-b text-gray-700">
                      {new Date(user.updatedAt).toLocaleString("ru-RU")}
                    </td>
                    <td className="py-4 px-6 border-b">
                      <button
                        onClick={() => handleDeleteUser(user.userId)}
                        className="bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-700 transition duration-200 text-sm"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно для добавления пользователя */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Добавить пользователя</h3>
            {formError && (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
                {formError}
              </div>
            )}
            <form onSubmit={handleAddUser} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Имя пользователя
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Введите имя пользователя"
                  value={form.username}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={form.password}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Введите email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Имя
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Введите имя"
                  value={form.firstName}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Фамилия
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Введите фамилию"
                  value={form.lastName}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-2">
                  Роль
                </label>
                <select
                  id="roleId"
                  name="roleId"
                  value={form.roleId}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Выберите роль
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 min-w-[140px]"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 min-w-[140px]"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;