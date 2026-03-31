import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  const cards = [
    {
      title: 'Total de Usuários',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Usuários Aprovados',
      value: stats?.approved_users || 0,
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      title: 'Pendentes',
      value: stats?.pending_users || 0,
      icon: UserX,
      color: 'bg-yellow-500'
    },
    {
      title: 'Por Função',
      value: Object.keys(stats?.users_by_role || {}).length,
      icon: BarChart3,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao painel administrativo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuários por Função</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.users_by_role && Object.entries(stats.users_by_role).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="capitalize">{role}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left px-4 py-2 bg-blue-50 rounded hover:bg-blue-100">
              Gerenciar Usuários Pendentes
            </button>
            <button className="w-full text-left px-4 py-2 bg-green-50 rounded hover:bg-green-100">
              Configurar Sistema
            </button>
            <button className="w-full text-left px-4 py-2 bg-purple-50 rounded hover:bg-purple-100">
              Gerar Relatórios
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}