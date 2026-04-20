import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ClipboardList, 
  CheckCircle, 
  Circle, 
  Activity,
  Filter,
  Search,
  Loader2
} from 'lucide-react';
import { funcionarioService } from '@/services/funcionarioService';

export default function ListaTarefas({ limit }) {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = async () => {
    setLoading(true);
    try {
      const data = await funcionarioService.getTarefas();
      setTarefas(data.results || data);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusTarefa = async (id, novoStatus) => {
    try {
      const updated = await funcionarioService.atualizarTarefa(id, { status: novoStatus });
      setTarefas(tarefas.map(t => t.id === id ? updated : t));
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'concluido') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'andamento') return <Activity className="h-5 w-5 text-blue-500" />;
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      concluido: 'bg-green-100 text-green-800',
      andamento: 'bg-blue-100 text-blue-800',
      pendente: 'bg-yellow-100 text-yellow-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      concluido: 'Concluído',
      andamento: 'Em andamento',
      pendente: 'Pendente'
    };
    return labels[status] || status;
  };

  const getPrioridadeBadge = (prioridade) => {
    const badges = {
      alta: 'bg-red-100 text-red-800',
      media: 'bg-yellow-100 text-yellow-800',
      baixa: 'bg-green-100 text-green-800'
    };
    return badges[prioridade] || 'bg-gray-100 text-gray-800';
  };

  const tarefasFiltradas = tarefas.filter(tarefa => {
    const matchesSearch = tarefa.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tarefa.setor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFiltro = filtro === 'todas' || tarefa.status === filtro;
    return matchesSearch && matchesFiltro;
  });

  const tarefasExibidas = limit ? tarefasFiltradas.slice(0, limit) : tarefasFiltradas;

  if (loading && tarefas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-purple-600" />
            {limit ? 'Minhas Tarefas' : 'Todas as Tarefas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-purple-600" />
          {limit ? 'Minhas Tarefas' : 'Todas as Tarefas'}
        </CardTitle>
        
        {!limit && (
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tarefa..."
                className="pl-10 pr-4 py-2 border rounded-lg text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="border rounded-lg px-3 py-2 text-sm"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="todas">Todas</option>
              <option value="pendente">Pendentes</option>
              <option value="andamento">Em andamento</option>
              <option value="concluido">Concluídas</option>
            </select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {tarefasExibidas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma tarefa encontrada
          </div>
        ) : (
          <div className="space-y-3">
            {tarefasExibidas.map((tarefa) => (
              <div key={tarefa.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-purple-50 transition-colors">
                <div className="flex items-start gap-3 flex-1">
                  <button 
                    onClick={() => {
                      if (tarefa.status === 'pendente') {
                        atualizarStatusTarefa(tarefa.id, 'andamento');
                      } else if (tarefa.status === 'andamento') {
                        atualizarStatusTarefa(tarefa.id, 'concluido');
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {getStatusIcon(tarefa.status)}
                  </button>
                  <div>
                    <p className={`font-medium ${tarefa.status === 'concluido' ? 'line-through text-gray-500' : ''}`}>
                      {tarefa.titulo}
                    </p>
                    <p className="text-sm text-gray-500">
                      Setor: {tarefa.setor} • Prazo: {new Date(tarefa.prazo).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusBadge(tarefa.status)}>
                    {getStatusLabel(tarefa.status)}
                  </Badge>
                  <Badge className={getPrioridadeBadge(tarefa.prioridade)}>
                    {tarefa.prioridade === 'alta' ? 'Alta Prioridade' : 
                     tarefa.prioridade === 'media' ? 'Média Prioridade' : 'Baixa Prioridade'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}