import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/register';
import PendingApproval from './pages/auth/pendingApproval';
import ConfirmEmail from './pages/auth/ConfirmEmail';
import CompleteProfile from './pages/auth/CompleteProfile';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';  // <-- ADICIONE ESTA LINHA

// Admin Pages
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Settings from './pages/admin/Settings';
import Reports from './pages/admin/Reports';
import Backups from './pages/admin/Backups';

// Role-based Dashboards
import ProdutorDashboard from './pages/dashboard/ProdutorDashboard';
import VeterinarioDashboard from './pages/dashboard/VeterinarioDashboard';
import FuncionarioDashboard from './pages/dashboard/FuncionarioDashboard';
import GestorFinanceiroDashboard from './pages/dashboard/GestorFinanceiroDashboard';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!user?.email_confirmed) {
    return <Navigate to="/pending-confirmation" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role) && !user?.is_superuser) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  
  const dashboards = {
    administrador: <AdminLayout><AdminDashboard /></AdminLayout>,
    produtor: <ProdutorDashboard />,
    veterinario: <VeterinarioDashboard />,
    funcionario: <FuncionarioDashboard />,
    gestor_financeiro: <GestorFinanceiroDashboard />
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
          <Route path="/reset-password/:token" element={<ResetPassword />} />  {/* <-- ADICIONE ESTA LINHA */}
          
          {/* Dashboard */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardRouter />
            </PrivateRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['administrador']}>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="backups" element={<Backups />} />
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