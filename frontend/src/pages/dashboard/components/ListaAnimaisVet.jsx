import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, PawPrint, Heart, Eye, Stethoscope, Loader2 } from 'lucide-react';
import { veterinarioService } from '@/services/veterinarioService';

export default function ListaAnimaisVet() {
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroSaude, setFiltroSaude] = useState('todos');

  useEffect(() => {
    carregarAnimais();
  }, []);

  const carregarAnimais = async () => {
    setLoading(true);
    try {
      const data = await veterinarioService.getAnimais();
      setAnimais(data.results || data);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      saudavel: 'bg-emerald-100 text-emerald-800',
      atencao: 'bg-yellow-100 text-yellow-800',
      tratamento: 'bg-blue-100 text-blue-800',
      doente: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      saudavel: 'Saudável',
      atencao: 'Atenção',
      tratamento: 'Tratamento',
      doente: 'Doente'
    };
    return labels[status] || status;
  };

  const filteredAnimais = animais.filter(animal => {
    const matchesSearch = (animal.raca || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.brinco.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFiltro = filtroSaude === 'todos' || animal.status_saude === filtroSaude;
    return matchesSearch && matchesFiltro;
  });

  const handleVerPerfil = (animalId) => {
    // Navegar para o perfil do animal ou abrir modal
    console.log('Ver perfil do animal:', animalId);
  };

  const handleRegistrarConsulta = (animalId) => {
    // Abrir formulário de registro de consulta
    console.log('Registrar consulta para animal:', animalId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-cyan-600" />
            Lista de Animais
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
            <PawPrint className="h-5 w-5 text-cyan-600" />
            Lista de Animais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou brinco..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filtroSaude === 'todos' ? 'default' : 'outline'}
                onClick={() => setFiltroSaude('todos')}
                className={filtroSaude === 'todos' ? 'bg-cyan-600' : ''}
              >
                Todos
              </Button>
              <Button 
                variant={filtroSaude === 'saudavel' ? 'default' : 'outline'}
                onClick={() => setFiltroSaude('saudavel')}
                className={filtroSaude === 'saudavel' ? 'bg-emerald-600' : ''}
              >
                Saudáveis
              </Button>
              <Button 
                variant={filtroSaude === 'atencao' ? 'default' : 'outline'}
                onClick={() => setFiltroSaude('atencao')}
                className={filtroSaude === 'atencao' ? 'bg-yellow-600' : ''}
              >
                Atenção
              </Button>
              <Button 
                variant={filtroSaude === 'tratamento' ? 'default' : 'outline'}
                onClick={() => setFiltroSaude('tratamento')}
                className={filtroSaude === 'tratamento' ? 'bg-blue-600' : ''}
              >
                Tratamento
              </Button>
              <Button 
                variant={filtroSaude === 'doente' ? 'default' : 'outline'}
                onClick={() => setFiltroSaude('doente')}
                className={filtroSaude === 'doente' ? 'bg-red-600' : ''}
              >
                Doentes
              </Button>
            </div>
          </div>

          {/* Tabela de Animais */}
          {filteredAnimais.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum animal encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Brinco</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Raça</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Espécie</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Peso</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status Saúde</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnimais.map((animal) => (
                    <tr key={animal.id} className="border-t hover:bg-cyan-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{animal.brinco}</td>
                      <td className="px-4 py-3">{animal.raca || '-'}</td>
                      <td className="px-4 py-3 capitalize">{animal.especie}</td>
                      <td className="px-4 py-3">{animal.peso_atual} kg</td>

                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(animal.status_saude)}>
                          {getStatusLabel(animal.status_saude)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-cyan-600"
                            onClick={() => handleVerPerfil(animal.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-cyan-600"
                            onClick={() => handleRegistrarConsulta(animal.id)}
                          >
                            <Stethoscope className="h-4 w-4" />
                          </Button>
                        </div>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}