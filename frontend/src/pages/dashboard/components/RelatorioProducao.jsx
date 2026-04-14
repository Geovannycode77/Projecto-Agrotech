import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, TrendingUp, BarChart3 } from 'lucide-react';

export default function RelatorioProducao() {
  return (
    <div className="space-y-6">
      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Taxa de Natalidade</p>
              <p className="text-2xl font-bold text-blue-600">5.13%</p>
              <p className="text-xs text-green-600 mt-1">↑ 0.5% vs mês anterior</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Taxa de Mortalidade</p>
              <p className="text-2xl font-bold text-red-600">1.28%</p>
              <p className="text-xs text-green-600 mt-1">↓ 0.3% vs mês anterior</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Peso Médio do Rebanho</p>
              <p className="text-2xl font-bold text-green-600">320 kg</p>
              <p className="text-xs text-green-600 mt-1">↑ 15 kg vs mês anterior</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Produção Mensal</p>
              <p className="text-2xl font-bold text-purple-600">+12 animais</p>
              <p className="text-xs text-green-600 mt-1">Crescimento de 8%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Rebanho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <BarChart3 className="h-12 w-12 text-gray-400" />
              <p className="text-gray-500 ml-2">Gráfico em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between">
                <span>Relatório Mensal - Fevereiro 2026</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Relatório de Saúde do Rebanho</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Relatório Financeiro Anual</span>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Relatório de Alimentação</span>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gerar Novo Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Novo Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <select className="flex-1 border rounded-md p-2">
              <option value="producao">Relatório de Produção</option>
              <option value="financeiro">Relatório Financeiro</option>
              <option value="saude">Relatório de Saúde</option>
              <option value="alimentacao">Relatório de Alimentação</option>
            </select>
            <select className="flex-1 border rounded-md p-2">
              <option value="mes">Último Mês</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="ano">Último Ano</option>
            </select>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Gerar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}