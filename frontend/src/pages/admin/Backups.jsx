import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Download, 
  Trash2, 
  RefreshCw,
  Clock,
  HardDrive,
  Cloud,
  Plus,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services/api';

export default function AdminBackups() {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [backups, setBackups] = useState([]);
  const [backupInfo, setBackupInfo] = useState({
    lastBackup: null,
    nextBackup: null,
    totalSize: 0,
    totalBackups: 0
  });

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar backups da API
      const data = await adminService.getBackups();
      setBackups(data.backups || []);
      setBackupInfo({
        lastBackup: data.lastBackup || null,
        nextBackup: data.nextBackup || null,
        totalSize: data.totalSize || 0,
        totalBackups: data.totalBackups || 0
      });
    } catch (err) {
      console.error('Erro ao carregar backups:', err);
      setError('Não foi possível carregar os backups.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      await adminService.createBackup();
      alert('Backup criado com sucesso!');
      fetchBackups(); // Recarrega a lista
    } catch (err) {
      console.error('Erro ao criar backup:', err);
      alert('Erro ao criar backup. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const blob = await adminService.downloadBackup(id);
      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${id}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Erro ao baixar backup:', err);
      alert('Erro ao baixar backup. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este backup?')) {
      try {
        await adminService.deleteBackup(id);
        alert('Backup excluído com sucesso!');
        fetchBackups(); // Recarrega a lista
      } catch (err) {
        console.error('Erro ao deletar backup:', err);
        alert('Erro ao deletar backup. Tente novamente.');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nenhum';
    return new Date(dateString).toLocaleString('pt-PT');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando backups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={fetchBackups}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Backups</h1>
          <p className="text-gray-500 mt-1">Gerencie os backups do sistema</p>
        </div>
        <Button onClick={handleCreateBackup} disabled={creating} className="gap-2">
          <Plus className="w-4 h-4" />
          {creating ? 'Criando...' : 'Novo Backup'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações de Backup */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-600" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Último Backup</span>
              <span className="text-sm font-medium">{formatDate(backupInfo.lastBackup)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Próximo Backup</span>
              <span className="text-sm font-medium">{formatDate(backupInfo.nextBackup) || 'Não agendado'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Espaço Total</span>
              <span className="text-sm font-medium">{formatFileSize(backupInfo.totalSize)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Backups Disponíveis</span>
              <span className="text-sm font-medium">{backupInfo.totalBackups}</span>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Backups */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              Lista de Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {backups.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum backup disponível</p>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{backup.name}</p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-gray-500">{formatFileSize(backup.size)}</span>
                          <span className="text-xs text-gray-500">{formatDate(backup.date)}</span>
                          <Badge variant={backup.type === 'automático' ? 'secondary' : 'default'}>
                            {backup.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(backup.id)}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(backup.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuração de Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-emerald-600" />
            Configuração de Backup Automático
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">
                {backupInfo.nextBackup 
                  ? `Próximo backup agendado para ${formatDate(backupInfo.nextBackup)}`
                  : 'Nenhum backup agendado'}
              </span>
            </div>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Configurar Agenda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}