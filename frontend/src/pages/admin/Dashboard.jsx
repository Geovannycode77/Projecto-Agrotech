import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminService } from '../../services/api';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield,
  Database,
  AlertCircle,
  FileText 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    approved_users: 0,
    pending_users: 0,
    users_by_role: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  // Função auxiliar para extrair valor numérico de qualquer formato
  const getNumericValue = (value) => {
    if (typeof value === 'number') return value;
    if (value && typeof value === 'object') {
      if ('count' in value) return value.count;
      if ('display' in value) return parseInt(value.display) || 0;
    }
    return Number(value) || 0;
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getStats();
      
      console.log('Dados da API:', data); // Para debug
      
      // Normaliza os dados para o formato esperado
      const normalizedStats = {
        total_users: getNumericValue(data.total_users || data.totalUsers || 0),
        approved_users: getNumericValue(data.approved_users || data.approvedUsers || data.active_users || data.activeUsers || 0),
        pending_users: getNumericValue(data.pending_users || data.pendingUsers || 0),
        users_by_role: {}
      };
      
      // Processa users_by_role
      if (data.users_by_role && typeof data.users_by_role === 'object') {
        const roles = {};
        for (const [key, value] of Object.entries(data.users_by_role)) {
          roles[key] = getNumericValue(value);
        }
        normalizedStats.users_by_role = roles;
      } else {
        // Se não veio users_by_role, tenta criar a partir de campos individuais
        const roles = {};
        if (data.produtores) roles.produtor = getNumericValue(data.produtores);
        if (data.funcionarios) roles.funcionario = getNumericValue(data.funcionarios);
        if (data.veterinarios) roles.veterinario = getNumericValue(data.veterinarios);
        if (data.gestores) roles.gestor = getNumericValue(data.gestores);
        if (data.admin) roles.admin = getNumericValue(data.admin);
        if (Object.keys(roles).length > 0) {
          normalizedStats.users_by_role = roles;
        }
      }
      
      setStats(normalizedStats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Não foi possível carregar as estatísticas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total de Usuários',
      value: stats.total_users,
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Usuários Ativos',
      value: stats.approved_users,
      icon: UserCheck,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Pendentes',
      value: stats.pending_users,
      icon: UserX,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bem-vindo ao painel administrativo</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-800">{card.value}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usuários por Função */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Usuários por Função
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.users_by_role && Object.keys(stats.users_by_role).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.users_by_role).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="capitalize text-gray-600">{role.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-4 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: stats.total_users > 0 ? `${(count / stats.total_users) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="font-semibold text-gray-800 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Nenhum dado disponível</p>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Gerenciar Usuários</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/permissions'}
              className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Configurar Permissões</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/backups'}
              className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
            >
              <Database className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">Fazer Backup</span>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/reports'}
              className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
            >
              <FileText className="w-5 h-5 text-rose-600" />
              <span className="text-sm font-medium text-rose-700">Gerar Relatórios</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 