import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/useConfirm";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const DEFAULT_GESTATION_DAYS = 283; // valor padrão pra bovino (ajustável)

export default function Reproducao() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    femaleTag: "",
    maleTag: "",
    method: "natural",
    breedingDate: "",
  });
  const [eventos, setEventos] = useState([]);
  const [formEvento, setFormEvento] = useState({
    animal: "",
    tipo: "",
    data: "",
    observacao: "",
  });

  const tiposEvento = [
    "Inseminação",
    "Cobertura",
    "Parto",
    "Aborto",
    "Diagnóstico de gestação",
  ];

  function handleChange(e) {
    setFormEvento({ ...formEvento, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formEvento.animal || !formEvento.tipo || !formEvento.data) return;
    setEventos([...eventos, { ...formEvento, id: Date.now() }]);
    setFormEvento({ animal: "", tipo: "", data: "", observacao: "" });
  }

  // carrega registros do localStorage — útil para desenvolvimento sem backend
  useEffect(() => {
    const raw = localStorage.getItem("repro_records");
    if (raw) setRecords(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem("repro_records", JSON.stringify(records));
  }, [records]);

  const addRecord = () => {
    if (!form.femaleTag || !form.breedingDate) return;

    const breedingDate = new Date(form.breedingDate);
    // calcula data estimada de parto
    const estimated = new Date(breedingDate);
    estimated.setDate(breedingDate.getDate() + DEFAULT_GESTATION_DAYS);

    const newRec = {
      id: Date.now(),
      femaleTag: form.femaleTag.trim(),
      maleTag: form.maleTag.trim(),
      method: form.method,
      breedingDate: form.breedingDate,
      estimatedCalving: estimated.toISOString().slice(0, 10),
      status: "pendente", // pendente, gestante, nascido
    };

    setRecords([newRec, ...records]);
    setForm({
      femaleTag: "",
      maleTag: "",
      method: "natural",
      breedingDate: "",
    });
  };

  const removeRecord = (id) => setRecords(records.filter((r) => r.id !== id));
  const confirm = useConfirm();
  const handleRemoveRecord = async (id) => {
    const ok = await confirm(
      "Excluir registro",
      "Tem certeza que deseja excluir este registro?"
    );
    if (!ok) return;
    removeRecord(id);
  };

  const updateStatus = (id, status) => {
    setRecords(records.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const stats = {
    total: records.length,
    gestantes: records.filter((r) => r.status === "gestante").length,
    nascidos: records.filter((r) => r.status === "nascido").length,
  };

  // TODO: Replace local state with API calls - use `lib/api.js` to fetch/save records
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">🔁 Gestão de Reprodução</h2>

      {/* Cards de estatísticas */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gestantes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nascidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nascidos}</div>
          </CardContent>
        </Card>
      </section>

      {/* Formulário para registro de coberturas / inseminações */}
      <section className="p-4 border rounded-lg bg-slate-900/80 border-primary/20 dark:bg-gray-800 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <Input
            placeholder="Matriz (tag)"
            value={form.femaleTag}
            onChange={(e) => setForm({ ...form, femaleTag: e.target.value })}
          />
          <Input
            placeholder="Reprodutor (tag)"
            value={form.maleTag}
            onChange={(e) => setForm({ ...form, maleTag: e.target.value })}
          />
          <Input
            type="date"
            value={form.breedingDate}
            onChange={(e) => setForm({ ...form, breedingDate: e.target.value })}
          />
          <Select
            value={form.method}
            onValueChange={(v) => setForm({ ...form, method: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="natural">Natural</SelectItem>
              <SelectItem value="inseminacao">Inseminação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={addRecord}>Adicionar Evento</Button>
          <Button variant="outline" onClick={() => setRecords([])}>
            Limpar Todos
          </Button>
        </div>
      </section>

      {/* Lista de registros de reprodução */}
      <section className="p-4 border rounded-lg bg-slate-900/80 border-primary/20 dark:bg-gray-800 text-white">
        <h3 className="font-semibold mb-3">Eventos de Reprodução</h3>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum evento registrado.
          </p>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-lg border border-primary/20 bg-slate-900/80 dark:bg-gray-900 dark:border-gray-700 text-white"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">Matriz: {r.femaleTag}</div>
                    <div className="text-sm text-muted-foreground">
                      Reprodutor: {r.maleTag || "—"}
                    </div>
                    <div className="text-sm">
                      Data de cobertura: {r.breedingDate}
                    </div>
                    <div className="text-sm">
                      Previsão de parto: {r.estimatedCalving}
                    </div>
                    <div className="text-sm">Método: {r.method}</div>
                    <div className="text-sm">Status: {r.status}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateStatus(r.id, "gestante")}
                    >
                      Marcar Gestante
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(r.id, "nascido")}
                    >
                      Marcar Nascido
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveRecord(r.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Formulário e tabela de eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulário de cadastro de eventos */}
        <form className="space-y-4 mb-8" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">Animal</label>
            <Input
              name="animal"
              value={formEvento.animal}
              onChange={handleChange}
              placeholder="Identificação do animal"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Tipo de evento</label>
            <Select
              value={formEvento.tipo}
              onValueChange={(v) => setFormEvento({ ...formEvento, tipo: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposEvento.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Data</label>
            <Input
              type="date"
              name="data"
              value={formEvento.data}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Observação</label>
            <Input
              type="text"
              name="observacao"
              value={formEvento.observacao}
              onChange={handleChange}
              placeholder="Observações (opcional)"
            />
          </div>
          <Button type="submit">Adicionar evento</Button>
        </form>

        {/* Tabela de eventos */}
        <div>
          <h3 className="text-lg font-bold mb-2">Eventos cadastrados</h3>
          {eventos.length === 0 ? (
            <p className="text-gray-500">Nenhum evento registrado.</p>
          ) : (
            <table className="w-full border rounded overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Animal</th>
                  <th className="p-2 text-left">Tipo</th>
                  <th className="p-2 text-left">Data</th>
                  <th className="p-2 text-left">Observação</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((ev) => (
                  <tr key={ev.id} className="border-t">
                    <td className="p-2">{ev.animal}</td>
                    <td className="p-2">{ev.tipo}</td>
                    <td className="p-2">{ev.data}</td>
                    <td className="p-2">{ev.observacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
