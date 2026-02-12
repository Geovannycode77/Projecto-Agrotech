// src/pages/dashboard/DashboardLayout.jsx
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

import Dashboard from "./main";
import SaudeAnimal from "./SaudeAnimal";
import Nutricao from "./Nutricao";
import Reproducao from "./Reproducao";
import Tarefas from "./Tarefas";
import Calendario from "./Calendario";
import Insumos from "./Insumos";
import Perfil from "./Perfil";
import Alertas from "./Alertas";

// =================== SIDEBAR ===================
function Sidebar({ onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Painel" },
    { path: "/calendario", label: "Calendário" },
    { path: "/nutricao", label: "Nutrição" },
    { path: "/reproducao", label: "Reprodução" },
    { path: "/alertas", label: "Alertas" },
    { path: "/tarefas", label: "Tarefas" },
    { path: "/saude", label: "Saúde" },
    { path: "/insumos", label: "Insumos" },
    { path: "/perfil", label: "Perfil" },
  ];

  return (
    <aside className="w-64 fixed top-0 left-0 h-screen bg-gray-50 flex flex-col justify-between p-4 border-r">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <img src={logo} alt="AgroTech" className="h-16 w-16 rounded-full object-cover" />
          <div>
            <h1 className="text-lg font-semibold">AgroTech</h1>
            <p className="text-xs text-gray-500">Gestão Agropecuária</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ path, label }) => {
            const isActive = location.pathname === path;
            const base = "justify-start w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors";
            const classes = isActive
              ? `${base} bg-gray-200 text-gray-900 font-medium`
              : `${base} text-gray-600 hover:bg-gray-100 hover:text-gray-800`;

            return (
              <Link key={path} to={path}>
                <Button variant="ghost" className={classes}>
                  <span className="ml-1">{label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

// =================== DASHBOARD LAYOUT ===================
export default function DashboardLayout() {
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex bg-green-50 min-h-screen">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto rounded-2xl bg-white/90 p-6 shadow-lg border border-primary/20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/saude" element={<SaudeAnimal />} />
            <Route path="/nutricao" element={<Nutricao />} />
            <Route path="/reproducao" element={<Reproducao />} />
            <Route path="/tarefas" element={<Tarefas />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/insumos" element={<Insumos />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/alertas" element={<Alertas />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
