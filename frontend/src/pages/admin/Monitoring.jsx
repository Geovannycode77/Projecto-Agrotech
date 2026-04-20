import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminService } from '../../services/api';
import { 
  Activity, 
  Server, 
  Database, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function Monitoring() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [systemHealth, setSystemHealth] = useState({
    services: {},
    resources: {},
    uptime: null,
    lastEvents: []
  });

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getSystemStatus();
      setSystemHealth(data);
    } catch (err) {
      console.error('Erro ao buscar status do sistema:', err);
      setError('Não foi possível carregar o status do sistema.');
    } finally {
      setLoading(false);
    }
  };

  const getServiceStatus = (status) => {
    if (status === 'operational') return { text: 'Operacional', color: 'from-emerald-500 to-green-500', icon: CheckCircle };
    if (status === 'degraded') return { text: 'Degradado', color: 'from-yellow-500 to-orange-500', icon: AlertTriangle };
    return { text: 'Falha', color: 'from-red-500 to-rose-500', icon: AlertCircle };
  };

  const services = [
    { id: 'api', name: 'API', icon: Server },
    { id: 'database', name: 'Banco de Dados', icon: Database },
    { id: 'email', name: 'Email Service', icon: Wifi }
  ];

  const resources = [
    { id: 'cpu', name: 'CPU', icon: Cpu, unit: '%' },
    { id: 'memory', name: 'Memória RAM', icon: Activity, unit: '%' },
    { id: 'storage', name: 'Armazenamento', icon: HardDrive, unit: '%' }
  ];

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={fetchStatus}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Monitoramento</h1>
          <p className="text-gray-500 mt-1">Acompanhe o status e desempenho do sistema</p>
        </div>
        <Button variant="outline" onClick={fetchStatus} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Status dos Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          const status = systemHealth.services?.[service.id] || { status: 'unknown' };
          const statusInfo = getServiceStatus(status.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <Card key={service.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${statusInfo.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <StatusIcon className={`w-5 h-5 ${statusInfo.icon === CheckCircle ? 'text-emerald-500' : statusInfo.icon === AlertTriangle ? 'text-yellow-500' : 'text-red-500'}`} />
                </div>
                <p className="text-sm text-gray-500 mt-2">{service.name}</p>
                <p className="text-lg font-semibold text-gray-800">{statusInfo.text}</p>
                {status.message && <p className="text-xs text-gray-500 mt-1">{status.message}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recursos do Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {resources.map((resource) => {
          const Icon = resource.icon;
          const value = systemHealth.resources?.[resource.id] || 0;
          const colors = {
            cpu: 'from-emerald-500 to-green-500',
            memory: 'from-blue-500 to-cyan-500',
            storage: 'from-purple-500 to-pink-500'
          };
          
          return (
            <Card key={resource.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-gray-600" />
                  {resource.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-800">{value}{resource.unit}</p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                    <div 
                      className={`bg-gradient-to-r ${colors[resource.id]} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {value < 70 ? 'Uso normal' : value < 90 ? 'Uso elevado' : 'Uso crítico'}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Últimos Eventos */}
      {systemHealth.lastEvents && systemHealth.lastEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Últimos Eventos do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemHealth.lastEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event.type === 'success' ? 'bg-green-500' :
                      event.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-sm text-gray-700">{event.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">{event.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}