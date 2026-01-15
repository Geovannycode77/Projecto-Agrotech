import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Scale, DollarSign, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Nutricao() {
  // 🔢 Estado inicial vazio — pronto para receber dados da API
  const [dadosNutricionais, setDadosNutricionais] = useState({
    consumoDiario: "",
    custoRacao: "",
    gmd: "",
  });

  const [planos, setPlanos] = useState([]);

  const [dadosPeso, setDadosPeso] = useState([]);

  // 🌐 Carregar dados da API futuramente
  useEffect(() => {
    const fetchDados = async () => {
      try {
        // Exemplo fictício — trocar depois pelo endpoint real
        const res = await fetch("http://localhost:5000/api/nutricao");
        if (!res.ok) throw new Error("Erro ao buscar dados");

        const data = await res.json();

        // Estrutura esperada:
        // {
        //   consumoDiario: "1200kg",
        //   custoRacao: "R$ 2850",
        //   gmd: "1.2kg",
        //   planos: [{ id: 1, nome: "Plano A", descricao: "..." }],
        //   historicoPeso: [{ mes: "Jan", peso: 320 }, ...]
        // }

        setDadosNutricionais({
          consumoDiario: data.consumoDiario || "",
          custoRacao: data.custoRacao || "",
          gmd: data.gmd || "",
        });

        setPlanos(data.planos || []);
        setDadosPeso(data.historicoPeso || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    // Chama a função assim que o componente montar
    fetchDados();
  }, []);

  return (
    <div className="p-4">
      <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>🥩 Gestão de Alimentação</CardTitle>
          <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={() => alert("Adicionar novo plano (função futura)")}
          >
            <Plus className="w-4 h-4" /> Novo Plano
          </Button>
        </CardHeader>

        <CardContent>
          {/* Estatísticas principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
              <Scale className="w-8 h-8 mb-2" />
              <div className="text-sm">Consumo Diário</div>
              <p className="text-2xl font-bold">
                {dadosNutricionais.consumoDiario || "—"}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/10 dark:bg-primary/80 text-primary dark:text-primary-foreground">
              <DollarSign className="w-8 h-8 mb-2" />
              <div className="text-sm">Custo com Ração</div>
              <p className="text-2xl font-bold">
                {dadosNutricionais.custoRacao || "—"}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100">
              <TrendingUp className="w-8 h-8 mb-2" />
              <div className="text-sm">GMD</div>
              <p className="text-2xl font-bold">
                {dadosNutricionais.gmd || "—"}
              </p>
            </div>
          </div>

          {/* Grid com planos e gráfico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Planos de Alimentação */}
            <div className="p-4 border rounded-lg bg-slate-900/80 border-primary/20 dark:bg-gray-800 text-white">
              <h3 className="font-semibold mb-3">📋 Planos de Alimentação</h3>
              <div className="space-y-3">
                {planos.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Nenhum plano disponível.
                  </p>
                ) : (
                  planos.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg border border-primary/20 bg-slate-900/80 dark:bg-gray-900 dark:border-gray-700 hover:shadow transition text-white"
                    >
                      <h4 className="font-semibold">{p.nome}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {p.descricao}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Histórico de Pesagem */}
            <div className="p-4 border rounded-lg bg-slate-900/80 border-primary/20 dark:bg-gray-800 text-white">
              <h3 className="font-semibold mb-3">📈 Histórico de Pesagem</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dadosPeso}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
