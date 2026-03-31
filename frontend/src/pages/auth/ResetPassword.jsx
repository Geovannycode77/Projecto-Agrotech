import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Leaf, Lock, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const [senha, setSenha] = useState("");
  const [confSenha, setConfSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Token inválido. Solicite um novo link de recuperação.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (senha !== confSenha) {
      setError("As senhas não coincidem");
      return;
    }

    if (senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: senha })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Senha redefinida com sucesso!");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(data.error || "Token inválido ou expirado.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link Inválido</h2>
          <p className="text-gray-600 mb-4">O link de recuperação é inválido ou expirou.</p>
          <Link to="/forgot-password" className="text-green-600 hover:underline">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo e cabeçalho */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nova Senha</h1>
          <p className="text-gray-500">Digite sua nova senha</p>
        </div>

        {/* Card de redefinição */}
        <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Redefinir Senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 flex-1">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-700 flex-1">{success}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Nova Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-12 border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirmar Nova Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confSenha}
                  onChange={(e) => setConfSenha(e.target.value)}
                  className="h-12 border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-xl"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Redefinir Senha
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <div className="text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            © 2024 AgroTech. Todos os direitos reservados.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in-down { animation: fade-in-down 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-blob { animation: blob 7s infinite; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}