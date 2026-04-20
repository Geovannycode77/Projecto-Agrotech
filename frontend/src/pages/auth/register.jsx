import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Leaf, 
  Mail, 
  Lock, 
  UserPlus, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Briefcase,
  Stethoscope,
  Tractor,
  Sprout
} from 'lucide-react';

export default function Register() {
  const location = useLocation();
  const googleData = location.state?.googleData || null;
  
  const [formData, setFormData] = useState({
    email: googleData?.email || '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({ email: false, password: false, confirmPassword: false });
  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { 
      value: 'produtor', 
      label: 'Produtor', 
      icon: Tractor,
      color: 'green'
    },
    { 
      value: 'veterinario', 
      label: 'Veterinário', 
      icon: Stethoscope,
      color: 'blue'
    },
    { 
      value: 'funcionario', 
      label: 'Funcionário', 
      icon: Users,
      color: 'yellow'
    },
    { 
      value: 'gestor_financeiro', 
      label: 'Gestor Financeiro', 
      icon: Briefcase,
      color: 'purple'
    }
  ];

  useEffect(() => {
    if (googleData) {
      setSuccess('Bem-vindo! Complete seu cadastro.');
    }
  }, [googleData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleRoleChange = (e) => {
    setFormData({ ...formData, role: e.target.value });
    setError('');
  };

  const handleFocus = (field) => {
    setFocused({ ...focused, [field]: true });
  };

  const handleBlur = (field, value) => {
    if (!value) setFocused({ ...focused, [field]: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.role) {
      setError('Selecione um tipo de usuário');
      return;
    }

    if (!googleData && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!googleData && !formData.password) {
      setError('Senha é obrigatória');
      return;
    }

    if (!googleData && formData.password.length < 6) {
      setError('Mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    const result = await register({
      email: formData.email,
      password: formData.password,
      role: formData.role
    });

    if (result.success) {
      if (googleData) {
        navigate(`/complete-profile/${formData.role}`, { 
          state: { 
            email: formData.email,
            role: formData.role,
            isGoogle: true,
            name: googleData.name,
            picture: googleData.picture,
            google_id: googleData.google_id,
            credential: googleData.credential
          } 
        });
      } else {
        navigate(`/complete-profile/${formData.role}`, { 
          state: { 
            email: formData.email,
            password: formData.password,
            role: formData.role,
            isGoogle: false
          } 
        });
      }
    } else {
      setError(result.error || 'Erro ao criar conta');
    }

    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!formData.role) {
      setError('Selecione um tipo de usuário');
      return;
    }
    
    setLoading(true);
    
    try {
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      
      navigate(`/complete-profile/${formData.role}`, { 
        state: { 
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          google_id: decoded.sub,
          credential: credentialResponse.credential,
          role: formData.role,
          isGoogle: true
        } 
      });
    } catch (err) {
      setError('Erro ao processar Google');
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Erro ao fazer login com Google');
  };

  const getRoleColor = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.color : 'gray';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
      <div className="w-full max-w-5xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Lado Esquerdo - Decorativo */}
            <div className="lg:w-2/5 bg-gradient-to-br from-green-600 to-emerald-700 p-8 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-6">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">AgroTech</h2>
                <p className="text-white/80 text-sm">Tecnologia que conecta você ao campo</p>
              </div>
              <div className="mt-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white/80 text-sm">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    <span>Gestão completa da fazenda</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80 text-sm">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    <span>Controle de produção e estoque</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80 text-sm">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    <span>Relatórios financeiros detalhados</span>
                  </div>
                </div>
              </div>
              <p className="text-white/60 text-xs mt-8">© 2024 AgroTech</p>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="lg:w-3/5 p-6 md:p-8">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-gray-900">Criar Conta</h3>
                <p className="text-sm text-gray-500 mt-1">Preencha os dados para começar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mensagens */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-700 flex-1">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-xs text-green-700 flex-1">{success}</p>
                  </div>
                )}

                {/* Seleção de Role - Grid compacto */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Usuário *</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      const isSelected = formData.role === role.value;
                      const color = role.color;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => handleRoleChange({ target: { value: role.value } })}
                          className={`
                            flex flex-col items-center justify-center p-2 rounded-lg border transition-all
                            ${isSelected 
                              ? `border-${color}-500 bg-${color}-50 shadow-sm` 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                          `}
                        >
                          <Icon className={`w-5 h-5 mb-1 ${isSelected ? `text-${color}-600` : 'text-gray-500'}`} />
                          <span className={`text-xs font-medium ${isSelected ? `text-${color}-700` : 'text-gray-600'}`}>
                            {role.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => handleFocus('email')}
                      onBlur={(e) => handleBlur('email', e.target.value)}
                      disabled={!!googleData}
                      className={`pl-9 h-10 text-sm border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-lg ${googleData ? 'bg-gray-50' : ''}`}
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                
                {/* Senhas */}
                {!googleData && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          onFocus={() => handleFocus('password')}
                          onBlur={(e) => handleBlur('password', e.target.value)}
                          className="pl-9 h-10 text-sm border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-lg"
                          required
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1 block">
                        Confirmar
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onFocus={() => handleFocus('confirmPassword')}
                          onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                          className="pl-9 h-10 text-sm border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-lg"
                          required
                        />
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Separador */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-gray-500">ou</span>
                  </div>
                </div>

                {/* Google e Botão */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap={false}
                      theme="outline"
                      size="large"
                      text="signup_with"
                      shape="rectangular"
                      width="100%"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="h-10 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="flex items-center gap-1">
                        Registrar
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </Button>
                </div>

                {/* Link para login */}
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                      Entrar
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}