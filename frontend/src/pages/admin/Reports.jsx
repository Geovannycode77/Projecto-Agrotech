import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService } from "../../services/api";
import {
  FileText,
  Download,
  Calendar,
  Users,
  DollarSign,
  Package,
  Activity,
  Printer,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminReports() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const reportTypes = [
    {
      id: "users",
      name: "Relatório de Usuários",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      description: "Lista completa de usuários cadastrados",
    },
    {
      id: "financial",
      name: "Relatório Financeiro",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      description: "Resumo financeiro da fazenda",
    },
    {
      id: "production",
      name: "Relatório de Produção",
      icon: Package,
      color: "from-yellow-500 to-orange-500",
      description: "Produção por cultura/período",
    },
    {
      id: "activity",
      name: "Relatório de Atividades",
      icon: Activity,
      color: "from-purple-500 to-pink-500",
      description: "Registro de atividades realizadas",
    },
  ];

  const fetchRecentReports = async () => {
    try {
      const data = await adminService.getRecentReports();
      setRecentReports(data || []);
    } catch (err) {
      console.error("Erro ao carregar relatórios recentes:", err);
    }
  };

  const handleGenerate = async (reportId) => {
    try {
      setGenerating(true);
      setError(null);
      const blob = await adminService.generateReport(reportId, dateRange);

      // Download do relatório
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_${reportId}_${dateRange.start}_${dateRange.end}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      fetchRecentReports();
    } catch (err) {
      console.error("Erro ao gerar relatório:", err);
      setError("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (format) => {
    try {
      setLoading(true);
      const blob = await adminService.exportData(format, dateRange);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exportacao_${format}_${dateRange.start}_${dateRange.end}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erro ao exportar:", err);
      toast({
        title: "Erro",
        description: "Erro ao exportar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Relatórios Gerais</h1>
        <p className="text-gray-500 mt-1">
          Gere e exporte relatórios do sistema
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-600 block mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600 block mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card
              key={report.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleGenerate(report.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {report.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {report.description}
                    </p>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Exportação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" />
            Exportar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => handleExport("PDF")}
              className="gap-2"
              disabled={loading}
            >
              <FileText className="w-4 h-4" />
              Exportar como PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("Excel")}
              className="gap-2"
              disabled={loading}
            >
              <Download className="w-4 h-4" />
              Exportar como Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("CSV")}
              className="gap-2"
              disabled={loading}
            >
              <Download className="w-4 h-4" />
              Exportar como CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Recentes */}
      {recentReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Relatórios Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-gray-800">{report.name}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          {report.date}
                        </span>
                        <span className="text-xs text-gray-500">
                          {report.size}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleGenerate(report.id)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {generating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Gerando relatório...</p>
          </div>
        </div>
      )}
    </div>
  );
}
