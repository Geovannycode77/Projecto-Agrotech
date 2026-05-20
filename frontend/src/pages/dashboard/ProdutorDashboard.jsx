import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PawPrint, 
  Heart, 
  Utensils, 
  DollarSign, 
  FileText, 
  Bell,
  Calendar,
  Activity,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  Syringe,
  Loader2
} from 'lucide-react';
import { produtorService } from '@/services/ProdutorService';
import CadastroAnimais from './components/CadastroAnimais';
import GestaoFinanceira from './components/GestaoFinanceira';
import AlimentacaoGado from './components/AlimentacaoGado';
import RelatorioProducao from './components/RelatorioProducao';
import AlertasNotificacoes from './components/AlertasNotificacoes';
import PerfilProdutor from './components/PerfilProdutor';
import AlertasLembretesSaude from './components/AlertasLembretesSaude'; 

function ProdutorDashboard() {
  const { user, perfil, logout } = useAuth();  // Adicione perfil aqui
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    rebanho: { total: 0, novos_ultimo_mes: 0 },
    alimentacao: { consumo_mensal: 0, estoque_atual: 0 }
  });
  const [animais, setAnimais] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    total_receitas: 0,
    total_despesas: 0,
    saldo: 0
  });
  const [relatorioProducao, setRelatorioProducao] = useState({
    nascimentos: 0,
    mortes: 0,
    vendas: 0,
    peso_medio: 0
  });
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const carregarDadosDashboard = async () => {
    setLoading(true);
    try {
      // Dashboard principal
      const dashboard = await produtorService.getDashboard();
      setDashboardData({
        rebanho: {
          total: dashboard.rebanho?.total || 0,
          novos_ultimo_mes: dashboard.rebanho?.novos_ultimo_mes || 0
        },
        alimentacao: {
          consumo_mensal: dashboard.alimentacao?.consumo_mensal || 0,
          estoque_atual: dashboard.alimentacao?.estoque_atual || 0
        }
      });
      
      // Últimos animais
      const animaisData = await produtorService.getUltimosAnimais(5);
      setAnimais(animaisData);
      
      // Alertas não lidos
      const alertasData = await produtorService.getAlertas();
      setAlertas(alertasData.filter(alerta => !alerta.lido));
      
      // Resumo financeiro
      const financeiroData = await produtorService.getResumoFinanceiro('ultimo_mes');
      setResumoFinanceiro({
        total_receitas: financeiroData.total_receitas || 0,
        total_despesas: financeiroData.total_despesas || 0,
        saldo: financeiroData.saldo || 0
      });
      
      // Relatório de produção
      // Em vez de gerarRelatorio, use getRelatoriosProducao
      const relatorioData = await produtorService.getRelatoriosProducao({ periodo: 'ultimo_mes' });
      setRelatorioProducao({
        nascimentos: relatorioData.nascimentos || 0,
        mortes: relatorioData.mortes || 0,
        vendas: relatorioData.vendas || 0,
        peso_medio: relatorioData.peso_medio || 0
      });
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'animais', label: 'Animais', icon: PawPrint },
    { id: 'alimentacao', label: 'Alimentação', icon: Utensils },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    { id: 'alertas', label: 'Alertas', icon: Bell },
    { id: 'lembretes', label: 'Lembretes de Saúde', icon: Syringe },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  const statsCards = [
    {
      title: 'Total de Animais',
      value: dashboardData.rebanho.total,
      icon: PawPrint,
      change: `+${dashboardData.rebanho.novos_ultimo_mes} este mês`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Consumo de Ração',
      value: `${dashboardData.alimentacao.consumo_mensal} kg`,
      icon: Utensils,
      change: `Estoque: ${dashboardData.alimentacao.estoque_atual} kg`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Saldo Atual',
      value: `AOA ${resumoFinanceiro.saldo.toLocaleString()}`,
      icon: DollarSign,
      change: `Receita: AOA ${resumoFinanceiro.total_receitas.toLocaleString()}`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Alertas',
      value: alertas.length,
      icon: Bell,
      change: `${alertas.filter(a => a.prioridade === 'alta').length} urgentes`,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
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

  // Obter o nome para exibição
  const getNomeExibicao = () => {
    if (perfil?.nome_completo) return perfil.nome_completo;
    if (user?.nome) return user.nome;
    if (user?.email) return user.email.split('@')[0];
    return 'Produtor';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-gray-800">AgroTech</span>
          </div>
          <div className="w-8"></div>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-sm shadow-xl z-20">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AgroTech</h1>
              <p className="text-xs text-gray-500">Produtor Rural</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setAbaAtiva(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                abaAtiva === item.id
                  ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`h-5 w-5 ${abaAtiva === item.id ? "text-emerald-600" : "text-gray-500"}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-gray-50">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">
                {getNomeExibicao()}
              </p>
              <p className="text-xs text-gray-500">Produtor Rural</p>
              {perfil?.fazenda_nome && (
                <p className="text-xs text-emerald-600 mt-1">
                  🏠 {perfil.fazenda_nome}
                </p>
              )}
            </div>
          </div>
          <Button onClick={handleLogout} className="w-full justify-start gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700">
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-50">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">AgroTech</h1>
                  <p className="text-xs text-gray-500">Produtor Rural</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setAbaAtiva(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    abaAtiva === item.id
                      ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
              <Button onClick={handleLogout} className="w-full justify-start gap-2 bg-red-50 text-red-600 hover:bg-red-100">
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header da Página com informações do perfil */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Painel do Produtor</h1>
            <p className="text-gray-500 text-sm mt-1">
              Bem-vindo, {getNomeExibicao()}
            </p>
            {perfil?.fazenda_nome && (
              <p className="text-sm text-emerald-600 mt-1">
                🏠 Fazenda: {perfil.fazenda_nome}
              </p>
            )}
            {perfil?.telefone && (
              <p className="text-xs text-gray-400 mt-1">
                📞 Telefone: +244 {perfil.telefone}
              </p>
            )}
          </div>

          {/* Conteúdo condicional baseado na aba ativa */}
          {abaAtiva === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {statsCards.map((stat, index) => (
                  <Card key={index} className="hover:shadow-xl transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
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

              {/* Indicadores Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100">Produção do Mês</p>
                        <p className="text-3xl font-bold">+{relatorioProducao.nascimentos}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-100">Peso Médio</p>
                        <p className="text-3xl font-bold">{relatorioProducao.peso_medio} kg</p>
                      </div>
                      <Activity className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Taxa de Natalidade</p>
                        <p className="text-3xl font-bold">
                          {relatorioProducao.nascimentos > 0 ? ((relatorioProducao.nascimentos / dashboardData.rebanho.total) * 100).toFixed(2) : 0}%
                        </p>
                      </div>
                      <Heart className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conteúdo Principal do Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Últimos Animais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {animais.slice(0, 3).map((animal) => (
                      <div key={animal.id} className="flex items-center justify-between border-b pb-3 mb-3">
                        <div>
                          <p className="font-semibold">{animal.nome || animal.brinco}</p>
                          <p className="text-sm text-gray-500">{animal.especie}</p>
                        </div>
                        <Badge className={getStatusColor(animal.status)}>{animal.status}</Badge>
                      </div>
                    ))}
                    {animais.length === 0 && (
                      <div className="text-center py-4 text-gray-500">Nenhum animal cadastrado</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumo Financeiro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-emerald-50 rounded-lg">
                        <span>Receitas</span>
                        <span className="font-bold text-emerald-600">AOA {resumoFinanceiro.total_receitas.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                        <span>Despesas</span>
                        <span className="font-bold text-red-600">AOA {resumoFinanceiro.total_despesas.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-emerald-100 rounded-lg">
                        <span>Saldo</span>
                        <span className="font-bold text-emerald-700">AOA {resumoFinanceiro.saldo.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Outras abas */}
          {abaAtiva === 'animais' && <CadastroAnimais />}
          {abaAtiva === 'alimentacao' && <AlimentacaoGado />}
          {abaAtiva === 'financeiro' && <GestaoFinanceira />}
          {abaAtiva === 'relatorios' && <RelatorioProducao />}
          {abaAtiva === 'alertas' && <AlertasNotificacoes alertas={alertas} onAtualizar={carregarDadosDashboard} />}
          {abaAtiva === 'lembretes' && <AlertasLembretesSaude />}
          {abaAtiva === 'perfil' && <PerfilProdutor />}
        </div>
      </main>
    </div>
  );
}

export default ProdutorDashboard;