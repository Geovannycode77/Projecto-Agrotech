import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
import AdminLayout from "./components/layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import SystemSettings from "./pages/admin/SystemSettings";
import AdminReports from "./pages/admin/Reports";
import AdminBackups from "./pages/admin/Backups";
import Permissions from "./pages/admin/Permissions";
import Security from "./pages/admin/Security";
import Monitoring from "./pages/admin/Monitoring";

// Role-based Dashboards
import ProdutorDashboard from "./pages/dashboard/ProdutorDashboard";
import VeterinarioDashboard from "./pages/dashboard/VeterinarioDashboard";
import FuncionarioDashboard from "./pages/dashboard/FuncionarioDashboard";
import GestorFinanceiroDashboard from "./pages/dashboard/GestorFinanceiroDashboard";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Carregando...
      </div>
    );
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
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const DashboardRouter = () => {
  const { user } = useAuth();

  const dashboards = {
    administrador: (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    ),
    produtor: <ProdutorDashboard />,
    veterinario: <VeterinarioDashboard />,
    funcionario: <FuncionarioDashboard />,
    gestor_financeiro: <GestorFinanceiroDashboard />,
  };

  return dashboards[user?.role] || <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
          <Route path="/complete-profile/:role" element={<CompleteProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardRouter />
              </PrivateRoute>
            }
          />
          
          {/* Admin Routes */}
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
            <Route path="settings" element={<SystemSettings />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="backups" element={<AdminBackups />} />
            <Route path="security" element={<Security />} />
            <Route path="monitoring" element={<Monitoring />} />
          </Route>
          
          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;