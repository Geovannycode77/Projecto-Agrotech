import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  TrendingUp,
  BarChart3,
  Loader2,
} from "lucide-react";
import { produtorService } from "@/services/ProdutorService";
import { toast } from "@/hooks/use-toast";

export default function RelatorioProducao() {
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [relatorioAtual, setRelatorioAtual] = useState(null);
  const [indicadores, setIndicadores] = useState({
    taxa_natalidade: 0,
    taxa_mortalidade: 0,
    peso_medio: 0,
    producao_mensal: 0,
  });
  const [relatoriosDisponiveis, setRelatoriosDisponiveis] = useState([]);
  const [formData, setFormData] = useState({
    tipo: "producao",
    periodo: "ultimo_mes",
  });

  const chartData = useMemo(() => {
    const values = [
      { label: "Nascimentos", value: indicadores.producao_mensal || 0 },
      { label: "Peso Médio", value: indicadores.peso_medio || 0 },
      { label: "Natalidade", value: indicadores.taxa_natalidade || 0 },
      { label: "Mortalidade", value: indicadores.taxa_mortalidade || 0 },
    ];

    const maxValue = Math.max(...values.map((item) => item.value), 1);

    return values.map((item) => ({
      ...item,
      height: `${(item.value / maxValue) * 100}%`,
    }));
  }, [indicadores]);

  useEffect(() => {
    carregarIndicadores();
    carregarRelatoriosDisponiveis();
  }, []);

  const carregarIndicadores = async () => {
    setLoading(true);
    try {
      const data = await produtorService.getIndicadoresProducao();
      setIndicadores({
        taxa_natalidade: data.taxa_natalidade || 0,
        taxa_mortalidade: data.taxa_mortalidade || 0,
        peso_medio: data.peso_medio || 0,
        producao_mensal: data.producao_mensal || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar indicadores:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarRelatoriosDisponiveis = async () => {
    try {
      const response = await produtorService.getRelatoriosProducao({
        limit: 10,
      });
      const lista = response.results || response || [];
      setRelatoriosDisponiveis(lista);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      setRelatoriosDisponiveis([]);
    }
  };

  const handleGerarRelatorio = async () => {
    setGerando(true);
    try {
      const relatorio = await produtorService.gerarRelatorio({
        periodo: formData.periodo,
      });
      setRelatorioAtual(relatorio);
      await carregarRelatoriosDisponiveis();
      toast({
        title: "Sucesso",
        description: "Relatório gerado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGerando(false);
    }
  };

  const handleDownloadRelatorio = async (id) => {
    try {
      await produtorService.downloadRelatorio(id);
      toast({
        title: "Sucesso",
        description: "Download iniciado!",
      });
    } catch (error) {
      console.error("Erro ao baixar relatório:", error);
      toast({
        title: "Erro",
        description: "Erro ao baixar relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Taxa de Natalidade</p>
              <p className="text-3xl font-bold text-blue-600">
                {indicadores.taxa_natalidade}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Taxa de Mortalidade</p>
              <p className="text-3xl font-bold text-red-600">
                {indicadores.taxa_mortalidade}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Peso Médio do Rebanho</p>
              <p className="text-3xl font-bold text-green-600">
                {indicadores.peso_medio} kg
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Nascimentos Mensais</p>
              <p className="text-3xl font-bold text-purple-600">
                {indicadores.producao_mensal ?? 0} animais
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Apenas nascimentos do mês atual são contados aqui.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatório Atual */}
      {relatorioAtual && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Relatório Gerado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs text-gray-500">Total de Animais</p>
                <p className="text-2xl font-bold">
                  {relatorioAtual.total_animais || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-500">Nascimentos</p>
                <p className="text-2xl font-bold">
                  {relatorioAtual.nascimentos || 0}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-gray-500">Mortes</p>
                <p className="text-2xl font-bold">
                  {relatorioAtual.mortes || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-500">Vendas</p>
                <p className="text-2xl font-bold">
                  {relatorioAtual.vendas || 0}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => handleDownloadRelatorio(relatorioAtual.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Relatório
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos e Relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Rebanho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Últimos indicadores</span>
                <span className="font-semibold text-gray-800">Mês atual</span>
              </div>
              <div className="h-64 p-4 bg-gray-50 rounded-lg">
                <div className="h-full flex items-end gap-3">
                  {chartData.map((item) => (
                    <div
                      key={item.label}
                      className="flex-1 flex flex-col justify-end"
                    >
                      <div className="relative h-full w-full bg-slate-100 rounded-xl overflow-hidden">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-emerald-500"
                          style={{ height: item.height }}
                        />
                      </div>
                      <p className="mt-3 text-center text-xs font-medium text-gray-700">
                        {item.label}
                      </p>
                      <p className="text-center text-xs text-gray-500">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            {relatoriosDisponiveis.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum relatório disponível. Clique em "Gerar Relatório" para
                criar um.
              </div>
            ) : (
              <div className="space-y-3">
                {relatoriosDisponiveis.map((relatorio) => (
                  <div
                    key={relatorio.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">
                        {relatorio.nome || `Relatório ${relatorio.periodo}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {relatorio.data
                          ? new Date(relatorio.data).toLocaleDateString("pt-BR")
                          : new Date(relatorio.created_at).toLocaleDateString(
                              "pt-BR",
                            )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadRelatorio(relatorio.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gerar Novo Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Novo Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="flex-1 border rounded-md p-2"
              value={formData.tipo}
              onChange={(e) =>
                setFormData({ ...formData, tipo: e.target.value })
              }
            >
              <option value="producao">Relatório de Produção</option>
              <option value="financeiro">Relatório Financeiro</option>
              <option value="saude">Relatório de Saúde</option>
              <option value="alimentacao">Relatório de Alimentação</option>
            </select>
            <select
              className="flex-1 border rounded-md p-2"
              value={formData.periodo}
              onChange={(e) =>
                setFormData({ ...formData, periodo: e.target.value })
              }
            >
              <option value="ultimo_mes">Último Mês</option>
              <option value="ultimo_trimestre">Último Trimestre</option>
              <option value="ultimo_ano">Último Ano</option>
            </select>
            <Button
              onClick={handleGerarRelatorio}
              disabled={gerando}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {gerando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {gerando ? "Gerando..." : "Gerar Relatório"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
