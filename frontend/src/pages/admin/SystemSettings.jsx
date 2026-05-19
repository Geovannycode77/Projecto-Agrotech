import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminService } from "../../services/api";
import {
  Globe,
  Mail,
  Shield,
  Save,
  RefreshCw,
  Database,
  Cloud,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import useConfirm from "@/components/ui/useConfirm";

export default function SystemSettings() {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    general: {},
    email: {},
    security: {},
    backup: {},
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getSystemSettings();
      setSettings(data);
    } catch (err) {
      console.error("Erro ao carregar configurações:", err);
      setError("Não foi possível carregar as configurações do sistema.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (category, key, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminService.updateSystemSettings(settings);
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
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

  const handleReset = async () => {
    try {
      const ok = await confirm(
        "Restaurar padrões",
        "Tem certeza que deseja restaurar as configurações padrão?",
      );
      if (!ok) return;
      setSaving(true);
      await adminService.resetSystemSettings();
      await fetchSettings();
      toast({
        title: "Sucesso",
        description: "Configurações restauradas com sucesso!",
      });
    } catch (err) {
      console.error("Erro ao restaurar configurações:", err);
      toast({
        title: "Erro",
        description: "Erro ao restaurar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", name: "Geral", icon: Globe },
    { id: "email", name: "Email", icon: Mail },
    { id: "security", name: "Segurança", icon: Shield },
    { id: "backup", name: "Backup", icon: Database },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando configurações...</p>
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
            onClick={fetchSettings}
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
        <h1 className="text-3xl font-bold text-gray-800">
          Configuração do Sistema
        </h1>
        <p className="text-gray-500 mt-1">
          Configure as definições gerais da plataforma
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? "text-emerald-600 border-b-2 border-emerald-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="mt-4">
        {activeTab === "general" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Site</Label>
                <Input
                  value={settings.general?.site_name || ""}
                  onChange={(e) =>
                    handleChange("general", "site_name", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={settings.general?.site_description || ""}
                  onChange={(e) =>
                    handleChange("general", "site_description", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email de Contato</Label>
                <Input
                  type="email"
                  value={settings.general?.contact_email || ""}
                  onChange={(e) =>
                    handleChange("general", "contact_email", e.target.value)
                  }
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="font-medium">Modo de Manutenção</p>
                  <p className="text-sm text-gray-500">
                    Bloqueia acesso de usuários não-admin
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.general?.maintenance_mode || false}
                    onChange={(e) =>
                      handleChange(
                        "general",
                        "maintenance_mode",
                        e.target.checked,
                      )
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "email" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                Configurações de Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Servidor SMTP</Label>
                <Input
                  value={settings.email?.smtp_host || ""}
                  onChange={(e) =>
                    handleChange("email", "smtp_host", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Porta SMTP</Label>
                <Input
                  value={settings.email?.smtp_port || ""}
                  onChange={(e) =>
                    handleChange("email", "smtp_port", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Usuário SMTP</Label>
                <Input
                  value={settings.email?.smtp_user || ""}
                  onChange={(e) =>
                    handleChange("email", "smtp_user", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Senha SMTP</Label>
                <Input
                  type="password"
                  value={settings.email?.smtp_password || ""}
                  onChange={(e) =>
                    handleChange("email", "smtp_password", e.target.value)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações por Email</p>
                  <p className="text-sm text-gray-500">
                    Enviar notificações automáticas
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.email?.notifications_enabled || false}
                    onChange={(e) =>
                      handleChange(
                        "email",
                        "notifications_enabled",
                        e.target.checked,
                      )
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "security" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticação de Dois Fatores</p>
                  <p className="text-sm text-gray-500">
                    Requer código adicional no login
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.security?.two_factor_enabled || false}
                    onChange={(e) =>
                      handleChange(
                        "security",
                        "two_factor_enabled",
                        e.target.checked,
                      )
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="space-y-2">
                <Label>Tempo de Sessão (minutos)</Label>
                <Input
                  type="number"
                  value={settings.security?.session_timeout || 30}
                  onChange={(e) =>
                    handleChange(
                      "security",
                      "session_timeout",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Máximo de Tentativas de Login</Label>
                <Input
                  type="number"
                  value={settings.security?.max_login_attempts || 5}
                  onChange={(e) =>
                    handleChange(
                      "security",
                      "max_login_attempts",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "backup" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                Configurações de Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Frequência de Backup</Label>
                <select
                  value={settings.backup?.frequency || "daily"}
                  onChange={(e) =>
                    handleChange("backup", "frequency", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Horário do Backup (UTC)</Label>
                <Input
                  type="time"
                  value={settings.backup?.time || "03:00"}
                  onChange={(e) =>
                    handleChange("backup", "time", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Reter Backups por (dias)</Label>
                <Input
                  type="number"
                  value={settings.backup?.retention_days || 30}
                  onChange={(e) =>
                    handleChange(
                      "backup",
                      "retention_days",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Cloud className="w-4 h-4" />
                Configurar Armazenamento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleReset} disabled={saving}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Restaurar Padrões
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}
