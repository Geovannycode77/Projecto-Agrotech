import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ui/useConfirm";

const initialAlerts = [
  {
    id: 1,
    title: "Surtos de febre aftosa detectados",
    description: "Focos identificados em rebanhos na região Leste.",
    date: "2025-11-15",
    location: "Município Leste",
    severity: "critical",
    isOutbreak: true,
    status: "active",
  },
  {
    id: 2,
    title: "Vírus respiratório — vacas leiteiras",
    description: "Casos reportados em três fazendas; monitorar temperatura.",
    date: "2025-11-18",
    location: "Município Norte",
    severity: "high",
    isOutbreak: false,
    status: "active",
  },
  {
    id: 3,
    title: "Surto controlado de gripe",
    description: "Surto encerrado, rebanhos vacinados e monitorados.",
    date: "2025-10-30",
    location: "Município Sul",
    severity: "medium",
    isOutbreak: true,
    status: "resolved",
  },
];

function severityToColor(sev) {
  switch (sev) {
    case "critical":
      return "destructive";
    case "high":
      return "secondary";
    case "medium":
      return "outline";
    default:
      return "default";
  }
}

// TODO: Replace local sample data with real backend APIs (use lib/api.js)
export default function Alertas() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOutbreak, setSelectedOutbreak] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  // highlightRef removed — not needed yet

  // If a notification navigates to /alertas?alert=ID we open/highlight that item
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("alert");
    if (id) {
      const found = alerts.find((a) => String(a.id) === String(id));
      if (found) {
        setSelectedOutbreak(found.isOutbreak ? found.id : null);
        // scroll / highlight: set a ref id and scroll to element
        const el = document.getElementById(`alert-${found.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-2", "ring-offset-2", "ring-yellow-400");
          setTimeout(
            () =>
              el.classList.remove("ring-2", "ring-offset-2", "ring-yellow-400"),
            3500
          );
        }
      }
    }
  }, [location.search, alerts]);

  const filtered = useMemo(() => {
    return alerts
      .filter((a) =>
        query
          ? (a.title + a.description + a.location)
              .toLowerCase()
              .includes(query.toLowerCase())
          : true
      )
      .filter((a) => (severity ? a.severity === severity : true))
      .filter((a) => (statusFilter ? a.status === statusFilter : true))
      .filter((a) =>
        selectedOutbreak
          ? a.isOutbreak
            ? a.id === selectedOutbreak
            : false
          : true
      );
  }, [alerts, query, severity, statusFilter, selectedOutbreak]);

  const outbreaks = useMemo(() => alerts.filter((a) => a.isOutbreak), [alerts]);

  function markResolved(id) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a))
    );
  }

  function reopenAlert(id) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "active" } : a))
    );
  }

  const confirm = useConfirm();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">🚨 Alertas & Surtos</h2>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter((a) => a.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Surtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outbreaks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter((a) => a.severity === "critical").length}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Filtros e busca */}
      <section className="flex gap-2 items-center">
        <Input
          placeholder="Pesquisar por título, descrição ou município..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="border rounded p-2  bg-slate-900/80 border-primary/20 dark:bg-gray-800 text-white"
        >
          <option value="">Todas severidades</option>
          <option value="critical">Crítica</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2  bg-slate-900/80 border-primary/20 dark:bg-gray-800 text-white"
        >
          <option value="">Todos status</option>
          <option value="active">Ativos</option>
          <option value="resolved">Resolvidos</option>
        </select>
        <Button
          variant="outline"
          onClick={() => {
            setQuery("");
            setSeverity("");
            setStatusFilter("");
            setSelectedOutbreak(null);
          }}
        >
          Limpar
        </Button>
      </section>

      {/* Surtos (Outbreaks) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {outbreaks.map((o) => (
          <Card key={o.id}>
            <CardHeader>
              <CardTitle>{o.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-2">
                {o.location} — {o.date}
              </div>
              <div className="mb-3">{o.description}</div>
              <div className="flex gap-2">
                <Badge variant={severityToColor(o.severity)}>
                  {o.severity}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedOutbreak(o.id)}
                >
                  Abrir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Lista de alertas */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Alertas</h3>
        {filtered.length === 0 ? (
          <p className="text-gray-500">Nenhuma notificação encontrada.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => (
              <div
                id={`alert-${a.id}`}
                key={a.id}
                className="p-3 rounded-lg border border-primary/20 bg-slate-900/80 dark:bg-gray-900 dark:border-gray-700 flex justify-between items-start text-white"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{a.title}</h4>
                    <Badge variant={severityToColor(a.severity)}>
                      {a.severity}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {a.location} • {a.date}
                  </div>
                  <p className="mt-1 text-sm">{a.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {a.status === "active" ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        const ok = await confirm(
                          "Resolver alerta",
                          "Marcar este alerta como resolvido?"
                        );
                        if (ok) markResolved(a.id);
                      }}
                    >
                      Marcar como resolvido
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => reopenAlert(a.id)}>
                      Reabrir
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/alertas?alert=${a.id}`)}
                  >
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
