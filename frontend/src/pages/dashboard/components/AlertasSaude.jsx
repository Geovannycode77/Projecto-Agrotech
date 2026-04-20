import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { veterinarioService } from '@/services/veterinarioService';

export default function AlertasSaude({ alertas: alertasProps, onAtualizar }) {
  const [alertas, setAlertas] = useState(alertasProps || []);
  const [loading, setLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    saudaveis: 0,
    atencao: 0,
    tratamento: 0,
    criticos: 0
  });

  // Atualizar alertas quando as props mudarem
  useEffect(() => {
    if (alertasProps) {
      setAlertas(alertasProps);
    }
  }, [alertasProps]);

  // Carregar estatísticas de saúde
  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const data = await veterinarioService.getResumoSaudeRebanho();
      setEstatisticas(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas de saúde:', error);
    }
  };

  const getPrioridadeIcon = (prioridade) => {
    if (prioridade === 'alta') return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (prioridade === 'media') return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <Info className="h-5 w-5 text-blue-600" />;
  };

  const getPrioridadeColor = (prioridade) => {
    const colors = {
      alta: 'bg-red-100 border-red-300 text-red-800',
      media: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      baixa: 'bg-blue-100 border-blue-300 text-blue-800'
    };
    return colors[prioridade] || 'bg-gray-100';
  };

  const marcarComoLido = async (id) => {
    try {
      setLoading(true);
      await veterinarioService.marcarAlertaLido(id);
      
      // Atualizar a lista localmente
      const alertasAtualizados = alertas.map(alerta => 
        alerta.id === id ? { ...alerta, lido: true } : alerta
      );
      setAlertas(alertasAtualizados);
      
      // Notificar o componente pai
      if (onAtualizar) {
        onAtualizar();
      }
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
    } finally {
      setLoading(false);
    }
  };

  const alertasNaoLidos = alertas.filter(a => !a.lido);
  const alertasUrgentes = alertasNaoLidos.filter(a => a.prioridade === 'alta');

  if (loading && alertas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-600" />
            Alertas de Saúde
            {alertasUrgentes.length > 0 && (
              <Badge className="bg-red-500 text-white ml-2">
                {alertasUrgentes.length} urgentes
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertasNaoLidos.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum alerta pendente!</p>
              <p className="text-sm text-gray-500">Todos os animais estão com a saúde em dia.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alertasNaoLidos.map((alerta) => (
                <div key={alerta.id} className={`border-l-4 p-4 rounded-r-lg ${getPrioridadeColor(alerta.prioridade)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      {getPrioridadeIcon(alerta.prioridade)}
                      <div>
                        <p className="font-medium">{alerta.mensagem}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Animal: {alerta.animal_nome || alerta.animal}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Prioridade: {alerta.prioridade?.toUpperCase() || 'NORMAL'}
                        </p>
                        {alerta.data_criacao && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(alerta.data_criacao).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-cyan-600"
                      onClick={() => marcarComoLido(alerta.id)}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas de Saúde */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Saúde do Rebanho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{estatisticas.saudaveis || 0}</div>
              <div className="text-sm text-gray-600">Saudáveis</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{estatisticas.atencao || 0}</div>
              <div className="text-sm text-gray-600">Em Atenção</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{estatisticas.tratamento || 0}</div>
              <div className="text-sm text-gray-600">Em Tratamento</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{estatisticas.criticos || 0}</div>
              <div className="text-sm text-gray-600">Críticos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}