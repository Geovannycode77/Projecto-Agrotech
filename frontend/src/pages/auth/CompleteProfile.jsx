import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Phone, MapPin, Building2, Syringe, Home } from 'lucide-react';

export default function CompleteProfile() {
  const { role } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { completeProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
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

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
      // Limpa o formulário e mostra mensagem de sucesso
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Perfil criado com sucesso! Verifique seu email para confirmar a conta.' 
          } 
        });
      }, 3000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const renderRoleSpecificFields = () => {
    switch (role) {
      case 'produtor':
        return (
          <div className="space-y-2">
            <Label htmlFor="fazenda_nome">
              <Building2 className="h-4 w-4 inline mr-2" />
              Nome da Fazenda
            </Label>
            <Input
              id="fazenda_nome"
              placeholder="Ex: Fazenda Boa Esperança"
              value={profileData.fazenda_nome}
              onChange={handleChange}
              required
            />
          </div>
        );
      
      case 'veterinario':
        return (
          <div className="space-y-2">
            <Label htmlFor="especialidade">
              <Syringe className="h-4 w-4 inline mr-2" />
              Especialidade
            </Label>
            <Input
              id="especialidade"
              placeholder="Ex: Bovinos, Equinos, Pequenos Animais"
              value={profileData.especialidade}
              onChange={handleChange}
              required
            />
          </div>
        );
      
      case 'funcionario':
        return (
          <div className="space-y-2">
            <Label htmlFor="setor">
              <Home className="h-4 w-4 inline mr-2" />
              Setor de Trabalho
            </Label>
            <Input
              id="setor"
              placeholder="Ex: Campo, Estábulo, Irrigação"
              value={profileData.setor}
              onChange={handleChange}
              required
            />
          </div>
        );
      
      case 'gestor_financeiro':
        return (
          <div className="space-y-2">
            <Label htmlFor="area_atuacao">
              <Building2 className="h-4 w-4 inline mr-2" />
              Área de Atuação
            </Label>
            <Input
              id="area_atuacao"
              placeholder="Ex: Contabilidade, Gestão, Auditoria"
              value={profileData.area_atuacao}
              onChange={handleChange}
              required
            />
          </div>
        );
      
      default:
        return null;
    }
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
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
                <div className="mt-2">
                  <Link to="/login" className="text-sm text-green-600 hover:underline">
                    Ir para página de login
                  </Link>
                </div>
              </Alert>
            )}
            
            {successMessage && (
              <Alert className="bg-green-50 border-green-200">
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
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input
                id="nome_completo"
                placeholder="Digite seu nome completo"
                value={profileData.nome_completo}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">
                <Phone className="h-4 w-4 inline mr-2" />
                Telefone
              </Label>
              <Input
                id="telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={profileData.telefone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_nascimento">
                <CalendarIcon className="h-4 w-4 inline mr-2" />
                Data de Nascimento
              </Label>
              <Input
                id="data_nascimento"
                type="date"
                value={profileData.data_nascimento}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endereco">
                <MapPin className="h-4 w-4 inline mr-2" />
                Endereço
              </Label>
              <Input
                id="endereco"
                placeholder="Cidade, Estado"
                value={profileData.endereco}
                onChange={handleChange}
                required
              />
            </div>
            
            {renderRoleSpecificFields()}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
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