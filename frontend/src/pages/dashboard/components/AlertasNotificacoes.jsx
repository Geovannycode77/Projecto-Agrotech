import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle, PawPrint, Clock } from "lucide-react";
import { produtorService } from "@/services/ProdutorService";
import { toast } from "@/hooks/use-toast";

export default function AlertasNotificacoes({ alertas: alertasProps, onAtualizar }) {
  const [alertas, setAlertas] = useState(alertasProps || []);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("alertas");
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

  useEffect(() => {
    if (alertasProps) setAlertas(alertasProps);
  }, [alertasProps]);

  useEffect(() => {
    carregarPreferencias();
    carregarAlertas();
    carregarOcorrencias();
  }, []);

  const carregarAlertas = async () => {
    try {
      const data = await produtorService.getAlertas();
      setAlertas(data.results || data);
    } catch (error) {
      console.error("Erro ao carregar alertas:", error);
    }
  };

  const carregarOcorrencias = async () => {
    try {
      const data = await produtorService.getOcorrenciasFazenda();
      setOcorrencias(data);
    } catch (error) {
      console.error("Erro ao carregar ocorrências:", error);
    }
  };

  const carregarPreferencias = async () => {
    try {
      const data = await produtorService.getPreferenciasNotificacoes();
      setPreferencias(data);
    } catch (error) {
      console.error("Erro ao carregar preferências:", error);
    }
  };

  const marcarComoLido = async (id) => {
    try {
      setLoading(true);
      await produtorService.marcarAlertaLido(id);
      setAlertas(alertas.map((a) => (a.id === id ? { ...a, lido: true } : a)));
      if (onAtualizar) onAtualizar();
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const resolverOcorrencia = async (id) => {
    try {
      setLoading(true);
      await produtorService.resolverOcorrencia(id);
      setOcorrencias(ocorrencias.map((oc) =>
        oc.id === id ? { ...oc, resolvido: true, data_resolucao: new Date().toISOString() } : oc
      ));
      toast({ title: "Sucesso", description: "Ocorrência marcada como resolvida!" });
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao resolver ocorrência.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const salvarPreferencias = async () => {
    try {
      setSalvando(true);
      await produtorService.updatePreferenciasNotificacoes(preferencias);
      toast({ title: "Sucesso", description: "Preferências salvas!" });
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao salvar.", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  const getUrgenciaColor = (urgencia) => ({
    urgente: "border-red-500 bg-red-50",
    alta: "border-orange-500 bg-orange-50",
    media: "border-yellow-500 bg-yellow-50",
    baixa: "border-blue-500 bg-blue-50",
  }[urgencia] || "border-gray-300 bg-gray-50");

  const getUrgenciaLabel = (urgencia) => ({
    urgente: "🔴 Urgente",
    alta: "🟠 Alta",
    media: "🟡 Média",
    baixa: "🔵 Baixa",
  }[urgencia] || urgencia);

  const getPrioridadeColor = (prioridade) => ({
    alta: "bg-red-100 border-red-300 text-red-800",
    media: "bg-yellow-100 border-yellow-300 text-yellow-800",
    baixa: "bg-blue-100 border-blue-300 text-blue-800",
  }[prioridade] || "bg-gray-100");

  const alertasNaoLidos = alertas.filter((a) => !a.lido);
  const ocorrenciasPendentes = ocorrencias.filter((oc) => !oc.resolvido);

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setAbaAtiva("alertas")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            abaAtiva === "alertas"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Bell className="inline h-4 w-4 mr-1" />
          Alertas do Sistema
          {alertasNaoLidos.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {alertasNaoLidos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAbaAtiva("ocorrencias")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            abaAtiva === "ocorrencias"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <AlertTriangle className="inline h-4 w-4 mr-1" />
          Ocorrências dos Funcionários
          {ocorrenciasPendentes.length > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {ocorrenciasPendentes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAbaAtiva("preferencias")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            abaAtiva === "preferencias"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Preferências
        </button>
      </div>

      {/* Aba: Alertas do Sistema */}
      {abaAtiva === "alertas" && (
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
            {alertas.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">Nenhum alerta pendente!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`border-l-4 p-4 rounded-r-lg ${getPrioridadeColor(alerta.prioridade)} ${alerta.lido ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Bell className="h-5 w-5 mt-0.5 text-gray-500" />
                        <div>
                          <p className="font-medium">{alerta.mensagem}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {alerta.data_criacao && new Date(alerta.data_criacao).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      {!alerta.lido && (
                        <Button variant="ghost" size="sm" onClick={() => marcarComoLido(alerta.id)} disabled={loading}>
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
      )}

      {/* Aba: Ocorrências dos Funcionários */}
      {abaAtiva === "ocorrencias" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Ocorrências Registradas pelos Funcionários
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ocorrencias.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">Nenhuma ocorrência registrada.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ocorrencias.map((oc) => (
                  <div
                    key={oc.id}
                    className={`border-l-4 p-4 rounded-r-lg ${getUrgenciaColor(oc.urgencia)} ${oc.resolvido ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-gray-800">{oc.titulo}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/70 border">
                            {getUrgenciaLabel(oc.urgencia)}
                          </span>
                          {oc.resolvido && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                              ✅ Resolvida
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{oc.descricao}</p>

                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>👤 {oc.funcionario}</span>
                          {oc.animal && (
                            <span>
                              <PawPrint className="inline h-3 w-3 mr-1" />
                              {oc.animal} {oc.animal_brinco && `(${oc.animal_brinco})`}
                            </span>
                          )}
                          <span>
                            <Clock className="inline h-3 w-3 mr-1" />
                            {new Date(oc.data_hora).toLocaleString("pt-BR")}
                          </span>
                          {oc.resolvido && oc.data_resolucao && (
                            <span className="text-green-600">
                              ✅ Resolvida em {new Date(oc.data_resolucao).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                      </div>

                      {!oc.resolvido && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-700 hover:bg-green-50 shrink-0"
                          onClick={() => resolverOcorrencia(oc.id)}
                          disabled={loading}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Aba: Preferências */}
      {abaAtiva === "preferencias" && (
        <Card>
          <CardHeader>
            <CardTitle>Preferências de Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: "alertas_saude", label: "Alertas de Saúde do Rebanho", freqKey: "frequencia_saude" },
                { key: "alertas_estoque", label: "Estoque de Ração Baixo", freqKey: "frequencia_estoque" },
                { key: "alertas_relatorios", label: "Relatórios de Produção", freqKey: "frequencia_relatorios" },
              ].map(({ key, label, freqKey }) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={preferencias[key]}
                      onChange={(e) => setPreferencias({ ...preferencias, [key]: e.target.checked })}
                      className="rounded"
                    />
                    <span>{label}</span>
                  </label>
                  <select
                    className="text-sm border rounded p-1"
                    value={preferencias[freqKey]}
                    onChange={(e) => setPreferencias({ ...preferencias, [freqKey]: e.target.value })}
                    disabled={!preferencias[key]}
                  >
                    <option value="imediato">Imediato</option>
                    <option value="diario">Diário</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensal">Mensal</option>
                  </select>
                </div>
              ))}
            </div>
            <Button className="mt-4" onClick={salvarPreferencias} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar Preferências"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}