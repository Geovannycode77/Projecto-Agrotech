import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  Clock,
  Calendar,
  PawPrint,
  Utensils,
  AlertTriangle,
  User,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Weight,
  Baby,
  Loader2
} from 'lucide-react';
import { funcionarioService } from '@/services/funcionarioService';
import ListaTarefas from './components/ListaTarefas';
import RegistroAlimentacao from './components/RegistroAlimentacao';
import RegistroOcorrencias from './components/RegistroOcorrencias';
import AtualizarAnimais from './components/AtualizarAnimais';
import PerfilFuncionario from './components/PerfilFuncionario';

function FuncionarioDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({
    tarefas_hoje: 0,
    tarefas_concluidas: 0,
    tarefas_pendentes: 0,
    tarefas_proximas: 0,
    alimentacoes_registradas: 0,
    animais_atualizados: 0,
    nascimentos_mes: 0,
    ocorrencias: 0
  });

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const carregarDadosDashboard = async () => {
    setLoading(true);
    try {
      const data = await funcionarioService.getDashboard();
      setDashboardData({
        tarefas_hoje: data.tarefas_hoje || 0,
        tarefas_concluidas: data.tarefas_concluidas || 0,
        tarefas_pendentes: data.tarefas_pendentes || 0,
        tarefas_proximas: data.tarefas_proximas || 0,
        alimentacoes_registradas: data.alimentacoes_registradas || 0,
        animais_atualizados: data.animais_atualizados || 0,
        nascimentos_mes: data.nascimentos_mes || 0,
        ocorrencias: data.ocorrencias || 0
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
    { id: 'tarefas', label: 'Minhas Tarefas', icon: ClipboardList },
    { id: 'alimentacao', label: 'Registro Alimentação', icon: Utensils },
    { id: 'ocorrencias', label: 'Registro Ocorrências', icon: AlertTriangle },
    { id: 'animais', label: 'Atualizar Animais', icon: PawPrint },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  const statsCards = [
    {
      title: 'Tarefas Hoje',
      value: dashboardData.tarefas_hoje,
      icon: ClipboardList,
      change: 'Tarefas programadas',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Concluídas',
      value: dashboardData.tarefas_concluidas,
      icon: CheckSquare,
      change: `${dashboardData.tarefas_concluidas} de ${dashboardData.tarefas_hoje}`,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pendentes',
      value: dashboardData.tarefas_pendentes,
      icon: Clock,
      change: 'Aguardando execução',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Próximas Tarefas',
      value: dashboardData.tarefas_proximas,
      icon: Calendar,
      change: 'Para os próximos dias',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-violet-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AgroTech</h1>
              <p className="text-xs text-gray-500">Funcionário</p>
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
                  ? "bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`h-5 w-5 ${abaAtiva === item.id ? "text-purple-600" : "text-gray-500"}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-gray-50">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.nome || user?.email?.split('@')[0] || 'Funcionário'}
              </p>
              <p className="text-xs text-gray-500">Funcionário</p>
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
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">AgroTech</h1>
                  <p className="text-xs text-gray-500">Funcionário</p>
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
                      ? "bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 shadow-sm"
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
            <h1 className="text-2xl font-bold text-gray-800">Painel do Funcionário</h1>
            <p className="text-gray-500 text-sm mt-1">
              Olá {user?.nome || user?.email?.split('@')[0]} - Gerencie suas atividades diárias
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
                      <p className="text-xs text-purple-600 mt-1">{stat.change}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Alimentações Registradas</p>
                        <p className="text-3xl font-bold">{dashboardData.alimentacoes_registradas}</p>
                      </div>
                      <Utensils className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100">Animais Atualizados</p>
                        <p className="text-3xl font-bold">{dashboardData.animais_atualizados}</p>
                      </div>
                      <Weight className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Nascimentos no Mês</p>
                        <p className="text-3xl font-bold">{dashboardData.nascimentos_mes}</p>
                      </div>
                      <Baby className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <ListaTarefas limit={4} />
            </>
          )}

          {/* Outras Abas */}
          {abaAtiva === 'tarefas' && <ListaTarefas />}
          {abaAtiva === 'alimentacao' && <RegistroAlimentacao />}
          {abaAtiva === 'ocorrencias' && <RegistroOcorrencias />}
          {abaAtiva === 'animais' && <AtualizarAnimais />}
          {abaAtiva === 'perfil' && <PerfilFuncionario />}
        </div>
      </main>
    </div>
  );
}

export default FuncionarioDashboard;