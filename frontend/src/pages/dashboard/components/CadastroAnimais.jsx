import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Save, Trash2, Eye, Loader2, CalendarIcon, Weight, Tag, Info,
} from "lucide-react";
import PerfilAnimal from "./PerfilAnimal";
import { produtorService } from "@/services/ProdutorService";
import { toast } from "@/hooks/use-toast";
import useConfirm from "@/components/ui/useConfirm";

export default function CadastroAnimais() {
  const confirm = useConfirm();
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [showPerfil, setShowPerfil] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    brinco: "",
    nome: "",
    raca: "",
    sexo: "M",
    data_nascimento: "",
    peso_atual: "",
    observacoes: "",
  });

  useEffect(() => {
    carregarAnimais();
  }, []);

  const carregarAnimais = async () => {
    setLoading(true);
    try {
      const data = await produtorService.getAnimais();
      const lista = data.results || data;
      setAnimais(lista);

      // Pré-selecciona o próximo brinco disponível
      const proximoBrinco = calcularProximoBrinco(lista);
      setFormData(prev => ({
        ...prev,
        brinco: proximoBrinco,
      }));

    } catch (error) {
      console.error("Erro ao carregar animais:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcula o próximo brinco disponível
  const calcularProximoBrinco = (lista) => {
    const brincosTodos = new Set(lista.map(a => a.brinco));
    let proximo = 1;
    while (brincosTodos.has(`BR-${String(proximo).padStart(3, '0')}`)) {
      proximo++;
    }
    return `BR-${String(proximo).padStart(3, '0')}`;
  };

  const validateDate = (date) => {
    if (!date) return "Data de nascimento é obrigatória";
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) return "A data de nascimento não pode ser futura";
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 25);
    if (selectedDate < minDate) return "Data inválida. Gado vive no máximo 25 anos.";
    return '';
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return "Não informada";
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return `${idade} ${idade === 1 ? "ano" : "anos"}`;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (touched[id]) {
      let error = '';
      if (id === 'data_nascimento') error = validateDate(value);
      setErrors({ ...errors, [id]: error });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    let error = '';
    if (field === 'data_nascimento') error = validateDate(formData.data_nascimento);
    setErrors({ ...errors, [field]: error });
  };

  const getFieldError = (field) => touched[field] && errors[field] ? errors[field] : '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dateError = validateDate(formData.data_nascimento);
    if (dateError) {
      setErrors({ ...errors, data_nascimento: dateError });
      setTouched({ ...touched, data_nascimento: true });
      toast({ title: "Erro", description: dateError, variant: "destructive" });
      return;
    }

    if (!formData.brinco.trim()) {
      toast({ title: "Erro", description: "Selecione um brinco.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const novoAnimal = await produtorService.createAnimal({
        ...formData,
        especie: "bovino",
        peso_atual: parseFloat(formData.peso_atual) || 0,
        data_nascimento: formData.data_nascimento || null,
      });

      const novaLista = [novoAnimal, ...animais];
      setAnimais(novaLista);

      // Avança para o próximo brinco disponível após cadastrar
      const proximoBrinco = calcularProximoBrinco(novaLista);

      setFormData({
        brinco: proximoBrinco,
        nome: "",
        raca: "",
        sexo: "M",
        data_nascimento: "",
        peso_atual: "",
        observacoes: "",
      });
      setErrors({});
      setTouched({});

      toast({ title: "Sucesso", description: "Animal cadastrado com sucesso!" });
    } catch (error) {
      console.error("Erro ao cadastrar animal:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao cadastrar animal.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const ok = await confirm("Confirmar exclusão", "Tem certeza que deseja excluir este animal?");
      if (!ok) return;
      await produtorService.deleteAnimal(id);
      const novaLista = animais.filter(a => a.id !== id);
      setAnimais(novaLista);
      toast({ title: "Sucesso", description: "Animal excluído com sucesso!" });
    } catch (error) {
      console.error("Erro ao excluir animal:", error);
      toast({ title: "Erro", description: "Erro ao excluir animal.", variant: "destructive" });
    }
  };

  const handleVerPerfil = (animal) => {
    setAnimalSelecionado(animal);
    setShowPerfil(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      ativo:   "bg-emerald-100 text-emerald-800",
      doente:  "bg-red-100 text-red-800",
      atencao: "bg-yellow-100 text-yellow-800",
      vendido: "bg-gray-100 text-gray-800",
      morto:   "bg-black/10 text-gray-800",
    };
    return colors[status] || "bg-emerald-100 text-emerald-800";
  };

  if (showPerfil && animalSelecionado) {
    return (
      <PerfilAnimal
        animal={animalSelecionado}
        onVoltar={() => setShowPerfil(false)}
        onAtualizar={async (animalAtualizado) => {
          try {
            const updated = await produtorService.updateAnimal(animalAtualizado.id, animalAtualizado);
            setAnimais(animais.map(a => a.id === updated.id ? updated : a));
            setShowPerfil(false);
          } catch (error) {
            console.error("Erro ao atualizar animal:", error);
            toast({ title: "Erro", description: "Erro ao atualizar animal.", variant: "destructive" });
          }
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Cadastrar Novo Animal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Brinco — mostra apenas o próximo disponível */}
              <div>
                <Label htmlFor="brinco">Número do Brinco *</Label>
                <select
                  id="brinco"
                  className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.brinco}
                  onChange={e => setFormData({ ...formData, brinco: e.target.value })}
                  required
                >
                  {formData.brinco ? (
                    <option value={formData.brinco}>{formData.brinco}</option>
                  ) : (
                    <option value="">Nenhum brinco disponível</option>
                  )}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Próximo brinco disponível atribuído automaticamente
                </p>
              </div>

              <div>
                <Label htmlFor="raca">Raça</Label>
                <Input
                  id="raca"
                  value={formData.raca}
                  onChange={handleChange}
                  placeholder="Ex: Nelore, Brahman, Brangus, Hereford, Senepol..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="sexo">Sexo *</Label>
                <select
                  id="sexo"
                  className="w-full border rounded-md p-2 mt-1"
                  value={formData.sexo}
                  onChange={e => setFormData({ ...formData, sexo: e.target.value })}
                  required
                >
                  <option value="M">♂ Macho (Boi/Touro)</option>
                  <option value="F">♀ Fêmea (Vaca)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="data_nascimento">
                  <CalendarIcon className="h-4 w-4 inline mr-2" />
                  Data de Nascimento *
                </Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={handleChange}
                  onBlur={() => handleBlur('data_nascimento')}
                  className={errors.data_nascimento ? 'border-red-500' : ''}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
                {getFieldError('data_nascimento') && (
                  <p className="text-xs text-red-500">{getFieldError('data_nascimento')}</p>
                )}
                <p className="text-xs text-gray-400">💡 Gado vive até 25 anos</p>
              </div>

              <div>
                <Label htmlFor="peso_atual">
                  <Weight className="h-4 w-4 inline mr-2" />
                  Peso Actual (kg)
                </Label>
                <Input
                  id="peso_atual"
                  type="number"
                  step="0.1"
                  value={formData.peso_atual}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 450"
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="observacoes">
                  <Info className="h-4 w-4 inline mr-2" />
                  Observações
                </Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  placeholder="Saúde, vacinas, histórico..."
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700"
              disabled={submitting}
            >
              {submitting
                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                : <Save className="h-4 w-4 mr-2" />}
              Cadastrar Animal
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Rebanho Cadastrado ({animais.length} animais)</CardTitle>
        </CardHeader>
        <CardContent>
          {animais.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              🐄 Nenhum animal cadastrado. Comece cadastrando o seu rebanho.
            </div>
          ) : (
            <div className="overflow-auto max-h-72 border rounded-md">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm">Brinco</th>
                    <th className="px-4 py-2 text-left text-sm">Raça</th>
                    <th className="px-4 py-2 text-left text-sm">Sexo</th>
                    <th className="px-4 py-2 text-left text-sm">Idade</th>
                    <th className="px-4 py-2 text-left text-sm">Peso (kg)</th>
                    <th className="px-4 py-2 text-left text-sm">Estado</th>
                    <th className="px-4 py-2 text-left text-sm">Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {[...animais]
                    .sort((a, b) => {
                      const numA = parseInt(a.brinco?.match(/\d+/)?.[0] || 0);
                      const numB = parseInt(b.brinco?.match(/\d+/)?.[0] || 0);
                      return numA - numB;
                    })
                    .map(animal => (
                    <tr key={animal.id} className="border-t hover:bg-emerald-50 transition-colors">
                      <td className="px-4 py-2 font-medium">{animal.brinco}</td>
                      <td className="px-4 py-2">{animal.raca || "—"}</td>
                      <td className="px-4 py-2">
                        {animal.sexo === 'M' ? '♂ Macho' : '♀ Fêmea'}
                      </td>
                      <td className="px-4 py-2">
                        {animal.idade || calcularIdade(animal.data_nascimento)}
                      </td>
                      <td className="px-4 py-2">{animal.peso_atual || 0} kg</td>
                      <td className="px-4 py-2">
                        <Badge className={getStatusColor(animal.status)}>
                          {animal.status || "ativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-emerald-600"
                            onClick={() => handleVerPerfil(animal)} title="Ver perfil">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600"
                            onClick={() => handleDelete(animal.id)} title="Excluir">
                            <Trash2 className="h-4 w-4" />
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