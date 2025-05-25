import React, { useEffect, useState } from "react";
import axios from "axios";

// Сервис для получения статистики
const getDashboardStats = async () => {
  try {
    const response = await axios.get("http://localhost:8080/api/dashboard/statistics", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats", error);
    return null;
  }
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDiagnoses: 0,
    totalTests: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getDashboardStats();
      if (data) {
        setStats(data);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Dashboard</h1>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700">Total Patients</h3>
          <p className="text-4xl font-bold text-blue-500">{stats.totalPatients}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700">Total Diagnoses</h3>
          <p className="text-4xl font-bold text-blue-500">{stats.totalDiagnoses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700">Total Tests</h3>
          <p className="text-4xl font-bold text-blue-500">{stats.totalTests}</p>
        </div>
      </div>

      {/* Графики и тренды */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Trends and Analysis</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-center text-gray-600">Здесь могут быть графики или другие виды аналитики</p>
          {/* Пример статической диаграммы */}
          <div className="mt-6 p-6 border border-dashed border-gray-300 rounded-md text-center">
            <p className="text-gray-500">Диаграмма трендов (здесь может быть график)</p>
          </div>
        </div>
      </div>

      {/* Последняя активность */}
      <div>
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Recent Activity</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-center text-gray-600">Здесь будет список недавних действий или изменений</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
