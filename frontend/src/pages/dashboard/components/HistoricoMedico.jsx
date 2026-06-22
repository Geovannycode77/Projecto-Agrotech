import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, FileText, Loader2 } from 'lucide-react';
import { veterinarioService } from '@/services/veterinarioService';

export default function HistoricoMedico() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [animalSelecionado, setAnimalSelecionado] = useState('');
  const [animais, setAnimais] = useState([]);

  useEffect(() => {
    carregarAnimais();
    carregarHistoricoGeral();
  }, []);

  const carregarAnimais = async () => {
    try {
      const data = await veterinarioService.getAnimais();
      setAnimais(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
    }
  };

  // Carrega histórico agregando consultas + vacinas + tratamentos
  const carregarHistoricoGeral = async (animalId = null) => {
    setLoading(true);
    try {
      const params = animalId ? { animal: animalId } : {};
      const [consultas, vacinas, tratamentos] = await Promise.allSettled([
        veterinarioService.getConsultas(params),
        veterinarioService.getVacinas(params),
        veterinarioService.getTratamentos(params),
      ]);

      const lista = [];

      if (consultas.status === 'fulfilled') {
        const d = Array.isArray(consultas.value) ? consultas.value : consultas.value.results || [];
        d.forEach(c => lista.push({
          id: `consulta-${c.id}`,
          tipo: 'consulta',
          animal_nome: c.animal_brinco || '—',
          descricao: c.descricao || c.tipo || '—',
          data: c.data_consulta,
          status: c.status,
          veterinario_nome: c.veterinario_nome || '—',
        }));
      }

      if (vacinas.status === 'fulfilled') {
        const d = Array.isArray(vacinas.value) ? vacinas.value : vacinas.value.results || [];
        d.forEach(v => lista.push({
          id: `vacina-${v.id}`,
          tipo: 'vacina',
          animal_nome:  v.animal_brinco || '—',
          descricao: v.nome_vacina || v.vacina || '—',
          data: v.data_aplicacao,
          status: 'concluido',
          proxima_dose: v.data_proxima_dose || v.proxima_dose,
          veterinario_nome: v.veterinario_nome || '—',
        }));
      }

      if (tratamentos.status === 'fulfilled') {
        const d = Array.isArray(tratamentos.value) ? tratamentos.value : tratamentos.value.results || [];
        d.forEach(t => lista.push({
          id: `tratamento-${t.id}`,
          tipo: 'tratamento',
          animal_nome: t.animal_brinco || '—',
          descricao: t.diagnostico || t.tratamento || '—',
          data: t.data_inicio,
          status: t.status,
          veterinario_nome: t.veterinario_nome || '—',
        }));
      }

      // Ordena por data decrescente
      lista.sort((a, b) => new Date(b.data) - new Date(a.data));
      setHistorico(lista);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimalChange = (animalId) => {
    setAnimalSelecionado(animalId);
    carregarHistoricoGeral(animalId || null);
  };

  const getTipoIcon = (tipo) => ({ consulta: '🏥', tratamento: '💊', vacina: '💉' }[tipo] || '📋');
  const getTipoLabel = (tipo) => ({ consulta: 'Consulta', tratamento: 'Tratamento', vacina: 'Vacina' }[tipo] || tipo);

  const filteredHistorico = historico.filter(item => {
    const matchesSearch = item.animal_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFiltro = filtroTipo === 'todos' || item.tipo === filtroTipo;
    return matchesSearch && matchesFiltro;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-cyan-600" />Histórico Médico</CardTitle></CardHeader>
        <CardContent><div className="flex justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-cyan-600 self-center" /></div></CardContent>
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
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar por animal..." className="pl-10"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select className="border rounded-lg px-3 py-2 text-sm"
              value={animalSelecionado}
              onChange={e => handleAnimalChange(e.target.value)}>
              <option value="">Todos os animais</option>
              {animais.map(a => (
                <option key={a.id} value={a.id}>
                  {a.brinco} - ({a.status})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {['todos','consulta','tratamento','vacina'].map(tipo => (
              <Button key={tipo}
                variant={filtroTipo === tipo ? 'default' : 'outline'}
                onClick={() => setFiltroTipo(tipo)}
                className={filtroTipo === tipo ? 'bg-cyan-600' : ''}>
                {tipo === 'todos' ? 'Todos' : getTipoLabel(tipo) + 's'}
              </Button>
            ))}
          </div>

          {filteredHistorico.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum registro encontrado.</div>
          ) : (
            <div className="space-y-3">
              {filteredHistorico.map(item => (
                <div key={item.id} className="p-4 border rounded-lg hover:bg-cyan-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTipoIcon(item.tipo)}</span>
                      <div>
                        <p className="text-sm text-gray-600">{getTipoLabel(item.tipo)}: {item.descricao}</p>
                        <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '—'}
                          </span>
                          <span>Vet: {item.veterinario_nome}</span>
                          {item.proxima_dose && (
                            <span className="text-amber-600">
                              Próxima dose: {new Date(item.proxima_dose).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={item.status === 'concluido' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {item.status === 'concluido' ? 'Concluído' : item.status === 'em_andamento' ? 'Em andamento' : item.status || '—'}
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