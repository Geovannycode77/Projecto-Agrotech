import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building, 
  Save,
  Edit,
  Camera,
  Shield,
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function PerfilProdutor() {
  const { user, perfil, updateProfile, refreshProfile } = useAuth();
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [carregando, setCarregando] = useState(true);
  
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    fazenda_nome: '',
    endereco: '',
    data_nascimento: ''
  });

  useEffect(() => {
    if (user || perfil) {
      carregarPerfil();
    }
  }, [user, perfil]);

  const carregarPerfil = () => {
    setCarregando(true);
    try {
      setFormData({
        nome_completo: perfil?.nome_completo || user?.nome || user?.email?.split('@')[0] || '',
        email: user?.email || '',
        telefone: perfil?.telefone || '',
        fazenda_nome: perfil?.fazenda_nome || '',
        endereco: perfil?.endereco || '',
        data_nascimento: perfil?.data_nascimento || ''
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setCarregando(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ tipo: '', texto: '' });
    
    try {
      const dadosPerfil = {
        nome_completo: formData.nome_completo,
        telefone: formData.telefone,
        endereco: formData.endereco,
        fazenda_nome: formData.fazenda_nome,
        data_nascimento: formData.data_nascimento || null
      };
      
      const result = await updateProfile(dadosPerfil);
      
      if (result.success) {
        setMensagem({ tipo: 'success', texto: 'Perfil atualizado com sucesso!' });
        setEditando(false);
        
        if (refreshProfile) {
          await refreshProfile();
        }
        
        carregarPerfil();
        
        setTimeout(() => {
          setMensagem({ tipo: '', texto: '' });
        }, 3000);
      } else {
        setMensagem({ tipo: 'error', texto: result.error || 'Erro ao atualizar perfil' });
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setMensagem({ tipo: 'error', texto: 'Erro ao atualizar perfil. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setEditando(false);
    setMensagem({ tipo: '', texto: '' });
    carregarPerfil();
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Perfil */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <User className="w-12 h-12 text-white" />
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg">
              <Camera className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">{formData.nome_completo || 'Produtor'}</h2>
            <p className="text-emerald-100 mt-1">Produtor Rural</p>
            {formData.fazenda_nome && (
              <p className="text-emerald-100 text-sm mt-1">
                <Building className="w-4 h-4 inline mr-1" />
                {formData.fazenda_nome}
              </p>
            )}
            <div className="flex gap-2 mt-2 justify-center md:justify-start">
              <Badge className="bg-white/20 text-white border-0">
                <Shield className="w-3 h-3 mr-1" />
                Verificado
              </Badge>
              <Badge className="bg-white/20 text-white border-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ativo
              </Badge>
            </div>
          </div>
          {!editando && (
            <Button 
              onClick={() => setEditando(true)}
              className="bg-white text-emerald-600 hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      {/* Formulário do Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mensagem.texto && (
            <div className={`mb-4 p-3 rounded-lg ${
              mensagem.tipo === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {mensagem.texto}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nome_completo">Nome Completo</Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={handleChange}
                  disabled={!editando}
                  className={!editando ? 'bg-gray-50' : ''}
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado</p>
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  disabled={!editando}
                  placeholder="+244 000 000 000"
                  className={!editando ? 'bg-gray-50' : ''}
                />
              </div>
              <div>
                <Label htmlFor="fazenda_nome">Nome da Fazenda</Label>
                <Input
                  id="fazenda_nome"
                  value={formData.fazenda_nome}
                  onChange={handleChange}
                  disabled={!editando}
                  className={!editando ? 'bg-gray-50' : ''}
                />
              </div>
              <div>
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={handleChange}
                  disabled={!editando}
                  className={!editando ? 'bg-gray-50' : ''}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  disabled={!editando}
                  placeholder="Cidade, Bairro, Rua"
                  className={!editando ? 'bg-gray-50' : ''}
                />
              </div>
            </div>

            {editando && (
              <div className="flex gap-3 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelar}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}