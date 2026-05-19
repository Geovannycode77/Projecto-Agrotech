import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  TrendingUp,
  BarChart3,
  Loader2,
} from "lucide-react";
import { produtorService } from "@/services/produtorService";
import { toast } from "@/hooks/use-toast";

export default function RelatorioProducao() {
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [indicadores, setIndicadores] = useState({
    taxa_natalidade: 0,
    taxa_mortalidade: 0,
    peso_medio: 0,
    producao_mensal: 0,
    variacao_natalidade: 0,
    variacao_mortalidade: 0,
    variacao_peso: 0,
    variacao_producao: 0,
  });
  const [relatoriosDisponiveis, setRelatoriosDisponiveis] = useState([]);
  const [formData, setFormData] = useState({
    tipo: "producao",
    periodo: "mes",
  });

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
        variacao_natalidade: data.variacao_natalidade || 0,
        variacao_mortalidade: data.variacao_mortalidade || 0,
        variacao_peso: data.variacao_peso || 0,
        variacao_producao: data.variacao_producao || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar indicadores:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarRelatoriosDisponiveis = async () => {
    try {
      const data = await produtorService.getRelatoriosDisponiveis();
      setRelatoriosDisponiveis(data.results || data);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    }
  };

  const handleGerarRelatorio = async () => {
    setGerando(true);
    try {
      const blob = await produtorService.gerarRelatorio(
        formData.tipo,
        formData.periodo,
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_${formData.tipo}_${formData.periodo}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
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

  const handleDownloadRelatorio = async (id, nome) => {
    try {
      const blob = await produtorService.downloadRelatorio(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nome;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
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
              <p className="text-2xl font-bold text-blue-600">
                {indicadores.taxa_natalidade}%
              </p>
              <p
                className={`text-xs mt-1 ${indicadores.variacao_natalidade >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {indicadores.variacao_natalidade >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(indicadores.variacao_natalidade)}% vs mês anterior
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Taxa de Mortalidade</p>
              <p className="text-2xl font-bold text-red-600">
                {indicadores.taxa_mortalidade}%
              </p>
              <p
                className={`text-xs mt-1 ${indicadores.variacao_mortalidade <= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {indicadores.variacao_mortalidade <= 0 ? "↓" : "↑"}{" "}
                {Math.abs(indicadores.variacao_mortalidade)}% vs mês anterior
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Peso Médio do Rebanho</p>
              <p className="text-2xl font-bold text-green-600">
                {indicadores.peso_medio} kg
              </p>
              <p
                className={`text-xs mt-1 ${indicadores.variacao_peso >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {indicadores.variacao_peso >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(indicadores.variacao_peso)} kg vs mês anterior
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Produção Mensal</p>
              <p className="text-2xl font-bold text-purple-600">
                +{indicadores.producao_mensal} animais
              </p>
              <p
                className={`text-xs mt-1 ${indicadores.variacao_producao >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {indicadores.variacao_producao >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(indicadores.variacao_producao)}% vs mês anterior
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Rebanho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <BarChart3 className="h-12 w-12 text-gray-400" />
              <p className="text-gray-500 ml-2">Gráfico em desenvolvimento</p>
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
                Nenhum relatório disponível.
              </div>
            ) : (
              <div className="space-y-3">
                {relatoriosDisponiveis.map((relatorio) => (
                  <Button
                    key={relatorio.id}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() =>
                      handleDownloadRelatorio(relatorio.id, relatorio.nome)
                    }
                  >
                    <span>{relatorio.nome}</span>
                    <Download className="h-4 w-4" />
                  </Button>
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
              <option value="mes">Último Mês</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="ano">Último Ano</option>
            </select>
            <Button onClick={handleGerarRelatorio} disabled={gerando}>
              {gerando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Gerar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
