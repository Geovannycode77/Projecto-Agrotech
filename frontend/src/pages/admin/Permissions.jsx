import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { adminService } from '../../services/api';
import { Shield, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function Permissions() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [camadas, setCamadas] = useState({});
  const [modulos, setModulos] = useState([]);
  const [permissoesAtuais, setPermissoesAtuais] = useState({});

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await adminService.getSimplePermissions();
      console.log('Permissões simplificadas:', data);
      
      setCamadas(data.camadas || {});
      setModulos(data.modulos || []);
      
      // Inicializar permissões atuais baseado nas camadas
      const permissoesIniciais = {};
      Object.keys(data.camadas || {}).forEach(camadaId => {
        permissoesIniciais[camadaId] = {};
        (data.modulos || []).forEach(modulo => {
          const temPermissao = data.camadas[camadaId].permissoes.includes('*') || 
                               data.camadas[camadaId].permissoes.includes(modulo.id);
          permissoesIniciais[camadaId][modulo.id] = temPermissao;
        });
      });
      setPermissoesAtuais(permissoesIniciais);
      
    } catch (err) {
      console.error('Erro:', err);
      setError('Não foi possível carregar as permissões.');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissaoChange = (camadaId, moduloId, checked) => {
    setPermissoesAtuais(prev => ({
      ...prev,
      [camadaId]: {
        ...prev[camadaId],
        [moduloId]: checked
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminService.saveSimplePermissions(permissoesAtuais);
      alert('✅ Permissões salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('❌ Erro ao salvar permissões.');
    } finally {
      setSaving(false);
    }
  };

  const getCorCamada = (cor) => {
    const cores = {
      red: 'bg-red-100 text-red-700',
      green: 'bg-green-100 text-green-700',
      blue: 'bg-blue-100 text-blue-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      purple: 'bg-purple-100 text-purple-700'
    };
    return cores[cor] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando permissões...</p>
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
            onClick={fetchPermissions}
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Permissões por Camada</h1>
        <p className="text-gray-500 mt-1">Configure o acesso de cada tipo de usuário aos módulos do sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Matriz de Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 text-sm font-medium text-gray-700 w-48">Camada / Módulo</th>
                  {modulos.map(modulo => (
                    <th key={modulo.id} className="text-center p-3 text-sm font-medium text-gray-700 min-w-[100px]">
                      {modulo.nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(camadas).map(([camadaId, camada]) => (
                  <tr key={camadaId} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCorCamada(camada.cor)}`}>
                          {camada.nome}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{camada.descricao}</p>
                      </div>
                    </td>
                    {modulos.map(modulo => {
                      const isChecked = permissoesAtuais[camadaId]?.[modulo.id] || false;
                      const isAdmin = camadaId === 'administrador';
                      return (
                        <td key={modulo.id} className="text-center p-3">
                          <Switch
                            checked={isChecked}
                            onCheckedChange={(checked) => handlePermissaoChange(camadaId, modulo.id, checked)}
                            disabled={isAdmin}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button 
              onClick={fetchPermissions} 
              variant="outline"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Permissões'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Legenda das Camadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(camadas).map(([camadaId, camada]) => (
              <div key={camadaId} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${camada.cor}-500`} />
                <span className="text-sm text-gray-600">{camada.nome}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}