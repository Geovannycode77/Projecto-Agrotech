import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Leaf, Mail, Lock, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [focused, setFocused] = useState({ email: false, password: false });
  const [needsPassword, setNeedsPassword] = useState(false);
  const [needsAdminApproval, setNeedsAdminApproval] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Validação de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação de senha
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowResend(false);
    setShowResetPassword(false);
    setNeedsPassword(false);
    setNeedsAdminApproval(false);
    
    // Validações locais
    if (!validateEmail(email)) {
      setError('Por favor, insira um email válido.');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      // Redireciona baseado no role
      const userRole = result.user?.role;
      if (userRole === 'administrador') {
        navigate('/admin/dashboard');
      } else if (userRole === 'produtor') {
        navigate('/produtor');
      } else if (userRole === 'veterinario') {
        navigate('/veterinario');
      } else if (userRole === 'funcionario') {
        navigate('/funcionario');
      } else if (userRole === 'gestor_financeiro') {
        navigate('/gestor');
      } else {
        navigate('/dashboard');
      }
    } else {
      if (result.requires_confirmation) {
        setUnconfirmedEmail(email);
        setShowResend(true);
        setError(result.error);
      } else if (result.requires_password_setup) {
        setNeedsPassword(true);
        setError(result.error);
      } else if (result.requires_admin_approval) {
        setNeedsAdminApproval(true);
        setError(result.error);
      } else {
        setError(result.error);
      }
    }
    
    setLoading(false);
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    setResendMessage('');
    
    try {
      const response = await authService.resendConfirmation(unconfirmedEmail);
      setResendMessage(response.message);
      setError('');
      setTimeout(() => setResendMessage(''), 5000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao reenviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    setShowResend(false);
    setShowResetPassword(false);
    
    try {
      const result = await googleLogin(credentialResponse.credential);
      
      if (result.success) {
        const userRole = result.user?.role;
        if (userRole === 'administrador') {
          navigate('/admin/dashboard');
        } else if (userRole === 'produtor') {
          navigate('/produtor');
        } else if (userRole === 'veterinario') {
          navigate('/veterinario');
        } else if (userRole === 'funcionario') {
          navigate('/funcionario');
        } else if (userRole === 'gestor_financeiro') {
          navigate('/gestor');
        } else {
          navigate('/dashboard');
        }
      } else if (result.requires_registration) {
        navigate('/register', { 
          state: { 
            googleData: {
              email: result.email,
              name: result.name,
              picture: result.picture,
              google_id: result.google_id,
              credential: credentialResponse.credential
            }
          } 
        });
      } else if (result.requires_confirmation) {
        setUnconfirmedEmail(result.email);
        setShowResend(true);
        setError(result.error);
      } else if (result.requires_password_setup) {
        setNeedsPassword(true);
        setError(result.error);
      } else if (result.requires_admin_approval) {
        setNeedsAdminApproval(true);
        setError(result.error);
      } else {
        setError(result.error || 'Erro ao fazer login com Google');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Erro ao fazer login com Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Erro ao fazer login com Google. Verifique se o Google OAuth está configurado corretamente.');
  };

  const handleFocus = (field) => {
    setFocused({ ...focused, [field]: true });
  };

  const handleBlur = (field, value) => {
    if (!value) {
      setFocused({ ...focused, [field]: false });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo e cabeçalho */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AgroTech</h1>
          <p className="text-gray-500">Tecnologia que conecta você ao campo</p>
        </div>

        {/* Card de login */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensagens de erro específicas */}
            {error && (
              <div className={`flex items-center gap-3 border rounded-xl p-4 animate-shake ${
                needsPassword || needsAdminApproval 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                  needsPassword || needsAdminApproval ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm ${needsPassword || needsAdminApproval ? 'text-yellow-700' : 'text-red-700'}`}>
                    {error}
                  </p>
                  {needsAdminApproval && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Entre em contato com o administrador do sistema para aprovar sua conta.
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {resendMessage && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700 flex-1">{resendMessage}</p>
              </div>
            )}

            {/* Campo Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                <Mail className="inline w-4 h-4 mr-2" />
                Email
              </Label>
              <div className={`relative transition-all duration-200 ${focused.email ? 'scale-[1.02]' : ''}`}>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => handleFocus('email')}
                  onBlur={(e) => handleBlur('email', e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-xl transition-all"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                <Lock className="inline w-4 h-4 mr-2" />
                Senha
              </Label>
              <div className={`relative transition-all duration-200 ${focused.password ? 'scale-[1.02]' : ''}`}>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => handleFocus('password')}
                  onBlur={(e) => handleBlur('password', e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-xl transition-all"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Link Esqueceu a senha */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700 hover:underline transition-colors">
                Esqueceu a senha?
              </Link>
            </div>

            {showResend && (
              <div className="text-center">
                <Button 
                  type="button"
                  variant="link" 
                  onClick={handleResendConfirmation}
                  className="text-sm text-green-600 hover:text-green-700"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Reenviar email de confirmação'}
                </Button>
              </div>
            )}

            {/* Botão de Login */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-500">Ou continue com</span>
              </div>
            </div>

            {/* Botão Google */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="300"
              />
            </div>
          </form>

          {/* Link para registro */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-medium text-green-600 hover:text-green-700 hover:underline transition-colors">
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            © 2026 AgroTech. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Animações CSS */}
      <style jsx>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}