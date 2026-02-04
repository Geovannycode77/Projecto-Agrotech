import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Login simulado (trocas depois por backend/Firebase)
    if (email === "admin@agrotech.com" && senha === "123456") {
      setIsAuthenticated(true);
      navigate("/");
    } else {
      alert("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 grid md:grid-cols-2">
      {/* LADO ESQUERDO - FORMULÁRIO */}
      <div className="flex items-center justify-center  bg-gray-100 px-4">
        <Card className="w-full max-w-md shadow-lg rounded-2xl border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Login - AgroTech
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form
              className="space-y-4"
              onSubmit={handleSubmit}
              noValidate
            >
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
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Entrar
              </Button>

              <p className="text-sm text-center text-gray-600">
                Não tem conta?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Registrar-se
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* LADO DIREITO - IMAGEM */}
      <div className="hidden md:flex items-center justify-center  rounded-l-3xl overflow-hidden">
        <img
          src="/fundo.jpeg"
          alt="AgroTech"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
