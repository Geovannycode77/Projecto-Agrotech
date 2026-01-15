import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  Home,
  Calendar,
  BarChart2,
  Repeat,
  AlertTriangle,
  List,
  Heart,
  Box,
  User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmProvider } from "@/components/ui/ConfirmContext";

import Dashboard from "./pages/Dashboard";
import SaudeAnimal from "./pages/SaudeAnimal";
import Nutricao from "./pages/Nutricao";
import Reproducao from "./pages/Reproducao";
import Perfil from "./pages/Perfil";
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
    { path: "/", label: "Painel", Icon: Home },
    { path: "/calendario", label: "Calendário", Icon: Calendar },
    { path: "/nutricao", label: "Nutrição", Icon: BarChart2 },
    { path: "/reproducao", label: "Reprodução", Icon: Repeat },
    { path: "/alertas", label: "Alertas", Icon: AlertTriangle },
    { path: "/tarefas", label: "Tarefas", Icon: List },
    { path: "/saude", label: "Saúde", Icon: Heart },
    { path: "/insumos", label: "Insumos", Icon: Box },
    { path: "/perfil", label: "Perfil", Icon: User },
  ];

  return (
    <aside
      className="w-72 fixed top-0 left-0 h-screen flex flex-col justify-between p-6 shadow-2xl overflow-y-auto"
      style={{
        background:
          "linear-gradient(135deg, #0a3d62 0%, #0f5a8a 50%, #1e7a8f 100%)",
        borderRight: "3px solid #10c876",
      }}
    >
      {/* LOGO HEADER */}
      <div>
        <div
          className="flex items-center gap-3 mb-10 p-4 rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(16, 200, 118, 0.2), rgba(30, 122, 143, 0.2))",
            border: "2px solid rgba(16, 200, 118, 0.4)",
            backdropFilter: "blur(10px)",
          }}
        >
          <img
            src="/celeiro-removebg(1).png"
            alt="AgroTech"
            className="h-14 w-14 rounded-full shadow-xl"
            style={{
              boxShadow:
                "0 0 20px rgba(12, 180, 116, 0.4), 0 0 40px rgba(16, 200, 118, 0.3)",
            }}
          />
          <div>
            <h1
              className="text-2xl font-black neon-text"
              style={{ color: "#fff" }}
            >
              AgroTech
            </h1>
            <p
              className="text-xs font-semibold opacity-80"
              style={{ color: "#10c876" }}
            >
              Inteligência Agrícola
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="flex flex-col gap-2 mb-6">
          {navItems.map(({ path, label, Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link key={path} to={path} className="group relative">
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #10c876, #1e7a8f)"
                      : "linear-gradient(135deg, rgba(16, 200, 118, 0.3), rgba(30, 122, 143, 0.3))",
                  }}
                />
                <Button
                  className={`w-full justify-start gap-3 rounded-2xl relative z-10 font-semibold text-base h-12 transition-all duration-300 ${
                    isActive
                      ? "text-white shadow-xl"
                      : "text-white hover:text-green-200"
                  }`}
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #10c876, #1e7a8f)"
                      : "rgba(255, 255, 255, 0.12)",
                    border: isActive
                      ? "none"
                      : "2px solid rgba(16, 200, 118, 0.4)",
                    backdropFilter: "blur(10px)",
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span>{label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* LOGOUT AREA */}
      <div className="pt-4 border-t border-white/10 flex items-center gap-3 justify-between group">
        <Link to="/perfil" title="Ver Perfil" className="relative">
          <div
            className="absolute inset-0 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: "linear-gradient(135deg, #10c876, #1e7a8f)",
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full relative z-10 font-bold text-lg shadow-lg transition-all duration-300 text-white hover:scale-110"
            style={{
              background: "linear-gradient(135deg, #10c876, #1e7a8f)",
            }}
          >
            {(() => {
              try {
                const raw = localStorage.getItem("perfil_data");
                const name = raw ? JSON.parse(raw).name : null;
                return name ? name[0].toUpperCase() : "U";
              } catch (e) {
                return "U";
              }
            })()}
          </Button>
        </Link>
        <Button
          variant="destructive"
          onClick={onLogout}
          className="flex-1 font-bold rounded-xl h-12 text-base transition-all duration-300 text-white"
          style={{
            background: "linear-gradient(130deg, #1e7a8f, #10c876)",
          }}
        >
          SAIR
        </Button>
      </div>
    </aside>
  );
}

// =================== PROTEÇÃO DE ROTAS ===================
function ProtectedLayout({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  const onLogout = () => {
    try {
      localStorage.removeItem("insumos_items");
      localStorage.removeItem("repro_records");
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar onLogout={onLogout} />
      <main
        className="flex-1 ml-72 overflow-y-auto gradient-shift"
        style={{
          background:
            "linear-gradient(135deg, #0f0f23 0%, #1a0f2e 25%, #2d1b4e 50%, #1a0f2e 75%, #0f0f23 100%)",
          backgroundSize: "400% 400%",
        }}
      >
        <div className="p-10">
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

// =================== APP PRINCIPAL ===================
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <ConfirmProvider>
        <Routes>
          {/* Login e Registro SEM sidebar */}
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/register" element={<Register />} />

          {/* Rotas protegidas COM sidebar */}
          <Route
            path="/*"
            element={
              <ProtectedLayout
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
              />
            }
          />
        </Routes>
      </ConfirmProvider>
    </Router>
  );
}

export default App;
