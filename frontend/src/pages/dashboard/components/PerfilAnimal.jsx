import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PawPrint, 
  Calendar, 
  Weight, 
  Syringe, 
  Heart, 
  Activity,
  Stethoscope,
  FileText,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Loader2
} from 'lucide-react';
import { veterinarioService } from '@/services/veterinarioService';

export default function PerfilAnimal({ animal, onVoltar, onAtualizar }) {
  const [editando, setEditando] = useState(false);
  const [dadosAnimal, setDadosAnimal] = useState(animal);
  const [historicoSaude, setHistoricoSaude] = useState([]);
  const [proximasVacinas, setProximasVacinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDadosAdicionais();
  }, [animal.id]);

  const carregarDadosAdicionais = async () => {
    setLoading(true);
    try {
      const [historico, vacinas] = await Promise.all([
        veterinarioService.getHistoricoMedico(animal.id),
        veterinarioService.getVacinas({ animal_id: animal.id, proximas: true })
      ]);
      
      setHistoricoSaude(historico.results || historico);
      setProximasVacinas(vacinas.results || vacinas);
    } catch (error) {
      console.error('Erro ao carregar dados adicionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      // Aqui você chamaria a API para atualizar o animal
      // const updated = await produtorService.updateAnimal(dadosAnimal.id, dadosAnimal);
      onAtualizar(dadosAnimal);
      setEditando(false);
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
    } finally {
      setSalvando(false);
    }
  };

  const InfoCard = ({ icon: Icon, label, value, color = "text-emerald-600" }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <Icon className={`h-5 w-5 ${color}`} />
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        {editando ? (
          <input 
            type="text" 
            className="w-full font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-emerald-500 outline-none"
            value={value}
            onChange={(e) => setDadosAnimal({...dadosAnimal, [label.toLowerCase().replace(/ /g, '_')]: e.target.value})}
          />
        ) : (
          <p className="font-medium text-gray-800">{value || '-'}</p>
        )}
      </div>
    </div>
  );

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
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
            <PawPrint className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">{dadosAnimal.nome || dadosAnimal.brinco}</CardTitle>
            <p className="text-gray-500 text-sm">Brinco: {dadosAnimal.brinco} • {dadosAnimal.especie}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onVoltar}>
            <X className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          {editando ? (
            <Button onClick={handleSalvar} className="bg-emerald-600 hover:bg-emerald-700" disabled={salvando}>
              {salvando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setEditando(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Status do Animal */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={dadosAnimal.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
              {dadosAnimal.status === 'ativo' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
              {dadosAnimal.status === 'ativo' ? 'Ativo' : dadosAnimal.status === 'doente' ? 'Doente' : 'Em observação'}
            </Badge>
            <Badge className={dadosAnimal.vacinacao === 'atualizada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              <Syringe className="h-3 w-3 mr-1" />
              Vacinação {dadosAnimal.vacinacao || 'pendente'}
            </Badge>
          </div>

          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard icon={PawPrint} label="Raça" value={dadosAnimal.raca} />
            <InfoCard icon={Calendar} label="Idade" value={dadosAnimal.idade} />
            <InfoCard icon={Weight} label="Peso" value={`${dadosAnimal.peso_atual} kg`} />
            <InfoCard icon={Heart} label="Sexo" value={dadosAnimal.sexo === 'M' ? 'Macho' : 'Fêmea'} />
            <InfoCard icon={Calendar} label="Data Nascimento" value={dadosAnimal.data_nascimento ? new Date(dadosAnimal.data_nascimento).toLocaleDateString('pt-BR') : '-'} />
            <InfoCard icon={Syringe} label="Última Vacina" value={dadosAnimal.ultima_vacina ? new Date(dadosAnimal.ultima_vacina).toLocaleDateString('pt-BR') : '-'} />
          </div>

          {/* Próximas Vacinas */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Syringe className="h-4 w-4 text-emerald-600" />
              Próximas Vacinas
            </h3>
            {proximasVacinas.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nenhuma vacina programada para este animal.
              </div>
            ) : (
              <div className="space-y-3">
                {proximasVacinas.map((vacina, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{vacina.nome}</p>
                      <p className="text-sm text-gray-500">
                        Data: {new Date(vacina.data_programada).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Em {vacina.dias_restantes} dias
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico de Saúde */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              Histórico de Saúde
            </h3>
            {historicoSaude.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nenhum registro de saúde encontrado.
              </div>
            ) : (
              <div className="space-y-3">
                {historicoSaude.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-full">
                        <Stethoscope className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">{item.titulo || item.evento}</p>
                        <p className="text-sm text-gray-500">
                          Veterinário: {item.veterinario_nome || item.veterinario}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(item.data).toLocaleDateString('pt-BR')}
                      </p>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {item.status === 'concluido' ? 'Concluído' : 'Registrado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              Observações
            </h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              {editando ? (
                <textarea 
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                  value={dadosAnimal.observacoes || ''}
                  onChange={(e) => setDadosAnimal({...dadosAnimal, observacoes: e.target.value})}
                />
              ) : (
                <p className="text-gray-600">{dadosAnimal.observacoes || 'Nenhuma observação registrada.'}</p>
              )}
            </div>
          </div>

          {/* Última Avaliação */}
          {dadosAnimal.ultima_avaliacao && (
            <div className="p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">Última avaliação realizada por:</p>
                  <p className="font-medium">
                    {dadosAnimal.ultimo_veterinario} - {new Date(dadosAnimal.ultima_avaliacao).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-500">{dadosAnimal.ultimo_comentario || 'Sem comentários adicionais.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}