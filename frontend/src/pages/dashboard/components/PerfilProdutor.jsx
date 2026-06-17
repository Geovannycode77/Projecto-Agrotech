import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  User, Building, Save, Edit, Camera,
  Shield, CheckCircle, Loader2, X,
  Trash2, AlertTriangle, FileX
} from 'lucide-react';
import { authService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

// ─── Modal de confirmação de exclusão ─────────────────────────────────────────
function DeleteAccountModal({ isOpen, onClose, onDeleteAccount, loading }) {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const canConfirm = confirmText === 'EXCLUIR CONTA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Excluir conta</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Aviso sobre dados de trabalho */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Os seus dados de trabalho não serão removidos</p>
              <p className="text-xs text-amber-700 mt-1">
                Relatórios, registos e histórico de atividades pertencem à fazenda e só o administrador pode removê-los.
              </p>
            </div>
          </div>

          {/* Aviso sobre a conta */}
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-sm font-medium text-gray-800">
              🚨 O seu acesso, dados pessoais e credenciais de login serão removidos permanentemente. Esta ação é irreversível.
            </p>
          </div>

          <div>
            <Label className="text-sm text-gray-600">
              Para confirmar, digite <span className="font-mono font-bold text-gray-900">EXCLUIR CONTA</span>
            </Label>
            <Input
              className="mt-2 font-mono"
              placeholder="EXCLUIR CONTA"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button
              onClick={onDeleteAccount}
              disabled={!canConfirm || loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PerfilProdutor() {
  const { user, perfil, updateProfile, refreshProfile } = useAuth();
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Foto de perfil
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    fazenda_nome: '',
    endereco: '',
    data_nascimento: ''
  });

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    setCarregando(true);
    try {
      const data = await authService.getProfile();
      setFormData({
        nome_completo:   data.nome_completo   || perfil?.nome_completo   || '',
        email:           data.email           || user?.email             || '',
        telefone:        data.telefone        || perfil?.telefone        || '',
        fazenda_nome:    data.fazenda_nome    || perfil?.fazenda_nome    || '',
        endereco:        data.endereco        || perfil?.endereco        || '',
        data_nascimento: data.data_nascimento || perfil?.data_nascimento || '',
      });
      // Carregar foto se existir
      if (data.foto_url || data.picture) {
        setFotoPreview(data.foto_url || data.picture);
      }
    } catch (error) {
      setFormData({
        nome_completo:   perfil?.nome_completo   || '',
        email:           user?.email             || '',
        telefone:        perfil?.telefone        || '',
        fazenda_nome:    perfil?.fazenda_nome    || '',
        endereco:        perfil?.endereco        || '',
        data_nascimento: perfil?.data_nascimento || '',
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleFotoClick = () => {
    if (editando) fileInputRef.current?.click();
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Erro', description: 'A imagem deve ter no máximo 5MB.', variant: 'destructive' });
      return;
    }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const payload = {
        nome_completo:   formData.nome_completo,
        telefone:        formData.telefone,
        endereco:        formData.endereco,
        fazenda_nome:    formData.fazenda_nome,
        data_nascimento: formData.data_nascimento || null,
      };

      // Se houver nova foto, enviar como FormData
      if (fotoFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => v && fd.append(k, v));
        fd.append('foto', fotoFile);
        await authService.updateProfileWithPhoto(fd);
      } else {
        await updateProfile(payload);
      }

      if (refreshProfile) await refreshProfile();
      setEditando(false);
      setFotoFile(null);
      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!' });
      await carregarPerfil();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar alterações.', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelar = () => {
    setEditando(false);
    setFotoFile(null);
    // Reverter preview se não foi salvo
    carregarPerfil();
  };

 

  const handleDeleteAccount = async () => {
    setDeletingLoading(true);
    try {
      await authService.deleteAccount(); // implemente este endpoint no seu backend
      toast({ title: 'Conta excluída', description: 'Sua conta foi removida.' });
      setDeleteModalOpen(false);
      // Redirecionar para login ou página inicial
      window.location.href = '/';
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir conta.', variant: 'destructive' });
    } finally {
      setDeletingLoading(false);
    }
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
      {/* Modal exclusão */}
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDeleteAccount={handleDeleteAccount}
        loading={deletingLoading}
      />

      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">

          {/* Foto de perfil */}
          <div className="relative">
            <div
              onClick={handleFotoClick}
              className={`w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm overflow-hidden ${editando ? 'cursor-pointer hover:bg-white/30 transition-colors' : ''}`}
            >
              {fotoPreview ? (
                <img src={fotoPreview} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <button
              type="button"
              onClick={handleFotoClick}
              disabled={!editando}
              className={`absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg transition-opacity ${editando ? 'opacity-100 hover:bg-gray-100' : 'opacity-50 cursor-default'}`}
            >
              <Camera className="w-4 h-4 text-emerald-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFotoChange}
            />
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
                <Shield className="w-3 h-3 mr-1" /> Verificado
              </Badge>
              <Badge className="bg-white/20 text-white border-0">
                <CheckCircle className="w-3 h-3 mr-1" /> Ativo
              </Badge>
            </div>
          </div>

          {!editando && (
            <Button onClick={() => setEditando(true)} className="bg-white text-emerald-600 hover:bg-gray-100">
              <Edit className="w-4 h-4 mr-2" /> Editar Perfil
            </Button>
          )}
        </div>

        {/* Dica de foto quando editando */}
        {editando && (
          <p className="text-center text-emerald-100 text-xs mt-4">
            📷 Clique na foto para alterar a imagem (máx. 5MB)
          </p>
        )}
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Informações Pessoais
          </CardTitle>
          {editando && (
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancelar}>
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSalvar}
                disabled={salvando}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {salvando ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={handleChange}
                disabled={!editando}
                className={!editando ? 'bg-gray-50' : ''}
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={formData.email} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado</p>
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={handleChange}
                disabled={!editando}
                placeholder="+244 912 345 678"
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
                placeholder="Nome da sua fazenda"
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
        </CardContent>
      </Card>

      {/* Zona de perigo */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <div>
                <p className="font-semibold text-gray-900">Excluir a minha conta</p>
                <p className="text-sm text-gray-500 mt-1">
                  Remove o seu acesso e dados pessoais. Os dados de trabalho (relatórios, registos) são mantidos e só o administrador os pode remover.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setDeleteModalOpen(true)}
                className="border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Excluir conta
              </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}