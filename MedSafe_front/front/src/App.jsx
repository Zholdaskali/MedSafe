// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux"; 
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import AuditPage from "./pages/AuditPage";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import CreateDiagnosis from "./pages/CreateDiagnosis";
import KeyGenerationPage from "./pages/KeyGenerationPage";
import DecryptDiagnosisPage from "./pages/DecryptDiagnosisPage";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage"

function App() {
  const authToken = useSelector((state) => state.token.token); 

  return (
    <Routes>
      {/* Открытые маршруты */}
      <Route path="/login" element={<Login />} />

      {/* Редирект с корня в зависимости от аутентификации */}
      <Route path="/" element={authToken ? <Navigate to="/home" /> : <Navigate to="/login" />} />

      {/* Защищенные маршруты */}
      <Route element={<Layout />}>
        <Route
          path="/register"
          element={
            <PrivateRoute>
              <Register />
            </PrivateRoute>
          }
        />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPage />
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
          path="/diagnosis/key-generation"
          element={
            <PrivateRoute>
              <KeyGenerationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/diagnosis/view"
          element={
            <PrivateRoute>
              <DecryptDiagnosisPage />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;