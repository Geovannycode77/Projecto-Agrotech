import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Phone, MapPin, Building2, Syringe, Home, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function CompleteProfile() {
  const { role } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { completeProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [touched, setTouched] = useState({});
  
  const userData = location.state || {};
  const isGoogle = userData.isGoogle || false;

  const [profileData, setProfileData] = useState({
    nome_completo: userData.name || '',
    telefone: '',
    data_nascimento: '',
    endereco: '',
    fazenda_nome: '',
    especialidade: '',
    setor: '',
    area_atuacao: ''
  });

  useEffect(() => {
    if (!userData.role && !role) {
      navigate('/register');
    }
  }, [userData.role, role, navigate]);

  // Validação de telefone (apenas números, formato angolano)
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{9}$/;
    if (!phone) return 'Telefone é obrigatório';
    if (!phoneRegex.test(phone)) return 'Telefone deve ter 9 dígitos (ex: 912345678)';
    return '';
  };

  // Validação de data de nascimento
  const validateDate = (date) => {
    if (!date) return 'Data de nascimento é obrigatória';
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    
    if (selectedDate > today) return 'A data de nascimento não pode ser futura';
    if (selectedDate < minDate) return 'Data de nascimento inválida';
    return '';
  };

  // Validação de nome completo
  const validateName = (name) => {
    if (!name) return 'Nome completo é obrigatório';
    if (name.trim().length < 3) return 'Nome deve ter pelo menos 3 caracteres';
    return '';
  };

  // Validação de endereço
  const validateAddress = (address) => {
    if (!address) return 'Endereço é obrigatório';
    if (address.trim().length < 5) return 'Endereço deve ter pelo menos 5 caracteres';
    return '';
  };

  // Validação de campo específico por role
  const validateRoleField = () => {
    switch (role) {
      case 'produtor':
        if (!profileData.fazenda_nome) return 'Nome da fazenda é obrigatório';
        if (profileData.fazenda_nome.trim().length < 3) return 'Nome da fazenda deve ter pelo menos 3 caracteres';
        break;
      case 'veterinario':
        if (!profileData.especialidade) return 'Especialidade é obrigatória';
        if (profileData.especialidade.trim().length < 3) return 'Especialidade deve ter pelo menos 3 caracteres';
        break;
      case 'funcionario':
        if (!profileData.setor) return 'Setor de trabalho é obrigatório';
        break;
      case 'gestor_financeiro':
        if (!profileData.area_atuacao) return 'Área de atuação é obrigatória';
        break;
      default:
        return '';
    }
    return '';
  };

  // Formatação do telefone enquanto digita
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 9) value = value.slice(0, 9);
    setProfileData({ ...profileData, telefone: value });
    
    if (touched.telefone) {
      const error = validatePhone(value);
      setErrors({ ...errors, telefone: error });
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setProfileData({ ...profileData, [id]: value });
    
    if (touched[id]) {
      let error = '';
      switch (id) {
        case 'nome_completo':
          error = validateName(value);
          break;
        case 'telefone':
          error = validatePhone(value);
          break;
        case 'data_nascimento':
          error = validateDate(value);
          break;
        case 'endereco':
          error = validateAddress(value);
          break;
        default:
          break;
      }
      setErrors({ ...errors, [id]: error });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    
    let error = '';
    switch (field) {
      case 'nome_completo':
        error = validateName(profileData.nome_completo);
        break;
      case 'telefone':
        error = validatePhone(profileData.telefone);
        break;
      case 'data_nascimento':
        error = validateDate(profileData.data_nascimento);
        break;
      case 'endereco':
        error = validateAddress(profileData.endereco);
        break;
      default:
        break;
    }
    setErrors({ ...errors, [field]: error });
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.nome_completo = validateName(profileData.nome_completo);
    newErrors.telefone = validatePhone(profileData.telefone);
    newErrors.data_nascimento = validateDate(profileData.data_nascimento);
    newErrors.endereco = validateAddress(profileData.endereco);
    
    const roleFieldError = validateRoleField();
    if (roleFieldError) {
      if (role === 'produtor') newErrors.fazenda_nome = roleFieldError;
      if (role === 'veterinario') newErrors.especialidade = roleFieldError;
      if (role === 'funcionario') newErrors.setor = roleFieldError;
      if (role === 'gestor_financeiro') newErrors.area_atuacao = roleFieldError;
    }
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setErrors('');
    setSuccessMessage('');
    setLoading(true);

    const submitData = {
      email: userData.email,
      role: role,
      password: userData.password,
      isGoogle: isGoogle,
      credential: userData.credential,
      google_id: userData.google_id,
      picture: userData.picture,
      name: userData.name,
      profile: {
        nome_completo: profileData.nome_completo,
        telefone: profileData.telefone,
        data_nascimento: profileData.data_nascimento,
        endereco: profileData.endereco,
        fazenda_nome: profileData.fazenda_nome,
        especialidade: profileData.especialidade,
        setor: profileData.setor,
        area_atuacao: profileData.area_atuacao
      }
    };

    const result = await completeProfile(submitData);

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Perfil criado com sucesso! Verifique seu email para confirmar a conta.' 
          } 
        });
      }, 3000);
    } else {
      setErrors({ general: result.error });
    }

    setLoading(false);
  };

  const getRoleTitle = () => {
    const titles = {
      produtor: 'Produtor Rural',
      veterinario: 'Veterinário',
      funcionario: 'Funcionário',
      gestor_financeiro: 'Gestor Financeiro'
    };
    return titles[role] || 'Usuário';
  };

  const getFieldError = (field) => {
    return touched[field] && errors[field] ? errors[field] : '';
  };

  const renderRoleSpecificFields = () => {
    switch (role) {
      case 'produtor':
        return (
          <div className="space-y-2">
            <Label htmlFor="fazenda_nome">
              <Building2 className="h-4 w-4 inline mr-2" />
              Nome da Fazenda *
            </Label>
            <Input
              id="fazenda_nome"
              placeholder="Ex: Fazenda Boa Esperança"
              value={profileData.fazenda_nome}
              onChange={handleChange}
              onBlur={() => {
                setTouched({ ...touched, fazenda_nome: true });
                if (!profileData.fazenda_nome) {
                  setErrors({ ...errors, fazenda_nome: 'Nome da fazenda é obrigatório' });
                }
              }}
              className={errors.fazenda_nome ? 'border-red-500' : ''}
              required
            />
            {getFieldError('fazenda_nome') && (
              <p className="text-xs text-red-500">{getFieldError('fazenda_nome')}</p>
            )}
          </div>
        );
      
      case 'veterinario':
        return (
          <div className="space-y-2">
            <Label htmlFor="especialidade">
              <Syringe className="h-4 w-4 inline mr-2" />
              Especialidade *
            </Label>
            <Input
              id="especialidade"
              placeholder="Ex: Bovinos, Equinos, Pequenos Animais"
              value={profileData.especialidade}
              onChange={handleChange}
              onBlur={() => {
                setTouched({ ...touched, especialidade: true });
                if (!profileData.especialidade) {
                  setErrors({ ...errors, especialidade: 'Especialidade é obrigatória' });
                }
              }}
              className={errors.especialidade ? 'border-red-500' : ''}
              required
            />
            {getFieldError('especialidade') && (
              <p className="text-xs text-red-500">{getFieldError('especialidade')}</p>
            )}
          </div>
        );
      
      case 'funcionario':
        return (
          <div className="space-y-2">
            <Label htmlFor="setor">
              <Home className="h-4 w-4 inline mr-2" />
              Setor de Trabalho *
            </Label>
            <Input
              id="setor"
              placeholder="Ex: Campo, Estábulo, Irrigação"
              value={profileData.setor}
              onChange={handleChange}
              onBlur={() => {
                setTouched({ ...touched, setor: true });
                if (!profileData.setor) {
                  setErrors({ ...errors, setor: 'Setor de trabalho é obrigatório' });
                }
              }}
              className={errors.setor ? 'border-red-500' : ''}
              required
            />
            {getFieldError('setor') && (
              <p className="text-xs text-red-500">{getFieldError('setor')}</p>
            )}
          </div>
        );
      
      case 'gestor_financeiro':
        return (
          <div className="space-y-2">
            <Label htmlFor="area_atuacao">
              <Building2 className="h-4 w-4 inline mr-2" />
              Área de Atuação *
            </Label>
            <Input
              id="area_atuacao"
              placeholder="Ex: Contabilidade, Gestão, Auditoria"
              value={profileData.area_atuacao}
              onChange={handleChange}
              onBlur={() => {
                setTouched({ ...touched, area_atuacao: true });
                if (!profileData.area_atuacao) {
                  setErrors({ ...errors, area_atuacao: 'Área de atuação é obrigatória' });
                }
              }}
              className={errors.area_atuacao ? 'border-red-500' : ''}
              required
            />
            {getFieldError('area_atuacao') && (
              <p className="text-xs text-red-500">{getFieldError('area_atuacao')}</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Complete seu Perfil
          </CardTitle>
          <CardDescription className="text-center">
            Preencha seus dados para concluir o cadastro como {getRoleTitle()}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
                <div className="mt-2">
                  <Link to="/login" className="text-sm text-green-600 hover:underline">
                    Ir para página de login
                  </Link>
                </div>
              </Alert>
            )}
            
            {successMessage && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                  <div className="mt-2">
                    <Link to="/login" className="text-sm text-green-600 hover:underline font-medium">
                      Clique aqui para fazer login
                    </Link>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {isGoogle && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-600 text-center">
                  📧 Registrando com Google: {userData.email}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userData.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nome_completo">Nome Completo *</Label>
              <Input
                id="nome_completo"
                placeholder="Digite seu nome completo"
                value={profileData.nome_completo}
                onChange={handleChange}
                onBlur={() => handleBlur('nome_completo')}
                className={errors.nome_completo ? 'border-red-500' : ''}
                required
              />
              {getFieldError('nome_completo') && (
                <p className="text-xs text-red-500">{getFieldError('nome_completo')}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">
                <Phone className="h-4 w-4 inline mr-2" />
                Telefone * (+244)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">+244</span>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="912345678"
                  value={profileData.telefone}
                  onChange={handlePhoneChange}
                  onBlur={() => handleBlur('telefone')}
                  className={`pl-16 ${errors.telefone ? 'border-red-500' : ''}`}
                  maxLength={9}
                  required
                />
              </div>
              <p className="text-xs text-gray-400">Digite apenas os 9 dígitos (ex: 912345678)</p>
              {getFieldError('telefone') && (
                <p className="text-xs text-red-500">{getFieldError('telefone')}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_nascimento">
                <CalendarIcon className="h-4 w-4 inline mr-2" />
                Data de Nascimento *
              </Label>
              <Input
                id="data_nascimento"
                type="date"
                value={profileData.data_nascimento}
                onChange={handleChange}
                onBlur={() => handleBlur('data_nascimento')}
                className={errors.data_nascimento ? 'border-red-500' : ''}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              {getFieldError('data_nascimento') && (
                <p className="text-xs text-red-500">{getFieldError('data_nascimento')}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endereco">
                <MapPin className="h-4 w-4 inline mr-2" />
                Endereço *
              </Label>
              <Input
                id="endereco"
                placeholder="Cidade, Estado"
                value={profileData.endereco}
                onChange={handleChange}
                onBlur={() => handleBlur('endereco')}
                className={errors.endereco ? 'border-red-500' : ''}
                required
              />
              {getFieldError('endereco') && (
                <p className="text-xs text-red-500">{getFieldError('endereco')}</p>
              )}
            </div>
            
            {renderRoleSpecificFields()}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {loading ? 'Finalizando...' : 'Finalizar Cadastro'}
            </Button>
            
            <div className="text-sm text-center">
              <p>
                Já tem uma conta?{' '}
                <Link to="/login" className="text-green-600 hover:underline">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}