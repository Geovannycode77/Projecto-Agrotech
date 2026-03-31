import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, CheckSquare, Clock, Calendar, CheckCircle, Circle } from 'lucide-react';

export default function Dashboard_Funcionario() {
  const { user } = useAuth();

  const stats = [
    { title: 'Tarefas Hoje', value: '8', icon: ClipboardList, color: 'text-blue-600' },
    { title: 'Concluídas', value: '5', icon: CheckSquare, color: 'text-green-600' },
    { title: 'Pendentes', value: '3', icon: Clock, color: 'text-yellow-600' },
    { title: 'Próximas', value: '6', icon: Calendar, color: 'text-purple-600' }
  ];

  const tarefas = [
    { tarefa: 'Regar plantação', setor: 'Campo Norte', prazo: 'Hoje', status: 'Pendente', prioridade: 'Alta' },
    { tarefa: 'Alimentar animais', setor: 'Estábulo', prazo: 'Ontem', status: 'Concluído', prioridade: 'Alta' },
    { tarefa: 'Limpar estábulos', setor: 'Estábulo', prazo: 'Hoje', status: 'Em andamento', prioridade: 'Média' },
    { tarefa: 'Colher milho', setor: 'Campo Sul', prazo: 'Amanhã', status: 'Pendente', prioridade: 'Alta' },
    { tarefa: 'Fertilizar solo', setor: 'Campo Leste', prazo: 'Amanhã', status: 'Pendente', prioridade: 'Média' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Painel do Funcionário
          </h1>
          <p className="text-gray-600 mt-2">
            Olá {user?.email?.split('@')[0] || 'Funcionário'} - Gerencie suas tarefas diárias
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Minhas Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tarefas.map((tarefa, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start space-x-3 flex-1">
                    {tarefa.status === 'Concluído' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${tarefa.status === 'Concluído' ? 'line-through text-gray-500' : ''}`}>
                        {tarefa.tarefa}
                      </p>
                      <p className="text-sm text-gray-500">Setor: {tarefa.setor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Prazo: {tarefa.prazo}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      tarefa.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                      tarefa.status === 'Em andamento' ? 'bg-blue-100 text-blue-800' :
                      tarefa.prioridade === 'Alta' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tarefa.status === 'Concluído' ? 'Concluído' : 
                       tarefa.status === 'Em andamento' ? 'Em andamento' : 
                       `Pendente - ${tarefa.prioridade}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}