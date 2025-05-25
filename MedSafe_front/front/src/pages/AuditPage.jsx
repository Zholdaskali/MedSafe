import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaFilter, FaUser, FaCalendarAlt, FaList, FaRedo } from "react-icons/fa";
import axios from "axios"; // Импортируем axios напрямую

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [action, setAction] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const authToken = useSelector((state) => state.token.token);
  const navigate = useNavigate();

  // Fetch audit logs
  const fetchAuditLogs = async (params = {}) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      console.log("AuditPage: Fetching logs with params:", params);
      console.log("AuditPage: Token being sent:", authToken);
      if (!authToken || typeof authToken !== "string") {
        throw new Error("Invalid or missing JWT token");
      }
      const response = await axios.get("http://localhost:8080/api/audit/logs", {
        params,
        headers: {
          Authorization: `Bearer ${authToken.trim()}`, // Удаляем пробелы
        },
      });
      console.log("AuditPage: Logs fetched:", response.data);
      setLogs(response.data);
      setSuccess("Логтар сәтті жүктелді!");
    } catch (err) {
      console.error("AuditPage: Error fetching audit logs:", err.response || err);
      setError(
        err.response?.data?.message ||
          "Аудит логтарын жүктеу кезінде қате пайда болды"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle filter submission
  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (action) params.action = action;
    if (userId) params.userId = userId;
    console.log("AuditPage: Filter params:", params);
    fetchAuditLogs(params);
  };

  // Reset filters
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setAction("");
    setUserId("");
    console.log("AuditPage: Resetting filters");
    fetchAuditLogs();
  };

  // Check authorization and initial log fetch
  useEffect(() => {
    console.log("AuditPage: authToken:", authToken);
    if (!authToken) {
      setError("Авторизация қажет. Кіріңіз.");
      navigate("/login");
    } else {
      fetchAuditLogs();
    }
  }, [authToken, navigate]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Header Bar */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaList className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Аудит Журналы</h1>
          </div>
          <p className="text-sm">Жүйелік әрекеттерді басқару</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-6 text-center">
              {success}
            </div>
          )}

          {/* Filter Form */}
          <form onSubmit={handleFilter} className="space-y-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="relative">
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Басталу Күні
                </label>
                <div className="flex items-center">
                  <FaCalendarAlt className="absolute left-3 text-gray-400" />
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Аяқталу Күні
                </label>
                <div className="flex items-center">
                  <FaCalendarAlt className="absolute left-3 text-gray-400" />
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="action"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Әрекет
                </label>
                <div className="flex items-center">
                  <FaFilter className="absolute left-3 text-gray-400" />
                  <input
                    id="action"
                    type="text"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Мысалы: login, create"
                  />
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Пайдаланушы ID
                </label>
                <div className="flex items-center">
                  <FaUser className="absolute left-3 text-gray-400" />
                  <input
                    id="userId"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    placeholder="Пайдаланушы ID енгізіңіз"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center p-3 rounded-lg text-white transition duration-200 ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                }`}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                    />
                  </svg>
                ) : (
                  <FaFilter className="mr-2" />
                )}
                {loading ? "Жүктелуде..." : "Логтарды Фильтрлеу"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 flex items-center justify-center p-3 rounded-lg text-blue-600 border border-blue-600 hover:bg-blue-50 transition duration-200"
              >
                <FaRedo className="mr-2" />
                Фильтрлерді тазалау
              </button>
            </div>
          </form>

          {/* Table */}
          <div className="relative overflow-x-auto max-h-[60vh]">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                  />
                </svg>
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="p-3">Пайдаланушы</th>
                  <th className="p-3">Әрекет</th>
                  <th className="p-3">Мақсатты Кесте</th>
                  <th className="p-3">Мақсатты ID</th>
                  <th className="p-3">Әрекет Күні</th>
                  <th className="p-3">IP Мекенжайы</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <tr
                      key={log.auditId}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-100 transition duration-200 animate-fade-in`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-3">{log.user?.username || "Белгісіз"}</td>
                      <td className="p-3">{log.action}</td>
                      <td className="p-3">{log.targetTable || "-"}</td>
                      <td className="p-3">{log.targetId || "-"}</td>
                      <td className="p-3">
                        {new Date(log.actionDate).toLocaleString("kk-KZ")}
                      </td>
                      <td className="p-3">{log.ipAddress || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-3 text-center text-gray-500">
                      Логтар табылмады
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-600 text-white p-4 text-center text-sm">
        <p>Аудит Журналы | Жаңартылған: {new Date().toLocaleString("kk-KZ")}</p>
      </footer>
    </div>
  );
};

export default AuditPage;