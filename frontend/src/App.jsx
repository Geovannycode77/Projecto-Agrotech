import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import Dashboard from "./pages/Dashboard";
import SaudeAnimal from "./pages/SaudeAnimal";
import Nutricao from "./pages/Nutricao";
import Reproducao from "./pages/Reproducao";
import Tarefas from "./pages/Tarefas";
import Calendario from "./pages/Calendario";
import Insumos from "./pages/Insumos";
import Alertas from "./pages/Alertas";
import Login from "./pages/Login";
import Register from "./pages/Register";

// =================== SIDEBAR ===================
function Sidebar({ onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "🏠 Painel" },
    { path: "/calendario", label: "📅 Calendário" },
    { path: "/nutricao", label: "🌾 Nutrição" },
    { path: "/reproducao", label: "🔁 Reprodução" },
    { path: "/alertas", label: "🚨 Alertas" },
    { path: "/tarefas", label: "📝 Tarefas" },
    { path: "/saude", label: "🐄 Saúde" },
    { path: "/insumos", label: "📦 Insumos" },
  ];

  return (
    <aside className="w-64 fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between p-4">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          🌿 AgroTech
        </h1>
        <nav className="flex flex-col gap-3">
          {navItems.map(({ path, label }) => (
            <Link key={path} to={path}>
              <Button
                variant={location.pathname === path ? "secondary" : "ghost"}
                className="justify-start w-full"
              >
                {label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      {/* Botão de Logout */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="destructive"
          onClick={onLogout}
          className="w-full font-semibold"
        >
          🚪 Sair
        </Button>
      </div>
    </aside>
  );
}

// =================== PROTEÇÃO DE ROTAS ===================
function ProtectedLayout({ isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/saude" element={<SaudeAnimal />} />
          <Route path="/nutricao" element={<Nutricao />} />
          <Route path="/reproducao" element={<Reproducao />} />
          <Route path="/tarefas" element={<Tarefas />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/insumos" element={<Insumos />} />
          <Route path="/alertas" element={<Alertas />} />
        </Routes>
      </main>
    </div>
  );
}

// =================== APP PRINCIPAL ===================
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Login e Registro SEM sidebar */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas protegidas COM sidebar */}
        <Route
          path="/*"
          element={<ProtectedLayout isAuthenticated={isAuthenticated} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
