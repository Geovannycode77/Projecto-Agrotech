import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Utensils, 
  Package, 
  TrendingDown, 
  Plus, 
  Search,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  PiggyBank,
  Settings,
  Edit,
  Trash2
} from 'lucide-react';
import { produtorService } from '@/services/produtorService';

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
  const [formData, setFormData] = useState({
    tipo: '',
    quantidade_sacos: '',
    animais: '',
    observacoes: ''
  });
  const [totalAnimais, setTotalAnimais] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Buscar dados do estoque
      const estoqueData = await produtorService.getEstoqueRacao();
      setEstoque(estoqueData);
      
      // Buscar consumo diário
      const consumoData = await produtorService.getConsumoDiario();
      setConsumoDiario(consumoData);
      
      // Buscar histórico de alimentações
      const alimentacoesData = await produtorService.getAlimentacoes({ limit: 50 });
      setAlimentacoes(alimentacoesData.results || alimentacoesData);
      
      // Buscar total de animais
      const animaisData = await produtorService.getAnimais({ status: 'ativo' });
      setTotalAnimais(animaisData.count || animaisData.results?.length || 0);
      
    } catch (error) {
      console.error('Erro ao carregar dados de alimentação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const racaSelecionada = estoque.racas.find(r => r.nome === formData.tipo);
      const quantidade_kg = formData.quantidade_sacos * (racaSelecionada?.peso_por_saco || 50);
      
      const novaAlimentacao = await produtorService.registrarAlimentacao({
        tipo: formData.tipo,
        quantidade_sacos: parseInt(formData.quantidade_sacos),
        quantidade_kg: quantidade_kg,
        animais: formData.animais,
        observacoes: formData.observacoes,
        data: new Date().toISOString().split('T')[0]
      });
      
      setAlimentacoes([novaAlimentacao, ...alimentacoes]);
      
      // Recarregar dados de estoque e consumo
      await carregarDados();
      
      setShowForm(false);
      setFormData({ tipo: '', quantidade_sacos: '', animais: '', observacoes: '' });
      
    } catch (error) {
      console.error('Erro ao registrar alimentação:', error);
    }
  };

  const calcularAutonomia = (quantidade_sacos, consumo_diario_sacos) => {
    if (consumo_diario_sacos === 0 || !consumo_diario_sacos) return 0;
    return Math.floor(quantidade_sacos / consumo_diario_sacos);
  };

  const calcularCustoMensal = () => {
    return consumoDiario.custo_diario * 30;
  };

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
                <p className="text-emerald-100">Consumo Diário</p>
                <p className="text-3xl font-bold">{consumoDiario.total || 0} kg</p>
                <p className="text-sm text-emerald-100">{consumoDiario.sacos_por_dia || 0} sacos/dia</p>
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
                  {estoque.racas?.reduce((sum, r) => sum + (r.quantidade_sacos || 0), 0) || 0} sacos
                </p>
                <p className="text-sm text-blue-100">
                  {estoque.racas?.reduce((sum, r) => sum + ((r.quantidade_sacos || 0) * (r.peso_por_saco || 0)), 0) || 0} kg
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
                <p className="text-amber-100">Autonomia Estimada</p>
                <p className="text-3xl font-bold">
                  {calcularAutonomia(
                    estoque.racas?.reduce((sum, r) => sum + (r.quantidade_sacos || 0), 0) || 0,
                    consumoDiario.sacos_por_dia || 1
                  )} dias
                </p>
                <p className="text-sm text-amber-100">Com estoque atual</p>
              </div>
              <Calendar className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Custo Mensal</p>
                <p className="text-3xl font-bold">AOA {calcularCustoMensal().toLocaleString()}</p>
                <p className="text-sm text-purple-100">AOA {consumoDiario.custo_diario?.toLocaleString() || 0}/dia</p>
              </div>
              <DollarSign className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estoque por Tipo de Ração */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            Estoque de Ração por Tipo
          </CardTitle>
          <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Registrar Consumo
          </Button>
        </CardHeader>
        <CardContent>
          {estoque.racas?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum tipo de ração cadastrado.
            </div>
          ) : (
            <div className="space-y-4">
              {estoque.racas?.map((raca) => {
                const autonomia = calcularAutonomia(raca.quantidade_sacos || 0, (consumoDiario.sacos_por_dia || 0) / (estoque.racas?.length || 1));
                const isLowStock = (raca.quantidade_sacos || 0) < 10;
                
                return (
                  <div key={raca.id} className="border rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{raca.nome}</h3>
                        <p className="text-sm text-gray-500">{raca.peso_por_saco}kg/saco • AOA {raca.preco_por_saco}/saco</p>
                      </div>
                      {isLowStock && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Estoque Baixo
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Sacos Disponíveis</p>
                        <p className="text-xl font-bold text-gray-800">{raca.quantidade_sacos || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Peso Total</p>
                        <p className="text-xl font-bold text-gray-800">{(raca.quantidade_sacos || 0) * (raca.peso_por_saco || 0)} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Autonomia</p>
                        <p className={`text-xl font-bold ${autonomia < 7 ? 'text-red-600' : 'text-gray-800'}`}>
                          {autonomia} dias
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Valor Total</p>
                        <p className="text-xl font-bold text-gray-800">AOA {((raca.quantidade_sacos || 0) * (raca.preco_por_saco || 0)).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(((raca.quantidade_sacos || 0) / 60) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consumo por Animal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-emerald-600" />
              Consumo por Animal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Consumo médio por animal/dia</span>
                  <span className="text-xl font-bold text-emerald-600">{consumoDiario.por_animal || 0} kg</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Custo por animal/dia</span>
                  <span className="text-xl font-bold text-emerald-600">AOA {totalAnimais > 0 ? ((consumoDiario.custo_diario || 0) / totalAnimais).toFixed(2) : '0.00'}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Custo por animal/mês</span>
                  <span className="text-xl font-bold text-emerald-600">AOA {totalAnimais > 0 ? (((consumoDiario.custo_diario || 0) / totalAnimais) * 30).toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Estatísticas de Consumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border-b">
                <span className="text-gray-600">Total de animais alimentados</span>
                <span className="font-bold">{totalAnimais} cabeças</span>
              </div>
              <div className="flex justify-between items-center p-3 border-b">
                <span className="text-gray-600">Consumo total do mês</span>
                <span className="font-bold">{((consumoDiario.total || 0) * 30).toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between items-center p-3 border-b">
                <span className="text-gray-600">Custo total do mês</span>
                <span className="font-bold text-red-600">AOA {calcularCustoMensal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                <span className="text-gray-600">Custo anual estimado</span>
                <span className="font-bold text-emerald-600">AOA {(calcularCustoMensal() * 12).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    required
                  >
                    <option value="">Selecione...</option>
                    {estoque.racas?.map(raca => (
                      <option key={raca.id} value={raca.nome}>{raca.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Quantidade (sacos)</Label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 3"
                    value={formData.quantidade_sacos}
                    onChange={(e) => setFormData({...formData, quantidade_sacos: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Animais / Lote</Label>
                  <input 
                    type="text"
                    className="w-full border rounded-md p-2"
                    placeholder="Ex: Todos os bovinos, Estábulo Norte"
                    value={formData.animais}
                    onChange={(e) => setFormData({...formData, animais: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Input 
                    placeholder="Observações adicionais"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
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
                    <th className="px-4 py-3 text-left text-sm font-semibold">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Quantidade</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Sacos</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Animais</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {alimentacoes.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-emerald-50 transition-colors">
                      <td className="px-4 py-3">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3 font-medium">{item.tipo}</td>
                      <td className="px-4 py-3">{item.quantidade_kg} kg</td>
                      <td className="px-4 py-3">{item.quantidade_sacos} sacos</td>
                      <td className="px-4 py-3">{item.animais}</td>
                      <td className="px-4 py-3 text-gray-500">{item.observacoes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas de Estoque Baixo */}
      {estoque.racas?.some(r => (r.quantidade_sacos || 0) < 10) && (
        <Card className="border-l-4 border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Atenção: Estoque Baixo!</p>
                <p className="text-sm text-red-600">
                  {estoque.racas.filter(r => (r.quantidade_sacos || 0) < 10).map(r => r.nome).join(', ')} está com estoque baixo.
                  Recomendamos fazer o pedido de reposição em breve.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}