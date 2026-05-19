import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { produtorService } from "@/services/produtorService";
import { toast } from "@/hooks/use-toast";

export default function AlertasNotificacoes({
  alertas: alertasProps,
  onAtualizar,
}) {
  const [alertas, setAlertas] = useState(alertasProps || []);
  const [loading, setLoading] = useState(false);
  const [preferencias, setPreferencias] = useState({
    alertas_saude: true,
    alertas_estoque: true,
    alertas_relatorios: false,
    frequencia_saude: "imediato",
    frequencia_estoque: "imediato",
    frequencia_relatorios: "mensal",
  });
  const [salvando, setSalvando] = useState(false);

  // Atualizar alertas quando as props mudarem
  useEffect(() => {
    if (alertasProps) {
      setAlertas(alertasProps);
    }
  }, [alertasProps]);

  // Carregar preferências do usuário
  useEffect(() => {
    carregarPreferencias();
  }, []);

  const carregarPreferencias = async () => {
    try {
      const data = await produtorService.getPreferenciasNotificacoes();
      setPreferencias(data);
    } catch (error) {
      console.error("Erro ao carregar preferências:", error);
    }
  };

  const getPrioridadeColor = (prioridade) => {
    const colors = {
      alta: "bg-red-100 border-red-300 text-red-800",
      media: "bg-yellow-100 border-yellow-300 text-yellow-800",
      baixa: "bg-blue-100 border-blue-300 text-blue-800",
    };
    return colors[prioridade] || "bg-gray-100";
  };

  const getIcone = (tipo) => {
    switch (tipo) {
      case "saude":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "alimentacao":
        return <Bell className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const marcarComoLido = async (id) => {
    try {
      setLoading(true);
      await produtorService.marcarAlertaLido(id);

      // Atualizar a lista localmente
      const alertasAtualizados = alertas.map((alerta) =>
        alerta.id === id ? { ...alerta, lido: true } : alerta,
      );
      setAlertas(alertasAtualizados);

      // Notificar o componente pai
      if (onAtualizar) {
        onAtualizar();
      }
    } catch (error) {
      console.error("Erro ao marcar alerta como lido:", error);
    } finally {
      setLoading(false);
    }
  };

  const salvarPreferencias = async () => {
    try {
      setSalvando(true);
      await produtorService.updatePreferenciasNotificacoes(preferencias);
      toast({
        title: "Sucesso",
        description: "Preferências salvas com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar preferências. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const alertasNaoLidos = alertas.filter((a) => !a.lido);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas e Notificações
            {alertasNaoLidos.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {alertasNaoLidos.length} não lidos
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : alertas.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum alerta pendente!</p>
              <p className="text-sm text-gray-500">
                Tudo está em ordem com seu rebanho.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`border-l-4 p-4 rounded-r-lg ${getPrioridadeColor(alerta.prioridade)} ${
                    alerta.lido ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      {getIcone(alerta.tipo)}
                      <div>
                        <p className="font-medium">{alerta.mensagem}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Prioridade:{" "}
                          {alerta.prioridade?.toUpperCase() || "NORMAL"}
                        </p>
                        {alerta.data_criacao && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(alerta.data_criacao).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    {!alerta.lido && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => marcarComoLido(alerta.id)}
                        disabled={loading}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferencias.alertas_saude}
                  onChange={(e) =>
                    setPreferencias({
                      ...preferencias,
                      alertas_saude: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span>Alertas de Saúde do Rebanho</span>
              </label>
              <select
                className="text-sm border rounded p-1"
                value={preferencias.frequencia_saude}
                onChange={(e) =>
                  setPreferencias({
                    ...preferencias,
                    frequencia_saude: e.target.value,
                  })
                }
                disabled={!preferencias.alertas_saude}
              >
                <option value="imediato">Imediato</option>
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferencias.alertas_estoque}
                  onChange={(e) =>
                    setPreferencias({
                      ...preferencias,
                      alertas_estoque: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span>Estoque de Ração Baixo</span>
              </label>
              <select
                className="text-sm border rounded p-1"
                value={preferencias.frequencia_estoque}
                onChange={(e) =>
                  setPreferencias({
                    ...preferencias,
                    frequencia_estoque: e.target.value,
                  })
                }
                disabled={!preferencias.alertas_estoque}
              >
                <option value="imediato">Imediato</option>
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferencias.alertas_relatorios}
                  onChange={(e) =>
                    setPreferencias({
                      ...preferencias,
                      alertas_relatorios: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span>Relatórios de Produção</span>
              </label>
              <select
                className="text-sm border rounded p-1"
                value={preferencias.frequencia_relatorios}
                onChange={(e) =>
                  setPreferencias({
                    ...preferencias,
                    frequencia_relatorios: e.target.value,
                  })
                }
                disabled={!preferencias.alertas_relatorios}
              >
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
              </select>
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={salvarPreferencias}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar Preferências"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
