import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Syringe, Loader2 } from "lucide-react";
import { veterinarioService } from "@/services/veterinarioService";
import { toast } from "@/hooks/use-toast";

export default function RegistroVacinas() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vacinas, setVacinas] = useState([]);
  const [animais, setAnimais] = useState([]);

  // ✅ Campos alinhados com o serializer do backend (model Vacina)
  const [formData, setFormData] = useState({
    animal: "",               // FK — backend espera "animal", não "animal_id"
    nome_vacina: "",          // backend espera "nome_vacina", não "vacina"
    data_aplicacao: "",
    data_proxima_dose: "",    // backend espera "data_proxima_dose", não "proxima_dose"
    lote: "",
    dose: "",                 // campo obrigatório no model
    via_aplicacao: "intramuscular", // campo obrigatório no model
    observacoes: "",
  });

  const tiposVacina = [
    "Febre Aftosa", "Brucelose", "Raiva",
    "Carbúnculo", "Clostridiose", "Outra",
  ];

  const viasAplicacao = [
    { value: "intramuscular", label: "Intramuscular" },
    { value: "subcutanea",    label: "Subcutânea" },
    { value: "oral",          label: "Oral" },
    { value: "intravenosa",   label: "Intravenosa" },
  ];

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [vacinasData, animaisData] = await Promise.all([
        veterinarioService.getVacinas(),
        // ✅ Sem filtro de status — traz todos exceto mortos (filtrado abaixo)
        veterinarioService.getAnimais(),
      ]);
      setVacinas(vacinasData.results || vacinasData);

      // ✅ Exclui mortos na listagem de animais para vacinar
      const todos = animaisData.results || animaisData;
      setAnimais(todos.filter(a => a.status !== "morto"));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setFormData({
    animal: "",
    nome_vacina: "",
    data_aplicacao: "",
    data_proxima_dose: "",
    lote: "",
    dose: "",
    via_aplicacao: "intramuscular",
    observacoes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // ✅ Payload com os nomes de campo que o serializer aceita
      const payload = {
        animal:            formData.animal,
        nome_vacina:       formData.nome_vacina,
        data_aplicacao:    formData.data_aplicacao,
        data_proxima_dose: formData.data_proxima_dose || null,
        lote:              formData.lote,
        dose:              formData.dose,
        via_aplicacao:     formData.via_aplicacao,
        observacoes:       formData.observacoes,
      };

      const novaVacina = await veterinarioService.registrarVacina(payload);
      setVacinas([novaVacina, ...vacinas]);
      setShowForm(false);
      resetForm();
      toast({ title: "Sucesso", description: "Vacina registrada com sucesso!" });
    } catch (error) {
      console.error("Erro ao registrar vacina:", error);
      // Mostra o erro real do backend para facilitar debug
      const detail = error.response?.data
        ? JSON.stringify(error.response.data)
        : "Tente novamente.";
      toast({
        title: "Erro ao registrar vacina",
        description: detail,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVacinas = vacinas.filter(
    (v) =>
      (v.animal_info?.brinco || "")
        .toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.nome_vacina || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5 text-cyan-600" />
            Registro de Vacinas
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
            <Syringe className="h-5 w-5 text-cyan-600" />
            Registro de Vacinas
          </CardTitle>
          <Button onClick={() => { setShowForm(!showForm); resetForm(); }} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Vacina
          </Button>
        </CardHeader>
        <CardContent>

          {/* Formulário */}
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg bg-cyan-50">
              <h3 className="font-semibold mb-4">Registrar Nova Vacina</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Animal — exclui mortos */}
                  <div>
                    <Label>Animal *</Label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={formData.animal}
                      onChange={(e) => setFormData({ ...formData, animal: e.target.value })}
                      required
                    >
                      <option value="">Selecione...</option>
                      {animais.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.brinco} ({a.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nome da vacina */}
                  <div>
                    <Label>Tipo de Vacina *</Label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={formData.nome_vacina}
                      onChange={(e) => setFormData({ ...formData, nome_vacina: e.target.value })}
                      required
                    >
                      <option value="">Selecione...</option>
                      {tiposVacina.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  {/* Data de aplicação */}
                  <div>
                    <Label>Data de Aplicação *</Label>
                    <Input type="date" value={formData.data_aplicacao}
                      onChange={(e) => setFormData({ ...formData, data_aplicacao: e.target.value })}
                      required />
                  </div>

                  {/* Próxima dose */}
                  <div>
                    <Label>Próxima Dose</Label>
                    <Input type="date" value={formData.data_proxima_dose}
                      onChange={(e) => setFormData({ ...formData, data_proxima_dose: e.target.value })} />
                  </div>

                  {/* Lote */}
                  <div>
                    <Label>Nº do Lote *</Label>
                    <Input placeholder="Ex: LOT-2024-001" value={formData.lote}
                      onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                      required />
                  </div>

                  {/* Dose */}
                  <div>
                    <Label>Dose *</Label>
                    <Input placeholder="Ex: 2ml" value={formData.dose}
                      onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                      required />
                  </div>

                  {/* Via de aplicação */}
                  <div>
                    <Label>Via de Aplicação *</Label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={formData.via_aplicacao}
                      onChange={(e) => setFormData({ ...formData, via_aplicacao: e.target.value })}
                      required
                    >
                      {viasAplicacao.map((v) => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Observações */}
                  <div>
                    <Label>Observações</Label>
                    <Input placeholder="Observações adicionais" value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={submitting}>
                    {submitting
                      ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      : <Syringe className="h-4 w-4 mr-2" />}
                    Registrar
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Busca */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Buscar por animal ou vacina..." className="pl-10"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {/* Tabela */}
          {filteredVacinas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhuma vacina encontrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Animal</th>
                    <th className="px-4 py-3 text-left">Vacina</th>
                    <th className="px-4 py-3 text-left">Via</th>
                    <th className="px-4 py-3 text-left">Data Aplicação</th>
                    <th className="px-4 py-3 text-left">Próxima Dose</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVacinas.map((vacina) => {
                    const hoje = new Date();
                    const proxima = vacina.data_proxima_dose ? new Date(vacina.data_proxima_dose) : null;
                    const isProxima = proxima && proxima > hoje && proxima - hoje < 7 * 86400000;
                    const isAtrasada = proxima && proxima < hoje;
                    const statusLabel = isAtrasada ? "Atrasada" : isProxima ? "Próxima" : "Aplicada";
                    const statusColor = isAtrasada
                      ? "bg-red-100 text-red-800"
                      : isProxima
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800";

                    return (
                      <tr key={vacina.id} className="border-t hover:bg-cyan-50 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {vacina.animal_info?.brinco || "—"} — {vacina.animal_info?.nome || "Sem nome"}
                        </td>
                        <td className="px-4 py-3">{vacina.nome_vacina}</td>
                        <td className="px-4 py-3 capitalize">{vacina.via_aplicacao_display || vacina.via_aplicacao}</td>
                        <td className="px-4 py-3">
                          {vacina.data_aplicacao ? new Date(vacina.data_aplicacao).toLocaleDateString("pt-BR") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {proxima ? proxima.toLocaleDateString("pt-BR") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusColor}>{statusLabel}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}