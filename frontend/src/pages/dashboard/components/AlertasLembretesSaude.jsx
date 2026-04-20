import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Syringe, 
  AlertTriangle, 
  Calendar, 
  CheckCircle, 
  Clock,
  Heart,
  Stethoscope,
  X,
  Eye
} from 'lucide-react';
import { veterinarioService } from '@/services/veterinarioService';
import { produtorService } from '@/services/produtorService';

export default function AlertasLembretesSaude({ userRole = 'produtor' }) {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proximasVacinas, setProximasVacinas] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    urgentes: 0,
    pendentes: 0,
    vacinasMes: 0
  });

  useEffect(() => {
    carregarAlertas();
    carregarProximasVacinas();
    // Verificar alertas a cada 5 minutos
    const interval = setInterval(() => {
      carregarAlertas();
      carregarProximasVacinas();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const carregarAlertas = async () => {
    setLoading(true);
    try {
      let dadosAlertas;
      if (userRole === 'veterinario') {
        dadosAlertas = await veterinarioService.getAlertas();
      } else {
        dadosAlertas = await produtorService.getAlertas();
      }
      
      setAlertas(dadosAlertas.results || dadosAlertas);
      
      // Calcular estatísticas
      const naoLidos = (dadosAlertas.results || dadosAlertas).filter(a => a.status !== 'lido');
      const urgentes = naoLidos.filter(a => a.prioridade === 'urgente' || a.status === 'atrasado');
      
      setEstatisticas(prev => ({
        ...prev,
        urgentes: urgentes.length,
        pendentes: naoLidos.length
      }));
      
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarProximasVacinas = async () => {
    try {
      let vacinasData;
      if (userRole === 'veterinario') {
        vacinasData = await veterinarioService.getVacinas({ proximos_30_dias: true });
      } else {
        vacinasData = await produtorService.getProximasVacinas();
      }
      
      setProximasVacinas(vacinasData.results || vacinasData);
      
      setEstatisticas(prev => ({
        ...prev,
        vacinasMes: (vacinasData.results || vacinasData).length
      }));
      
    } catch (error) {
      console.error('Erro ao carregar próximas vacinas:', error);
    }
  };

  const calcularDiasRestantes = (data) => {
    const hoje = new Date();
    const dataEvento = new Date(data);
    const diffTime = dataEvento - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPrioridadeColor = (prioridade) => {
    const colors = {
      urgente: 'bg-red-600 text-white',
      alta: 'bg-red-100 border-red-300 text-red-800',
      media: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      baixa: 'bg-blue-100 border-blue-300 text-blue-800'
    };
    return colors[prioridade] || 'bg-gray-100';
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      vacina: <Syringe className="h-5 w-5" />,
      tratamento: <Stethoscope className="h-5 w-5" />,
      consulta: <Calendar className="h-5 w-5" />,
      doenca: <AlertTriangle className="h-5 w-5" />
    };
    return icons[tipo] || <Bell className="h-5 w-5" />;
  };

  const getStatusLabel = (status, dias) => {
    if (status === 'emergencia') return 'EMERGÊNCIA';
    if (status === 'atrasado') return 'ATRASADO';
    if (dias <= 7) return 'PRÓXIMO';
    if (dias <= 15) return 'EM BREVE';
    return 'AGENDADO';
  };

  const getStatusColor = (status, dias) => {
    if (status === 'emergencia') return 'bg-red-600 text-white';
    if (status === 'atrasado') return 'bg-red-500 text-white';
    if (dias <= 7) return 'bg-orange-500 text-white';
    if (dias <= 15) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  const marcarComoLido = async (id) => {
    try {
      if (userRole === 'veterinario') {
        await veterinarioService.marcarAlertaLido(id);
      } else {
        await produtorService.marcarAlertaLido(id);
      }
      setAlertas(alertas.map(alerta => 
        alerta.id === id ? { ...alerta, status: 'lido' } : alerta
      ));
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
    }
  };

  const alertasNaoLidos = alertas.filter(a => a.status !== 'lido');
  const alertasUrgentes = alertasNaoLidos.filter(a => a.prioridade === 'urgente' || a.status === 'atrasado');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com contadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Alertas Urgentes</p>
                <p className="text-3xl font-bold">{estatisticas.urgentes}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Alertas Pendentes</p>
                <p className="text-3xl font-bold">{estatisticas.pendentes}</p>
              </div>
              <Bell className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">Vacinas este Mês</p>
                <p className="text-3xl font-bold">{estatisticas.vacinasMes}</p>
              </div>
              <Syringe className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-red-500" />
            Alertas e Lembretes de Saúde
            {alertasNaoLidos.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {alertasNaoLidos.length} não lidos
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertas.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum alerta pendente!</p>
              <p className="text-sm text-gray-500">Todas as vacinas e tratamentos estão em dia.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`border-l-4 p-4 rounded-r-lg transition-all ${
                    alerta.status === 'lido' ? 'opacity-60 bg-gray-50' : getPrioridadeColor(alerta.prioridade)
                  }`}
                  style={{ borderLeftColor: alerta.prioridade === 'urgente' ? '#dc2626' : 
                                         alerta.prioridade === 'alta' ? '#ef4444' :
                                         alerta.prioridade === 'media' ? '#eab308' : '#3b82f6' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-full ${
                        alerta.prioridade === 'urgente' ? 'bg-red-100' :
                        alerta.prioridade === 'alta' ? 'bg-red-100' :
                        alerta.prioridade === 'media' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        {getTipoIcon(alerta.tipo)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-800">{alerta.titulo}</p>
                          {alerta.dias_restantes !== undefined && alerta.dias_restantes !== null && (
                            <Badge className={getStatusColor(alerta.status, alerta.dias_restantes)}>
                              {getStatusLabel(alerta.status, alerta.dias_restantes)}
                            </Badge>
                          )}
                          {alerta.status === 'emergencia' && (
                            <Badge className="bg-red-600 text-white animate-pulse">
                              URGENTE
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alerta.mensagem}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {alerta.animal_nome || alerta.animal}
                          </span>
                          {alerta.data_vencimento && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Data: {new Date(alerta.data_vencimento).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {alerta.dias_restantes !== undefined && alerta.dias_restantes > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {alerta.dias_restantes} dias restantes
                            </span>
                          )}
                          {alerta.dias_restantes !== undefined && alerta.dias_restantes < 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              Atrasado há {Math.abs(alerta.dias_restantes)} dias
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {alerta.status !== 'lido' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-emerald-600"
                          onClick={() => marcarComoLido(alerta.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendário de Vacinas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Calendário de Vacinas - Próximos 30 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proximasVacinas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma vacina programada para os próximos 30 dias.
            </div>
          ) : (
            <div className="space-y-3">
              {proximasVacinas.map((vacina, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-emerald-50 transition-colors">
                  <div>
                    <p className="font-medium">{vacina.nome || vacina.vacina}</p>
                    <p className="text-sm text-gray-500">{vacina.animal_nome || vacina.animal}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date(vacina.data_programada).toLocaleDateString('pt-BR')}</p>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Em {vacina.dias_restantes} dias
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}