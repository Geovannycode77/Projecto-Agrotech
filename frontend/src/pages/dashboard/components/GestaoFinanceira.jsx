import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Loader2,
} from "lucide-react";
import { produtorService } from "@/services/ProdutorService";
import { toast } from "@/hooks/use-toast";

export default function GestaoFinanceira() {
  const [transacoes, setTransacoes] = useState([]);
  const [resumo, setResumo] = useState({
    total_receitas: 0,
    total_despesas: 0,
    saldo: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tipoTransacao, setTipoTransacao] = useState("despesa");
  const [formData, setFormData] = useState({
    categoria: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    descricao: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [transacoesData, resumoData] = await Promise.all([
        produtorService.getTransacoes({ limit: 50 }),
        produtorService.getResumoFinanceiro("ultimo_mes"),
      ]);

      setTransacoes(transacoesData.results || transacoesData);
      setResumo(resumoData);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validação básica
    if (!formData.categoria) {
      toast({
        title: "Erro",
        description: "Selecione uma categoria",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      toast({
        title: "Erro",
        description: "Informe um valor válido",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    if (!formData.descricao.trim()) {
      toast({
        title: "Erro",
        description: "Informe uma descrição",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    try {
      const dados = {
        tipo: tipoTransacao,
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        data: formData.data,
      };

      console.log("📤 Enviando:", dados);

      const novaTransacao = await produtorService.registrarTransacao(dados);

      setTransacoes([novaTransacao, ...transacoes]);

      // Atualizar resumo
      const novoResumo = await produtorService.getResumoFinanceiro("ultimo_mes");
      setResumo(novoResumo);

      // Limpar formulário
      setFormData({
        categoria: "",
        valor: "",
        data: new Date().toISOString().split("T")[0],
        descricao: "",
      });

      toast({
        title: "Sucesso",
        description: "Transação registrada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao registrar transação:", error);
      console.error("Detalhes do erro:", error.response?.data);
      toast({
        title: "Erro",
        description: error.response?.data?.error || Object.values(error.response?.data || {})[0]?.[0] || "Erro ao registrar transação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // CATEGORIAS CORRIGIDAS
  const categorias = {
    receita: [
      { value: "venda_animal", label: "Venda de Animal" },  // ← CORRIGIDO: venda_animal (singular)
      { value: "venda_produto", label: "Venda de Produto" },
      { value: "outros", label: "Outras Receitas" },
    ],
    despesa: [
      { value: "racao", label: "Compra de Ração" },
      { value: "veterinario", label: "Veterinário" },
      { value: "medicamentos", label: "Medicamentos" },
      { value: "transporte", label: "Transporte" },
      { value: "manutencao", label: "Manutenção" },
      { value: "outros", label: "Outras Despesas" },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receitas Totais</p>
                <p className="text-2xl font-bold text-green-600">
                  AOA {resumo.total_receitas?.toLocaleString() || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Despesas Totais</p>
                <p className="text-2xl font-bold text-red-600">
                  AOA {resumo.total_despesas?.toLocaleString() || 0}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saldo</p>
                <p
                  className={`text-2xl font-bold ${
                    resumo.saldo >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  AOA {resumo.saldo?.toLocaleString() || 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de Transação */}
      <Card>
        <CardHeader>
          <CardTitle>Nova Transação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button
              variant={tipoTransacao === "receita" ? "default" : "outline"}
              onClick={() => setTipoTransacao("receita")}
              className={
                tipoTransacao === "receita"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Receita
            </Button>
            <Button
              variant={tipoTransacao === "despesa" ? "default" : "outline"}
              onClick={() => setTipoTransacao("despesa")}
              className={
                tipoTransacao === "despesa" ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Despesa
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Categoria *</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione...</option>
                  {categorias[tipoTransacao].map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Valor (AOA) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={formData.data}
                  onChange={(e) =>
                    setFormData({ ...formData, data: e.target.value })
                  }
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label>Descrição *</Label>
                <Input
                  placeholder="Descrição da transação"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className={
                tipoTransacao === "receita"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Adicionar Transação
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {transacoes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma transação registrada.
            </div>
          ) : (
            <div className="space-y-3">
              {transacoes.slice(0, 10).map((transacao) => (
                <div
                  key={transacao.id}
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{transacao.descricao}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transacao.data).toLocaleDateString("pt-BR")} •
                      {transacao.tipo === "receita" ? " Receita" : " Despesa"}
                    </p>
                  </div>
                  <div
                    className={`font-bold ${
                      transacao.tipo === "receita"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transacao.tipo === "receita" ? "+" : "-"} AOA{" "}
                    {transacao.valor?.toLocaleString() || 0}
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