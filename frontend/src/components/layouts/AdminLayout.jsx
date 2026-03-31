import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Database,
  LogOut
} from 'lucide-react';

const menuItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/users', icon: Users, label: 'Utilizadores' },
  { path: '/admin/settings', icon: Settings, label: 'Configurações' },
  { path: '/admin/reports', icon: FileText, label: 'Relatórios' },
  { path: '/admin/backups', icon: Database, label: 'Backups' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-green-600">AgroTech</h1>
          <p className="text-sm text-gray-500 mt-2">Painel Admin</p>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors ${
                  isActive ? 'bg-green-50 text-green-600 border-r-4 border-green-600' : ''
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors mt-4"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Sair</span>
          </button>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Bem-vindo, {user?.email}</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Função: <span className="font-medium capitalize">{user?.role}</span>
              </span>
            </div>
          </div>
        </header>
        
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}