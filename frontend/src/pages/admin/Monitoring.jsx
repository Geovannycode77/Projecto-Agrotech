import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminService } from '../../services/api';
import { 
  Activity, 
  Server, 
  Database, 
  AlertTriangle,
  CheckCircle,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  AlertCircle,
  MemoryStick
} from 'lucide-react';

export default function Monitoring() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemHealth, setSystemHealth] = useState({
    status: 'operational',
    database: { status: 'unknown', user_count: 0 },
    cache: { status: 'unknown' },
    email: { status: 'unknown' },
    server: {
      cpu_usage: 0,
      memory_usage: 0,
      disk_usage: 0,
      cpu_cores: 0
    },
    active_users_today: 0,
    last_updated: null,
    system: null
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
      
      console.log('📊 Dados recebidos:', data);
      console.log('📊 Server:', data.server);
      
      // Atualizar state com os dados recebidos
      setSystemHealth({
        status: data.status || 'operational',
        database: {
          status: data.database?.status || 'unknown',
          user_count: data.database?.user_count || 0,
        },
        cache: {
          status: data.cache?.status || 'unknown',
        },
        email: {
          status: data.email?.status || 'unknown',
          backend: data.email?.backend,
        },
        server: {
          cpu_usage: data.server?.cpu_usage || 0,
          memory_usage: data.server?.memory_usage || 0,
          disk_usage: data.server?.disk_usage || 0,
          cpu_cores: data.server?.cpu_cores || 0,
        },
        active_users_today: data.active_users_today || 0,
        last_updated: data.last_updated,
        system: data.system,
      });
    } catch (err) {
      console.error('❌ Erro ao buscar status:', err);
      setError('Não foi possível carregar o status do sistema.');
    } finally {
      setLoading(false);
    }
  };

  const getServiceStatus = (status) => {
    if (status === 'healthy' || status === 'operational') {
      return { text: 'Operacional', color: 'from-emerald-500 to-green-500', icon: CheckCircle };
    }
    if (status === 'degraded') {
      return { text: 'Degradado', color: 'from-yellow-500 to-orange-500', icon: AlertTriangle };
    }
    return { text: 'Falha', color: 'from-red-500 to-rose-500', icon: AlertCircle };
  };

  const services = [
    { id: 'api', name: 'API', icon: Server },
    { id: 'database', name: 'Banco de Dados', icon: Database },
    { id: 'cache', name: 'Cache', icon: Activity },
    { id: 'email', name: 'E-mail', icon: Wifi }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando status do sistema...</p>
        </div>
      </div>
    );
  }

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

  // Valores para exibição
  const cpuValue = systemHealth.server?.cpu_usage || 0;
  const memoryValue = systemHealth.server?.memory_usage || 0;
  const diskValue = systemHealth.server?.disk_usage || 0;

  console.log('🎯 Valores para exibir - CPU:', cpuValue, 'Memória:', memoryValue, 'Disco:', diskValue);

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

      {/* Status Geral do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Status Geral do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Situação atual</p>
              <p className="text-2xl font-bold text-gray-800 capitalize">{systemHealth.status}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Usuários ativos hoje</p>
              <p className="text-2xl font-bold text-gray-800">{systemHealth.active_users_today}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status dos Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          let statusObj;
          
          if (service.id === 'api') {
            statusObj = { status: systemHealth.status };
          } else if (service.id === 'database') {
            statusObj = { status: systemHealth.database?.status };
          } else if (service.id === 'cache') {
            statusObj = { status: systemHealth.cache?.status };
          } else {
            statusObj = { status: systemHealth.email?.status };
          }
          
          const statusInfo = getServiceStatus(statusObj.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <Card key={service.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${statusInfo.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <StatusIcon className={`w-5 h-5 ${
                    statusInfo.icon === CheckCircle ? 'text-emerald-500' : 
                    statusInfo.icon === AlertTriangle ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </div>
                <p className="text-sm text-gray-500 mt-2">{service.name}</p>
                <p className="text-lg font-semibold text-gray-800">{statusInfo.text}</p>
                {service.id === 'database' && systemHealth.database?.user_count > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{systemHealth.database.user_count} usuários</p>
                )}
                {service.id === 'email' && systemHealth.email?.backend && (
                  <p className="text-xs text-gray-500 mt-1">{systemHealth.email.backend}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recursos do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-gray-600" />
              CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">
                {cpuValue.toFixed(1)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    cpuValue < 70 ? 'bg-emerald-500' : cpuValue < 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(cpuValue, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {cpuValue < 70 ? '✅ Uso normal' : cpuValue < 90 ? '⚠️ Uso elevado' : '🔴 Uso crítico'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Memória RAM */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MemoryStick className="w-5 h-5 text-gray-600" />
              Memória RAM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">
                {memoryValue.toFixed(1)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    memoryValue < 70 ? 'bg-emerald-500' : memoryValue < 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(memoryValue, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {memoryValue < 70 ? '✅ Uso normal' : memoryValue < 90 ? '⚠️ Uso elevado' : '🔴 Uso crítico'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Armazenamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-gray-600" />
              Armazenamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">
                {diskValue.toFixed(1)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    diskValue < 70 ? 'bg-emerald-500' : diskValue < 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(diskValue, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {diskValue < 70 ? '✅ Uso normal' : diskValue < 90 ? '⚠️ Uso elevado' : '🔴 Uso crítico'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Servidor */}
      {systemHealth.system && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-600" />
              Informações do Servidor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Sistema Operacional</p>
                <p className="text-sm font-medium">{systemHealth.system.os} {systemHealth.system.os_version}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Python</p>
                <p className="text-sm font-medium">{systemHealth.system.python_version}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Hostname</p>
                <p className="text-sm font-medium">{systemHealth.system.hostname}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Cores de CPU</p>
                <p className="text-sm font-medium">{systemHealth.server.cpu_cores || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Última Atualização */}
      {systemHealth.last_updated && (
        <div className="text-center text-xs text-gray-400">
          Última atualização: {new Date(systemHealth.last_updated).toLocaleString()}
        </div>
      )}
    </div>
  );
}