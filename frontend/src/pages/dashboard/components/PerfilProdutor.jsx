import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  Save,
  Edit,
  Camera,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { produtorService } from '@/services/produtorService';

export default function PerfilProdutor() {
  const { user, updateProfile } = useAuth();
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [estatisticas, setEstatisticas] = useState({
    total_animais: 0,
    tempo_plataforma: '',
    producao_total: 0,
    taxa_sucesso: 0
  });
  const [ultimasAtividades, setUltimasAtividades] = useState([]);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    fazenda: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
  });

  useEffect(() => {
    if (user) {
      carregarPerfil();
      carregarEstatisticas();
      carregarAtividades();
    }
  }, [user]);

  const carregarPerfil = () => {
    setFormData({
      nome: user?.nome || '',
      email: user?.email || '',
      telefone: user?.telefone || '',
      fazenda: user?.fazenda || '',
      endereco: user?.endereco || '',
      cidade: user?.cidade || '',
      estado: user?.estado || '',
      cep: user?.cep || ''
    });
  };

  const carregarEstatisticas = async () => {
    setLoadingStats(true);
    try {
      const data = await produtorService.getEstatisticasPerfil();
      setEstatisticas({
        total_animais: data.total_animais || 0,
        tempo_plataforma: data.tempo_plataforma || '0 anos',
        producao_total: data.producao_total || 0,
        taxa_sucesso: data.taxa_sucesso || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const carregarAtividades = async () => {
    try {
      const data = await produtorService.getAtividadesRecentes();
      setUltimasAtividades(data.results || data);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
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
      const result = await updateProfile(formData);
      if (result.success) {
        setMensagem({ tipo: 'success', texto: 'Perfil atualizado com sucesso!' });
        setEditando(false);
        carregarPerfil();
      } else {
        setMensagem({ tipo: 'error', texto: result.error || 'Erro ao atualizar perfil' });
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao atualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'AOA' }).format(valor);
  };

  const estatisticasCards = [
    { label: 'Total de Animais', valor: estatisticas.total_animais, icon: User },
    { label: 'Tempo na Plataforma', valor: estatisticas.tempo_plataforma, icon: Clock },
    { label: 'Produção Total', valor: formatarMoeda(estatisticas.producao_total), icon: CheckCircle },
    { label: 'Taxa de Sucesso', valor: `${estatisticas.taxa_sucesso}%`, icon: TrendingUp },
  ];

  if (loadingStats) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-2xl animate-pulse"></div>
            <div className="flex-1">
              <div className="h-8 w-48 bg-white/20 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-white/20 rounded mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Perfil */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <User className="w-12 h-12 text-white" />
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg">
              <Camera className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{formData.nome || user?.nome || 'Produtor'}</h2>
            <p className="text-emerald-100 mt-1">Produtor Rural</p>
            <div className="flex gap-2 mt-2">
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

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {estatisticasCards.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <stat.icon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stat.valor}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
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
              mensagem.tipo === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {mensagem.texto}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
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
                  onChange={handleChange}
                  disabled={!editando}
                  className={!editando ? 'bg-gray-50' : ''}
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  disabled={!editando}
                  placeholder="(000) 000-000-000"
                  className={!editando ? 'bg-gray-50' : ''}
                />
              </div>
              <div>
                <Label htmlFor="fazenda">Nome da Fazenda</Label>
                <Input
                  id="fazenda"
                  value={formData.fazenda}
                  onChange={handleChange}
                  disabled={!editando}
                  className={!editando ? 'bg-gray-50' : ''}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  disabled={!editando}
                  className={!editando ? 'bg-gray-50' : ''}
                />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  disabled={!editando}
                  className={!editando ? 'bg-gray-50' : ''}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  disabled={!editando}
                  className={!editando ? 'bg-gray-50' : ''}
                />
              </div>
              <div>
                <Label htmlFor="cep">NIF</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  disabled={!editando}
                  className={!editando ? 'bg-gray-50' : ''}
                />
              </div>
            </div>

            {editando && (
              <div className="flex gap-3 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditando(false);
                    setMensagem({ tipo: '', texto: '' });
                    carregarPerfil();
                  }}
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

      {/* Atividade Recente */}
      {ultimasAtividades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Últimas Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ultimasAtividades.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-emerald-100 rounded-full">
                    {item.tipo === 'perfil' && <User className="w-4 h-4 text-emerald-600" />}
                    {item.tipo === 'animal' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                    {item.tipo === 'saude' && <Shield className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.descricao}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente auxiliar para TrendingUp
const TrendingUp = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);