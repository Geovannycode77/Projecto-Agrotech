import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, TrendingUp, TrendingDown, Wallet, Calendar, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { gestorService } from '@/services/gestorService';

export default function AnaliseLucros() {
  const [periodo, setPeriodo] = useState('6meses');
  const [loading, setLoading] = useState(true);
  const [dadosAnalise, setDadosAnalise] = useState({
    lucro_mensal: [],
    tendencia: {
      lucro: '0%',
      receita: '0%',
      despesa: '0%'
    },
    projecao: {
      proximo_mes: 0,
      trimestre: 0,
      ano: 0
    }
  });

  useEffect(() => {
    carregarDadosAnalise();
  }, [periodo]);

  const carregarDadosAnalise = async () => {
    setLoading(true);
    try {
      const data = await gestorService.getAnaliseLucros(periodo);
      setDadosAnalise(data);
    } catch (error) {
      console.error('Erro ao carregar análise de lucros:', error);
    } finally {
      setLoading(false);
    }
  };

  const ultimosMeses = dadosAnalise.lucro_mensal?.slice(-6) || [];

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-amber-600" />
            Análise de Lucros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-amber-600" />
          Análise de Lucros
        </CardTitle>
        <select 
          className="border rounded-lg px-3 py-2 text-sm"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
        >
          <option value="6meses">Últimos 6 Meses</option>
          <option value="12meses">Últimos 12 Meses</option>
          <option value="ano">Ano Corrente</option>
        </select>
      </CardHeader>
      <CardContent>
        {/* Tendências */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tendência de Lucro</p>
                <p className="text-2xl font-bold text-green-600">{dadosAnalise.tendencia?.lucro || '0%'}</p>
              </div>
              <ArrowUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tendência de Receita</p>
                <p className="text-2xl font-bold text-emerald-600">{dadosAnalise.tendencia?.receita || '0%'}</p>
              </div>
              <ArrowUp className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tendência de Despesa</p>
                <p className="text-2xl font-bold text-red-600">{dadosAnalise.tendencia?.despesa || '0%'}</p>
              </div>
              <ArrowDown className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Evolução Mensal */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Evolução Mensal</h3>
          {ultimosMeses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum dado disponível para o período selecionado.
            </div>
          ) : (
            <div className="space-y-3">
              {ultimosMeses.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-amber-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{item.mes}</span>
                    <span className="text-sm text-gray-500">
                      Receita: AOA {item.receita?.toLocaleString() || 0} | Despesa: AOA {item.despesa?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((item.receita / 50000) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-emerald-600">
                      AOA {item.lucro?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projeções Futuras */}
        <div className="p-4 bg-amber-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-600" />
            Projeções Futuras
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Próximo Mês</p>
              <p className="text-xl font-bold text-amber-600">
                AOA {dadosAnalise.projecao?.proximo_mes?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-green-600">{dadosAnalise.tendencia?.lucro || '0%'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Próximo Trimestre</p>
              <p className="text-xl font-bold text-amber-600">
                AOA {dadosAnalise.projecao?.trimestre?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-green-600">{dadosAnalise.tendencia?.lucro ? `+${parseFloat(dadosAnalise.tendencia.lucro) * 1.5}%` : '0%'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Próximo Ano</p>
              <p className="text-xl font-bold text-amber-600">
                AOA {dadosAnalise.projecao?.ano?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-green-600">{dadosAnalise.tendencia?.lucro ? `+${parseFloat(dadosAnalise.tendencia.lucro) * 2}%` : '0%'}</p>
            </div>
          </div>
        </div>

        {/* Recomendações */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Recomendações</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Aumentar investimento em reprodução animal para potencializar vendas</span>
            </li>
            <li className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span>Revisar contratos de fornecimento de ração para reduzir custos</span>
            </li>
            <li className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-amber-600" />
              <span>Reservar 20% do lucro para emergências e reinvestimento</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}