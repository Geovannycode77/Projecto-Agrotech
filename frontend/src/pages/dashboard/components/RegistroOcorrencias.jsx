import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Plus, CheckCircle, Loader2 } from "lucide-react";
import { funcionarioService } from "@/services/funcionarioService";
import { toast } from "@/hooks/use-toast";

export default function RegistroOcorrencias() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "",
    local: "",
    data: new Date().toISOString().split("T")[0],
    urgencia: "",
    descricao: "",
  });
  const [success, setSuccess] = useState(false);

  const tiposOcorrencia = [
    { value: "doenca", label: "Doença detectada" },
    { value: "fuga", label: "Fuga de animal" },
    { value: "estrutura", label: "Estrutura danificada" },
    { value: "falta_insumos", label: "Falta de insumos" },
    { value: "acidente", label: "Acidente" },
    { value: "outro", label: "Outro" },
  ];

  const niveisUrgencia = [
    { value: "baixa", label: "Baixa", cor: "bg-green-100 text-green-800" },
    { value: "media", label: "Média", cor: "bg-yellow-100 text-yellow-800" },
    { value: "alta", label: "Alta", cor: "bg-orange-100 text-orange-800" },
    { value: "urgente", label: "Urgente", cor: "bg-red-100 text-red-800" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await funcionarioService.registrarOcorrencia({
        tipo: formData.tipo,
        local: formData.local,
        data: formData.data,
        urgencia: formData.urgencia,
        descricao: formData.descricao,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({
        tipo: "",
        local: "",
        data: new Date().toISOString().split("T")[0],
        urgencia: "",
        descricao: "",
      });
    } catch (error) {
      console.error("Erro ao registrar ocorrência:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar ocorrência. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-purple-600" />
          Registrar Ocorrência
        </CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Ocorrência registrada com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Ocorrência *</Label>
              <select
                className="w-full border rounded-lg p-2"
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value })
                }
                required
              >
                <option value="">Selecione...</option>
                {tiposOcorrencia.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Animal / Local *</Label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                placeholder="Especifique o animal ou local"
                value={formData.local}
                onChange={(e) =>
                  setFormData({ ...formData, local: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Data *</Label>
              <input
                type="date"
                className="w-full border rounded-lg p-2"
                value={formData.data}
                onChange={(e) =>
                  setFormData({ ...formData, data: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Urgência *</Label>
              <select
                className="w-full border rounded-lg p-2"
                value={formData.urgencia}
                onChange={(e) =>
                  setFormData({ ...formData, urgencia: e.target.value })
                }
                required
              >
                <option value="">Selecione...</option>
                {niveisUrgencia.map((urgencia) => (
                  <option key={urgencia.value} value={urgencia.value}>
                    {urgencia.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <Label>Descrição Detalhada *</Label>
              <textarea
                className="w-full border rounded-lg p-2"
                rows="4"
                placeholder="Descreva detalhadamente a ocorrência..."
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            Registrar Ocorrência
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
