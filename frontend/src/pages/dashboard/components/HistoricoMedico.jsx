import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, FileText, Filter, Loader2 } from 'lucide-react';
import { veterinarioService } from '@/services/veterinarioService';

export default function HistoricoMedico() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [animais, setAnimais] = useState([]);

  useEffect(() => {
    carregarHistorico();
    carregarAnimais();
  }, []);

  const carregarHistorico = async () => {
    setLoading(true);
    try {
      let data;
      if (animalSelecionado) {
        data = await veterinarioService.getHistoricoMedico(animalSelecionado);
      } else {
        data = await veterinarioService.getHistoricoMedico(null);
      }
      setHistorico(data.results || data);
    } catch (error) {
      console.error('Erro ao carregar histórico médico:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarAnimais = async () => {
    try {
      const data = await veterinarioService.getAnimais();
      setAnimais(data.results || data);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
    }
  };

  const handleAnimalChange = async (animalId) => {
    setAnimalSelecionado(animalId);
    setLoading(true);
    try {
      let data;
      if (animalId) {
        data = await veterinarioService.getHistoricoMedico(animalId);
      } else {
        data = await veterinarioService.getHistoricoMedico(null);
      }
      setHistorico(data.results || data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      consulta: '🏥',
      tratamento: '💊',
      vacina: '💉',
      emergencia: '🚨'
    };
    return icons[tipo] || '📋';
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      consulta: 'Consulta',
      tratamento: 'Tratamento',
      vacina: 'Vacina',
      emergencia: 'Emergência'
    };
    return labels[tipo] || tipo;
  };

  const filteredHistorico = historico.filter(item => {
    const matchesSearch = item.animal_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.animal_brinco?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFiltro = filtroTipo === 'todos' || item.tipo === filtroTipo;
    return matchesSearch && matchesFiltro;
  });

  if (loading && historico.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-600" />
            Histórico Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-600" />
            Histórico Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por animal..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="border rounded-lg px-3 py-2 text-sm"
              value={animalSelecionado || ''}
              onChange={(e) => handleAnimalChange(e.target.value || null)}
            >
              <option value="">Todos os animais</option>
              {animais.map(animal => (
                <option key={animal.id} value={animal.id}>
                  {animal.brinco} - {animal.nome || 'Sem nome'}
                </option>
              ))}
            </select>
          </div>

          {/* Botões de filtro por tipo */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              variant={filtroTipo === 'todos' ? 'default' : 'outline'} 
              onClick={() => setFiltroTipo('todos')} 
              className={filtroTipo === 'todos' ? 'bg-cyan-600' : ''}
            >
              Todos
            </Button>
            <Button 
              variant={filtroTipo === 'consulta' ? 'default' : 'outline'} 
              onClick={() => setFiltroTipo('consulta')} 
              className={filtroTipo === 'consulta' ? 'bg-cyan-600' : ''}
            >
              Consultas
            </Button>
            <Button 
              variant={filtroTipo === 'tratamento' ? 'default' : 'outline'} 
              onClick={() => setFiltroTipo('tratamento')} 
              className={filtroTipo === 'tratamento' ? 'bg-cyan-600' : ''}
            >
              Tratamentos
            </Button>
            <Button 
              variant={filtroTipo === 'vacina' ? 'default' : 'outline'} 
              onClick={() => setFiltroTipo('vacina')} 
              className={filtroTipo === 'vacina' ? 'bg-cyan-600' : ''}
            >
              Vacinas
            </Button>
          </div>

          {/* Lista de Histórico */}
          {filteredHistorico.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum registro encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistorico.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg hover:bg-cyan-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTipoIcon(item.tipo)}</span>
                      <div>
                        <h3 className="font-semibold">
                          {item.animal_nome || item.animal_brinco}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getTipoLabel(item.tipo)}: {item.descricao || item.diagnostico}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.data).toLocaleDateString('pt-BR')}
                          </span>
                          <span>Veterinário: {item.veterinario_nome || item.veterinario}</span>
                          {item.proxima_dose && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Calendar className="h-3 w-3" />
                              Próxima dose: {new Date(item.proxima_dose).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={item.status === 'concluido' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {item.status === 'concluido' ? 'Concluído' : item.status === 'em_andamento' ? 'Em andamento' : 'Agendado'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}