import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function AlertasNotificacoes({ alertas, onAtualizar }) {
  const getPrioridadeColor = (prioridade) => {
    const colors = {
      alta: 'bg-red-100 border-red-300 text-red-800',
      media: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      baixa: 'bg-blue-100 border-blue-300 text-blue-800'
    };
    return colors[prioridade] || 'bg-gray-100';
  };

  const getIcone = (tipo) => {
    switch(tipo) {
      case 'saude':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'alimentacao':
        return <Bell className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas e Notificações
            {alertas.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {alertas.length} não lidos
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertas.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum alerta pendente!</p>
              <p className="text-sm text-gray-500">Tudo está em ordem com seu rebanho.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`border-l-4 p-4 rounded-r-lg ${getPrioridadeColor(alerta.prioridade)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      {getIcone(alerta.tipo)}
                      <div>
                        <p className="font-medium">{alerta.mensagem}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Prioridade: {alerta.prioridade.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Marcar como lido
                        console.log('Marcar alerta como lido:', alerta.id);
                      }}
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

      {/* Configurações de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>Alertas de Saúde do Rebanho</span>
              </label>
              <select className="text-sm border rounded p-1">
                <option>Imediato</option>
                <option>Diário</option>
                <option>Semanal</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>Estoque de Ração Baixo</span>
              </label>
              <select className="text-sm border rounded p-1">
                <option>Imediato</option>
                <option>Diário</option>
                <option>Semanal</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Relatórios de Produção</span>
              </label>
              <select className="text-sm border rounded p-1">
                <option>Diário</option>
                <option>Semanal</option>
                <option>Mensal</option>
              </select>
            </div>
          </div>
          <Button className="mt-4">Salvar Preferências</Button>
        </CardContent>
      </Card>
    </div>
  );
}