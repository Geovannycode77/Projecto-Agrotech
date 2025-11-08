import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState([]);

  // 🗓️ Atualiza o calendário ao mudar de mês
  useEffect(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    setDays(eachDayOfInterval({ start, end }));
  }, [currentDate]);

  // ⏰ Atualiza data e hora em tempo real
  const [realTime, setRealTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setRealTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 💉 Lista de vacinas (ajustei meses para 1–12)
  const vacinasObrigatorias = [
    { nome: "Brucelose", dia: 10, mes: 3 }, // Março
    { nome: "Febre Aftosa", dia: 15, mes: 5 }, // Maio
    { nome: "Carbúnculo (Antraz)", dia: 5, mes: 8 }, // Agosto
    { nome: "Raiva", dia: 20, mes: 10 }, // Outubro
  ];

  const vacinasOpcionais = [
    { nome: "Leptospirose", dia: 12, mes: 4 }, // Abril
    { nome: "Botulismo", dia: 7, mes: 6 }, // Junho
    { nome: "Clostridioses", dia: 18, mes: 9 }, // Setembro
  ];

  // 🧠 Verifica se um dia tem vacina
  const getVacinaInfo = (day) => {
    const dia = day.getDate();
    const mes = day.getMonth() + 1; // Corrigido (+1)
    const obrigatoria = vacinasObrigatorias.find(
      (v) => v.dia === dia && v.mes === mes
    );
    const opcional = vacinasOpcionais.find(
      (v) => v.dia === dia && v.mes === mes
    );
    if (obrigatoria) return { tipo: "obrigatória", nome: obrigatoria.nome };
    if (opcional) return { tipo: "opcional", nome: opcional.nome };
    return null;
  };

  // 🎨 Define a cor do dia
  const getDayColor = (day) => {
    const vacina = getVacinaInfo(day);
    if (isSameDay(day, new Date()))
      return "bg-blue-300 text-blue-900 font-bold border border-blue-500";
    if (vacina?.tipo === "obrigatória")
      return "bg-red-200 text-red-900 border border-red-400";
    if (vacina?.tipo === "opcional")
      return "bg-yellow-200 text-yellow-900 border border-yellow-400";
    return "bg-white text-gray-800 border border-gray-200";
  };

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="p-4">
      <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>📅 Calendário de Gestão</CardTitle>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft />
            </Button>
            <span className="font-semibold capitalize">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Data e hora atuais */}
          <div className="text-sm mb-4 text-gray-500 dark:text-gray-400">
            Hoje é{" "}
            {format(realTime, "EEEE, dd 'de' MMMM 'de' yyyy - HH:mm:ss", {
              locale: ptBR,
            })}
          </div>

          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 text-center font-semibold border-b pb-2 mb-2">
            {diasSemana.map((dia) => (
              <div key={dia}>{dia}</div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: getDay(startOfMonth(currentDate)) }).map(
              (_, i) => (
                <div key={i}></div>
              )
            )}

            {days.map((day) => {
              const vacina = getVacinaInfo(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 rounded-lg text-center cursor-pointer hover:scale-105 transition-transform ${getDayColor(
                    day
                  )}`}
                  title={
                    vacina
                      ? `💉 ${vacina.nome} (${vacina.tipo})`
                      : isSameDay(day, new Date())
                      ? "📅 Hoje"
                      : ""
                  }
                >
                  {format(day, "d")}
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-red-200 border border-red-400 rounded"></span>
              <span className="text-sm">Vacina Obrigatória</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></span>
              <span className="text-sm">Vacina Opcional</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-300 border border-blue-500 rounded"></span>
              <span className="text-sm">Dia Atual</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
