import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Syringe, Calendar, AlertTriangle, PawPrint, Heart } from 'lucide-react';

export default function Dashboard_Veterinario() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Consultas Hoje',
      value: '8',
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: 'Vacinações',
      value: '12',
      icon: Syringe,
      color: 'text-green-600'
    },
    {
      title: 'Pendentes',
      value: '3',
      icon: Calendar,
      color: 'text-yellow-600'
    },
    {
      title: 'Alertas',
      value: '2',
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  const consultas = [
    { animal: 'Boi 123', horario: '14:30', tipo: 'Check-up', status: 'Agendado' },
    { animal: 'Vaca 456', horario: '15:00', tipo: 'Vacinação', status: 'Agendado' },
    { animal: 'Bezerro 789', horario: '16:00', tipo: 'Avaliação', status: 'Em andamento' }
  ];

  const animaisObservacao = [
    { id: 'Boi 123', condicao: 'Febre aftosa', tratamento: 'Medicação A', prioridade: 'Alta' },
    { id: 'Vaca 456', condicao: 'Mastite', tratamento: 'Antibiótico', prioridade: 'Média' },
    { id: 'Bezerro 789', condicao: 'Desidratação', tratamento: 'Soro', prioridade: 'Baixa' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Painel Veterinário
          </h1>
          <p className="text-gray-600 mt-2">
            Olá Dr(a). {user?.email?.split('@')[0] || 'Veterinário'} - Gerencie a saúde animal
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
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
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {consultas.map((consulta, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <PawPrint className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{consulta.animal}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{consulta.tipo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{consulta.horario}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        consulta.status === 'Em andamento' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {consulta.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Animais em Observação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {animaisObservacao.map((animal, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">{animal.id}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        animal.prioridade === 'Alta' ? 'bg-red-100 text-red-800' :
                        animal.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {animal.prioridade}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Condição: {animal.condicao}</p>
                    <p className="text-sm text-gray-600">Tratamento: {animal.tratamento}</p>
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