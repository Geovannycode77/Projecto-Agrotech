import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Syringe, Calendar, Filter, Loader2 } from 'lucide-react';
import { veterinarioService } from '@/services/veterinarioService';

export default function RegistroVacinas() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vacinas, setVacinas] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [formData, setFormData] = useState({
    animal_id: '',
    vacina: '',
    data_aplicacao: '',
    proxima_dose: '',
    lote: '',
    veterinario: ''
  });

  const tiposVacina = [
    { value: 'Febre Aftosa', label: 'Febre Aftosa' },
    { value: 'Brucelose', label: 'Brucelose' },
    { value: 'Raiva', label: 'Raiva' },
    { value: 'Carbúnculo', label: 'Carbúnculo' },
    { value: 'Clostridiose', label: 'Clostridiose' },
    { value: 'Outra', label: 'Outra' }
  ];

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [vacinasData, animaisData] = await Promise.all([
        veterinarioService.getVacinas(),
        veterinarioService.getAnimais({ status: 'ativo' })
      ]);
      setVacinas(vacinasData.results || vacinasData);
      setAnimais(animaisData.results || animaisData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const novaVacina = await veterinarioService.registrarVacina({
        animal_id: formData.animal_id,
        vacina: formData.vacina,
        data_aplicacao: formData.data_aplicacao,
        proxima_dose: formData.proxima_dose,
        lote: formData.lote,
        veterinario: formData.veterinario
      });
      
      setVacinas([novaVacina, ...vacinas]);
      setShowForm(false);
      setFormData({ 
        animal_id: '', 
        vacina: '', 
        data_aplicacao: '', 
        proxima_dose: '', 
        lote: '', 
        veterinario: '' 
      });
      
    } catch (error) {
      console.error('Erro ao registrar vacina:', error);
      alert('Erro ao registrar vacina. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVacinas = vacinas.filter(v => 
    v.animal_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.animal_brinco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vacina?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5 text-cyan-600" />
            Registro de Vacinas
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5 text-cyan-600" />
            Registro de Vacinas
          </CardTitle>
          <Button onClick={() => setShowForm(!showForm)} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Vacina
          </Button>
        </CardHeader>
        <CardContent>
          {/* Formulário de Nova Vacina */}
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg bg-cyan-50">
              <h3 className="font-semibold mb-4">Registrar Nova Vacina</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Animal *</Label>
                    <select 
                      className="w-full border rounded-md p-2"
                      value={formData.animal_id}
                      onChange={(e) => setFormData({...formData, animal_id: e.target.value})}
                      required
                    >
                      <option value="">Selecione...</option>
                      {animais.map(animal => (
                        <option key={animal.id} value={animal.id}>
                          {animal.brinco} - {animal.nome || 'Sem nome'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Tipo de Vacina *</Label>
                    <select 
                      className="w-full border rounded-md p-2"
                      value={formData.vacina}
                      onChange={(e) => setFormData({...formData, vacina: e.target.value})}
                      required
                    >
                      <option value="">Selecione...</option>
                      {tiposVacina.map(vacina => (
                        <option key={vacina.value} value={vacina.value}>{vacina.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Data de Aplicação *</Label>
                    <Input 
                      type="date" 
                      value={formData.data_aplicacao} 
                      onChange={(e) => setFormData({...formData, data_aplicacao: e.target.value})} 
                      required 
                    />
                  </div>
                  <div>
                    <Label>Próxima Dose *</Label>
                    <Input 
                      type="date" 
                      value={formData.proxima_dose} 
                      onChange={(e) => setFormData({...formData, proxima_dose: e.target.value})} 
                      required 
                    />
                  </div>
                  <div>
                    <Label>Nº do Lote</Label>
                    <Input 
                      placeholder="Número do lote" 
                      value={formData.lote} 
                      onChange={(e) => setFormData({...formData, lote: e.target.value})} 
                    />
                  </div>
                  <div>
                    <Label>Veterinário Responsável *</Label>
                    <Input 
                      placeholder="Nome do veterinário" 
                      value={formData.veterinario} 
                      onChange={(e) => setFormData({...formData, veterinario: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Syringe className="h-4 w-4 mr-2" />}
                    Registrar
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Busca */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar por animal ou vacina..." 
              className="pl-10" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          {/* Lista de Vacinas */}
          {filteredVacinas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma vacina encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Animal</th>
                    <th className="px-4 py-3 text-left">Vacina</th>
                    <th className="px-4 py-3 text-left">Data Aplicação</th>
                    <th className="px-4 py-3 text-left">Próxima Dose</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVacinas.map((vacina) => {
                    const hoje = new Date();
                    const proximaDose = new Date(vacina.proxima_dose);
                    const isProxima = proximaDose > hoje && proximaDose - hoje < 7 * 24 * 60 * 60 * 1000;
                    const status = vacina.status || (isProxima ? 'proxima' : 'aplicada');
                    
                    return (
                      <tr key={vacina.id} className="border-t hover:bg-cyan-50 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {vacina.animal_nome || vacina.animal_brinco}
                        </td>
                        <td className="px-4 py-3">{vacina.vacina}</td>
                        <td className="px-4 py-3">
                          {new Date(vacina.data_aplicacao).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(vacina.proxima_dose).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={
                            status === 'aplicada' ? 'bg-green-100 text-green-800' :
                            status === 'proxima' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {status === 'aplicada' ? 'Aplicada' : 
                             status === 'proxima' ? 'Próxima' : 'Pendente'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}