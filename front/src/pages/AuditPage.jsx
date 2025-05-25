import React, { useState, useEffect } from "react";
import axios from "axios";

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [action, setAction] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  // Функция для отправки запроса на сервер с фильтрацией
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/audit/logs", {
        params: {
          startDate,
          endDate,
          action,
          userId,
        },
      });
      setLogs(response.data);  // Сохраняем результаты в state
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Функция для обработки отправки формы
  const handleFilter = (e) => {
    e.preventDefault();
    fetchAuditLogs();
  };

  return (
    <div>
      <h2>Audit Logs</h2>
      
      <form onSubmit={handleFilter}>
        <div>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div>
          <label>Action:</label>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. login, create"
          />
        </div>

        <div>
          <label>User ID:</label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Filter Logs"}
        </button>
      </form>

      <h3>Audit Logs Results</h3>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Target Table</th>
            <th>Target ID</th>
            <th>Action Date</th>
            <th>IP Address</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <tr key={log.auditId}>
                <td>{log.user.username}</td>
                <td>{log.action}</td>
                <td>{log.targetTable}</td>
                <td>{log.targetId}</td>
                <td>{log.actionDate}</td>
                <td>{log.ipAddress}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No logs found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AuditPage;
