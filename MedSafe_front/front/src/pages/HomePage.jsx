import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { clearToken } from "../store/tokenSlice";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const { token, roles } = useSelector((state) => state.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        setError("");
        try {
          const res = await api.get("/api/v1/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Пайдаланушы мәліметтері:", res.data);
          setUser(res.data);
        } catch (err) {
          console.error("Пайдаланушы мәліметтерін алу қатесі:", err);
          setError("Пайдаланушы мәліметтерін алу мүмкін болмады.");
        }
      }
    };
    fetchUser();
  }, [token]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col">
      {/* Hero Section */}
      <motion.header
        className="flex flex-col items-center justify-center text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white w-full"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        aria-labelledby="hero-heading"
      >
        <svg
          className="w-20 h-20 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 11c0-1.1-.9-2-2-2s-2 .9-2 2 2 4 2 4 2-2.9 2-4zm0 0c0-1.1.9-2 2-2s2 .9 2 2-2 4-2 4-2-2.9-2-4zm-7 7h14M5 5h14"
          />
        </svg>
        <h1 id="hero-heading" className="text-5xl md:text-6xl font-bold mb-4">
          MedSafe: Жеке Деректерді Қорғау
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-4xl mx-auto">
          Медициналық деректерді қауіпсіз сақтау және өңдеу жүйесі. RSA шифрлауы мен жеке кілттер арқылы сіздің құпиялылығыңызды қамтамасыз етеміз.
        </p>
        {user ? (
          <button
            onClick={() => handleNavigate("/dashboard")}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            aria-label="Дашбордқа өту"
          >
            Статистикаға өту
          </button>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={() => handleNavigate("/login")}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              aria-label="Кіру"
            >
              Кіру
            </button>
            <button
              onClick={() => handleNavigate("/register")}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
              aria-label="Тіркелу"
            >
              Тіркелу
            </button>
          </div>
        )}
      </motion.header>

      {/* Features Section */}
      <motion.section
        className="py-16 px-4 sm:px-6 lg:px-8 w-full"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        aria-labelledby="features-heading"
      >
        <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          MedSafe жүйесінің мүмкіндіктері
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {[
            {
              icon: (
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c0-1.1-.9-2-2-2s-2 .9-2 2 2 4 2 4 2-2.9 2-4zm0 0c0-1.1.9-2 2-2s2 .9 2 2-2 4-2 4-2-2.9-2-4zm-7 7h14M5 5h14"
                  />
                </svg>
              ),
              title: "Қауіпсіз шифрлау",
              description: "Диагноздар мен деректерді RSA алгоритмімен шифрлау арқылы қорғаймыз.",
            },
            {
              icon: (
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              title: "Икемді аутентификация",
              description: "Пароль немесе жеке кілт арқылы қауіпсіз және ыңғайлы кіру.",
            },
            {
              icon: (
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
                  />
                </svg>
              ),
              title: "Толық аудит",
              description: "Барлық әрекеттерді бақылау және қауіпсіздікті қамтамасыз ету.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Authenticated User Section */}
      {user && (
        <motion.section
          className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 w-full"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          aria-labelledby="welcome-heading"
        >
          <div className="text-center">
            <h2 id="welcome-heading" className="text-3xl font-bold text-gray-800 mb-4">
              Қош келдіңіз, {user.firstName} {user.lastName}!
            </h2>
            <p className="text-gray-600 mb-6">
              Сіздің рөліңіз: {roles.join(", ") || "Жоқ"}
            </p>
            <button
              onClick={() => handleNavigate("/dashboard")}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              aria-label="Жеке кабинетке өту"
            >
              Жеке кабинетке өту
            </button>
          </div>
        </motion.section>
      )}

      {/* Error Alert */}
      {error && (
        <motion.div
          className="bg-red-100 text-red-700 p-4 rounded-lg mb-8 text-center w-full px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 sm:px-6 lg:px-8 w-full mt-auto">
        <div className="w-full text-center">
          <p className="text-lg mb-4">
            MedSafe © {new Date().getFullYear()} | Жетілдірілген шифрлау стандарттарымен қорғалған
          </p>
          <div className="flex justify-center space-x-6">
            <a href="/about" className="hover:text-blue-300 transition duration-200">
              Жүйе туралы
            </a>
            <a href="/contact" className="hover:text-blue-300 transition duration-200 POLITIC">
              Байланыс
            </a>
            <a href="/privacy" className="hover:text-blue-300 transition duration-200">
              Құпиялылық саясаты
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;