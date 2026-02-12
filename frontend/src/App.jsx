// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { ConfirmProvider } from "@/components/ui/ConfirmContext";

// Páginas públicas
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/registro";

// Layout protegido com sidebar e dashboard
import DashboardLayout from "@/pages/dashboard/DashboardLayout";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <ConfirmProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas protegidas */}
          <Route
            path="/*"
            element={
              <DashboardLayout
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
