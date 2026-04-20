import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Heart, Calendar, FileText, Loader2 } from 'lucide-react';
import { veterinarioService } from '@/services/veterinarioService';

export default function RegistroTratamento() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tratamentos, setTratamentos] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [formData, setFormData] = useState({
    animal_id: '',
    diagnostico: '',
    tratamento: '',
    medicacao: '',
    data_inicio: '',
    data_fim: '',
    observacoes: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [tratamentosData, animaisData] = await Promise.all([
        veterinarioService.getTratamentos(),
        veterinarioService.getAnimais({ status: 'ativo' })
      ]);
      setTratamentos(tratamentosData.results || tratamentosData);
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
      const novoTreatmento = await veterinarioService.registrarTratamento({
        animal_id: formData.animal_id,
        diagnostico: formData.diagnostico,
        tratamento: formData.tratamento,
        medicacao: formData.medicacao,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim || null,
        observacoes: formData.observacoes
      });
      
      setTratamentos([novoTreatmento, ...tratamentos]);
      setShowForm(false);
      setFormData({
        animal_id: '',
        diagnostico: '',
        tratamento: '',
        medicacao: '',
        data_inicio: '',
        data_fim: '',
        observacoes: ''
      });
      
    } catch (error) {
      console.error('Erro ao registrar tratamento:', error);
      alert('Erro ao registrar tratamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const tratamentosFiltrados = tratamentos.filter(t =>
    t.animal_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.animal_brinco?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-cyan-600" />
            Registro de Tratamentos
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
            <Heart className="h-5 w-5 text-cyan-600" />
            Registro de Tratamentos
          </CardTitle>
          <Button onClick={() => setShowForm(!showForm)} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Tratamento
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg bg-cyan-50">
              <h3 className="font-semibold mb-4">Registrar Novo Tratamento</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Animal *</Label>
                    <select 
                      className="w-full border rounded-lg p-2"
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
                    <Label>Diagnóstico *</Label>
                    <Input 
                      placeholder="Diagnóstico"
                      value={formData.diagnostico}
                      onChange={(e) => setFormData({...formData, diagnostico: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Tratamento *</Label>
                    <Input 
                      placeholder="Tipo de tratamento"
                      value={formData.tratamento}
                      onChange={(e) => setFormData({...formData, tratamento: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Medicação</Label>
                    <Input 
                      placeholder="Medicação utilizada"
                      value={formData.medicacao}
                      onChange={(e) => setFormData({...formData, medicacao: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Data de Início *</Label>
                    <Input 
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Data de Término</Label>
                    <Input 
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Observações</Label>
                    <Input 
                      placeholder="Observações adicionais"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Heart className="h-4 w-4 mr-2" />}
                    Registrar
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar por animal..." 
              className="pl-10" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          {tratamentosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum tratamento encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {tratamentosFiltrados.map((trat) => (
                <div key={trat.id} className="p-4 border rounded-lg hover:bg-cyan-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{trat.animal_nome || trat.animal_brinco}</h3>
                      <p className="text-sm text-gray-600 mt-1">Diagnóstico: {trat.diagnostico}</p>
                      <p className="text-sm text-gray-600">Tratamento: {trat.tratamento}</p>
                      {trat.medicacao && (
                        <p className="text-sm text-gray-600">Medicação: {trat.medicacao}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Início: {new Date(trat.data_inicio).toLocaleDateString('pt-BR')}
                        </span>
                        {trat.data_fim && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Término: {new Date(trat.data_fim).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      {trat.observacoes && (
                        <p className="text-sm text-gray-500 mt-2">{trat.observacoes}</p>
                      )}
                    </div>
                    <Badge className={trat.status === 'concluido' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      {trat.status === 'concluido' ? 'Concluído' : 'Em andamento'}
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