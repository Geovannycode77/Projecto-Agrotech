import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

// ⬇️ COLOQUE AQUI A URL OU NOME DA IMAGEM
const BACKGROUND_IMAGE = "/fundolog.svg";

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Login simulado (podes trocar por Firebase depois)
    if (email === "admin@agrotech.com" && senha === "123456") {
      setIsAuthenticated(true);
      navigate("/");
    } else {
      alert("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <div
      className="flex min-h-screen bg-white overflow-hidden"
      style={{ height: "100vh" }}
    >
      {/* DIV DO LOGIN - À esquerda */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-20 md:pl-42">
        <Card
          className="w-full max-w-xl shadow-2xl rounded-3xl border border-white/30 p-14"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <CardHeader>
            <CardTitle
              className="text-2xl font-semibold text-center"
              style={{ color: "#2d8659" }}
            >
              Iniciar sessão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

              {/* Checkbox e Link de Esqueceu Senha */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: "#4a9b7f" }}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm"
                    style={{ color: "#666" }}
                  >
                    Relembrar senha
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm hover:underline font-semibold"
                  style={{ color: "#2d8659" }}
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full text-white font-semibold rounded-2xl hover:opacity-90"
                style={{ backgroundColor: "#4a9b7f" }}
              >
                Entrar
              </Button>
              <p className="text-sm text-center" style={{ color: "#2d8659" }}>
                Não tem conta?{" "}
                <Link
                  to="/register"
                  className="hover:underline font-semibold"
                  style={{ color: "#2d8659" }}
                >
                  Registrar-se
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* DIV DA IMAGEM - À direita, ocupa toda a altura */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
        <img
          src={BACKGROUND_IMAGE}
          alt="AgroTech Logo"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
