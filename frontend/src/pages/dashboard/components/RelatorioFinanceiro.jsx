import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader2,
} from "lucide-react";
import { gestorService } from "@/services/gestorService";
import { toast } from "@/hooks/use-toast";

export default function RelatorioFinanceiro() {
  const [periodo, setPeriodo] = useState("mes");
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [relatorio, setRelatorio] = useState({
    receitas: 0,
    despesas: 0,
    lucro: 0,
    receitas_por_categoria: [],
    despesas_por_categoria: [],
    indicadores: {
      margem_lucro: 0,
      roi: 0,
      custo_operacional: 0,
      ticket_medio: 0,
    },
  });

  useEffect(() => {
    carregarRelatorio();
  }, [periodo]);

  const carregarRelatorio = async () => {
    setLoading(true);
    try {
      const data = await gestorService.getRelatorioFinanceiro(periodo);
      setRelatorio({
        receitas: data.receitas || 0,
        despesas: data.despesas || 0,
        lucro: data.lucro || 0,
        receitas_por_categoria: data.receitas_por_categoria || [],
        despesas_por_categoria: data.despesas_por_categoria || [],
        indicadores: {
          margem_lucro: data.margem_lucro || 0,
          roi: data.roi || 0,
          custo_operacional: data.custo_operacional || 0,
          ticket_medio: data.ticket_medio || 0,
        },
      });
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    setExportando(true);
    try {
      const blob = await gestorService.exportarRelatorio(periodo);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_financeiro_${periodo}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast({
        title: "Erro",
        description: "Erro ao exportar relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setExportando(false);
    }
  };

  const margemLucro =
    relatorio.receitas > 0 ? (relatorio.lucro / relatorio.receitas) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            Relatório Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-600" />
          Relatório Financeiro
        </CardTitle>
        <div className="flex gap-2">
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="mes">Último Mês</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="ano">Último Ano</option>
          </select>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportar}
            disabled={exportando}
          >
            {exportando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Resumo do Período */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Receitas Totais</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              AOA {relatorio.receitas.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="text-sm text-gray-600">Despesas Totais</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              AOA {relatorio.despesas.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-gray-600">Lucro Líquido</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              AOA {relatorio.lucro.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Detalhamento por Categoria */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Receitas por Categoria
            </h3>
            {relatorio.receitas_por_categoria.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nenhum dado disponível
              </div>
            ) : (
              <div className="space-y-3">
                {relatorio.receitas_por_categoria.map((cat, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat.categoria}</span>
                      <span>
                        AOA {cat.valor.toLocaleString()} ({cat.percentual}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${cat.percentual}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Despesas por Categoria
            </h3>
            {relatorio.despesas_por_categoria.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nenhum dado disponível
              </div>
            ) : (
              <div className="space-y-3">
                {relatorio.despesas_por_categoria.map((cat, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat.categoria}</span>
                      <span>
                        AOA {cat.valor.toLocaleString()} ({cat.percentual}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${cat.percentual}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Indicadores */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Indicadores</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Margem de Lucro</p>
              <p className="text-xl font-bold text-amber-600">
                {margemLucro.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">ROI</p>
              <p className="text-xl font-bold text-amber-600">
                {relatorio.indicadores.roi}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Custo Operacional</p>
              <p className="text-xl font-bold text-amber-600">
                AOA {relatorio.indicadores.custo_operacional.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Ticket Médio</p>
              <p className="text-xl font-bold text-amber-600">
                AOA {relatorio.indicadores.ticket_medio.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
