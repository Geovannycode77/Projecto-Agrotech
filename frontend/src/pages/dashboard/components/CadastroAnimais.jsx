import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Edit,
  Trash2,
  Search,
  PawPrint,
  Calendar,
  Weight,
  Syringe,
  Heart,
  Eye,
  FileText,
  Loader2,
} from "lucide-react";
import PerfilAnimal from "./PerfilAnimal";
import { produtorService } from "@/services/produtorService";
import { toast } from "@/hooks/use-toast";
import useConfirm from "@/components/ui/useConfirm";

export default function CadastroAnimais() {
  const confirm = useConfirm();
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [showPerfil, setShowPerfil] = useState(false);
  const [formData, setFormData] = useState({
    brinco: "",
    nome: "",
    especie: "bovino",
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
      setAnimais(data.results || data);
    } catch (error) {
      console.error("Erro ao carregar animais:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular idade baseado na data de nascimento
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return "Não informada";
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return `${idade} ${idade === 1 ? "ano" : "anos"}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const novoAnimal = await produtorService.createAnimal({
        ...formData,
        peso_atual: parseFloat(formData.peso_atual),
        data_nascimento: formData.data_nascimento || null,
      });

      setAnimais([novoAnimal, ...animais]);
      setFormData({
        brinco: "",
        nome: "",
        especie: "bovino",
        raca: "",
        sexo: "M",
        data_nascimento: "",
        peso_atual: "",
        observacoes: "",
      });
      toast({
        title: "Sucesso",
        description: "Animal cadastrado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao cadastrar animal:", error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar animal. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const ok = await confirm(
        "Confirmar exclusão",
        "Tem certeza que deseja excluir este animal?",
      );
      if (!ok) return;
      await produtorService.deleteAnimal(id);
      setAnimais(animais.filter((animal) => animal.id !== id));
      toast({ title: "Sucesso", description: "Animal excluído com sucesso!" });
    } catch (error) {
      console.error("Erro ao excluir animal:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir animal. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleVerPerfil = (animal) => {
    setAnimalSelecionado(animal);
    setShowPerfil(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      ativo: "bg-emerald-100 text-emerald-800",
      doente: "bg-red-100 text-red-800",
      atencao: "bg-yellow-100 text-yellow-800",
      vendido: "bg-gray-100 text-gray-800",
      morto: "bg-black/10 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getVacinacaoColor = (status) => {
    const colors = {
      atualizada: "bg-green-100 text-green-800",
      pendente: "bg-yellow-100 text-yellow-800",
      atrasada: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (showPerfil && animalSelecionado) {
    return (
      <PerfilAnimal
        animal={animalSelecionado}
        onVoltar={() => setShowPerfil(false)}
        onAtualizar={async (animalAtualizado) => {
          try {
            const updated = await produtorService.updateAnimal(
              animalAtualizado.id,
              animalAtualizado,
            );
            setAnimais(animais.map((a) => (a.id === updated.id ? updated : a)));
            setShowPerfil(false);
          } catch (error) {
            console.error("Erro ao atualizar animal:", error);
            toast({
              title: "Erro",
              description: "Erro ao atualizar animal. Tente novamente.",
              variant: "destructive",
            });
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
      {/* Formulário de Cadastro */}
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Novo Animal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brinco">Número do Brinco *</Label>
                <Input
                  id="brinco"
                  value={formData.brinco}
                  onChange={(e) =>
                    setFormData({ ...formData, brinco: e.target.value })
                  }
                  placeholder="Ex: BR-001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nome">Nome do Animal</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Nome opcional"
                />
              </div>
              <div>
                <Label htmlFor="especie">Espécie *</Label>
                <select
                  id="especie"
                  className="w-full border rounded-md p-2"
                  value={formData.especie}
                  onChange={(e) =>
                    setFormData({ ...formData, especie: e.target.value })
                  }
                >
                  <option value="bovino">Bovino</option>
                  <option value="suino">Suíno</option>
                  <option value="caprino">Caprino</option>
                  <option value="ovino">Ovino</option>
                </select>
              </div>
              <div>
                <Label htmlFor="raca">Raça</Label>
                <Input
                  id="raca"
                  value={formData.raca}
                  onChange={(e) =>
                    setFormData({ ...formData, raca: e.target.value })
                  }
                  placeholder="Ex: Nelore, Jersey"
                />
              </div>
              <div>
                <Label htmlFor="sexo">Sexo *</Label>
                <select
                  id="sexo"
                  className="w-full border rounded-md p-2"
                  value={formData.sexo}
                  onChange={(e) =>
                    setFormData({ ...formData, sexo: e.target.value })
                  }
                >
                  <option value="M">Macho</option>
                  <option value="F">Fêmea</option>
                </select>
              </div>
              <div>
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data_nascimento: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="peso_atual">Peso Atual (kg)</Label>
                <Input
                  id="peso_atual"
                  type="number"
                  step="0.1"
                  value={formData.peso_atual}
                  onChange={(e) =>
                    setFormData({ ...formData, peso_atual: e.target.value })
                  }
                  placeholder="Ex: 450"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  placeholder="Informações adicionais"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Cadastrar Animal
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Animais */}
      <Card>
        <CardHeader>
          <CardTitle>Animais Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {animais.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum animal cadastrado. Clique em "Cadastrar Novo Animal" para
              começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Brinco</th>
                    <th className="px-4 py-2 text-left">Nome</th>
                    <th className="px-4 py-2 text-left">Raça</th>
                    <th className="px-4 py-2 text-left">Idade</th>
                    <th className="px-4 py-2 text-left">Peso</th>
                    <th className="px-4 py-2 text-left">Vacinação</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {animais.map((animal) => (
                    <tr
                      key={animal.id}
                      className="border-t hover:bg-emerald-50 transition-colors"
                    >
                      <td className="px-4 py-2 font-medium">{animal.brinco}</td>
                      <td className="px-4 py-2">{animal.nome || "-"}</td>
                      <td className="px-4 py-2">{animal.raca || "-"}</td>
                      <td className="px-4 py-2">
                        {animal.idade || calcularIdade(animal.data_nascimento)}
                      </td>
                      <td className="px-4 py-2">{animal.peso_atual} kg</td>
                      <td className="px-4 py-2">
                        <Badge className={getVacinacaoColor(animal.vacinacao)}>
                          {animal.vacinacao || "pendente"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <Badge className={getStatusColor(animal.status)}>
                          {animal.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600"
                            onClick={() => handleVerPerfil(animal)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDelete(animal.id)}
                          >
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
