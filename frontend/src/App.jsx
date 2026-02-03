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
    <aside className="w-64 fixed top-0 left-0 h-screen bg-gradient-to-b from-primary/90 via-primary/80 to-primary/70 text-white flex flex-col justify-between p-4 shadow-lg">
      {/* Cabeçalho */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/logo192.png"
            alt="AgroTech"
            className="h-10 w-10 rounded"
          />
          <div>
            <h1 className="text-xl font-bold">AgroTech</h1>
            <p className="text-xs opacity-80">Gestão Agropecuária</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map(({ path, label, Icon }) => {
            const isActive = location.pathname === path;
            const base =
              "justify-start w-full flex items-center gap-3 px-3 py-2 rounded";
            const classes = isActive
              ? `${base} bg-primary shadow-md text-white`
              : `${base} hover:bg-primary/80 hover:text-white/90`;
            return (
              <Link key={path} to={path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={classes}
                >
                  {Icon && <Icon className="h-4 w-4 opacity-90" />}
                  <span className="ml-1">{label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Botão de Logout e Perfil */}
      <div className="pt-4 border-t border-primary/30 flex items-center gap-3 justify-between">
        <div className="flex gap-2 items-center">
          {/* Avatar button (compact) */}
          <Link to="/perfil" title="Perfil">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shadow"
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
          <div className="w-24">
            <Button
              variant="destructive"
              onClick={onLogout}
              className="w-full font-semibold"
            >
              🚪 Sair
            </Button>
          </div>
        </div>
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
    // Clear any client-side cached app data when logging out
    try {
      localStorage.removeItem("insumos_items");
      localStorage.removeItem("repro_records");
      // other keys that may contain user data
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="flex bg-gradient-to-br from-green-50 to-green-100 text-gray-900 dark:text-gray-100 min-h-screen">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto rounded-2xl bg-white/90 dark:bg-gray-800/70 p-6 shadow-lg border border-primary/20">
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
