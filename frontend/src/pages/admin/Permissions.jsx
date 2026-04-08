import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { adminService } from '../../services/api';
import { Shield, Save, Users, FileText, Settings, Database, AlertCircle } from 'lucide-react';

export default function Permissions() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getPermissions();
      setPermissions(data.permissions || {});
      setRoles(data.roles || []);
      setModules(data.modules || []);
    } catch (err) {
      console.error('Erro ao carregar permissões:', err);
      setError('Não foi possível carregar as permissões.');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (roleId, moduleId, value) => {
    setPermissions({
      ...permissions,
      [roleId]: {
        ...permissions[roleId],
        [moduleId]: value
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminService.updatePermissions(permissions);
      alert('Permissões salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar permissões:', err);
      alert('Erro ao salvar permissões. Tente novamente.');
    } finally {
      setSaving(false);
    }
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
        <h1 className="text-3xl font-bold text-gray-800">Permissões de Acesso</h1>
        <p className="text-gray-500 mt-1">Configure o que cada tipo de usuário pode acessar</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Matriz de Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roles.length > 0 && modules.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Função / Módulo</th>
                    {modules.map(module => (
                      <th key={module.id} className="text-center p-3 text-sm font-medium text-gray-600">
                        <div className="flex flex-col items-center gap-1">
                          {module.icon === 'Users' && <Users className="w-4 h-4" />}
                          {module.icon === 'FileText' && <FileText className="w-4 h-4" />}
                          {module.icon === 'Settings' && <Settings className="w-4 h-4" />}
                          {module.icon === 'Database' && <Database className="w-4 h-4" />}
                          <span>{module.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roles.map(role => (
                    <tr key={role.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                          {role.name}
                        </span>
                      </td>
                      {modules.map(module => (
                        <td key={module.id} className="text-center p-3">
                          <Switch
                            checked={permissions[role.id]?.[module.id] || false}
                            onCheckedChange={(checked) => handlePermissionChange(role.id, module.id, checked)}
                            disabled={role.id === 'administrador'}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Nenhuma configuração disponível</p>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Permissões'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}