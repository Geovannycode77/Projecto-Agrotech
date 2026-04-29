import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  PieChart,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Plus,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  Loader2
} from 'lucide-react';
import { gestorService } from '@/services/gestorService';
import RegistroReceitas from './components/RegistroReceitas';
import RegistroDespesas from './components/RegistroDespesas';
import RelatorioFinanceiro from './components/RelatorioFinanceiro';
import AnaliseLucros from './components/AnaliseLucros';
import PerfilGestor from './components/PerfilGestor';

function GestorFinanceiroDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({
    receitas_mes: 0,
    despesas_mes: 0,
    lucro_mes: 0,
    receitas_ano: 0,
    despesas_ano: 0,
    lucro_ano: 0,
    margem_lucro: 0,
    ultimas_vendas: 0,
    ultimas_despesas: 0,
    metas: {
      receita_meta: 0,
      despesa_meta: 0,
      lucro_meta: 0
    }
  });
  const [ultimasAtividades, setUltimasAtividades] = useState([]);

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const carregarDadosDashboard = async () => {
    setLoading(true);
    try {
      const data = await gestorService.getDashboard();
      setDashboardData({
        receitas_mes: data.receitas_mes || 0,
        despesas_mes: data.despesas_mes || 0,
        lucro_mes: data.lucro_mes || 0,
        receitas_ano: data.receitas_ano || 0,
        despesas_ano: data.despesas_ano || 0,
        lucro_ano: data.lucro_ano || 0,
        margem_lucro: data.margem_lucro || 0,
        ultimas_vendas: data.ultimas_vendas || 0,
        ultimas_despesas: data.ultimas_despesas || 0,
        metas: {
          receita_meta: data.metas?.receita_meta || 0,
          despesa_meta: data.metas?.despesa_meta || 0,
          lucro_meta: data.metas?.lucro_meta || 0
        }
      });
      
      const atividades = await gestorService.getUltimasAtividades();
      setUltimasAtividades(atividades.results || atividades);
      
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
    { id: 'receitas', label: 'Registro de Receitas', icon: TrendingUp },
    { id: 'despesas', label: 'Registro de Despesas', icon: TrendingDown },
    { id: 'relatorios', label: 'Relatório Financeiro', icon: FileText },
    { id: 'analise', label: 'Análise de Lucros', icon: PieChart },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  const statsCards = [
    {
      title: 'Receitas do Mês',
      value: `AOA ${dashboardData.receitas_mes.toLocaleString()}`,
      icon: TrendingUp,
      change: '0% em relação ao mês anterior',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Despesas do Mês',
      value: `AOA ${dashboardData.despesas_mes.toLocaleString()}`,
      icon: TrendingDown,
      change: '0% em relação ao mês anterior',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Lucro do Mês',
      value: `AOA ${dashboardData.lucro_mes.toLocaleString()}`,
      icon: Wallet,
      change: `Margem: ${dashboardData.margem_lucro}%`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    {
      title: 'Margem de Lucro',
      value: `${dashboardData.margem_lucro}%`,
      icon: PieChart,
      change: '0% em relação ao mês anterior',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center">
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
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AgroTech</h1>
              <p className="text-xs text-gray-500">Gestor Financeiro</p>
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
                  ? "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`h-5 w-5 ${abaAtiva === item.id ? "text-amber-600" : "text-gray-500"}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-gray-50">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.nome || user?.email?.split('@')[0] || 'Gestor'}
              </p>
              <p className="text-xs text-gray-500">Gestor Financeiro</p>
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
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">AgroTech</h1>
                  <p className="text-xs text-gray-500">Gestor Financeiro</p>
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
                      ? "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 shadow-sm"
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
          {/* Header da Página */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Painel do Gestor Financeiro</h1>
            <p className="text-gray-500 text-sm mt-1">
              Olá {user?.nome || user?.email?.split('@')[0] || 'Gestor'} - Gerencie as finanças da fazenda
            </p>
          </div>

          {/* Conteúdo da Aba Dashboard */}
          {abaAtiva === 'dashboard' && (
            <>
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
                      <p className="text-xs text-amber-600 mt-1">{stat.change}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Resumo Anual */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100">Receitas do Ano</p>
                        <p className="text-3xl font-bold">AOA {dashboardData.receitas_ano.toLocaleString()}</p>
                      </div>
                      <ArrowUpRight className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-red-500 to-rose-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100">Despesas do Ano</p>
                        <p className="text-3xl font-bold">AOA {dashboardData.despesas_ano.toLocaleString()}</p>
                      </div>
                      <ArrowDownRight className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-100">Lucro do Ano</p>
                        <p className="text-3xl font-bold">AOA {dashboardData.lucro_ano.toLocaleString()}</p>
                      </div>
                      <Wallet className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Metas e Progresso */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-amber-600" />
                      Metas do Mês
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Meta de Receita</span>
                          <span>AOA {dashboardData.receitas_mes.toLocaleString()} / AOA {dashboardData.metas.receita_meta.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${Math.min((dashboardData.receitas_mes / dashboardData.metas.receita_meta) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Meta de Despesa</span>
                          <span>AOA {dashboardData.despesas_mes.toLocaleString()} / AOA {dashboardData.metas.despesa_meta.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: `${Math.min((dashboardData.despesas_mes / dashboardData.metas.despesa_meta) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Meta de Lucro</span>
                          <span>AOA {dashboardData.lucro_mes.toLocaleString()} / AOA {dashboardData.metas.lucro_meta.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${Math.min((dashboardData.lucro_mes / dashboardData.metas.lucro_meta) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-amber-600" />
                      Últimas Atividades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ultimasAtividades.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">Nenhuma atividade recente</div>
                    ) : (
                      <div className="space-y-3">
                        {ultimasAtividades.map((atividade, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-lg transition-colors">
                            <div className={`p-2 rounded-full ${atividade.tipo === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                              {atividade.tipo === 'receita' ? 
                                <TrendingUp className="h-4 w-4 text-green-600" /> : 
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              }
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{atividade.descricao}</p>
                              <p className="text-xs text-gray-500">
                                {atividade.tipo === 'receita' ? '+' : '-'} AOA {atividade.valor.toLocaleString()} • {new Date(atividade.data).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Outras Abas */}
          {abaAtiva === 'receitas' && <RegistroReceitas />}
          {abaAtiva === 'despesas' && <RegistroDespesas />}
          {abaAtiva === 'relatorios' && <RelatorioFinanceiro />}
          {abaAtiva === 'analise' && <AnaliseLucros />}
          {abaAtiva === 'perfil' && <PerfilGestor />}
        </div>
      </main>
    </div>
  );
}

export default GestorFinanceiroDashboard;