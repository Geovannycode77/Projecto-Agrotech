import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Plus, CheckCircle, PawPrint, Package, DollarSign, Search, Filter, Truck, PiggyBank, Loader2 } from 'lucide-react';
import { gestorService } from '@/services/gestorService';

export default function RegistroReceitas() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receitas, setReceitas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [formData, setFormData] = useState({
    categoria: '',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    comprador: '',
    animais_vendidos: '',
    quantidade_animais: '',
    peso_total: '',
    forma_pagamento: ''
  });
  const [success, setSuccess] = useState(false);

  const categorias = [
    { value: 'Venda de Gado', label: 'Venda de Gado', icon: PawPrint, cor: 'bg-emerald-100 text-emerald-800' },
    { value: 'Venda de Leite', label: 'Venda de Leite', icon: Package, cor: 'bg-blue-100 text-blue-800' },
    { value: 'Venda de Insumos', label: 'Venda de Insumos', icon: Truck, cor: 'bg-purple-100 text-purple-800' },
    { value: 'Outros', label: 'Outras Receitas', icon: DollarSign, cor: 'bg-gray-100 text-gray-800' },
  ];

  useEffect(() => {
    carregarReceitas();
  }, []);

  const carregarReceitas = async () => {
    setLoading(true);
    try {
      const data = await gestorService.getReceitas();
      setReceitas(data.results || data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const novaReceita = await gestorService.registrarReceita({
        ...formData,
        valor: parseFloat(formData.valor),
        quantidade_animais: formData.quantidade_animais ? parseInt(formData.quantidade_animais) : null,
        peso_total: formData.peso_total ? parseFloat(formData.peso_total) : null
      });
      
      setReceitas([novaReceita, ...receitas]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({ 
        categoria: '', 
        descricao: '', 
        valor: '', 
        data: new Date().toISOString().split('T')[0], 
        comprador: '', 
        animais_vendidos: '', 
        quantidade_animais: '', 
        peso_total: '', 
        forma_pagamento: '' 
      });
      
    } catch (error) {
      console.error('Erro ao registrar receita:', error);
      alert('Erro ao registrar receita. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const receitasFiltradas = receitas.filter(r => {
    const matchSearch = r.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (r.comprador && r.comprador.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategoria = filtroCategoria === 'todas' || r.categoria === filtroCategoria;
    return matchSearch && matchCategoria;
  });

  const totalReceitas = receitas.reduce((sum, r) => sum + (r.valor || 0), 0);
  const vendasGado = receitas.filter(r => r.categoria === 'Venda de Gado');
  const totalVendasGado = vendasGado.reduce((sum, r) => sum + (r.valor || 0), 0);
  const totalAnimaisVendidos = vendasGado.reduce((sum, r) => sum + (r.quantidade_animais || 0), 0);
  const precoMedioAnimal = totalAnimaisVendidos > 0 ? totalVendasGado / totalAnimaisVendidos : 0;
  const receitasPorCategoria = categorias.map(cat => ({
    ...cat,
    total: receitas.filter(r => r.categoria === cat.value).reduce((sum, r) => sum + (r.valor || 0), 0)
  }));

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
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">Total de Receitas</p>
                <p className="text-2xl font-bold">AOA {totalReceitas.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
        {receitasPorCategoria.slice(0, 3).map((cat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${cat.cor.split(' ')[0]}`}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{cat.label}</p>
                  <p className="text-xl font-bold">AOA {cat.total.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards de Vendas de Gado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-full">
                <PawPrint className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Vendas de Gado</p>
                <p className="text-xl font-bold">AOA {totalVendasGado.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Animais Vendidos</p>
                <p className="text-xl font-bold">{totalAnimaisVendidos} cabeças</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Preço Médio</p>
                <p className="text-xl font-bold">AOA {precoMedioAnimal.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário */}
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
              <CheckCircle className="h-5 w-5" />
              Receita registrada com sucesso!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Categoria *</Label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  required
                >
                  <option value="">Selecione...</option>
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
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
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Data *</Label>
                <input 
                  type="date" 
                  className="w-full border rounded-lg p-2"
                  value={formData.data}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Comprador</Label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg p-2" 
                  placeholder="Nome do comprador"
                  value={formData.comprador}
                  onChange={(e) => setFormData({...formData, comprador: e.target.value})}
                />
              </div>
              
              {/* Campos específicos para venda de gado */}
              {formData.categoria === 'Venda de Gado' && (
                <>
                  <div>
                    <Label>Animais Vendidos</Label>
                    <input 
                      type="text" 
                      className="w-full border rounded-lg p-2" 
                      placeholder="Ex: Boi 123, Boi 124"
                      value={formData.animais_vendidos}
                      onChange={(e) => setFormData({...formData, animais_vendidos: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Quantidade de Animais</Label>
                    <input 
                      type="number" 
                      className="w-full border rounded-lg p-2" 
                      placeholder="Número de cabeças"
                      value={formData.quantidade_animais}
                      onChange={(e) => setFormData({...formData, quantidade_animais: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Peso Total (kg)</Label>
                    <input 
                      type="number" 
                      className="w-full border rounded-lg p-2" 
                      placeholder="Peso total dos animais"
                      value={formData.peso_total}
                      onChange={(e) => setFormData({...formData, peso_total: e.target.value})}
                    />
                  </div>
                </>
              )}
              
              <div>
                <Label>Forma de Pagamento</Label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={formData.forma_pagamento}
                  onChange={(e) => setFormData({...formData, forma_pagamento: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  <option>À vista</option>
                  <option>Parcelado</option>
                  <option>Boleto</option>
                  <option>Pix</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label>Descrição *</Label>
                <textarea 
                  className="w-full border rounded-lg p-2" 
                  rows="2" 
                  placeholder="Descreva a receita/venda..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Registrar Receita
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Receitas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Histórico de Receitas e Vendas
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border rounded-lg text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="border rounded-lg px-3 py-2 text-sm"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="todas">Todas Categorias</option>
              {categorias.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {receitasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma receita encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-4 py-3 text-left">Categoria</th>
                    <th className="px-4 py-3 text-left">Descrição</th>
                    <th className="px-4 py-3 text-left">Comprador</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {receitasFiltradas.map((receita) => {
                    const categoria = categorias.find(c => c.value === receita.categoria);
                    return (
                      <tr key={receita.id} className="border-t hover:bg-emerald-50 transition-colors">
                        <td className="px-4 py-3">{new Date(receita.data).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3">
                          <Badge className={categoria?.cor}>
                            {receita.categoria}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {receita.descricao}
                          {receita.animais_vendidos && (
                            <p className="text-xs text-gray-500 mt-1">Animais: {receita.animais_vendidos}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">{receita.comprador || '-'}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">+ AOA {receita.valor.toLocaleString()}</td>
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