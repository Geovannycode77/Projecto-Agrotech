import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ui/useConfirm";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const initialAnimals = [
  {
    id: 1,
    tag: "A-101",
    age: 3,
    weightGain: 1.2,
    temp: 39.1,
    lameness: 1,
    region: "Norte",
    status: "healthy",
    lastCheck: "2025-11-20",
  },
  {
    id: 2,
    tag: "B-202",
    age: 4,
    weightGain: -0.2,
    temp: 40.2,
    lameness: 3,
    region: "Sul",
    status: "sick",
    lastCheck: "2025-11-18",
  },
  {
    id: 3,
    tag: "C-303",
    age: 2,
    weightGain: 0.6,
    temp: 38.5,
    lameness: 0,
    region: "Leste",
    status: "isolated",
    lastCheck: "2025-11-21",
  },
];

const initialIncidents = [
  {
    id: 1,
    tag: "B-202",
    type: "Doença respiratória",
    date: "2025-11-18",
    severity: "high",
    resolved: false,
  },
  {
    id: 2,
    tag: "C-303",
    type: "Suspeita de intoxicação",
    date: "2025-11-20",
    severity: "medium",
    resolved: true,
  },
  {
    id: 3,
    tag: "A-101",
    type: "Despique (predador)",
    date: "2025-11-15",
    severity: "critical",
    resolved: false,
  },
];

const COLORS = ["#10b981", "#f59e0b", "#ef4444"]; // green, amber, red

function computeHealthIndex(animal) {
  // normalize values into 0..100
  // weightGain: higher is better (assume -1..2 kg/day); normalize to 0..100
  const wg = Math.max(-1, Math.min(2, animal.weightGain));
  const wgScore = ((wg + 1) / 3) * 100; // -1 => 0, 2 => 100

  // temp: ideal is 38.5 - 39.5; outside is worse
  const ideal = 39.0;
  const tempDiff = Math.abs(animal.temp - ideal); // 0 best, higher worse
  const tempScore = Math.max(0, 100 - tempDiff * 40);

  // lameness: 0 best, 5 worst
  const lame = Math.max(0, Math.min(5, animal.lameness));
  const lameScore = Math.max(0, 100 - lame * 20);

  // average
  return Math.round(wgScore * 0.4 + tempScore * 0.4 + lameScore * 0.2);
}

// TODO: Replace mock data with real API calls; create endpoints for animals/incidents
export default function SaudeAnimal() {
  const [animals, setAnimals] = useState(initialAnimals);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [filterRegion, setFilterRegion] = useState("");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const total = animals.length;
    const healthy = animals.filter((a) => a.status === "healthy").length;
    const sick = animals.filter((a) => a.status === "sick").length;
    const isolated = animals.filter((a) => a.status === "isolated").length;
    return { total, healthy, sick, isolated };
  }, [animals]);

  const healthSeries = useMemo(() => {
    // mock data — average health index over last 6 time points
    const points = ["Nov-01", "Nov-05", "Nov-10", "Nov-15", "Nov-20", "Nov-25"];
    return points.map((p, i) => ({
      name: p,
      value: Math.max(60, 95 - i * 5 + (i % 2 ? -3 : 3)),
    }));
  }, []);

  const factorPie = useMemo(() => {
    // show distribution of causes for sick animals
    const causes = { parasites: 0, nutrition: 0, injury: 0 };
    incidents.forEach((inc) => {
      if (!inc.resolved) {
        if (inc.severity === "critical") causes.injury++;
        else causes.nutrition++;
      }
    });
    // fallback sample
    if (causes.parasites + causes.nutrition + causes.injury === 0) {
      return [
        { name: "Nutrição", value: 50 },
        { name: "Lesões", value: 30 },
        { name: "Parasitas", value: 20 },
      ];
    }
    return [
      { name: "Nutrição", value: causes.nutrition },
      { name: "Lesões", value: causes.injury },
      { name: "Parasitas", value: causes.parasites },
    ];
  }, [incidents]);

  const filteredAnimals = useMemo(
    () =>
      animals
        .filter((a) => (filterRegion ? a.region === filterRegion : true))
        .filter((a) => (query ? a.tag.includes(query) : true)),
    [animals, filterRegion, query]
  );

  const confirm = useConfirm();
  async function resolveIncident(id) {
    const ok = await confirm(
      "Resolver incidente",
      "Marcar este incidente como resolvido?"
    );
    if (!ok) return;
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, resolved: true } : i))
    );
  }

  function addIncident(itag, type, severity = "medium") {
    const newInc = {
      id: Date.now(),
      tag: itag,
      type,
      date: new Date().toISOString().slice(0, 10),
      severity,
      resolved: false,
    };
    setIncidents((prev) => [newInc, ...prev]);
    // mark animal status based on severity
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.tag !== itag) return a;
        const newStatus = severity === "critical" ? "isolated" : "sick";
        return { ...a, status: newStatus };
      })
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">🐄 Saúde Animal</h2>

      {/* Summary cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de animais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Saudáveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.healthy}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Em tratamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.sick}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Isolados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.isolated}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Charts and controls */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Indice médio de saúde (últimos dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={healthSeries}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[40, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fatores que impactam</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={factorPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label
                  >
                    {factorPie.map((entry, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <Input
                placeholder="Filtrar por tag"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="">Todas regiões</option>
                <option value="Norte">Norte</option>
                <option value="Sul">Sul</option>
                <option value="Leste">Leste</option>
              </select>
            </div>
            <div className="mt-3">
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setFilterRegion("");
                }}
              >
                Limpar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Animal list */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Animais</h3>
        {filteredAnimals.length === 0 ? (
          <p className="text-gray-500">Nenhum animal cadastrado.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredAnimals.map((a) => (
              <Card key={a.id}>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">
                        {a.tag} • {a.region}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Age: {a.age}y • Peso gagn: {a.weightGain} kg/d • Temp:{" "}
                        {a.temp}ºC
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge
                        variant={
                          a.status === "healthy"
                            ? "default"
                            : a.status === "sick"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {a.status}
                      </Badge>
                      <div className="text-sm font-medium mr-4">
                        Indice: {computeHealthIndex(a)}%
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addIncident(a.tag, "Problema de saúde")}
                      >
                        Reportar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Incidents */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Incidentes recentes</h3>
        {incidents.length === 0 ? (
          <p className="text-gray-500">Nenhum incidente reportado.</p>
        ) : (
          <div className="space-y-2">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-3 rounded-lg border border-primary/20 bg-white/95 dark:bg-gray-900 dark:border-gray-700 flex justify-between items-start"
              >
                <div>
                  <div className="font-semibold">
                    {inc.type} — {inc.tag}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {inc.date} • Severidade: {inc.severity}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {inc.resolved ? (
                    <Badge variant="default">Resolvido</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => resolveIncident(inc.id)}
                    >
                      Marcar resolvido
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
