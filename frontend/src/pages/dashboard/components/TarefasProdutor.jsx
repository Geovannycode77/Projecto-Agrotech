import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ClipboardList } from "lucide-react";
import { produtorService } from "@/services/ProdutorService";
import { toast } from "@/hooks/use-toast";

const tiposTarefa = [
  { value: "manutencao", label: "Manutenção" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "registro", label: "Registro de Dados" },
  { value: "vacinacao", label: "Vacinação" },
  { value: "observacao", label: "Observação" },
];

const prioridades = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
];

const getStatusBadge = (status) => {
  if (status === "concluida") return "bg-green-100 text-green-800";
  if (status === "em_andamento") return "bg-blue-100 text-blue-800";
  if (status === "pendente") return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-800";
};

const getFuncionarioNomeExibicao = (funcionario) => {
  if (!funcionario) return "Sem nome";
  if (funcionario.nome) return funcionario.nome;
  if (funcionario.nome_completo) return funcionario.nome_completo;
  if (funcionario.user?.nome_completo) return funcionario.user.nome_completo;
  if (funcionario.user?.email) return funcionario.user.email.split("@")[0];
  if (typeof funcionario.user === "string") return funcionario.user;
  if (funcionario.email)
    return funcionario.email.split("@")[0] || funcionario.email;
  return "Sem nome";
};

export default function TarefasProdutor() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tarefas, setTarefas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    tipo: "manutencao",
    prioridade: "media",
    funcionario_id: "",
    animal_id: "",
    data_limite: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [tarefasData, funcionariosData, animaisData] = await Promise.all([
        produtorService.getTarefas(),
        produtorService.getFuncionarios(),
        produtorService.getAnimais(),
      ]);
      setTarefas(tarefasData.results || tarefasData);
      setFuncionarios(funcionariosData.results || funcionariosData);
      setAnimais(animaisData.results || animaisData);
    } catch (error) {
      console.error("Erro ao carregar tarefas do produtor:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de tarefas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.funcionario_id) {
      toast({
        title: "Atenção",
        description: "Selecione um funcionário para a tarefa.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        titulo: form.titulo,
        descricao: form.descricao,
        tipo: form.tipo,
        prioridade: form.prioridade,
        funcionario_id: Number(form.funcionario_id),
        animal_id: form.animal_id ? Number(form.animal_id) : null,
        data_limite: form.data_limite ? `${form.data_limite}T12:00:00Z` : null,
      };

      console.log("📤 Criar tarefa payload:", payload);
      await produtorService.createTarefa(payload);

      setForm({
        titulo: "",
        descricao: "",
        tipo: "manutencao",
        prioridade: "media",
        funcionario_id: "",
        animal_id: "",
        data_limite: "",
      });
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso.",
      });
      carregarDados();
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-purple-600" />
            Gerenciar Tarefas
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-purple-600" />
            Criar nova tarefa para funcionário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                  {tiposTarefa.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Prioridade</Label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={form.prioridade}
                  onChange={(e) =>
                    setForm({ ...form, prioridade: e.target.value })
                  }
                >
                  {prioridades.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Funcionário</Label>
                <select
                  className="w-full border rounded-lg p-2 bg-white text-gray-900"
                  value={form.funcionario_id}
                  onChange={(e) =>
                    setForm({ ...form, funcionario_id: e.target.value })
                  }
                  required
                >
                  <option value="">
                    Selecione... ({funcionarios.length} funcionários)
                  </option>{" "}
                  {/* ← Mostra a quantidade */}
                  {funcionarios.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.user_id || funcionario.id}>
                      {getFuncionarioNomeExibicao(funcionario)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Animal (opcional)</Label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={form.animal_id}
                  onChange={(e) =>
                    setForm({ ...form, animal_id: e.target.value })
                  }
                >
                  <option value="">Nenhum</option>
                  {animais.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.brinco} - {animal.nome || "Sem nome"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Prazo</Label>
                <Input
                  type="date"
                  value={form.data_limite}
                  onChange={(e) =>
                    setForm({ ...form, data_limite: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <textarea
                className="w-full border rounded-lg p-2 min-h-[120px]"
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Criar tarefa
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-purple-600" />
            Tarefas de funcionários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tarefas.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Nenhuma tarefa cadastrada.
            </div>
          ) : (
            <div className="space-y-3">
              {tarefas.map((tarefa) => (
                <div
                  key={tarefa.id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-semibold">{tarefa.titulo}</p>
                      <p className="text-sm text-gray-500">
                        {tarefa.descricao}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Funcionário:</span>{" "}
                        {tarefa.funcionario_nome || tarefa.funcionario}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getStatusBadge(tarefa.status)}>
                        {tarefa.status.replace("_", " ")}
                      </Badge>
                      <Badge className="bg-slate-100 text-slate-800">
                        {tarefa.tipo}
                      </Badge>
                      {tarefa.data_limite && (
                        <Badge className="bg-slate-100 text-slate-800">
                          {new Date(tarefa.data_limite).toLocaleDateString(
                            "pt-BR",
                          )}
                        </Badge>
                      )}
                    </div>
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
