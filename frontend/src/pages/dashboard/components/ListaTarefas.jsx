import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Play, Loader2 } from 'lucide-react';
import { funcionarioService } from '@/services/FuncionarioService';
import { toast } from '@/hooks/use-toast';

const getPrioridadeColor = (prioridade) => {
  if (prioridade === 'alta') return 'bg-red-100 text-red-800';
  if (prioridade === 'media') return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

const getStatusBadge = (status) => {
  if (status === 'concluida') return 'bg-green-100 text-green-800';
  if (status === 'em_andamento') return 'bg-blue-100 text-blue-800';
  return 'bg-yellow-100 text-yellow-800';
};

export default function ListaTarefas({ limit }) {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = async () => {
    setLoading(true);
    try {
      const data = await funcionarioService.getTarefas();
      let lista = data.results || data;
      if (limit) {
        lista = lista.slice(0, limit);
      }
      setTarefas(lista);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIniciar = async (id) => {
    setUpdating(id);
    try {
      await funcionarioService.iniciarTarefa(id);
      await carregarTarefas();
      toast({
        title: "Sucesso",
        description: "Tarefa iniciada!",
      });
    } catch (error) {
      console.error('Erro ao iniciar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar tarefa.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleConcluir = async (id) => {
    setUpdating(id);
    try {
      await funcionarioService.concluirTarefa(id);
      await carregarTarefas();
      toast({
        title: "Sucesso",
        description: "Tarefa concluída!",
      });
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao concluir tarefa.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tarefas.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            Nenhuma tarefa atribuída no momento.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tarefas.map((tarefa) => (
        <Card key={tarefa.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{tarefa.titulo}</h3>
                  <Badge className={getPrioridadeColor(tarefa.prioridade)}>
                    {tarefa.prioridade}
                  </Badge>
                  <Badge className={getStatusBadge(tarefa.status)}>
                    {tarefa.status === 'concluida' ? 'Concluída' : 
                     tarefa.status === 'em_andamento' ? 'Em andamento' : 'Pendente'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{tarefa.descricao}</p>
                {tarefa.data_limite && (
                  <p className="text-xs text-gray-400 mt-2">
                    Prazo: {new Date(tarefa.data_limite).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {tarefa.status === 'pendente' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleIniciar(tarefa.id)}
                    disabled={updating === tarefa.id}
                    className="border-blue-500 text-blue-600"
                  >
                    {updating === tarefa.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    Iniciar
                  </Button>
                )}
                {tarefa.status === 'em_andamento' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConcluir(tarefa.id)}
                    disabled={updating === tarefa.id}
                    className="border-green-500 text-green-600"
                  >
                    {updating === tarefa.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Concluir
                  </Button>
                )}
                {tarefa.status === 'concluida' && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Concluída
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}