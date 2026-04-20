import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Stethoscope, Calendar, Save, Edit, Camera, Shield, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { veterinarioService } from '@/services/veterinarioService';

export default function PerfilVeterinario() {
  const { user, updateProfile } = useAuth();
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [estatisticas, setEstatisticas] = useState({
    atendimentos: 0,
    tempo_plataforma: '',
    animais_tratados: 0,
    taxa_sucesso: 0
  });
  const [formData, setFormData] = useState({
    nome: '', email: '', telefone: '', crmv: '', especialidade: '', endereco: '', cidade: '', estado: ''
  });

  useEffect(() => {
    if (user) {
      carregarPerfil();
      carregarEstatisticas();
    }
  }, [user]);

  const carregarPerfil = () => {
    setFormData({
      nome: user?.nome || '',
      email: user?.email || '',
      telefone: user?.telefone || '',
      crmv: user?.crmv || '',
      especialidade: user?.especialidade || '',
      endereco: user?.endereco || '',
      cidade: user?.cidade || '',
      estado: user?.estado || ''
    });
  };

  const carregarEstatisticas = async () => {
    setLoadingStats(true);
    try {
      const data = await veterinarioService.getEstatisticasPerfil();
      setEstatisticas({
        atendimentos: data.atendimentos || 0,
        tempo_plataforma: data.tempo_plataforma || '0 anos',
        animais_tratados: data.animais_tratados || 0,
        taxa_sucesso: data.taxa_sucesso || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
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

  const estatisticasCards = [
    { label: 'Atendimentos', valor: estatisticas.atendimentos, icon: Stethoscope },
    { label: 'Tempo na Plataforma', valor: estatisticas.tempo_plataforma, icon: Clock },
    { label: 'Animais Tratados', valor: estatisticas.animais_tratados, icon: CheckCircle },
    { label: 'Taxa de Sucesso', valor: `${estatisticas.taxa_sucesso}%`, icon: TrendingUp }
  ];

  if (loadingStats) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-cyan-500 to-sky-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-2xl animate-pulse"></div>
            <div className="flex-1">
              <div className="h-8 w-48 bg-white/20 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-white/20 rounded mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Perfil */}
      <div className="bg-gradient-to-r from-cyan-500 to-sky-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              <Stethoscope className="w-12 h-12 text-white" />
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg">
              <Camera className="w-4 h-4 text-cyan-600" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Dr(a). {formData.nome || user?.nome || 'Veterinário'}</h2>
            <p className="text-cyan-100 mt-1">Médico Veterinário • CRMV: {formData.crmv || 'Pendente'}</p>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-white/20 text-white border-0"><Shield className="w-3 h-3 mr-1" />Verificado</Badge>
              <Badge className="bg-white/20 text-white border-0"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>
            </div>
          </div>
          {!editando && (
            <Button onClick={() => setEditando(true)} className="bg-white text-cyan-600 hover:bg-gray-100">
              <Edit className="w-4 h-4 mr-2" />Editar Perfil
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {estatisticasCards.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <stat.icon className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
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
            <User className="w-5 h-5 text-cyan-600" />
            Informações Profissionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mensagem.texto && (
            <div className={`mb-4 p-3 rounded-lg ${mensagem.tipo === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {mensagem.texto}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Nome Completo</Label>
                <Input 
                  value={formData.nome} 
                  onChange={(e) => setFormData({...formData, nome: e.target.value})} 
                  disabled={!editando} 
                />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input type="email" value={formData.email} disabled={!editando} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input 
                  value={formData.telefone} 
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})} 
                  disabled={!editando} 
                />
              </div>
              <div>
                <Label>CRMV</Label>
                <Input 
                  value={formData.crmv} 
                  onChange={(e) => setFormData({...formData, crmv: e.target.value})} 
                  disabled={!editando} 
                />
              </div>
              <div className="md:col-span-2">
                <Label>Especialidade</Label>
                <Input 
                  value={formData.especialidade} 
                  onChange={(e) => setFormData({...formData, especialidade: e.target.value})} 
                  disabled={!editando} 
                  placeholder="Ex: Grandes Animais" 
                />
              </div>
            </div>
            {editando && (
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditando(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const TrendingUp = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);