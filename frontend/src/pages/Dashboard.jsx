import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom"; // 👈 para navegação entre páginas

export default function Dashboard() {
  const navigate = useNavigate();

  // 🔹 Valores zerados (virão da API futuramente)
  const vacinasPendentes = 0;
  const alertasAtivos = 0;
  const tarefasHoje = 0;
  const ganhoMedioDiario = 0;
  const statusRebanho = {
    saudavel: 0,
    tratamento: 0,
    isolados: 0,
  };

  // 🔹 Eventos vazios (virão do calendário futuramente)
  const proximosEventos = [];

  return (
    <div className="space-y-8">
      {/* ---- Resumo ---- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacinas Pendentes</CardTitle>
            <span className="text-blue-500 text-2xl">💉</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vacinasPendentes}</div>
            <p className="text-xs text-muted-foreground">para esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <span className="text-yellow-500 text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertasAtivos}</div>
            <p className="text-xs text-muted-foreground">na sua região</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Hoje</CardTitle>
            <span className="text-green-500 text-2xl">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tarefasHoje}</div>
            <p className="text-xs text-muted-foreground">para completar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganho Médio Diário (GMD)</CardTitle>
            <span className="text-emerald-500 text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ganhoMedioDiario} kg</div>
            <p className="text-xs text-muted-foreground">no último registro</p>
          </CardContent>
        </Card>
      </section>

      {/* ---- Próximos eventos e ações rápidas ---- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proximosEventos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
            ) : (
              proximosEventos.map((evento, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2">
                  <span>{evento.nome}</span>
                  <span className="text-sm text-muted-foreground">{evento.data}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate("/tarefas")}>
              ➕ Nova Tarefa
            </Button>
            <Button variant="outline" onClick={() => navigate("/alertas")}>
              🚨 Reportar Problema
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* ---- Dica da Semana e Status do Rebanho ---- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dica da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nenhuma dica disponível no momento.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Rebanho</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{statusRebanho.saudavel}%</p>
              <p className="text-xs text-muted-foreground">Saudável</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{statusRebanho.tratamento}%</p>
              <p className="text-xs text-muted-foreground">Em tratamento</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{statusRebanho.isolados}%</p>
              <p className="text-xs text-muted-foreground">Isolados</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
