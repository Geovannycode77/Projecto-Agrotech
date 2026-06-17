import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Utensils } from 'lucide-react';
import { funcionarioService } from '@/services/FuncionarioService';
import { toast } from '@/hooks/use-toast';

export default function RegistroAlimentacao() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [animais, setAnimais] = useState([]);
  const [tiposRacao, setTiposRacao] = useState([]);
  const [form, setForm] = useState({
    animal_id: '',
    tipo_racao: '',
    quantidade_kg: '',
    observacoes: '',
    horario: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [animaisData, tiposData] = await Promise.all([
        funcionarioService.getAnimais(),
        funcionarioService.getTiposRacao()
      ]);
      setAnimais(animaisData.results || animaisData);
      setTiposRacao(tiposData.results || tiposData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await funcionarioService.registrarAlimentacao({
        animal_id: form.animal_id,
        tipo_racao: form.tipo_racao,
        quantidade_kg: parseFloat(form.quantidade_kg),
        observacoes: form.observacoes,
        horario: form.horario
      });

      setForm({
        animal_id: '',
        tipo_racao: '',
        quantidade_kg: '',
        observacoes: '',
        horario: ''
      });

      toast({
        title: "Sucesso",
        description: "Alimentação registrada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao registrar alimentação:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar alimentação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-emerald-600" />
          Registrar Alimentação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Animal</Label>
              <select
                className="w-full border rounded-lg p-2"
                value={form.animal_id}
                onChange={(e) => setForm({ ...form, animal_id: e.target.value })}
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
              <Label>Tipo de Ração</Label>
              <select
                className="w-full border rounded-lg p-2"
                value={form.tipo_racao}
                onChange={(e) => setForm({ ...form, tipo_racao: e.target.value })}
                required
              >
                <option value="">Selecione...</option>
                {tiposRacao.map(tipo => (
                  <option key={tipo.id} value={tipo.nome}>
                    {tipo.nome} ({tipo.peso_por_saco}kg/saco)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Quantidade (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="Ex: 12.5"
                value={form.quantidade_kg}
                onChange={(e) => setForm({ ...form, quantité_kg: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Horário</Label>
              <Input
                type="time"
                value={form.horario}
                onChange={(e) => setForm({ ...form, horario: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Observações</Label>
            <textarea
              className="w-full border rounded-lg p-2 min-h-[80px]"
              placeholder="Observações adicionais..."
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Utensils className="h-4 w-4 mr-2" />}
            Registrar Alimentação
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}