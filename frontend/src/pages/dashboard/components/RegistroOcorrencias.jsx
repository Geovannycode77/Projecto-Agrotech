import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, Loader2, PawPrint, Clock, List, Plus } from "lucide-react";
import { funcionarioService } from "@/services/funcionarioService";
import { toast } from "@/hooks/use-toast";

export default function RegistroOcorrencias() {
  const [submitting, setSubmitting] = useState(false);
  const [animais, setAnimais] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);
  const [view, setView] = useState("historico"); // "historico" | "novo"
  const [formData, setFormData] = useState({
    tipo: "",
    local: "",
    data: new Date().toISOString().slice(0, 16),
    urgencia: "",
    descricao: "",
    animal_id: "",
  });
  const [success, setSuccess] = useState(false);

  const tiposOcorrencia = [
    { value: "doenca",       label: "Doença detectada" },
    { value: "fuga",         label: "Fuga de animal" },
    { value: "estrutura",    label: "Estrutura danificada" },
    { value: "falta_insumos",label: "Falta de insumos" },
    { value: "acidente",     label: "Acidente" },
    { value: "outro",        label: "Outro" },
  ];

  const niveisUrgencia = [
    { value: "baixa",   label: "Baixa" },
    { value: "media",   label: "Média" },
    { value: "alta",    label: "Alta" },
    { value: "urgente", label: "Urgente" },
  ];

  useEffect(() => {
    carregarAnimais();
    carregarHistorico();
  }, []);

  const carregarAnimais = async () => {
    try {
      const data = await funcionarioService.getAnimais();
      setAnimais(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Erro ao carregar animais:", error);
    }
  };

  const carregarHistorico = async () => {
    setLoadingHistorico(true);
    try {
      const data = await funcionarioService.getOcorrencias();
      setOcorrencias(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoadingHistorico(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        tipo:     formData.tipo,
        local:    formData.local,
        data:     new Date(formData.data).toISOString(),
        urgencia: formData.urgencia,
        descricao:formData.descricao,
      };
      if (formData.animal_id) payload.animal_id = formData.animal_id;

      await funcionarioService.registrarOcorrencia(payload);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({
        tipo: "", local: "",
        data: new Date().toISOString().slice(0, 16),
        urgencia: "", descricao: "", animal_id: "",
      });

      // Recarrega histórico e volta para ele
      await carregarHistorico();
      setView("historico");

    } catch (error) {
      console.error("Erro:", error.response?.data);
      toast({ title: "Erro", description: "Erro ao registrar ocorrência.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getUrgenciaColor = (urgencia) => ({
    urgente: "border-red-500 bg-red-50",
    alta:    "border-orange-500 bg-orange-50",
    media:   "border-yellow-500 bg-yellow-50",
    baixa:   "border-blue-500 bg-blue-50",
  }[urgencia] || "border-gray-300 bg-gray-50");

  const getUrgenciaLabel = (urgencia) => ({
    urgente: "🔴 Urgente",
    alta:    "🟠 Alta",
    media:   "🟡 Média",
    baixa:   "🔵 Baixa",
  }[urgencia] || urgencia);

  const pendentes = ocorrencias.filter(oc => !oc.resolvido).length;

  return (
    <div className="space-y-4">
      {/* Cabeçalho com abas */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 border-b border-gray-200 w-full">
          <button
            onClick={() => setView("historico")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${
              view === "historico"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="h-4 w-4" />
            Histórico
            {pendentes > 0 && (
              <span className="ml-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pendentes}
              </span>
            )}
          </button>
          <button
            onClick={() => setView("novo")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${
              view === "novo"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Plus className="h-4 w-4" />
            Nova Ocorrência
          </button>
        </div>
      </div>

      {/* ABA: Histórico */}
      {view === "historico" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Minhas Ocorrências
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistorico ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : ocorrencias.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma ocorrência registrada.</p>
                <button
                  onClick={() => setView("novo")}
                  className="mt-3 text-sm text-purple-600 hover:underline"
                >
                  Registrar primeira ocorrência →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {ocorrencias.map((oc) => (
                  <div
                    key={oc.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      oc.resolvido
                        ? "border-green-400 bg-green-50 opacity-70"
                        : getUrgenciaColor(oc.urgencia)
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium text-gray-800">{oc.titulo}</span>
                          <span className="text-xs">{getUrgenciaLabel(oc.urgencia)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{oc.descricao}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>
                            <Clock className="inline h-3 w-3 mr-0.5" />
                            {new Date(oc.data_hora).toLocaleString("pt-BR")}
                          </span>
                          {oc.animal && (
                            <span>
                              <PawPrint className="inline h-3 w-3 mr-0.5" />
                              {oc.animal}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        oc.resolvido
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-orange-100 text-orange-700 border border-orange-300"
                      }`}>
                        {oc.resolvido ? "✅ Resolvida" : "⏳ Pendente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ABA: Nova Ocorrência */}
      {view === "novo" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-purple-600" />
              Registrar Nova Ocorrência
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
                    className="w-full border rounded-lg p-2 mt-1"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                  >
                    <option value="">Selecione...</option>
                    {tiposOcorrencia.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Urgência *</Label>
                  <select
                    className="w-full border rounded-lg p-2 mt-1"
                    value={formData.urgencia}
                    onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}
                    required
                  >
                    <option value="">Selecione...</option>
                    {niveisUrgencia.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Local / Título *</Label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 mt-1"
                    placeholder="Ex: Curral 2, Vaca com febre..."
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Data e Hora *</Label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded-lg p-2 mt-1"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>
                    Animal envolvido{" "}
                    <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                  </Label>
                  <select
                    className="w-full border rounded-lg p-2 mt-1"
                    value={formData.animal_id}
                    onChange={(e) => setFormData({ ...formData, animal_id: e.target.value })}
                  >
                    <option value="">Nenhum animal específico</option>
                    {animais.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome || a.brinco}
                        {a.especie_display ? ` — ${a.especie_display}` : ""}
                        {a.brinco && a.nome ? ` (${a.brinco})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label>Descrição Detalhada *</Label>
                  <textarea
                    className="w-full border rounded-lg p-2 mt-1"
                    rows="4"
                    placeholder="Descreva detalhadamente a ocorrência..."
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setView("historico")}
                >
                  Cancelar
                </Button>
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
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}