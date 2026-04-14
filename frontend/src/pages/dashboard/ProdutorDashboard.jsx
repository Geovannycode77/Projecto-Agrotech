import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PawPrint, 
  Heart, 
  Utensils, 
  DollarSign, 
  FileText, 
  Bell,
  AlertTriangle,
  Plus,
  Eye,
  Calendar,
  Activity,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { produtorService } from '../../services/ProdutorService';
import CadastroAnimais from './components/CadastroAnimais';
import GestaoFinanceira from './components/GestaoFinanceira';
import AlimentacaoGado from './components/AlimentacaoGado';
import RelatorioProducao from './components/RelatorioProducao';
import AlertasNotificacoes from './components/AlertasNotificacoes';

function ProdutorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [animais, setAnimais] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [resumoFinanceiro, setResumoFinanceiro] = useState(null);
  const [relatorioProducao, setRelatorioProducao] = useState(null);
  const [atividadesRecentes, setAtividadesRecentes] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const carregarDadosDashboard = async () => {
    setLoading(true);
    try {
      const dashboard = await produtorService.getDashboard();
      setDashboardData(dashboard.data);

      const animaisData = await produtorService.getAnimais({ limit: 5, status: 'ativo' });
      setAnimais(animaisData.data.results || animaisData.data);

      const alertasData = await produtorService.getAlertas();
      setAlertas(alertasData.data.filter(alerta => !alerta.lido));

      const financeiroData = await produtorService.getResumoFinanceiro('ultimo_mes');
      setResumoFinanceiro(financeiroData.data);

      const relatorioData = await produtorService.getRelatoriosProducao({ periodo: 'ultimo_mes' });
      setRelatorioProducao(relatorioData.data);

      const atividades = await produtorService.getAtividadesRecentes();
      setAtividadesRecentes(atividades.data);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    setDashboardData({
      rebanho: {
        total: 156,
        por_especie: { bovino: 120, suino: 25, caprino: 11 },
        por_status: { ativo: 142, doente: 8, vendido: 4, morto: 2 },
        machos: 68,
        femeas: 88,
        novos_ultimo_mes: 12
      },
      alimentacao: {
        consumo_mensal: 4850,
        estoque_atual: 3200,
        custo_mensal: 8750
      }
    });

    setAnimais([
      { id: 1, brinco: 'BR-001', nome: 'Mimosa', especie: 'bovino', sexo: 'F', peso_atual: 450, status: 'ativo' },
      { id: 2, brinco: 'BR-002', nome: 'Trovão', especie: 'bovino', sexo: 'M', peso_atual: 520, status: 'ativo' },
      { id: 3, brinco: 'BR-003', nome: 'Pintada', especie: 'suino', sexo: 'F', peso_atual: 180, status: 'ativo' },
      { id: 4, brinco: 'BR-004', nome: 'Caramelo', especie: 'bovino', sexo: 'M', peso_atual: 380, status: 'doente' },
      { id: 5, brinco: 'BR-005', nome: 'Branquinha', especie: 'caprino', sexo: 'F', peso_atual: 65, status: 'ativo' }
    ]);

    setAlertas([
      { id: 1, tipo: 'saude', mensagem: 'Vacinação do rebanho programada para amanhã', prioridade: 'alta', lido: false },
      { id: 2, tipo: 'alimentacao', mensagem: 'Estoque de ração está baixo (15% restante)', prioridade: 'media', lido: false },
      { id: 3, tipo: 'reproducao', mensagem: '3 animais prontos para reprodução', prioridade: 'alta', lido: false }
    ]);

    setResumoFinanceiro({
      total_receitas: 45230,
      total_despesas: 28750,
      saldo: 16480,
      receitas_por_categoria: { Venda: 35000, Outros: 10230 },
      despesas_por_categoria: { Ração: 12000, Veterinário: 5000, Medicamentos: 3000, Outros: 8750 }
    });

    setRelatorioProducao({
      periodo: 'Último Mês',
      total_animais: 156,
      nascimentos: 8,
      mortes: 2,
      vendas: 4,
      peso_medio: 320,
      taxa_mortalidade: 1.28,
      natalidade: 5.13
    });

    setAtividadesRecentes([
      { id: 1, tipo: 'Cadastro', descricao: 'Novo animal cadastrado: Mimosa', data: '2026-03-15T10:30:00', usuario: 'João Silva' },
      { id: 2, tipo: 'Saúde', descricao: 'Vacinação em massa aplicada', data: '2026-03-14T14:20:00', usuario: 'Maria Santos' },
      { id: 3, tipo: 'Financeiro', descricao: 'Venda de 2 bovinos realizada', data: '2026-03-13T09:15:00', usuario: 'Carlos Lima' }
    ]);
  };

  const statsCards = [
    {
      title: 'Total de Animais',
      value: dashboardData?.rebanho?.total || 0,
      icon: PawPrint,
      change: `+${dashboardData?.rebanho?.novos_ultimo_mes || 0} este mês`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Animais em Tratamento',
      value: dashboardData?.rebanho?.por_status?.doente || 0,
      icon: Heart,
      change: `${dashboardData?.rebanho?.por_status?.doente || 0} precisam de atenção`,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Consumo de Ração (Mês)',
      value: `${dashboardData?.alimentacao?.consumo_mensal || 0} kg`,
      icon: Utensils,
      change: `Estoque: ${dashboardData?.alimentacao?.estoque_atual || 0} kg`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Saldo Atual',
      value: `R$ ${resumoFinanceiro?.saldo?.toLocaleString() || 0}`,
      icon: DollarSign,
      change: `Receita: R$ ${resumoFinanceiro?.total_receitas?.toLocaleString() || 0}`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      ativo: 'bg-emerald-100 text-emerald-800',
      doente: 'bg-red-100 text-red-800',
      vendido: 'bg-gray-100 text-gray-800',
      morto: 'bg-black/10 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Painel do Produtor</h1>
            <p className="text-gray-500 mt-1">
              Bem-vindo, {user?.nome || user?.email?.split('@')[0]} | Gerencie seu rebanho de forma eficiente
            </p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1">
            <Activity className="h-4 w-4 mr-1" />
            Pecuária
          </Badge>
        </div>
      </header>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2 bg-white p-1 rounded-lg shadow-sm">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="animais" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            Cadastro de Animais
          </TabsTrigger>
          <TabsTrigger value="alimentacao" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            Alimentação
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            Gestão Financeira
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="alertas" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white relative">
            Alertas
            {alertas.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {alertas.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-emerald-600 mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Últimos Animais Cadastrados</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setAbaAtiva('animais')} className="text-emerald-600">
                  Ver todos <ArrowUp className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {animais.map((animal) => (
                    <div key={animal.id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <PawPrint className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold">{animal.nome}</span>
                          <span className="text-xs text-gray-500">({animal.brinco})</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {animal.especie} • {animal.sexo === 'M' ? '♂' : '♀'} • {animal.peso_atual} kg
                        </div>
                      </div>
                      <Badge className={getStatusColor(animal.status)}>
                        {animal.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium">Receitas</span>
                    </div>
                    <span className="text-xl font-bold text-emerald-600">
                      R$ {resumoFinanceiro?.total_receitas?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Despesas</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">
                      R$ {resumoFinanceiro?.total_despesas?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-700" />
                      <span className="font-medium">Saldo</span>
                    </div>
                    <span className="text-xl font-bold text-emerald-700">
                      R$ {resumoFinanceiro?.saldo?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatório de Produção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {relatorioProducao?.nascimentos || 0}
                    </div>
                    <div className="text-sm text-gray-600">Nascimentos</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {relatorioProducao?.mortes || 0}
                    </div>
                    <div className="text-sm text-gray-600">Mortes</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {relatorioProducao?.vendas || 0}
                    </div>
                    <div className="text-sm text-gray-600">Vendas</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {relatorioProducao?.peso_medio || 0} kg
                    </div>
                    <div className="text-sm text-gray-600">Peso Médio</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {atividadesRecentes.map((atividade) => (
                    <div key={atividade.id} className="flex items-start gap-3 p-2 hover:bg-emerald-50 rounded transition-colors">
                      <Calendar className="h-4 w-4 text-emerald-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{atividade.descricao}</p>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{atividade.tipo}</span>
                          <span>{new Date(atividade.data).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="animais">
          <CadastroAnimais />
        </TabsContent>

        <TabsContent value="alimentacao">
          <AlimentacaoGado />
        </TabsContent>

        <TabsContent value="financeiro">
          <GestaoFinanceira />
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatorioProducao />
        </TabsContent>

        <TabsContent value="alertas">
          <AlertasNotificacoes alertas={alertas} onAtualizar={carregarDadosDashboard} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// VERIFIQUE SE A EXPORTAÇÃO ESTÁ ASSIM:
export default ProdutorDashboard;