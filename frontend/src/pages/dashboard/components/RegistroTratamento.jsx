import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Heart, Calendar, Loader2 } from "lucide-react";
import { veterinarioService } from "@/services/veterinarioService";
import { toast } from "@/hooks/use-toast";

const FORM_VAZIO = {
  animal: "",          // ✅ "animal" — não "animal_id"
  diagnostico: "",
  tratamento: "",
  medicamentos: "",    // ✅ "medicamentos" — não "medicacao"
  data_inicio: "",
  data_fim: "",
  observacoes: "",
};

export default function RegistroTratamento() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tratamentos, setTratamentos] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [formData, setFormData] = useState(FORM_VAZIO);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [tratamentosData, animaisData] = await Promise.all([
        veterinarioService.getTratamentos(),
        veterinarioService.getAnimais(), // ✅ Sem filtro — exclui mortos abaixo
      ]);
      setTratamentos(tratamentosData.results || tratamentosData);

      // ✅ Mostra todos exceto mortos (para diagnóstico de qualquer animal)
      const todos = animaisData.results || animaisData;
      setAnimais(todos.filter((a) => a.status !== "morto"));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // ✅ Payload com os nomes exatos que o serializer/model aceita
      const payload = {
        animal:       formData.animal,
        diagnostico:  formData.diagnostico,
        tratamento:   formData.tratamento,
        medicamentos: formData.medicamentos,   // ✅ campo correto
        data_inicio:  formData.data_inicio,
        data_fim:     formData.data_fim || null,
        observacoes:  formData.observacoes,
      };

      const novo = await veterinarioService.registrarTratamento(payload);
      setTratamentos([novo, ...tratamentos]);
      setShowForm(false);
      setFormData(FORM_VAZIO);
      toast({ title: "Sucesso", description: "Tratamento registrado com sucesso!" });
    } catch (error) {
      console.error("Erro ao registrar tratamento:", error);
      const detail = error.response?.data
        ? JSON.stringify(error.response.data)
        : "Tente novamente.";
      toast({ title: "Erro ao registrar tratamento", description: detail, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const tratamentosFiltrados = tratamentos.filter((t) => {
    const nome = t.animal_info?.nome || t.animal_info?.brinco || "";
    return nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.diagnostico?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-cyan-600" />
            Registro de Tratamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-cyan-600" />
            Registro de Tratamentos
          </CardTitle>
          <Button onClick={() => { setShowForm(!showForm); setFormData(FORM_VAZIO); }}
            className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Tratamento
          </Button>
        </CardHeader>
        <CardContent>

          {/* Formulário */}
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg bg-cyan-50">
              <h3 className="font-semibold mb-4">Registrar Novo Tratamento</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <Label>Animal *</Label>
                    <select className="w-full border rounded-lg p-2"
                      value={formData.animal} onChange={set("animal")} required>
                      <option value="">Selecione...</option>
                      {animais.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.brinco} — {a.nome || "Sem nome"} ({a.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Diagnóstico *</Label>
                    <Input placeholder="Diagnóstico" value={formData.diagnostico}
                      onChange={set("diagnostico")} required />
                  </div>

                  <div>
                    <Label>Tratamento *</Label>
                    <Input placeholder="Tipo de tratamento" value={formData.tratamento}
                      onChange={set("tratamento")} required />
                  </div>

                  <div>
                    <Label>Medicamentos</Label>
                    <Input placeholder="Medicamentos utilizados" value={formData.medicamentos}
                      onChange={set("medicamentos")} />
                  </div>

                  <div>
                    <Label>Data de Início *</Label>
                    <Input type="date" value={formData.data_inicio}
                      onChange={set("data_inicio")} required />
                  </div>

                  <div>
                    <Label>Data de Término</Label>
                    <Input type="date" value={formData.data_fim}
                      onChange={set("data_fim")} />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Observações</Label>
                    <Input placeholder="Observações adicionais" value={formData.observacoes}
                      onChange={set("observacoes")} />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline"
                    onClick={() => { setShowForm(false); setFormData(FORM_VAZIO); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={submitting}>
                    {submitting
                      ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      : <Heart className="h-4 w-4 mr-2" />}
                    Registrar
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Busca */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Buscar por animal ou diagnóstico..." className="pl-10"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {/* Lista */}
          {tratamentosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum tratamento encontrado.</div>
          ) : (
            <div className="space-y-3">
              {tratamentosFiltrados.map((trat) => (
                <div key={trat.id} className="p-4 border rounded-lg hover:bg-cyan-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {trat.animal_info?.brinco || "—"} — {trat.animal_info?.nome || "Sem nome"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Diagnóstico: {trat.diagnostico}</p>
                      <p className="text-sm text-gray-600">Tratamento: {trat.tratamento}</p>
                      {trat.medicamentos && (
                        <p className="text-sm text-gray-600">Medicamentos: {trat.medicamentos}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Início: {new Date(trat.data_inicio).toLocaleDateString("pt-BR")}
                        </span>
                        {trat.data_fim && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Término: {new Date(trat.data_fim).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                      {trat.observacoes && (
                        <p className="text-sm text-gray-500 mt-2">{trat.observacoes}</p>
                      )}
                    </div>
                    <Badge className={
                      trat.status === "concluido"
                        ? "bg-green-100 text-green-800"
                        : trat.status === "interrompido"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                    }>
                      {trat.status === "concluido" ? "Concluído"
                        : trat.status === "interrompido" ? "Interrompido"
                          : "Em andamento"}
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