import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Utensils,
  Package,
  Plus,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  X,
  ShoppingCart,
  Edit,
  Trash2,
} from "lucide-react";
import { produtorService } from "@/services/ProdutorService";

export default function AlimentacaoGado() {
  const [loading, setLoading] = useState(true);
  const [estoque, setEstoque] = useState({ racas: [] });
  const [consumoDiario, setConsumoDiario] = useState({
    total: 0,
    por_animal: 0,
    sacos_por_dia: 0,
    custo_diario: 0,
    custo_mensal: 0,
  });
  const [alimentacoes, setAlimentacoes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAddRacao, setShowAddRacao] = useState(false);
  const [showAddEstoque, setShowAddEstoque] = useState(false);
  const [selectedRacaoId, setSelectedRacaoId] = useState(null);
  const [editandoRacao, setEditandoRacao] = useState(null);
  const [editRacaoData, setEditRacaoData] = useState({
    id: null,
    nome: "",
    peso_por_saco: 0,
    preco_por_saco: 0,
  });
  const [formData, setFormData] = useState({
    tipo: "",
    quantidade_sacos: "",
    observacoes: "",
  });
  const [novaRacao, setNovaRacao] = useState({
    nome: "",
    peso_por_saco: 50,
    preco_por_saco: 5000,
  });
  const [addEstoqueData, setAddEstoqueData] = useState({
    quantidade_sacos: "",
    preco_pago_saco: "",
  });
  const [totalAnimais, setTotalAnimais] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const estoqueData = await produtorService.getEstoqueRacao();
      setEstoque(estoqueData);

      const consumoData = await produtorService.getConsumoDiario();
      setConsumoDiario(consumoData);

      const alimentacoesData = await produtorService.getAlimentacoes({
        limit: 100,
      });
      setAlimentacoes(alimentacoesData.results || alimentacoesData);

      const animaisData = await produtorService.getAnimais({ status: "ativo" });
      setTotalAnimais(animaisData.count || animaisData.results?.length || 0);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRacao = async () => {
    try {
      await produtorService.criarTipoRacao(novaRacao);
      await carregarDados();
      setShowAddRacao(false);
      setNovaRacao({ nome: "", peso_por_saco: 50, preco_por_saco: 5000 });
    } catch (error) {
      console.error("Erro ao adicionar ração:", error);
    }
  };

  const handleEditarRacao = (raca) => {
    setEditandoRacao(raca.id);
    setEditRacaoData({
      id: raca.id,
      nome: raca.nome,
      peso_por_saco: raca.peso_por_saco,
      preco_por_saco: raca.preco_por_saco,
    });
  };

  const handleSalvarEdicaoRacao = async () => {
    try {
      await produtorService.atualizarTipoRacao(editRacaoData.id, {
        nome: editRacaoData.nome,
        peso_por_saco: editRacaoData.peso_por_saco,
        preco_por_saco: editRacaoData.preco_por_saco,
      });
      await carregarDados();
      setEditandoRacao(null);
    } catch (error) {
      console.error("Erro ao editar ração:", error);
      alert("Erro ao salvar alterações");
    }
  };

  const handleDeletarRacao = async (id, nome) => {
    if (
      confirm(
        `Tem certeza que deseja deletar a ração "${nome}"? Isso também deletará o estoque e histórico.`,
      )
    ) {
      try {
        await produtorService.deletarTipoRacao(id);
        await carregarDados();
      } catch (error) {
        console.error("Erro ao deletar ração:", error);
        alert("Erro ao deletar ração");
      }
    }
  };

  const handleAddEstoque = async () => {
    if (!selectedRacaoId) return;

    try {
      await produtorService.adicionarEstoque({
        tipo_racao: selectedRacaoId,
        quantidade_sacos: parseFloat(addEstoqueData.quantidade_sacos),
        preco_pago_saco: parseFloat(addEstoqueData.preco_pago_saco) || 0,
      });
      await carregarDados();
      setShowAddEstoque(false);
      setAddEstoqueData({ quantidade_sacos: "", preco_pago_saco: "" });
      setSelectedRacaoId(null);
    } catch (error) {
      console.error("Erro ao adicionar estoque:", error);
      alert("Erro ao adicionar estoque");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const racaSelecionada = estoque.racas.find(
        (r) => r.nome === formData.tipo,
      );

      if (!racaSelecionada) {
        alert("Tipo de ração não encontrado");
        return;
      }

      const quantidadeSacos = parseFloat(formData.quantidade_sacos);
      if (isNaN(quantidadeSacos) || quantidadeSacos <= 0) {
        alert("Quantidade inválida");
        return;
      }

      const dadosEnvio = {
        tipo_racao: racaSelecionada.id,
        quantidade_sacos: quantidadeSacos,
        data: new Date().toISOString().split("T")[0],
        observacoes: formData.observacoes || "",
      };

      const novaAlimentacao =
        await produtorService.registrarAlimentacao(dadosEnvio);

      setAlimentacoes([novaAlimentacao, ...alimentacoes]);
      await carregarDados();
      setShowForm(false);
      setFormData({ tipo: "", quantidade_sacos: "", observacoes: "" });
    } catch (error) {
      console.error("Erro ao registrar alimentação:", error);
      alert("Erro ao registrar consumo");
    }
  };

  // Calcular autonomia específica para cada ração
  const calcularAutonomiaPorRacao = (quantidadeSacos, racaId) => {
    if (!quantidadeSacos || quantidadeSacos <= 0) return 0;

    const raca = estoque.racas.find((r) => r.id === racaId);
    if (!raca) return 0;

    const ultimos7Dias = new Date();
    ultimos7Dias.setDate(ultimos7Dias.getDate() - 7);

    const registrosRacao = alimentacoes.filter((item) => {
      const itemData = new Date(item.data);
      const itemNome =
        item.tipo_racao_nome || item.tipo_racao?.nome || item.tipo;
      return itemData >= ultimos7Dias && itemNome === raca.nome;
    });

    if (registrosRacao.length === 0) return 0;

    // Agrupar consumo por dia
    const consumoPorDia = {};
    registrosRacao.forEach((item) => {
      const data = item.data;
      const quantidade = Number(item.quantidade_sacos) || 0;
      if (!consumoPorDia[data]) {
        consumoPorDia[data] = 0;
      }
      consumoPorDia[data] += quantidade;
    });

    const diasComRegistro = Object.keys(consumoPorDia).length;
    const totalConsumido = Object.values(consumoPorDia).reduce(
      (sum, val) => sum + val,
      0,
    );
    const consumoMedioDiario =
      diasComRegistro > 0 ? totalConsumido / diasComRegistro : 0;

    if (consumoMedioDiario <= 0) return 0;

    // Autonomia = Estoque atual / Consumo médio diário
    return Math.floor(quantidadeSacos / consumoMedioDiario);
  };

  // Calcular autonomia total do estoque
  const calcularAutonomiaTotal = () => {
    const totalSacos =
      estoque.racas?.reduce(
        (sum, r) => sum + (Number(r.quantidade_sacos) || 0),
        0,
      ) || 0;
    if (totalSacos === 0) return 0;

    const ultimos7Dias = new Date();
    ultimos7Dias.setDate(ultimos7Dias.getDate() - 7);

    const registrosRecentes = alimentacoes.filter(
      (item) => new Date(item.data) >= ultimos7Dias,
    );

    if (registrosRecentes.length === 0) return 0;

    // Agrupar consumo total por dia
    const consumoPorDia = {};
    registrosRecentes.forEach((item) => {
      const data = item.data;
      const quantidade = Number(item.quantidade_sacos) || 0;
      if (!consumoPorDia[data]) {
        consumoPorDia[data] = 0;
      }
      consumoPorDia[data] += quantidade;
    });

    const diasComRegistro = Object.keys(consumoPorDia).length;
    const totalConsumido = Object.values(consumoPorDia).reduce(
      (sum, val) => sum + val,
      0,
    );
    const consumoMedioDiario =
      diasComRegistro > 0 ? totalConsumido / diasComRegistro : 0;

    if (consumoMedioDiario <= 0) return 0;

    return Math.floor(totalSacos / consumoMedioDiario);
  };

  // Calcular consumo médio diário em kg
  const calcularConsumoMedioDiarioKg = () => {
    const ultimos7Dias = new Date();
    ultimos7Dias.setDate(ultimos7Dias.getDate() - 7);

    const registrosRecentes = alimentacoes.filter(
      (item) => new Date(item.data) >= ultimos7Dias,
    );

    if (registrosRecentes.length === 0) return 0;

    const consumoPorDia = {};
    registrosRecentes.forEach((item) => {
      const data = item.data;
      const kg = Number(item.quantidade_kg) || 0;
      if (!consumoPorDia[data]) {
        consumoPorDia[data] = 0;
      }
      consumoPorDia[data] += kg;
    });

    const diasComRegistro = Object.keys(consumoPorDia).length;
    const totalKg = Object.values(consumoPorDia).reduce(
      (sum, val) => sum + val,
      0,
    );

    return diasComRegistro > 0 ? totalKg / diasComRegistro : 0;
  };

  // Calcular custo médio diário
  const calcularCustoMedioDiario = () => {
    const ultimos7Dias = new Date();
    ultimos7Dias.setDate(ultimos7Dias.getDate() - 7);

    const registrosRecentes = alimentacoes.filter(
      (item) => new Date(item.data) >= ultimos7Dias,
    );

    if (registrosRecentes.length === 0) return 0;

    const custoPorDia = {};
    registrosRecentes.forEach((item) => {
      const data = item.data;
      const custo = Number(item.custo_total) || 0;
      if (!custoPorDia[data]) {
        custoPorDia[data] = 0;
      }
      custoPorDia[data] += custo;
    });

    const diasComRegistro = Object.keys(custoPorDia).length;
    const totalCusto = Object.values(custoPorDia).reduce(
      (sum, val) => sum + val,
      0,
    );

    return diasComRegistro > 0 ? totalCusto / diasComRegistro : 0;
  };

  const consumoMedioDiarioKg = calcularConsumoMedioDiarioKg();
  const custoMedioDiario = calcularCustoMedioDiario();
  const autonomiaTotal = calcularAutonomiaTotal();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">Consumo Médio Diário</p>
                <p className="text-3xl font-bold">
                  {Math.round(consumoMedioDiarioKg)} kg
                </p>
                <p className="text-sm text-emerald-100">
                  {alimentacoes.length > 0
                    ? `Baseado em ${alimentacoes.length} registros`
                    : "Sem registros"}
                </p>
              </div>
              <Utensils className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Estoque Total</p>
                <p className="text-3xl font-bold">
                  {estoque.racas?.reduce(
                    (sum, r) => sum + (Number(r.quantidade_sacos) || 0),
                    0,
                  ) || 0}{" "}
                  sacos
                </p>
                <p className="text-sm text-blue-100">
                  {Math.round(
                    estoque.racas?.reduce(
                      (sum, r) =>
                        sum +
                        (Number(r.quantidade_sacos) || 0) *
                          (Number(r.peso_por_saco) || 0),
                      0,
                    ) || 0,
                  )}{" "}
                  kg
                </p>
              </div>
              <Package className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100">Autonomia Total</p>
                <p className="text-3xl font-bold">{autonomiaTotal} dias</p>
                {autonomiaTotal > 0 && (
                  <p className="text-sm text-amber-100">
                    Estoque:{" "}
                    {estoque.racas?.reduce(
                      (sum, r) => sum + (Number(r.quantidade_sacos) || 0),
                      0,
                    ) || 0}{" "}
                    sacos
                  </p>
                )}
              </div>
              <Calendar className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Custo Médio Diário</p>
                <p className="text-3xl font-bold">
                  AOA {Math.round(custoMedioDiario).toLocaleString()}
                </p>
                <p className="text-sm text-purple-100">
                  Mensal: AOA{" "}
                  {Math.round(custoMedioDiario * 30).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estoque por Tipo de Ração */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            Estoque de Ração por Tipo
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddRacao(!showAddRacao)}
              variant="outline"
              className="border-emerald-500 text-emerald-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Ração
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Consumo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {estoque.racas?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum tipo de ração cadastrado. Clique em "Nova Ração" para
              começar.
            </div>
          ) : (
            <div className="space-y-4">
              {estoque.racas?.map((raca) => {
                const quantidadeSacos = Number(raca.quantidade_sacos) || 0;
                const autonomiaPorRacao = calcularAutonomiaPorRacao(
                  quantidadeSacos,
                  raca.id,
                );
                const isLowStock = quantidadeSacos < 10;
                const pesoTotal =
                  quantidadeSacos * (Number(raca.peso_por_saco) || 0);
                const valorTotal =
                  quantidadeSacos * (Number(raca.preco_por_saco) || 0);

                return (
                  <div
                    key={raca.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    {editandoRacao === raca.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">
                            Nome da Ração
                          </label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={editRacaoData.nome}
                            onChange={(e) =>
                              setEditRacaoData({
                                ...editRacaoData,
                                nome: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">
                            Peso por Saco (kg)
                          </label>
                          <input
                            type="number"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={editRacaoData.peso_por_saco}
                            onChange={(e) =>
                              setEditRacaoData({
                                ...editRacaoData,
                                peso_por_saco: parseFloat(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">
                            Preço por Saco (AOA)
                          </label>
                          <input
                            type="number"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={editRacaoData.preco_por_saco}
                            onChange={(e) =>
                              setEditRacaoData({
                                ...editRacaoData,
                                preco_por_saco: parseFloat(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditandoRacao(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSalvarEdicaoRacao}
                            className="bg-emerald-600"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {raca.nome}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {raca.peso_por_saco}kg/saco • AOA{" "}
                              {raca.preco_por_saco}/saco
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {isLowStock && (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Estoque Baixo
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditarRacao(raca)}
                              className="text-blue-600"
                              title="Editar ração"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDeletarRacao(raca.id, raca.nome)
                              }
                              className="text-red-600"
                              title="Deletar ração"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRacaoId(raca.id);
                                setShowAddEstoque(true);
                              }}
                              className="border-emerald-500 text-emerald-600"
                              title="Adicionar estoque"
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />+ Estoque
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500">
                              Sacos Disponíveis
                            </p>
                            <p className="text-xl font-bold text-gray-800">
                              {quantidadeSacos}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Peso Total</p>
                            <p className="text-xl font-bold text-gray-800">
                              {pesoTotal} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Autonomia</p>
                            <p
                              className={`text-xl font-bold ${autonomiaPorRacao < 7 && autonomiaPorRacao > 0 ? "text-red-600" : "text-gray-800"}`}
                            >
                              {autonomiaPorRacao > 0
                                ? `${autonomiaPorRacao} dias`
                                : "Sem dados"}
                            </p>
                            {autonomiaPorRacao > 0 && (
                              <p className="text-xs text-gray-400">
                                {quantidadeSacos} sacos ÷ consumo
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Valor Total</p>
                            <p className="text-xl font-bold text-gray-800">
                              AOA {valorTotal.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min((quantidadeSacos / 60) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para Adicionar Nova Ração */}
      {showAddRacao && (
        <Card className="border-2 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cadastrar Nova Ração</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddRacao(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Nome da Ração</Label>
                <Input
                  placeholder="Ex: Ração de Crescimento"
                  value={novaRacao.nome}
                  onChange={(e) =>
                    setNovaRacao({ ...novaRacao, nome: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Peso por Saco (kg)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 50"
                  value={novaRacao.peso_por_saco}
                  onChange={(e) =>
                    setNovaRacao({
                      ...novaRacao,
                      peso_por_saco: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Preço por Saco (AOA)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 5000"
                  value={novaRacao.preco_por_saco}
                  onChange={(e) =>
                    setNovaRacao({
                      ...novaRacao,
                      preco_por_saco: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAddRacao(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddRacao}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Cadastrar Ração
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal para Adicionar Estoque */}
      {showAddEstoque && selectedRacaoId && (
        <Card className="border-2 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Adicionar Estoque</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddEstoque(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Quantidade de Sacos</Label>
                <Input
                  type="number"
                  placeholder="Ex: 30"
                  value={addEstoqueData.quantidade_sacos}
                  onChange={(e) =>
                    setAddEstoqueData({
                      ...addEstoqueData,
                      quantidade_sacos: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Preço Pago por Saco (AOA) - opcional</Label>
                <Input
                  type="number"
                  placeholder="Ex: 5500"
                  value={addEstoqueData.preco_pago_saco}
                  onChange={(e) =>
                    setAddEstoqueData({
                      ...addEstoqueData,
                      preco_pago_saco: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAddEstoque(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddEstoque}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Adicionar ao Estoque
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Registro de Consumo */}
      {showForm && (
        <Card className="border-2 border-emerald-200">
          <CardHeader>
            <CardTitle>Registrar Consumo de Ração</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Ração</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecione...</option>
                    {estoque.racas?.map((raca) => (
                      <option key={raca.id} value={raca.nome}>
                        {raca.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Quantidade (sacos)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 3"
                    value={formData.quantidade_sacos}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantidade_sacos: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Input
                    placeholder="Observações adicionais"
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Registrar Consumo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Alimentações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Histórico de Alimentações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alimentacoes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum registro de alimentação encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Sacos
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Peso (kg)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Custo (AOA)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {alimentacoes.slice(0, 20).map((item) => (
                    <tr
                      key={item.id}
                      className="border-t hover:bg-emerald-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {new Date(item.data).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {item.tipo_racao_nome ||
                          item.tipo_racao?.nome ||
                          item.tipo}
                      </td>
                      <td className="px-4 py-3">
                        {item.quantidade_sacos} sacos
                      </td>
                      <td className="px-4 py-3">{item.quantidade_kg} kg</td>
                      <td className="px-4 py-3">
                        AOA {Number(item.custo_total).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {item.observacoes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
