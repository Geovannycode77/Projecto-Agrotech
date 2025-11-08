import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center text-green-700">
            Login - AgroTech
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
            <Button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold"
            >
              Entrar
            </Button>
            <p className="text-sm text-center text-gray-600">
              Não tem conta?{" "}
              <Link to="/register" className="text-green-700 hover:underline">
                Registrar-se
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
