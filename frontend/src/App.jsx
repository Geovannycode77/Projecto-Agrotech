import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ConfirmProvider } from "./components/ui/ConfirmContext";
import { Toaster } from "./components/ui/toaster";
import { useAuth } from "./hooks/useAuth";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/register";
import PendingApproval from "./pages/auth/pendingApproval";
import ConfirmEmail from "./pages/auth/ConfirmEmail";
import CompleteProfile from "./pages/auth/CompleteProfile";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminReports from "./pages/admin/Reports";
import AdminBackups from "./pages/admin/Backups";
import Permissions from "./pages/admin/Permissions";
import Security from "./pages/admin/Security";
import AdminLayout from "./components/layouts/AdminLayout";

// Dashboards dos usuários (sem layout wrapper)
import ProdutorDashboard from "./pages/dashboard/ProdutorDashboard";
import VeterinarioDashboard from "./pages/dashboard/VeterinarioDashboard";
import FuncionarioDashboard from "./pages/dashboard/FuncionarioDashboard";
import GestorFinanceiroDashboard from "./pages/dashboard/GestorFinanceiroDashboard";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Carregando...</p>
    </div>
  </div>
);

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!user?.email_confirmed) {
    return <Navigate to="/pending-confirmation" />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user?.role) &&
    !user?.is_superuser
  ) {
    return <Navigate to="/" />;
  }

  return children;
};

// Componente que redireciona para o dashboard correto baseado no papel
const DashboardRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  switch (user?.role) {
    case "produtor":
      return <Navigate to="/produtor" />;
    case "veterinario":
      return <Navigate to="/veterinario" />;
    case "funcionario":
      return <Navigate to="/funcionario" />;
    case "gestor_financeiro":
      return <Navigate to="/gestor" />;
    case "administrador":
      return <Navigate to="/admin/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ConfirmProvider>
          <Toaster />
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
            <Route
              path="/complete-profile/:role"
              element={<CompleteProfile />}
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Rotas dos Dashboards (sem layout wrapper) */}
            <Route
              path="/produtor"
              element={
                <PrivateRoute allowedRoles={["produtor"]}>
                  <ProdutorDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/veterinario"
              element={
                <PrivateRoute allowedRoles={["veterinario"]}>
                  <VeterinarioDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/funcionario"
              element={
                <PrivateRoute allowedRoles={["funcionario"]}>
                  <FuncionarioDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/gestor"
              element={
                <PrivateRoute allowedRoles={["gestor_financeiro"]}>
                  <GestorFinanceiroDashboard />
                </PrivateRoute>
              }
            />

            {/* Admin Routes (com AdminLayout) */}
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={["administrador"]}>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="permissions" element={<Permissions />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="backups" element={<AdminBackups />} />
              <Route path="security" element={<Security />} />
            </Route>

            {/* Redirect padrão */}
            <Route path="/" element={<DashboardRedirect />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ConfirmProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
