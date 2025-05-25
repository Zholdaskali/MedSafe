// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";  // Импорт Navigate
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard";
import AuditPage from "./pages/AuditPage";  
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import CreateDiagnosis from "./pages/CreateDiagnosis";
import DecryptDiagnosis from "./pages/DecryptDiagnosis";

function App() {
  return (
    <Routes>
      {/* Открытые маршруты */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Редирект с корня на /dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} /> {/* Редирект на Dashboard */}

      {/* Защищенные маршруты */}
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/audit/logs"
          element={
            <PrivateRoute>
              <AuditPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/diagnosis/create"
          element={
            <PrivateRoute>
              <CreateDiagnosis />
            </PrivateRoute>
          }
        />
        <Route
          path="/diagnosis/view"
          element={
            <PrivateRoute>
              <DecryptDiagnosis />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
