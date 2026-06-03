import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PawPrint, Weight, Baby, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { funcionarioService } from '@/services/funcionarioService';
import { toast } from '@/hooks/use-toast';

export default function AtualizarAnimais() {
  const [animais, setAnimais] = useState([]);
  const [loadingAnimais, setLoadingAnimais] = useState(true);
  const [submitting, setSubmitting] = useState({ peso: false, nascimento: false, morte: false });
  const [success, setSuccess] = useState({ peso: false, nascimento: false, morte: false });

  const [pesoData, setPesoData] = useState({ animal: '', peso: '' });
  const [nascimentoData, setNascimentoData] = useState({
    especie: '', quantidade: 1, mae: '', data_nascimento: new Date().toISOString().split('T')[0], observacoes: ''
  });
  const [morteData, setMorteData] = useState({ animal: '', data: new Date().toISOString().split('T')[0], causa: '' });

  useEffect(() => {
    carregarAnimais();
  }, []);

  const carregarAnimais = async () => {
    setLoadingAnimais(true);
    try {
      const data = await funcionarioService.getAnimais();
      setAnimais(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar os animais.', variant: 'destructive' });
    } finally {
      setLoadingAnimais(false);
    }
  };

  const showSuccess = (key) => {
    setSuccess(s => ({ ...s, [key]: true }));
    setTimeout(() => setSuccess(s => ({ ...s, [key]: false })), 3000);
  };

  const handlePesoSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(s => ({ ...s, peso: true }));
    try {
      await funcionarioService.atualizarPeso(pesoData.animal, pesoData.peso);
      showSuccess('peso');
      setPesoData({ animal: '', peso: '' });
      await carregarAnimais(); // atualiza lista com novo peso
    } catch (error) {
      console.error('Erro:', error.response?.data);
      toast({ title: 'Erro', description: 'Erro ao atualizar peso.', variant: 'destructive' });
    } finally {
      setSubmitting(s => ({ ...s, peso: false }));
    }
  };

  const handleNascimentoSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(s => ({ ...s, nascimento: true }));
    try {
      await funcionarioService.registrarNascimento({
        especie:         nascimentoData.especie,
        quantidade:      nascimentoData.quantidade,
        mae:             nascimentoData.mae || null,
        data_nascimento: nascimentoData.data_nascimento,
        observacoes:     nascimentoData.observacoes,
      });
      showSuccess('nascimento');
      setNascimentoData({
        especie: '', quantidade: 1, mae: '',
        data_nascimento: new Date().toISOString().split('T')[0], observacoes: ''
      });
    } catch (error) {
      console.error('Erro:', error.response?.data);
      toast({ title: 'Erro', description: 'Erro ao registrar nascimento.', variant: 'destructive' });
    } finally {
      setSubmitting(s => ({ ...s, nascimento: false }));
    }
  };

  const handleMorteSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(s => ({ ...s, morte: true }));
    try {
      await funcionarioService.registrarMorte({
        animal:      morteData.animal,
        data_hora:   new Date(morteData.data).toISOString(),
        descricao:   morteData.causa,
        novo_status: 'morto',
      });
      showSuccess('morte');
      setMorteData({ animal: '', data: new Date().toISOString().split('T')[0], causa: '' });
      await carregarAnimais();
    } catch (error) {
      console.error('Erro:', error.response?.data);
      toast({ title: 'Erro', description: 'Erro ao registrar óbito.', variant: 'destructive' });
    } finally {
      setSubmitting(s => ({ ...s, morte: false }));
    }
  };

  const especiesOptions = [
    { value: 'bovino',  label: 'Bovino' },
  ];

  const causasMorte = ['Doença', 'Acidente', 'Idade avançada', 'Complicação no parto', 'Outro'];

  const getAnimalLabel = (a) =>
    `${a.brinco || a.id} ${a.nome ? `- ${a.nome}` : ''} ${a.especie_display ? `(${a.especie_display})` : ''}`.trim();

  // Só fêmeas para seleção de mãe
  const femeas = animais.filter(a => a.sexo === 'F' && a.status === 'ativo');

  if (loadingAnimais) {
    return (
      <Card>
        <CardContent className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PawPrint className="h-5 w-5 text-purple-600" />
          Atualizar Dados dos Animais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">

          {/* ── Atualizar Peso ── */}
          <div className="border-b pb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Weight className="h-4 w-4 text-purple-600" />
              Atualizar Peso
            </h3>
            {success.peso && (
              <div className="mb-3 p-2 bg-green-50 text-green-800 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Peso atualizado com sucesso!
              </div>
            )}
            <form onSubmit={handlePesoSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="border rounded-lg p-2"
                value={pesoData.animal}
                onChange={e => setPesoData({ ...pesoData, animal: e.target.value })}
                required
              >
                <option value="">Selecione o animal</option>
                {animais.map(a => (
                  <option key={a.id} value={a.id}>{getAnimalLabel(a)}</option>
                ))}
              </select>
              <input
                type="number"
                step="0.1"
                min="0"
                className="border rounded-lg p-2"
                placeholder="Peso atual (kg)"
                value={pesoData.peso}
                onChange={e => setPesoData({ ...pesoData, peso: e.target.value })}
                required
              />
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={submitting.peso}>
                {submitting.peso ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Atualizar Peso'}
              </Button>
            </form>
          </div>

          {/* ── Registrar Nascimento ── */}
          <div className="border-b pb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Baby className="h-4 w-4 text-purple-600" />
              Registrar Nascimento
            </h3>
            {success.nascimento && (
              <div className="mb-3 p-2 bg-green-50 text-green-800 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Nascimento registrado com sucesso!
              </div>
            )}
            <form onSubmit={handleNascimentoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Espécie *</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={nascimentoData.especie}
                  onChange={e => setNascimentoData({ ...nascimentoData, especie: e.target.value })}
                  required
                >
                  <option value="">Selecione a espécie</option>
                  {especiesOptions.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Quantidade *</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border rounded-lg p-2"
                  value={nascimentoData.quantidade}
                  onChange={e => setNascimentoData({ ...nascimentoData, quantidade: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Mãe <span className="text-gray-400 text-xs">(opcional)</span>
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={nascimentoData.mae}
                  onChange={e => setNascimentoData({ ...nascimentoData, mae: e.target.value })}
                >
                  <option value="">Selecione a mãe</option>
                  {femeas.map(a => (
                    <option key={a.id} value={a.id}>{getAnimalLabel(a)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Data do Nascimento *</label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-2"
                  value={nascimentoData.data_nascimento}
                  onChange={e => setNascimentoData({ ...nascimentoData, data_nascimento: e.target.value })}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600 mb-1 block">
                  Observações <span className="text-gray-400 text-xs">(opcional)</span>
                </label>
                <textarea
                  className="w-full border rounded-lg p-2"
                  rows="2"
                  placeholder="Ex: nascimento gemelar, parto normal..."
                  value={nascimentoData.observacoes}
                  onChange={e => setNascimentoData({ ...nascimentoData, observacoes: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto" disabled={submitting.nascimento}>
                  {submitting.nascimento ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Baby className="h-4 w-4 mr-2" />}
                  Registrar Nascimento
                </Button>
              </div>
            </form>
          </div>

          {/* ── Registrar Óbito ── */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Registrar Óbito
            </h3>
            {success.morte && (
              <div className="mb-3 p-2 bg-green-50 text-green-800 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Óbito registrado com sucesso!
              </div>
            )}
            <form onSubmit={handleMorteSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Animal *</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={morteData.animal}
                  onChange={e => setMorteData({ ...morteData, animal: e.target.value })}
                  required
                >
                  <option value="">Selecione o animal</option>
                  {animais.filter(a => a.status !== 'morto').map(a => (
                    <option key={a.id} value={a.id}>{getAnimalLabel(a)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Data *</label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-2"
                  value={morteData.data}
                  onChange={e => setMorteData({ ...morteData, data: e.target.value })}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600 mb-1 block">Causa *</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={morteData.causa}
                  onChange={e => setMorteData({ ...morteData, causa: e.target.value })}
                  required
                >
                  <option value="">Selecione a causa</option>
                  {causasMorte.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="bg-red-600 hover:bg-red-700 w-full md:w-auto" disabled={submitting.morte}>
                  {submitting.morte ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                  Registrar Óbito
                </Button>
              </div>
            </form>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}