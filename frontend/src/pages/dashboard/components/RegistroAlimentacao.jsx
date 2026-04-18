import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Utensils, Plus, CheckCircle, Loader2 } from 'lucide-react';
import { funcionarioService } from '@/services/funcionarioService';

export default function RegistroAlimentacao() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [animais, setAnimais] = useState([]);
  const [tiposRacao, setTiposRacao] = useState([]);
  const [formData, setFormData] = useState({
    animal_id: '',
    tipo_racao_id: '',
    quantidade: '',
    horario: '',
    observacoes: ''
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [animaisData, racasData] = await Promise.all([
        funcionarioService.getAnimais({ status: 'ativo' }),
        funcionarioService.getTiposRacao()
      ]);
      setAnimais(animaisData.results || animaisData);
      setTiposRacao(racasData.results || racasData);
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
      await funcionarioService.registrarAlimentacao({
        animal_id: formData.animal_id,
        tipo_racao_id: formData.tipo_racao_id,
        quantidade_kg: parseFloat(formData.quantidade),
        horario: formData.horario,
        observacoes: formData.observacoes
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({ animal_id: '', tipo_racao_id: '', quantidade: '', horario: '', observacoes: '' });
      
    } catch (error) {
      console.error('Erro ao registrar alimentação:', error);
      alert('Erro ao registrar alimentação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const horarios = [
    { value: 'manha', label: 'Manhã (06:00 - 08:00)' },
    { value: 'tarde', label: 'Tarde (14:00 - 16:00)' },
    { value: 'noite', label: 'Noite (18:00 - 20:00)' }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-purple-600" />
            Registrar Alimentação
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-purple-600" />
          Registrar Alimentação
        </CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Alimentação registrada com sucesso!
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Animal / Lote</Label>
              <select 
                className="w-full border rounded-lg p-2"
                value={formData.animal_id}
                onChange={(e) => setFormData({...formData, animal_id: e.target.value})}
                required
              >
                <option value="">Selecione...</option>
                {animais.map(animal => (
                  <option key={animal.id} value={animal.id}>
                    {animal.brinco} - {animal.nome || 'Sem nome'} ({animal.especie})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Tipo de Ração</Label>
              <select 
                className="w-full border rounded-lg p-2"
                value={formData.tipo_racao_id}
                onChange={(e) => setFormData({...formData, tipo_racao_id: e.target.value})}
                required
              >
                <option value="">Selecione...</option>
                {tiposRacao.map(racao => (
                  <option key={racao.id} value={racao.id}>
                    {racao.nome} ({racao.peso_por_saco}kg/saco)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Quantidade (kg)</Label>
              <input 
                type="number" 
                step="0.1"
                className="w-full border rounded-lg p-2" 
                placeholder="Ex: 500"
                value={formData.quantidade}
                onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Horário</Label>
              <select 
                className="w-full border rounded-lg p-2"
                value={formData.horario}
                onChange={(e) => setFormData({...formData, horario: e.target.value})}
                required
              >
                <option value="">Selecione...</option>
                {horarios.map(horario => (
                  <option key={horario.value} value={horario.value}>{horario.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <Label>Observações</Label>
              <textarea 
                className="w-full border rounded-lg p-2" 
                rows="3" 
                placeholder="Informações adicionais..."
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              />
            </div>
          </div>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Registrar Alimentação
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}