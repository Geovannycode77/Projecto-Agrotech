// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { ConfirmProvider } from "@/components/ui/ConfirmContext.jsx";
import { isAuthenticated as checkAuth } from "@/services/api";

// Páginas públicas
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/registro";
import ForgotPassword from "@/pages/auth/esqueceu-palavra-passe";
import ResetPassword from "@/pages/auth/resetar-palavra-passe";
import VerificacaoEmail from "@/pages/auth/verificacao-email";

// Layout protegido com sidebar e dashboard
import DashboardLayout from "@/pages/dashboard/DashboardLayout";

// Componente para proteger rotas
function ProtectedRoute({ children, isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Componente para redirecionar se já estiver autenticado
function PublicRoute({ children, isAuthenticated }) {
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar autenticação ao carregar a app
  useEffect(() => {
    const auth = checkAuth();
    setIsAuthenticated(auth);
    setLoading(false);
  }, []);

  // Função de logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-semibold text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <Router>
      <ConfirmProvider>
        <Routes>
          {/* Rotas públicas - apenas para usuários não autenticados */}
          <Route
            path="/login"
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <Login setIsAuthenticated={setIsAuthenticated} />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/esqueceu-palavra-passe"
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/resetar-palavra-passe/:token"
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/verificacao-email/:token"
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <VerificacaoEmail />
              </PublicRoute>
            }
          />

          {/* Rotas protegidas - apenas para usuários autenticados */}
          <Route
            path="/*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <DashboardLayout
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ConfirmProvider>
    </Router>
  );
}

export default App;
