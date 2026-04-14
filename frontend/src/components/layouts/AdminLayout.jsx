import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Database,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Lock,
  BarChart3,
  HardDrive,
} from "lucide-react";

const menuItems = [
  {
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    color: "text-emerald-600",
  },
  {
    path: "/admin/users",
    icon: Users,
    label: "Gestão de Utilizadores",
    color: "text-blue-600",
  },
  {
    path: "/admin/permissions",
    icon: Shield,
    label: "Permissões",
    color: "text-purple-600",
  },
  {
    path: "/admin/settings",
    icon: Settings,
    label: "Configuração do Sistema",
    color: "text-orange-600",
  },
  {
    path: "/admin/backups",
    icon: Database,
    label: "Backups",
    color: "text-teal-600",
  },
  {
    path: "/admin/reports",
    icon: FileText,
    label: "Relatórios Gerais",
    color: "text-rose-600",
  },
  {
    path: "/admin/security",
    icon: Lock,
    label: "Segurança",
    color: "text-red-600",
  },
  {
    path: "/admin/monitoring",
    icon: BarChart3,
    label: "Monitoramento",
    color: "text-indigo-600",
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-gray-800">AgroTech Admin</span>
          </div>
          <div className="w-8"></div>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-20">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AgroTech</h1>
              <p className="text-xs text-gray-500">Painel Administrativo</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-gray-50">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-50">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">AgroTech</h1>
                  <p className="text-xs text-gray-500">Painel Admin</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
