import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  User, Mail, Phone, Calendar, Briefcase,
  Building, Save, Edit, X, Loader2, CheckCircle, Camera
} from 'lucide-react';
import { authService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export default function PerfilFuncionario() {
  const { user, perfil, updateProfile, refreshProfile } = useAuth();
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    endereco: '',
  });

  // Info somente leitura vindas do model Funcionario
  const [infoFazenda, setInfoFazenda] = useState({
    fazenda_nome: '',
    cargo: '',
    turno: '',
    data_contratacao: '',
  });

  useEffect(() => {
    carregarPerfil();
  }, [user, perfil]);

  const carregarPerfil = async () => {
    setLoading(true);
    try {
      const data = await authService.getProfile();

      setFormData({
        nome_completo:   data.nome_completo || user?.nome_completo || user?.email?.split('@')[0] || '',
        email:           data.email         || user?.email || '',
        telefone:        data.telefone      || '',
        data_nascimento: data.data_nascimento || '',
        endereco:        data.endereco      || '',
      });

      setInfoFazenda({
        fazenda_nome:     data.fazenda_nome     || '',
        cargo:            data.cargo            || '',
        turno:            data.turno            || '',
        data_contratacao: data.data_contratacao || '',
      });

    } catch (error) {
      // fallback para dados do contexto
      setFormData({
        nome_completo:   perfil?.nome_completo || user?.email?.split('@')[0] || '',
        email:           user?.email || '',
        telefone:        perfil?.telefone || '',
        data_nascimento: perfil?.data_nascimento || '',
        endereco:        perfil?.endereco || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const result = await updateProfile({
        nome_completo:   formData.nome_completo,
        telefone:        formData.telefone,
        endereco:        formData.endereco,
        data_nascimento: formData.data_nascimento || null,
      });

      if (result?.success !== false) {
        if (refreshProfile) await refreshProfile();
        setEditando(false);
        toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!' });
        await carregarPerfil();
      } else {
        toast({ title: 'Erro', description: result.error || 'Erro ao salvar.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar alterações.', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };

  const turnoLabel = {
    manha:    'Manhã (06h–14h)',
    tarde:    'Tarde (14h–22h)',
    noite:    'Noite (22h–06h)',
    integral: 'Integral',
  };

  const cargoLabel = {
    tratador:              'Tratador de Animais',
    veterinario_assistente:'Assistente Veterinário',
    alimentador:           'Alimentador',
    gerente_pecuario:      'Gerente de Pecuária',
    auxiliar_geral:        'Auxiliar Geral',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <User className="w-12 h-12 text-white" />
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg">
              <Camera className="w-4 h-4 text-purple-600" />
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">{formData.nome_completo || 'Funcionário'}</h2>
            <p className="text-purple-100 mt-1">
              {cargoLabel[infoFazenda.cargo] || 'Funcionário'}
            </p>
            {infoFazenda.fazenda_nome && (
              <p className="text-purple-100 text-sm mt-1">
                <Building className="w-4 h-4 inline mr-1" />
                {infoFazenda.fazenda_nome}
              </p>
            )}
            <div className="flex gap-2 mt-2 justify-center md:justify-start flex-wrap">
              <Badge className="bg-white/20 text-white border-0">
                <CheckCircle className="w-3 h-3 mr-1" /> Ativo
              </Badge>
              {infoFazenda.turno && (
                <Badge className="bg-white/20 text-white border-0">
                  {turnoLabel[infoFazenda.turno] || infoFazenda.turno}
                </Badge>
              )}
            </div>
          </div>
          {!editando && (
            <Button onClick={() => setEditando(true)} className="bg-white text-purple-600 hover:bg-gray-100">
              <Edit className="w-4 h-4 mr-2" /> Editar Perfil
            </Button>
          )}
        </div>
      </div>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Informações Pessoais
          </CardTitle>
          {editando && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setEditando(false); carregarPerfil(); }}>
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button onClick={handleSalvar} className="bg-purple-600 hover:bg-purple-700" disabled={salvando}>
                {salvando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input id="nome_completo" value={formData.nome_completo} onChange={handleChange}
                disabled={!editando} className={!editando ? 'bg-gray-50' : ''} />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={formData.email} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado</p>
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={formData.telefone} onChange={handleChange}
                disabled={!editando} placeholder="+244 000 000 000"
                className={!editando ? 'bg-gray-50' : ''} />
            </div>
            <div>
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input id="data_nascimento" type="date" value={formData.data_nascimento}
                onChange={handleChange} disabled={!editando}
                className={!editando ? 'bg-gray-50' : ''}
                max={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" value={formData.endereco} onChange={handleChange}
                disabled={!editando} placeholder="Cidade, Bairro, Rua"
                className={!editando ? 'bg-gray-50' : ''} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados da Fazenda — somente leitura */}
      {(infoFazenda.fazenda_nome || infoFazenda.cargo) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Dados Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {infoFazenda.fazenda_nome && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Fazenda</p>
                    <p className="font-medium">{infoFazenda.fazenda_nome}</p>
                  </div>
                </div>
              )}
              {infoFazenda.cargo && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Briefcase className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Cargo</p>
                    <p className="font-medium">{cargoLabel[infoFazenda.cargo] || infoFazenda.cargo}</p>
                  </div>
                </div>
              )}
              {infoFazenda.turno && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Turno</p>
                    <p className="font-medium">{turnoLabel[infoFazenda.turno] || infoFazenda.turno}</p>
                  </div>
                </div>
              )}
              {infoFazenda.data_contratacao && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">Data de Contratação</p>
                    <p className="font-medium">
                      {new Date(infoFazenda.data_contratacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              * Dados profissionais só podem ser alterados pelo administrador.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}