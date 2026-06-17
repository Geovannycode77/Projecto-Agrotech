import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Syringe, AlertTriangle, Calendar, CheckCircle, Heart, Loader2 } from "lucide-react";
import { veterinarioService } from "@/services/veterinarioService";
import { produtorService } from "@/services/ProdutorService";

export default function AlertasLembretesSaude({ userRole = "veterinario" }) {
  const [alertas, setAlertas] = useState([]);
  const [proximasVacinas, setProximasVacinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState({ urgentes: 0, pendentes: 0, vacinasMes: 0 });

  const isVet = userRole === "veterinario";

  useEffect(() => {
    carregarTudo();
    const interval = setInterval(carregarTudo, 300000);
    return () => clearInterval(interval);
  }, [userRole]);

  const carregarTudo = async () => {
    setLoading(true);
    await Promise.allSettled([carregarAlertas(), carregarProximasVacinas()]);
    setLoading(false);
  };

  const carregarAlertas = async () => {
    try {
      // ✅ Veterinário usa endpoint próprio — nunca chama produtor/alertas/
      const data = isVet
        ? await veterinarioService.getAlertas()       // veterinario/alertas/
        : await produtorService.getAlertas();          // produtor/alertas/

      const lista = Array.isArray(data) ? data : data.results || [];
      setAlertas(lista);

      const naoLidos = lista.filter(a => !a.lido && a.status !== "lido");
      setEstatisticas(prev => ({
        ...prev,
        urgentes: naoLidos.filter(a => a.prioridade === "alta" || a.prioridade === "urgente").length,
        pendentes: naoLidos.length,
      }));
    } catch (error) {
      console.error("Erro ao carregar alertas:", error);
      setAlertas([]);
    }
  };

  const carregarProximasVacinas = async () => {
    try {
      // ✅ Ambos usam veterinario/vacinas/proximas/ — produtor não tem esse endpoint separado
      const data = await veterinarioService.getProximasVacinas();
      const lista = Array.isArray(data) ? data : data.results || [];

      const hoje = new Date();
      const limite = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

      const proximas = lista
        .filter(v => {
          const dt = new Date(v.data_proxima_dose || v.proxima_dose || v.data_programada);
          return dt >= hoje && dt <= limite;
        })
        .map(v => ({
          ...v,
          _data: new Date(v.data_proxima_dose || v.proxima_dose),
          dias_restantes: Math.ceil(
            (new Date(v.data_proxima_dose || v.proxima_dose) - hoje) / (1000 * 60 * 60 * 24)
          ),
        }))
        .sort((a, b) => a._data - b._data); // ordena por data

      setProximasVacinas(proximas);
      setEstatisticas(prev => ({ ...prev, vacinasMes: proximas.length }));
    } catch (error) {
      console.error("Erro ao carregar próximas vacinas:", error);
      setProximasVacinas([]);
    }
  };

  const marcarComoLido = async (id) => {
    try {
      if (isVet) {
        await veterinarioService.marcarAlertaLido(id);
      } else {
        await produtorService.marcarAlertaLido(id);
      }
      setAlertas(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a));
      // Atualiza contadores
      setEstatisticas(prev => ({
        ...prev,
        pendentes: Math.max(0, prev.pendentes - 1),
      }));
    } catch (error) {
      console.error("Erro ao marcar alerta como lido:", error);
    }
  };

  const getPrioridadeColor = (prioridade) => ({
    urgente: "border-red-600 bg-red-50",
    alta:    "border-red-400 bg-red-50",
    media:   "border-yellow-400 bg-yellow-50",
    baixa:   "border-blue-400 bg-blue-50",
  }[prioridade] || "border-gray-300 bg-gray-50");

  const alertasVisiveis = alertas.filter(a => !a.lido && a.status !== "lido");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Contadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Alertas Urgentes</p>
                <p className="text-3xl font-bold">{estatisticas.urgentes}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Alertas Pendentes</p>
                <p className="text-3xl font-bold">{estatisticas.pendentes}</p>
              </div>
              <Bell className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Vacinas este Mês</p>
                <p className="text-3xl font-bold">{estatisticas.vacinasMes}</p>
              </div>
              <Syringe className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-red-500" />
            Alertas e Lembretes
            {alertasVisiveis.length > 0 && (
              <Badge className="bg-red-500 text-white ml-1">
                {alertasVisiveis.length} não lido{alertasVisiveis.length > 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertasVisiveis.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Nenhum alerta pendente!</p>
              <p className="text-gray-400 text-sm mt-1">Tudo em dia por enquanto.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertasVisiveis.map(alerta => (
                <div
                  key={alerta.id}
                  className={`border-l-4 p-4 rounded-r-lg ${getPrioridadeColor(alerta.prioridade)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {alerta.titulo || alerta.mensagem}
                      </p>
                      {alerta.titulo && alerta.mensagem && (
                        <p className="text-sm text-gray-600 mt-1">{alerta.mensagem}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        {/* Suporta tanto animal_info (vet) quanto animal_nome (produtor) */}
                        {(alerta.animal_info?.nome || alerta.animal_info?.brinco || alerta.animal_nome || alerta.animal) && (
                          <span>
                            <Heart className="inline h-3 w-3 mr-0.5" />
                            {alerta.animal_info?.nome || alerta.animal_info?.brinco || alerta.animal_nome || alerta.animal}
                          </span>
                        )}
                        {(alerta.created_at || alerta.data_criacao) && (
                          <span>
                            <Calendar className="inline h-3 w-3 mr-0.5" />
                            {new Date(alerta.created_at || alerta.data_criacao).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                        {alerta.data_limite && (
                          <span className="text-orange-600 font-medium">
                            Prazo: {new Date(alerta.data_limite).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 shrink-0"
                      onClick={() => marcarComoLido(alerta.id)}
                      title="Marcar como lido"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendário de Vacinas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Calendário de Vacinas — Próximos 30 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proximasVacinas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Syringe className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma vacina programada para os próximos 30 dias.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proximasVacinas.map((vacina, i) => (
                <div
                  key={vacina.id || i}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{vacina.nome_vacina || vacina.vacina || "—"}</p>
                    <p className="text-sm text-gray-500">
                      {vacina.animal_info?.brinco || vacina.animal_info?.nome || vacina.animal_nome || vacina.animal_brinco || "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {vacina._data?.toLocaleDateString("pt-BR") || "—"}
                    </p>
                    <Badge className={
                      vacina.dias_restantes <= 3
                        ? "bg-red-100 text-red-800"
                        : vacina.dias_restantes <= 7
                          ? "bg-orange-100 text-orange-800"
                          : "bg-yellow-100 text-yellow-800"
                    }>
                      Em {vacina.dias_restantes} dia{vacina.dias_restantes !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}