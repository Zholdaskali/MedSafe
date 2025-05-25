// src/pages/Auth/Register.jsx
import { useState } from "react";
import { register } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      alert("Ошибка регистрации");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form className="bg-white p-8 rounded shadow-md w-96 space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold">Регистрация</h2>
        <input className="w-full border p-2 rounded" name="username" placeholder="Логин" value={form.username} onChange={handleChange} />
        <input className="w-full border p-2 rounded" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input className="w-full border p-2 rounded" name="firstName" placeholder="Имя" value={form.firstName} onChange={handleChange} />
        <input className="w-full border p-2 rounded" name="lastName" placeholder="Фамилия" value={form.lastName} onChange={handleChange} />
        <input className="w-full border p-2 rounded" name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Зарегистрироваться</button>
      </form>
    </div>
  );
};

export default Register;
