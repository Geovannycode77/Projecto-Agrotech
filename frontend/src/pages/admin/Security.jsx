import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminService, authService } from "../../services/api";
import {
  Shield,
  Lock,
  Key,
  Activity,
  Eye,
  EyeOff,
  AlertCircle,
  Save,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Security() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    login_notifications: true,
    max_login_attempts: 5,
    session_timeout: 30,
  });
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  // Security.jsx - Versão sem mock

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [settings, logs] = await Promise.all([
        adminService.getSecuritySettings(),
        adminService.getActivityLog(),
      ]);

      setSecuritySettings(settings);
      setActivityLog(logs || []);
    } catch (err) {
      console.error("Erro ao carregar dados de segurança:", err);
      setError("Não foi possível carregar as configurações de segurança.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await authService.changePassword(passwordData);
      toast({ title: "Sucesso", description: "Senha alterada com sucesso!" });
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      console.error("Erro ao alterar senha:", err);
      toast({
        title: "Erro",
        description:
          err.response?.data?.error ||
          "Erro ao alterar senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await adminService.updateSecuritySettings(securitySettings);
      toast({
        title: "Sucesso",
        description: "Configurações de segurança salvas!",
      });
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">
            Carregando configurações de segurança...
          </p>
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
            onClick={fetchSecurityData}
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
        <h1 className="text-3xl font-bold text-gray-800">Segurança</h1>
        <p className="text-gray-500 mt-1">
          Gerencie as configurações de segurança do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alterar Senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-600" />
              Alterar Senha
            </CardTitle>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Senha Atual</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Digite sua senha atual"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current_password: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nova Senha</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirmar Nova Senha</Label>
                <Input
                  type="password"
                  placeholder="Confirme sua nova senha"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirm_password: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Alterando..." : "Alterar Senha"}
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* Configurações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              Configurações de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticação de Dois Fatores</p>
                <p className="text-sm text-gray-500">
                  Adiciona uma camada extra de segurança
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={securitySettings.two_factor_enabled}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      two_factor_enabled: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações de Login</p>
                <p className="text-sm text-gray-500">
                  Receber email ao fazer login
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={securitySettings.login_notifications}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      login_notifications: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="space-y-2">
              <Label>Máximo de Tentativas de Login</Label>
              <Input
                type="number"
                value={securitySettings.max_login_attempts}
                onChange={(e) =>
                  setSecuritySettings({
                    ...securitySettings,
                    max_login_attempts: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tempo de Sessão (minutos)</Label>
              <Input
                type="number"
                value={securitySettings.session_timeout}
                onChange={(e) =>
                  setSecuritySettings({
                    ...securitySettings,
                    session_timeout: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <Button
              onClick={handleSaveSettings}
              className="w-full"
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Log de Atividades */}
      {activityLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Log de Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityLog.map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{log.action}</p>
                    <p className="text-xs text-gray-500">
                      Usuário: {log.user} • IP: {log.ip}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{log.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
