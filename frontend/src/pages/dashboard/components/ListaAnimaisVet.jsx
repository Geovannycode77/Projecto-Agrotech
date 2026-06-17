import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, PawPrint, Eye, Stethoscope, Loader2 } from 'lucide-react';
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

  const getStatusColor = (status) => ({
    ativo:   'bg-emerald-100 text-emerald-800',
    doente:  'bg-red-100 text-red-800',
    morto:   'bg-gray-100 text-gray-800',
    vendido: 'bg-blue-100 text-blue-800',
  }[status] || 'bg-gray-100 text-gray-800');

  const getStatusLabel = (status) => ({
    ativo:   'Saudável',
    doente:  'Doente',
    morto:   'Morto',
    vendido: 'Vendido',
  }[status] || status);

  // ✅ CORRIGIDO: valores agora batem com os do model Django
  const FILTROS = [
    { value: 'todos',   label: 'Todos',     color: 'bg-cyan-600' },
    { value: 'ativo',   label: 'Saudáveis', color: 'bg-emerald-600' },
    { value: 'doente',  label: 'Doentes',   color: 'bg-red-600' },
    { value: 'morto',   label: 'Mortos',    color: 'bg-gray-600' },
    { value: 'vendido', label: 'Vendidos',  color: 'bg-blue-600' },
  ];

  const filteredAnimais = animais.filter(animal => {
    const matchesSearch =
      (animal.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.brinco || '').toLowerCase().includes(searchTerm.toLowerCase());
    // ✅ CORRIGIDO: compara animal.status (campo real) em vez de animal.status_saude
    const matchesFiltro = filtroSaude === 'todos' || animal.status === filtroSaude;
    return matchesSearch && matchesFiltro;
  });

  const handleVerPerfil = (animalId) => {
    console.log('Ver perfil do animal:', animalId);
  };

  const handleRegistrarConsulta = (animalId) => {
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou brinco..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTROS.map(({ value, label, color }) => (
                <Button
                  key={value}
                  variant={filtroSaude === value ? 'default' : 'outline'}
                  onClick={() => setFiltroSaude(value)}
                  className={filtroSaude === value ? color : ''}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tabela */}
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
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Espécie</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Raça</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Peso</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status Saúde</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnimais.map((animal) => (
                    <tr key={animal.id} className="border-t hover:bg-cyan-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{animal.brinco}</td>
                      <td className="px-4 py-3">{animal.nome || '-'}</td>
                      <td className="px-4 py-3 capitalize">{animal.especie}</td>
                      <td className="px-4 py-3">{animal.raca || '-'}</td>
                      <td className="px-4 py-3">{animal.peso_atual} kg</td>
                      <td className="px-4 py-3">
                        {/* ✅ CORRIGIDO: usa animal.status (campo real do model) */}
                        <Badge className={getStatusColor(animal.status)}>
                          {getStatusLabel(animal.status)}
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