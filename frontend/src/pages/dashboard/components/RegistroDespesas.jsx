import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  TrendingDown,
  Plus,
  CheckCircle,
  Package,
  Syringe,
  Utensils,
  Wrench,
  Truck,
  DollarSign,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import { gestorService } from "@/services/gestorService";
import { toast } from "@/hooks/use-toast";

export default function RegistroDespesas() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [despesas, setDespesas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [formData, setFormData] = useState({
    categoria: "",
    descricao: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    fornecedor: "",
    forma_pagamento: "",
    notas: "",
  });
  const [success, setSuccess] = useState(false);

  const categorias = [
    { value: "racao",         label: "Ração",          icon: Utensils,  cor: "bg-emerald-100 text-emerald-800" },
    { value: "veterinario",   label: "Veterinário",    icon: Syringe,   cor: "bg-blue-100 text-blue-800" },
    { value: "medicamentos",  label: "Medicamentos",   icon: Package,   cor: "bg-purple-100 text-purple-800" },
    { value: "equipamentos",  label: "Equipamentos",   icon: Wrench,    cor: "bg-yellow-100 text-yellow-800" },
    { value: "manutencao",    label: "Manutenção",     icon: Wrench,    cor: "bg-orange-100 text-orange-800" },
    { value: "funcionarios",  label: "Funcionários",   icon: DollarSign,cor: "bg-pink-100 text-pink-800" },
    { value: "energia",       label: "Energia",        icon: DollarSign,cor: "bg-amber-100 text-amber-800" },
    { value: "agua",          label: "Água",           icon: DollarSign,cor: "bg-cyan-100 text-cyan-800" },
    { value: "transporte",    label: "Transporte",     icon: Truck,     cor: "bg-indigo-100 text-indigo-800" },
    { value: "impostos",      label: "Impostos",       icon: DollarSign,cor: "bg-red-100 text-red-800" },
    { value: "outros",        label: "Outros",         icon: DollarSign,cor: "bg-gray-100 text-gray-800" },
  ];

  useEffect(() => {
    carregarDespesas();
  }, []);

  const carregarDespesas = async () => {
    setLoading(true);
    try {
     const data = await gestorService.getTodosDespesas();
     setDespesas(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Erro ao carregar despesas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const novaDespesa = await gestorService.registrarDespesa({
        ...formData,
        valor: parseFloat(formData.valor),
      });

      setDespesas([novaDespesa, ...despesas]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({
        categoria: "",
        descricao: "",
        valor: "",
        data: new Date().toISOString().split("T")[0],
        fornecedor: "",
        forma_pagamento: "",
        notas: "",
      });
    } catch (error) {
      console.error("Erro ao registrar despesa:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar despesa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const despesasFiltradas = despesas.filter((d) => {
    const matchSearch =
      d.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.fornecedor &&
        d.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategoria =
      filtroCategoria === "todas" || d.categoria === filtroCategoria;
    return matchSearch && matchCategoria;
  });

  const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
  const despesasPorCategoria = categorias.map((cat) => ({
    ...cat,
    total: despesas
      .filter((d) => d.categoria === cat.value)
      .reduce((sum, d) => sum + (d.valor || 0), 0),
  }));

  const mediaPorDespesa =
    despesas.length > 0 ? totalDespesas / despesas.length : 0;
  const maiorDespesa =
    despesas.length > 0 ? Math.max(...despesas.map((d) => d.valor || 0)) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-red-500 to-rose-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Total de Despesas</p>
                <p className="text-2xl font-bold">
                  AOA {totalDespesas.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
        {despesasPorCategoria.slice(0, 3).map((cat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${cat.cor.split(" ")[0]}`}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{cat.label}</p>
                  <p className="text-xl font-bold">
                    AOA {cat.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Média por Despesa</p>
                <p className="text-xl font-bold">
                  AOA {mediaPorDespesa.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Package className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Maior Despesa</p>
                <p className="text-xl font-bold">
                  AOA {maiorDespesa.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Registros</p>
                <p className="text-xl font-bold">{despesas.length} despesas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Registrar Nova Despesa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Despesa registrada com sucesso!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Categoria *</Label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione...</option>
                  {categorias.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Valor (AOA) *</Label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded-lg p-2"
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
                <input
                  type="date"
                  className="w-full border rounded-lg p-2"
                  value={formData.data}
                  onChange={(e) =>
                    setFormData({ ...formData, data: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Fornecedor</Label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  placeholder="Nome do fornecedor"
                  value={formData.fornecedor}
                  onChange={(e) =>
                    setFormData({ ...formData, fornecedor: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Forma de Pagamento</Label>
               <select className="w-full border rounded-lg p-2"
                  value={formData.forma_pagamento}
                  onChange={e => setFormData({ ...formData, forma_pagamento: e.target.value })}>
                  <option value="">Selecione...</option>
                  <option>À vista (dinheiro)</option>
                  <option>Transferência bancária</option>
                  <option>Multicaixa Express</option>
                  <option>Referência Multicaixa</option>
                  <option>Cheque</option>
                  <option>Crédito documentário</option>
                  <option>Outro</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label>Descrição *</Label>
                <textarea
                  className="w-full border rounded-lg p-2"
                  rows="2"
                  placeholder="Descreva a despesa..."
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
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Registrar Despesa
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Despesas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Histórico de Despesas
          </CardTitle>
         <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
            value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
            <option value="todas">Todas Categorias</option>
            {categorias.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        </CardHeader>
        <CardContent>
          {despesasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma despesa encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-4 py-3 text-left">Categoria</th>
                    <th className="px-4 py-3 text-left">Descrição</th>
                    <th className="px-4 py-3 text-left">Fornecedor</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {despesasFiltradas.map((despesa) => {
                    const categoria = categorias.find(
                      (c) => c.value === despesa.categoria,
                    );
                    return (
                      <tr
                        key={despesa.id}
                        className="border-t hover:bg-red-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          {new Date(despesa.data).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={categoria?.cor}>
                            {despesa.categoria}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{despesa.descricao}</td>
                        <td className="px-4 py-3">
                          {despesa.fornecedor || "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-red-600">
                          - AOA {despesa.valor.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente Calendar para o card de estatísticas
const Calendar = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
