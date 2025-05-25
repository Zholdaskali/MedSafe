import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import api from "../../utils/api";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDiagnoses: 0,
    totalTests: 0,
  });
  const [error, setError] = useState("");
  const { token, roles } = useSelector((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setError("");
      try {
        if (!token || typeof token !== "string") {
          throw new Error("Жарамды JWT токені табылмады");
        }
        const response = await api.get("/api/dashboard/statistics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (err) {
        console.error("Статистиканы алу қатесі:", err);
        setError("Статистиканы жүктеу мүмкін болмады. Қайтадан көріңіз.");
      }
    };
    fetchStats();
  }, [token]);

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  // Pie chart data
  const pieData = {
    labels: ["Пациенттер", "Диагноздар", "Тесттер"],
    datasets: [
      {
        data: [stats.totalPatients, stats.totalDiagnoses, stats.totalTests],
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
        hoverBackgroundColor: ["#2563EB", "#059669", "#D97706"],
      },
    ],
  };

  // Pie chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 14 } },
      },
      tooltip: {
        callbacks: { label: (context) => `${context.label}: ${context.raw}` },
      },
    },
  };

  // Bar chart data
  const barData = {
    labels: ["Пациенттер", "Диагноздар", "Тесттер"],
    datasets: [
      {
        label: "Статистика",
        data: [stats.totalPatients, stats.totalDiagnoses, stats.totalTests],
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
        borderColor: ["#2563EB", "#059669", "#D97706"],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Саны", font: { size: 14 } },
      },
      x: {
        title: { display: true, text: "Категориялар", font: { size: 14 } },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (context) => `${context.label}: ${context.raw}` },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col">
      {/* Header */}
      <motion.header
        className="bg-white shadow-lg py-6 px-4 sm:px-6 lg:px-8 sticky top-0 z-10 w-full"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="w-full flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">MedSafe статистика</h1>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {error && (
          <motion.div
            className="bg-red-100 text-red-700 p-4 rounded-lg mb-8 text-center w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        {/* Statistics Cards */}
        <motion.section
          className="mb-12 w-full"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          aria-labelledby="overview-heading"
        >
          <h2 id="overview-heading" className="text-2xl font-semibold text-gray-800 mb-6">
            Шолу
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
            {[
              { title: "Жалпы пациенттер", value: stats.totalPatients, color: "blue-600" },
              { title: "Жалпы диагноздар", value: stats.totalDiagnoses, color: "green-500" },
              { title: "Жалпы тесттер", value: stats.totalTests, color: "yellow-500" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full"
                variants={cardVariants}
              >
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{stat.title}</h3>
                <p className={`text-3xl font-bold text-${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Charts Section */}
        <motion.section
          className="mb-12 w-full"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          aria-labelledby="charts-heading"
        >
          <h2 id="charts-heading" className="text-2xl font-semibold text-gray-800 mb-6">
            Трендтер және талдау
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-lg w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                  Статистиканың таралуы
                </h3>
                <div className="w-full" style={{ height: '300px' }}>
                  <Pie data={pieData} options={pieOptions} aria-label="Статистиканың таралу диаграммасы" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                  Статистиканы салыстыру
                </h3>
                <div className="w-full" style={{ height: '300px' }}>
                  <Bar data={barData} options={barOptions} aria-label="Статистиканы салыстыру диаграммасы" />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Recent Activity Section */}
        <motion.section
          className="w-full"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          aria-labelledby="activity-heading"
        >
          <h2 id="activity-heading" className="text-2xl font-semibold text-gray-800 mb-6">
            Соңғы әрекеттер
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-lg w-full">
            <p className="text-gray-600 text-center">
              Соңғы әрекеттер жоқ. Кейінірек жаңартуларды тексеріңіз.
            </p>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full text-center">
          <p className="text-sm">
            MedSafe © {new Date().getFullYear()} | Жетілдірілген шифрлау стандарттарымен қорғалған
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;