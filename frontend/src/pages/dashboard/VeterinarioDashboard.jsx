import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Syringe, 
  Calendar, 
  AlertTriangle, 
  PawPrint, 
  Heart,
  FileText,
  Stethoscope,
  TrendingUp,
  ArrowUp,
  Clock,
  CheckCircle,
  User,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Bell,
  Loader2
} from 'lucide-react';
import { veterinarioService } from '../../services/VeterinarioService';
import ListaAnimaisVet from './components/ListaAnimaisVet';
import HistoricoMedico from './components/HistoricoMedico';
import RegistroVacinas from './components/RegistroVacinas';
import RegistroTratamento from './components/RegistroTratamento';
import AlertasSaude from './components/AlertasSaude';
import PerfilVeterinario from './components/PerfilVeterinario';
import AlertasLembretesSaude from './components/AlertasLembretesSaude';

function VeterinarioDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    consultas_hoje: 0,
    vacinacoes_hoje: 0,
    pendentes: 0,
    alertas: 0,
    animais_tratamento: 0,
    recuperados_mes: 0,
    estatisticas: {
      taxa_sucesso: 0,
      total_atendimentos: 0
    }
  });
  const [alertas, setAlertas] = useState([]);
  const [proximasConsultas, setProximasConsultas] = useState([]);
  const [animaisObservacao, setAnimaisObservacao] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const carregarDadosDashboard = async () => {
    setLoading(true);
    try {
      const dashboard = await veterinarioService.getDashboard();
      setDashboardData({
        consultas_hoje: dashboard.consultas_hoje || 0,
        vacinacoes_hoje: dashboard.vacinacoes_hoje || 0,
        pendentes: dashboard.pendentes || 0,
        alertas: dashboard.alertas || 0,
        animais_tratamento: dashboard.animais_tratamento || 0,
        recuperados_mes: dashboard.recuperados_mes || 0,
        estatisticas: {
          taxa_sucesso: dashboard.estatisticas?.taxa_sucesso || 0,
          total_atendimentos: dashboard.estatisticas?.total_atendimentos || 0
        }
      });
      
      const alertasData = await veterinarioService.getAlertas();
      setAlertas(alertasData.results || alertasData);
      
      const consultasData = await veterinarioService.getConsultas({ status: 'agendado', limit: 3 });
      setProximasConsultas(consultasData.results || consultasData);
      
      const observacaoData = await veterinarioService.getAnimais({ status_saude: 'atencao', limit: 3 });
      setAnimaisObservacao(observacaoData.results || observacaoData);
      
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
    { id: 'animais', label: 'Lista de Animais', icon: PawPrint },
    { id: 'historico', label: 'Histórico Médico', icon: FileText },
    { id: 'vacinas', label: 'Registro de Vacinas', icon: Syringe },
    { id: 'tratamentos', label: 'Tratamentos', icon: Heart },
    { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
    { id: 'lembretes', label: 'Lembretes de Saúde', icon: Bell },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  const statsCards = [
    {
      title: 'Consultas Hoje',
      value: dashboardData.consultas_hoje,
      icon: Stethoscope,
      change: '0% em relação a ontem',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100'
    },
    {
      title: 'Vacinações',
      value: dashboardData.vacinacoes_hoje,
      icon: Syringe,
      change: 'Programadas para hoje',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100'
    },
    {
      title: 'Pendentes',
      value: dashboardData.pendentes,
      icon: Clock,
      change: 'Aguardando atendimento',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Alertas de Saúde',
      value: dashboardData.alertas,
      icon: AlertTriangle,
      change: 'Requerem atenção',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      agendado: 'bg-green-100 text-green-800',
      urgente: 'bg-red-100 text-red-800',
      concluido: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPrioridadeColor = (prioridade) => {
    const colors = {
      alta: 'bg-red-100 text-red-800',
      media: 'bg-yellow-100 text-yellow-800',
      baixa: 'bg-green-100 text-green-800'
    };
    return colors[prioridade] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-sky-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-sky-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-gray-800">AgroTech Vet</span>
          </div>
          <div className="w-8"></div>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-sm shadow-xl z-20">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AgroTech</h1>
              <p className="text-xs text-gray-500">Veterinário</p>
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
                  ? "bg-gradient-to-r from-cyan-50 to-sky-50 text-cyan-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`h-5 w-5 ${abaAtiva === item.id ? "text-cyan-600" : "text-gray-500"}`} />
              <span className="font-medium">{item.label}</span>
              {item.id === 'alertas' && alertas.filter(a => a.prioridade === 'alta').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {alertas.filter(a => a.prioridade === 'alta').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-gray-50">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">
                Dr(a). {user?.nome || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500">Médico Veterinário</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            className="w-full justify-start gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-50">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">AgroTech</h1>
                  <p className="text-xs text-gray-500">Veterinário</p>
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
                      ? "bg-gradient-to-r from-cyan-50 to-sky-50 text-cyan-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
              <Button
                onClick={handleLogout}
                className="w-full justify-start gap-2 bg-red-50 text-red-600 hover:bg-red-100"
              >
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
            <h1 className="text-2xl font-bold text-gray-800">Painel Veterinário</h1>
            <p className="text-gray-500 text-sm mt-1">
              Olá Dr(a). {user?.nome || user?.email?.split('@')[0]} - Gerencie a saúde do rebanho
            </p>
          </div>

          {/* Stats Cards - Visíveis apenas no Dashboard */}
          {abaAtiva === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {statsCards.map((stat, index) => (
                  <Card key={index} className="hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-cyan-600 mt-1">{stat.change}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Indicadores Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gradient-to-r from-cyan-500 to-sky-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cyan-100">Animais em Tratamento</p>
                        <p className="text-3xl font-bold">{dashboardData.animais_tratamento}</p>
                      </div>
                      <Heart className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100">Recuperados no Mês</p>
                        <p className="text-3xl font-bold">{dashboardData.recuperados_mes}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Taxa de Sucesso</p>
                        <p className="text-3xl font-bold">{dashboardData.estatisticas.taxa_sucesso}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conteúdo do Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Próximas Consultas */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-cyan-600" />
                      Próximas Consultas
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-cyan-600">
                      Ver todas <ArrowUp className="ml-2 h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {proximasConsultas.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">Nenhuma consulta agendada</div>
                    ) : (
                      <div className="space-y-3">
                        {proximasConsultas.map((consulta, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-cyan-50 transition-colors">
                            <div>
                              <div className="flex items-center gap-2">
                                <PawPrint className="h-4 w-4 text-cyan-600" />
                                <span className="font-semibold">{consulta.animal_nome || consulta.animal_brinco}</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{consulta.tipo}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-cyan-600">{consulta.horario}</p>
                              <Badge className={getStatusColor(consulta.status)}>
                                {consulta.status === 'agendado' ? 'Agendado' : consulta.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Animais em Observação */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      Animais em Observação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {animaisObservacao.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">Nenhum animal em observação</div>
                    ) : (
                      <div className="space-y-3">
                        {animaisObservacao.map((animal, index) => (
                          <div key={index} className="p-3 border rounded-lg hover:bg-cyan-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold">{animal.brinco} - {animal.raca || 'Raça não informada'}</span>
                              <Badge className={getPrioridadeColor(animal.prioridade)}>
                                {animal.prioridade === 'alta' ? 'Alta Prioridade' : 
                                 animal.prioridade === 'media' ? 'Média Prioridade' : 'Baixa Prioridade'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">Condição: {animal.condicao}</p>
                            <p className="text-sm text-gray-600">Tratamento: {animal.tratamento}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Conteúdo das outras abas */}
          {abaAtiva === 'animais' && <ListaAnimaisVet />}
          {abaAtiva === 'historico' && <HistoricoMedico />}
          {abaAtiva === 'vacinas' && <RegistroVacinas />}
          {abaAtiva === 'tratamentos' && <RegistroTratamento />}
          {abaAtiva === 'alertas' && <AlertasSaude alertas={alertas} onAtualizar={carregarDadosDashboard} />}
          {abaAtiva === 'lembretes' && <AlertasLembretesSaude />}
          {abaAtiva === 'perfil' && <PerfilVeterinario />}
        </div>
      </main>
    </div>
  );
}

export default VeterinarioDashboard;