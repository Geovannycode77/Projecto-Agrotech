import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, Plus, CheckCircle, PawPrint,
  Package, DollarSign, Search, Truck, Loader2, PiggyBank,
} from "lucide-react";
import { gestorService } from "@/services/GestorService";
import { toast } from "@/hooks/use-toast";

// Formata valores em AOA correctamente
const formatAOA = (valor) => {
  const num = parseFloat(valor) || 0;
  return num.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function RegistroReceitas() {
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receitas, setReceitas]     = useState([]);
  const [animais, setAnimais]       = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    categoria: "", descricao: "", valor: "",
    data: new Date().toISOString().split("T")[0],
    comprador: "", animal_id: "", peso_total: "",
    forma_pagamento: "",
  });

  const categorias = [
    { value: "venda_animal",  label: "Venda de Animal",  icon: PawPrint,   cor: "bg-emerald-100 text-emerald-800" },
    { value: "venda_produto", label: "Venda de Produto", icon: Package,    cor: "bg-blue-100 text-blue-800" },
    { value: "venda_leite",   label: "Venda de Leite",   icon: Truck,      cor: "bg-purple-100 text-purple-800" },
    { value: "subsidio",      label: "Subsídio/Governo", icon: DollarSign, cor: "bg-yellow-100 text-yellow-800" },
    { value: "emprestimo",    label: "Empréstimo",       icon: PiggyBank,  cor: "bg-orange-100 text-orange-800" },
    { value: "outros",        label: "Outros",           icon: DollarSign, cor: "bg-gray-100 text-gray-800" },
  ];

  const formasPagamento = [
    "À vista (dinheiro)", "Transferência bancária",
    "Multicaixa Express", "Referência Multicaixa",
    "Crédito documentário", "Cheque", "Outro",
  ];

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [receitasRes, animaisRes] = await Promise.allSettled([
        gestorService.getReceitas(),
        gestorService.getAnimaisFazenda(),
      ]);
      if (receitasRes.status === 'fulfilled') {
        const lista = receitasRes.value.results || receitasRes.value;
        setReceitas(Array.isArray(lista) ? lista : []);
      }
      if (animaisRes.status === 'fulfilled') {
        const lista = animaisRes.value.results || animaisRes.value;
        setAnimais(Array.isArray(lista) ? lista : []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimalChange = (animalId) => {
    const animal = animais.find(a => String(a.id) === String(animalId));
    setFormData(prev => ({
      ...prev,
      animal_id: animalId,
      peso_total: animal?.peso_atual ? String(animal.peso_atual) : prev.peso_total,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Monta descrição com extras (comprador, pagamento, peso)
      // pois o model não tem esses campos separados
      let descricaoFinal = formData.descricao;
      const extras = [];
      if (formData.comprador)       extras.push(`Comprador: ${formData.comprador}`);
      if (formData.forma_pagamento) extras.push(`Pagamento: ${formData.forma_pagamento}`);
      if (formData.peso_total)      extras.push(`Peso: ${formData.peso_total}kg`);
      if (extras.length > 0)        descricaoFinal += ` | ${extras.join(' | ')}`;

      const payload = {
        categoria: formData.categoria,
        descricao: descricaoFinal,
        valor:     parseFloat(formData.valor),
        data:      formData.data,
      };
      if (formData.categoria === "venda_animal" && formData.animal_id) {
        payload.animal = formData.animal_id;
      }

      const novaReceita = await gestorService.registrarReceita(payload);
      setReceitas(prev => [novaReceita, ...prev]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({
        categoria: "", descricao: "", valor: "",
        data: new Date().toISOString().split("T")[0],
        comprador: "", animal_id: "", peso_total: "", forma_pagamento: "",
      });
    } catch (err) {
      console.error("Erro:", err.response?.data);
      toast({ title: "Erro", description: "Erro ao registrar receita.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cálculos corrigidos ──────────────────────────────────────────
  const totalReceitas = receitas.reduce((s, r) => s + parseFloat(r.valor || 0), 0);

  // Receitas por categoria para os 4 cards do topo
  const receitasPorCategoria = categorias.map(cat => ({
    ...cat,
    total: receitas
      .filter(r => r.categoria === cat.value)
      .reduce((s, r) => s + parseFloat(r.valor || 0), 0),
  }));

  // Estatísticas de vendas de animal
  const vendasAnimal       = receitas.filter(r => r.categoria === "venda_animal");
  const qtdAnimaisVendidos = vendasAnimal.length; // cada registo = 1 venda de animal
  

  // Filtro do histórico
  const receitasFiltradas = receitas.filter(r => {
    const matchSearch = r.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat    = filtroCategoria === "todas" || r.categoria === filtroCategoria;
    return matchSearch && matchCat;
  });

  // Extrai comprador da descrição (formato: "desc | Comprador: X | ...")
  const extrairComprador = (descricao) => {
    if (!descricao) return "-";
    const match = descricao.match(/Comprador: ([^|]+)/);
    return match ? match[1].trim() : "-";
  };

  // Descrição limpa (sem os extras)
  const limparDescricao = (descricao) => {
    if (!descricao) return "-";
    return descricao.split(" | Comprador:")[0].split(" | Pagamento:")[0].split(" | Peso:")[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── 4 Cards de topo: Total + 3 categorias principais ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total de Receitas</p>
                <p className="text-2xl font-bold">AOA {formatAOA(totalReceitas)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
        {receitasPorCategoria.slice(0, 3).map((cat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${cat.cor.split(" ")[0]}`}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{cat.label}</p>
                  <p className="text-lg font-bold">
                    {cat.total > 0 ? `AOA ${formatAOA(cat.total)}` : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── 3 Cards de estatísticas de venda de animal ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
       
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Animais Vendidos</p>
                <p className="text-xl font-bold">{qtdAnimaisVendidos} cabeça{qtdAnimaisVendidos !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>
       
      </div>

      {/* ── Formulário ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Registrar Nova Receita / Venda
          </CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Receita registrada com sucesso!
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Categoria *</Label>
                <select className="w-full border rounded-lg p-2 mt-1"
                  value={formData.categoria}
                  onChange={e => setFormData({ ...formData, categoria: e.target.value, animal_id: '', peso_total: '' })}
                  required>
                  <option value="">Selecione...</option>
                  {categorias.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <Label>Valor (AOA) *</Label>
                <input type="number" step="0.01" min="0.01"
                  className="w-full border rounded-lg p-2 mt-1"
                  placeholder="Ex: 1000000"
                  value={formData.valor}
                  onChange={e => setFormData({ ...formData, valor: e.target.value })} required />
              </div>

              <div>
                <Label>Data *</Label>
                <input type="date" className="w-full border rounded-lg p-2 mt-1"
                  value={formData.data}
                  onChange={e => setFormData({ ...formData, data: e.target.value })} required />
              </div>

              <div>
                <Label>Comprador</Label>
                <input type="text" className="w-full border rounded-lg p-2 mt-1"
                  placeholder="Nome do comprador"
                  value={formData.comprador}
                  onChange={e => setFormData({ ...formData, comprador: e.target.value })} />
              </div>

              {/* Campos de venda de animal */}
              {formData.categoria === "venda_animal" && (
                <>
                  <div>
                    <Label>Animal vendido <span className="text-xs text-gray-400">(opcional)</span></Label>
                    <select className="w-full border rounded-lg p-2 mt-1"
                      value={formData.animal_id}
                      onChange={e => handleAnimalChange(e.target.value)}>
                      <option value="">Selecione o animal...</option>
                      {animais.filter(a => a.status !== 'morto').map(a => (
                        <option key={a.id} value={a.id}>
                          {a.brinco}{a.nome ? ` — ${a.nome}` : ''} | {a.peso_atual ? `${a.peso_atual}kg` : 'sem peso'}
                        </option>
                      ))}
                    </select>
                    {animais.length === 0 && (
                      <p className="text-xs text-gray-400 mt-1">Nenhum animal na fazenda.</p>
                    )}
                  </div>
                  <div>
                    <Label>Peso (kg) <span className="text-xs text-gray-400">(auto preenchido)</span></Label>
                    <input type="number" step="0.1" className="w-full border rounded-lg p-2 mt-1"
                      placeholder="Peso do animal"
                      value={formData.peso_total}
                      onChange={e => setFormData({ ...formData, peso_total: e.target.value })} />
                  </div>
                </>
              )}

              <div>
                <Label>Forma de Pagamento</Label>
                <select className="w-full border rounded-lg p-2 mt-1"
                  value={formData.forma_pagamento}
                  onChange={e => setFormData({ ...formData, forma_pagamento: e.target.value })}>
                  <option value="">Selecione...</option>
                  {formasPagamento.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <Label>Descrição *</Label>
                <textarea className="w-full border rounded-lg p-2 mt-1" rows="2"
                  placeholder="Descreva a receita/venda..."
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })} required />
              </div>
            </div>

            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Registrar Receita
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Histórico ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Histórico de Receitas e Vendas
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
              <option value="todas">Todas as Categorias</option>
              {categorias.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {receitasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhuma receita encontrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Categoria</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Descrição</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Comprador</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {receitasFiltradas.map(receita => {
                    const cat = categorias.find(c => c.value === receita.categoria);
                    return (
                      <tr key={receita.id} className="border-t hover:bg-emerald-50 transition-colors">
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {new Date(receita.data).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cat?.cor || 'bg-gray-100 text-gray-800'}>
                            {cat?.label || receita.categoria_display || receita.categoria}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm max-w-[200px]">
                          {limparDescricao(receita.descricao)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {extrairComprador(receita.descricao)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                          + AOA {formatAOA(receita.valor)}
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