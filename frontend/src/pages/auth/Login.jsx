import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "@/services/api"; // <-- import da API

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(email, senha);
      // Exemplo: salvar token no localStorage
      localStorage.setItem("authToken", data.token);
      setIsAuthenticated(true);
      navigate("/");
    } catch (error) {
      alert("Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 grid md:grid-cols-2">
      <div className="flex items-center justify-center bg-gray-100 px-4">
        <Card className="w-full max-w-md shadow-lg rounded-2xl border border-gray-200 bg-white">
          <CardHeader className="border-b border-border/40 pb-6 mb-2">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold">Acesse sua conta</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Continue monitorando sua produção com a AgroTech</p>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <p className="text-sm text-center text-gray-600">
                Não tem conta? <Link to="/register" className="text-primary hover:underline">Registrar-se</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:flex items-center justify-center rounded-l-3xl overflow-hidden">
        <img src="/fundo.jpeg" alt="AgroTech" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
