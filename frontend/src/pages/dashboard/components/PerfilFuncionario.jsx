import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  User, Mail, Phone, Calendar, Briefcase,
  Building, Save, Edit, X, Loader2, CheckCircle, Camera,
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
export default function PerfilFuncionario() {
  const { user, perfil, updateProfile, refreshProfile } = useAuth();
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ nome_completo: '', email: '', telefone: '', data_nascimento: '', endereco: '' });
  const [infoFazenda, setInfoFazenda] = useState({ fazenda_nome: '', cargo: '', turno: '', data_contratacao: '' });

  useEffect(() => { carregarPerfil(); }, []);

  const carregarPerfil = async () => {
    setCarregando(true);
    try {
      const data = await authService.getProfile();
      setFormData({ nome_completo: data.nome_completo || perfil?.nome_completo || '', email: data.email || user?.email || '', telefone: data.telefone || perfil?.telefone || '', data_nascimento: data.data_nascimento || perfil?.data_nascimento || '', endereco: data.endereco || perfil?.endereco || '' });
      setInfoFazenda({ fazenda_nome: data.fazenda_nome || '', cargo: data.cargo || '', turno: data.turno || '', data_contratacao: data.data_contratacao || '' });
      if (data.foto_url || data.picture) setFotoPreview(data.foto_url || data.picture);
    } catch (error) {
      setFormData({ nome_completo: perfil?.nome_completo || '', email: user?.email || '', telefone: perfil?.telefone || '', data_nascimento: perfil?.data_nascimento || '', endereco: perfil?.endereco || '' });
    } finally {
      setCarregando(false);
    }
  };

  const handleFotoClick = () => { if (editando) fileInputRef.current?.click(); };
  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'Erro', description: 'A imagem deve ter no máximo 5MB.', variant: 'destructive' }); return; }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };
  const handleChange = (e) => { setFormData({ ...formData, [e.target.id]: e.target.value }); };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const payload = { nome_completo: formData.nome_completo, telefone: formData.telefone, endereco: formData.endereco, data_nascimento: formData.data_nascimento || null };
      if (fotoFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => v && fd.append(k, v));
        fd.append('foto', fotoFile);
        await authService.updateProfileWithPhoto(fd);
      } else {
        const result = await updateProfile(payload);
        if (result?.success === false) { toast({ title: 'Erro', description: result.error || 'Erro ao salvar.', variant: 'destructive' }); return; }
      }
      if (refreshProfile) await refreshProfile();
      setEditando(false); setFotoFile(null);
      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!' });
      await carregarPerfil();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar alterações.', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };



  const handleDeleteAccount = async () => {
    setDeletingLoading(true);
    try {
      await authService.deleteAccount();
      toast({ title: 'Conta excluída', description: 'Sua conta foi removida.' });
      setDeleteModalOpen(false);
      window.location.href = '/';
    } catch { toast({ title: 'Erro', description: 'Erro ao excluir conta.', variant: 'destructive' }); }
    finally { setDeletingLoading(false); }
  };

  const turnoLabel = { manha: 'Manhã (06h–14h)', tarde: 'Tarde (14h–22h)', noite: 'Noite (22h–06h)', integral: 'Integral' };
  const cargoLabel = { tratador: 'Tratador de Animais', veterinario_assistente: 'Assistente Veterinário', alimentador: 'Alimentador', gerente_pecuario: 'Gerente de Pecuária', auxiliar_geral: 'Auxiliar Geral' };

  if (carregando) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <DeleteAccountModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}  onDeleteAccount={handleDeleteAccount} loading={deletingLoading} />

      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div onClick={handleFotoClick} className={`w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm overflow-hidden ${editando ? 'cursor-pointer hover:bg-white/30 transition-colors' : ''}`}>
              {fotoPreview ? <img src={fotoPreview} alt="Foto de perfil" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-white" />}
            </div>
            <button type="button" onClick={handleFotoClick} disabled={!editando} className={`absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg transition-opacity ${editando ? 'opacity-100 hover:bg-gray-100' : 'opacity-50 cursor-default'}`}>
              <Camera className="w-4 h-4 text-purple-600" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">{formData.nome_completo || 'Funcionário'}</h2>
            <p className="text-purple-100 mt-1">{cargoLabel[infoFazenda.cargo] || 'Funcionário'}</p>
            {infoFazenda.fazenda_nome && <p className="text-purple-100 text-sm mt-1"><Building className="w-4 h-4 inline mr-1" />{infoFazenda.fazenda_nome}</p>}
            <div className="flex gap-2 mt-2 justify-center md:justify-start flex-wrap">
              <Badge className="bg-white/20 text-white border-0"><CheckCircle className="w-3 h-3 mr-1" /> Ativo</Badge>
              {infoFazenda.turno && <Badge className="bg-white/20 text-white border-0">{turnoLabel[infoFazenda.turno] || infoFazenda.turno}</Badge>}
            </div>
          </div>
          {!editando && (
            <Button onClick={() => setEditando(true)} className="bg-white text-purple-600 hover:bg-gray-100">
              <Edit className="w-4 h-4 mr-2" /> Editar Perfil
            </Button>
          )}
        </div>
        {editando && <p className="text-center text-purple-100 text-xs mt-4">📷 Clique na foto para alterar a imagem (máx. 5MB)</p>}
      </div>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-purple-600" />Informações Pessoais</CardTitle>
          {editando && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setEditando(false); setFotoFile(null); carregarPerfil(); }}><X className="h-4 w-4 mr-2" /> Cancelar</Button>
              <Button onClick={handleSalvar} className="bg-purple-600 hover:bg-purple-700" disabled={salvando}>
                {salvando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Salvar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><Label htmlFor="nome_completo">Nome Completo</Label><Input id="nome_completo" value={formData.nome_completo} onChange={handleChange} disabled={!editando} placeholder="Seu nome completo" className={!editando ? 'bg-gray-50' : ''} /></div>
            <div><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={formData.email} disabled className="bg-gray-50" /><p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado</p></div>
            <div><Label htmlFor="telefone">Telefone</Label><Input id="telefone" value={formData.telefone} onChange={handleChange} disabled={!editando} placeholder="+244 912 345 678" className={!editando ? 'bg-gray-50' : ''} /></div>
            <div><Label htmlFor="data_nascimento">Data de Nascimento</Label><Input id="data_nascimento" type="date" value={formData.data_nascimento} onChange={handleChange} disabled={!editando} className={!editando ? 'bg-gray-50' : ''} max={new Date().toISOString().split('T')[0]} /></div>
            <div className="md:col-span-2"><Label htmlFor="endereco">Endereço</Label><Input id="endereco" value={formData.endereco} onChange={handleChange} disabled={!editando} placeholder="Cidade, Bairro, Rua" className={!editando ? 'bg-gray-50' : ''} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Profissionais — somente leitura */}
      {(infoFazenda.fazenda_nome || infoFazenda.cargo) && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-purple-600" />Dados Profissionais</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {infoFazenda.fazenda_nome && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><Building className="h-5 w-5 text-purple-500" /><div><p className="text-xs text-gray-500">Fazenda</p><p className="font-medium">{infoFazenda.fazenda_nome}</p></div></div>}
              {infoFazenda.cargo && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><Briefcase className="h-5 w-5 text-purple-500" /><div><p className="text-xs text-gray-500">Cargo</p><p className="font-medium">{cargoLabel[infoFazenda.cargo] || infoFazenda.cargo}</p></div></div>}
              {infoFazenda.turno && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><Calendar className="h-5 w-5 text-purple-500" /><div><p className="text-xs text-gray-500">Turno</p><p className="font-medium">{turnoLabel[infoFazenda.turno] || infoFazenda.turno}</p></div></div>}
              {infoFazenda.data_contratacao && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><Calendar className="h-5 w-5 text-purple-500" /><div><p className="text-xs text-gray-500">Data de Contratação</p><p className="font-medium">{new Date(infoFazenda.data_contratacao).toLocaleDateString('pt-BR')}</p></div></div>}
            </div>
            <p className="text-xs text-gray-400 mt-4">* Dados profissionais só podem ser alterados pelo administrador.</p>
          </CardContent>
        </Card>
      )}

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