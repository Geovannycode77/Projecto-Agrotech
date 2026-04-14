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
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import SystemSettings from "./pages/admin/SystemSettings";
import AdminReports from "./pages/admin/Reports";
import AdminBackups from "./pages/admin/Backups";
import Permissions from "./pages/admin/Permissions";
import Security from "./pages/admin/Security";
import Monitoring from "./pages/admin/Monitoring";

// Role-based Dashboards
import DashboardLayout from "./components/layouts/DashboardLayout";
import ProdutorDashboard from "./pages/dashboard/ProdutorDashboard";
import VeterinarioDashboard from "./pages/dashboard/VeterinarioDashboard";
import FuncionarioDashboard from "./pages/dashboard/FuncionarioDashboard";
import GestorFinanceiroDashboard from "./pages/dashboard/GestorFinanceiroDashboard";

// Componentes específicos do produtor
import CadastroAnimais from "./pages/dashboard/components/CadastroAnimais";
import GestaoFinanceira from "./pages/dashboard/components/GestaoFinanceira";
import AlimentacaoGado from "./pages/dashboard/components/AlimentacaoGado";
import RelatorioProducao from "./pages/dashboard/components/RelatorioProducao";
import AlertasNotificacoes from "./pages/dashboard/components/AlertasNotificacoes";

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
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Componente que renderiza o dashboard correto baseado no papel
const RoleBasedDashboard = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  const role = user?.role || 'produtor';
  
  switch (role) {
    case 'administrador':
      return <AdminDashboard />;
    case 'produtor':
      return <ProdutorDashboard />;
    case 'veterinario':
      return <VeterinarioDashboard />;
    case 'funcionario':
      return <FuncionarioDashboard />;
    case 'gestor_financeiro':
      return <GestorFinanceiroDashboard />;
    default:
      return <ProdutorDashboard />;
  }
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
          
          {/* Dashboard Routes com Layout */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            {/* Rotas do Produtor */}
            <Route index element={<RoleBasedDashboard />} />
            <Route path="animais" element={<CadastroAnimais />} />
            <Route path="financeiro" element={<GestaoFinanceira />} />
            <Route path="alimentacao" element={<AlimentacaoGado />} />
            <Route path="relatorios" element={<RelatorioProducao />} />
            <Route path="alertas" element={<AlertasNotificacoes alertas={[]} />} />
            <Route path="saude" element={<ProdutorDashboard />} />
            <Route path="calendario" element={<ProdutorDashboard />} />
            <Route path="tarefas" element={<ProdutorDashboard />} />
            <Route path="insumos" element={<ProdutorDashboard />} />
            <Route path="perfil" element={<ProdutorDashboard />} />
            
            {/* Rotas do Veterinário */}
            <Route path="consultas" element={<VeterinarioDashboard />} />
            <Route path="vacinas" element={<VeterinarioDashboard />} />
            <Route path="prontuarios" element={<VeterinarioDashboard />} />
            <Route path="emergencias" element={<VeterinarioDashboard />} />
            
            {/* Rotas do Funcionário */}
            <Route path="tarefas" element={<FuncionarioDashboard />} />
            
            {/* Rotas do Gestor */}
            <Route path="projecoes" element={<GestorFinanceiroDashboard />} />
            <Route path="configuracoes" element={<GestorFinanceiroDashboard />} />
          </Route>
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={["administrador"]}>
                <DashboardLayout />
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