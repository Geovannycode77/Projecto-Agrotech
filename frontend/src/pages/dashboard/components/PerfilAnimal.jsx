import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PawPrint,
  Calendar,
  Weight,
  Syringe,
  Heart,
  Activity,
  FileText,
  Edit,
  Save,
  X,
  CheckCircle,
  Tag,
} from "lucide-react";
import { produtorService } from "@/services/ProdutorService";

export default function PerfilAnimal({ animal, onVoltar, onAtualizar }) {
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  const [formData, setFormData] = useState({
    id: animal.id,
    brinco: animal.brinco || "",
    nome: animal.nome || "",
    raca: animal.raca || "",
    sexo: animal.sexo || "M",
    data_nascimento: animal.data_nascimento || "",
    peso_atual: animal.peso_atual || "",
    observacoes: animal.observacoes || "",
    status: animal.status || "ativo",
    vacinacao: animal.vacinacao || "pendente",
  });

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

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    setMensagem({ tipo: "", texto: "" });
  };

  const handleSalvar = async () => {
    setSalvando(true);
    setMensagem({ tipo: "", texto: "" });

    try {
      const dadosParaSalvar = {
        brinco: formData.brinco,
        nome: formData.nome || "",
        raca: formData.raca || "",
        sexo: formData.sexo,
        especie: "bovino",
        data_nascimento: formData.data_nascimento || null,
        peso_atual: parseFloat(formData.peso_atual) || 0,
        observacoes: formData.observacoes || "",
        status: formData.status,
        vacinacao: formData.vacinacao,
      };

      const updated = await produtorService.updateAnimal(
        formData.id,
        dadosParaSalvar,
      );
      setEditando(false);
      onAtualizar(updated);
      setMensagem({ tipo: "success", texto: "Animal atualizado com sucesso!" });

      setTimeout(() => {
        setMensagem({ tipo: "", texto: "" });
      }, 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setMensagem({ tipo: "error", texto: "Erro ao salvar alterações" });
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelar = () => {
    setFormData({
      id: animal.id,
      brinco: animal.brinco || "",
      nome: animal.nome || "",
      raca: animal.raca || "",
      sexo: animal.sexo || "M",
      data_nascimento: animal.data_nascimento || "",
      peso_atual: animal.peso_atual || "",
      observacoes: animal.observacoes || "",
      status: animal.status || "ativo",
      vacinacao: animal.vacinacao || "pendente",
    });
    setEditando(false);
    setMensagem({ tipo: "", texto: "" });
  };

  const nomeExibicao = formData.nome || formData.brinco;
  const idade = calcularIdade(formData.data_nascimento);
  const statusAnimal = formData.status || "ativo";
  const vacinacaoAnimal = formData.vacinacao || "pendente";

  // Função para obter a cor do badge de vacinação
  const getVacinacaoColor = () => {
    switch (vacinacaoAnimal) {
      case "atualizada":
        return "bg-green-100 text-green-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "atrasada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Função para obter o texto da vacinação
  const getVacinacaoTexto = () => {
    switch (vacinacaoAnimal) {
      case "atualizada":
        return "em dia";
      case "pendente":
        return "pendente";
      case "atrasada":
        return "atrasada";
      default:
        return vacinacaoAnimal;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
            <PawPrint className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">{nomeExibicao}</CardTitle>
            <p className="text-gray-500 text-sm">
              Brinco: {formData.brinco} • 🐄 Bovino
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onVoltar}>
            <X className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          {!editando && (
            <Button variant="outline" onClick={() => setEditando(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Mensagem de feedback */}
        {mensagem.texto && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              mensagem.tipo === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        {/* Status do Animal */}
        <div className="flex gap-2 flex-wrap mb-6">
          {/* Badge de Status */}
          <Badge
            className={
              statusAnimal === "ativo"
                ? "bg-emerald-100 text-emerald-800"
                : statusAnimal === "doente"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
            }
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            {statusAnimal === "ativo"
              ? "Ativo"
              : statusAnimal === "doente"
                ? "Doente"
                : "Em observação"}
          </Badge>

          {/* Badge de Vacinação com cores corretas */}
          <Badge className={getVacinacaoColor()}>
            <Syringe className="h-3 w-3 mr-1" />
            Vacinação {getVacinacaoTexto()}
          </Badge>
        </div>

        {/* Modo Leitura */}
        {!editando && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Brinco</p>
              <p className="font-medium">{formData.brinco}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Raça</p>
              <p className="font-medium">{formData.raca || "-"}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Sexo</p>
              <p className="font-medium">
                {formData.sexo === "M" ? "Macho" : "Fêmea"}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Peso</p>
              <p className="font-medium">{formData.peso_atual || 0} kg</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Idade</p>
              <p className="font-medium">{idade}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Data Nascimento</p>
              <p className="font-medium">
                {formData.data_nascimento
                  ? new Date(formData.data_nascimento).toLocaleDateString(
                      "pt-BR",
                    )
                  : "-"}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Status</p>
              <p className="font-medium capitalize">{formData.status}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Vacinação</p>
              <p className="font-medium capitalize">{formData.vacinacao}</p>
            </div>
            <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Observações</p>
              <p className="text-gray-600">
                {formData.observacoes || "Nenhuma observação"}
              </p>
            </div>
          </div>
        )}

        {/* Modo Edição */}
        {editando && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Brinco</label>
                <p className="p-2 bg-gray-100 rounded">{formData.brinco}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Nome</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                  value={formData.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Raça</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                  value={formData.raca}
                  onChange={(e) => handleChange("raca", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Sexo</label>
                <select
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                  value={formData.sexo}
                  onChange={(e) => handleChange("sexo", e.target.value)}
                >
                  <option value="M">Macho</option>
                  <option value="F">Fêmea</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                  value={formData.peso_atual}
                  onChange={(e) => handleChange("peso_atual", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Data Nascimento</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                  value={formData.data_nascimento}
                  onChange={(e) =>
                    handleChange("data_nascimento", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Status</label>
                <select
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="ativo">Ativo</option>
                  <option value="doente">Doente</option>
                  <option value="atencao">Em observação</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Vacinação</label>
                <select
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                  value={formData.vacinacao}
                  onChange={(e) => handleChange("vacinacao", e.target.value)}
                >
                  <option value="atualizada">Em dia</option>
                  <option value="pendente">Pendente</option>
                  <option value="atrasada">Atrasada</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500">Observações</label>
                <textarea
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                  value={formData.observacoes || ""}
                  onChange={(e) => handleChange("observacoes", e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={handleCancelar}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSalvar}
                disabled={salvando}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {salvando ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
