import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tractor, Droplets, Sun, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function Dashboard_Produtor() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Fazendas',
      value: '3',
      icon: Tractor,
      change: '+1 este mês',
      color: 'text-green-600'
    },
    {
      title: 'Culturas Ativas',
      value: '12',
      icon: Droplets,
      change: '+2 esta semana',
      color: 'text-blue-600'
    },
    {
      title: 'Produção Mensal',
      value: '2,450 kg',
      icon: Sun,
      change: '+15%',
      color: 'text-yellow-600'
    },
    {
      title: 'Receita Total',
      value: 'R$ 45.230',
      icon: DollarSign,
      change: '+12%',
      color: 'text-green-600'
    }
  ];

  const culturas = [
    { nome: 'Milho', area: '50 hectares', producao: '3.200 kg', status: 'Em crescimento' },
    { nome: 'Soja', area: '30 hectares', producao: '2.100 kg', status: 'Pronto para colheita' },
    { nome: 'Trigo', area: '20 hectares', producao: '1.500 kg', status: 'Plantado' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {user?.email?.split('@')[0] || 'Produtor'}
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas fazendas e acompanhe a produção
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Culturas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Culturas em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {culturas.map((cultura, index) => (
                  <div key={index} className="border-b pb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-lg">{cultura.nome}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        cultura.status === 'Pronto para colheita' 
                          ? 'bg-green-100 text-green-800' 
                          : cultura.status === 'Em crescimento'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cultura.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Área: {cultura.area}</span>
                      <span>Produção: {cultura.producao}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { atividade: 'Colheita de Milho', data: '15/03/2026', status: 'Concluído' },
                  { atividade: 'Irrigação programada', data: '16/03/2026', status: 'Em andamento' },
                  { atividade: 'Fertilização', data: '18/03/2026', status: 'Pendente' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{item.atividade}</p>
                        <p className="text-xs text-gray-500">{item.data}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                      item.status === 'Em andamento' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}