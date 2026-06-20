import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, TrendingUp, TrendingDown, Wallet, Calendar, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { gestorService } from '@/services/GestorService';

const formatAOA = (valor) => {
  const num = parseFloat(valor) || 0;
  return num.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function AnaliseLucros() {
  const [periodo, setPeriodo] = useState('6meses');
  const [loading, setLoading] = useState(true);
  const [dadosAnalise, setDadosAnalise] = useState({
    lucro_mensal: [],
    tendencia: { lucro: 'N/D', receita: 'N/D', despesa: 'N/D' },
    projecao:  { proximo_mes: 0, trimestre: 0, ano: 0 }
  });

  useEffect(() => { carregarDadosAnalise(); }, [periodo]);

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
  const ultimo = ultimosMeses[ultimosMeses.length - 1];

  // Calcula receita e despesa do último mês para os cards de tendência
  const receitaUltimoMes = ultimo?.receita || 0;
  const despesaUltimoMes = ultimo?.despesa || 0;
  const lucroTendencia   = dadosAnalise.tendencia?.lucro || 'N/D';

  if (loading) {
    return (
      <Card>
        <CardHeader>
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

  // Barra de progresso proporcional ao maior valor entre os meses
  const maxReceita = Math.max(...ultimosMeses.map(m => m.receita || 0), 1);

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
          onChange={e => setPeriodo(e.target.value)}
        >
          <option value="6meses">Últimos 6 Meses</option>
          <option value="12meses">Últimos 12 Meses</option>
          <option value="ano">Ano Corrente</option>
        </select>
      </CardHeader>
      <CardContent>

        {/* ── Tendências (dados reais do último mês) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tendência de Lucro</p>
                <p className="text-2xl font-bold text-green-600">{lucroTendencia}</p>
                <p className="text-xs text-gray-400 mt-1">vs mês anterior</p>
              </div>
              <ArrowUp className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receitas (mês actual)</p>
                <p className="text-xl font-bold text-emerald-600">AOA {formatAOA(receitaUltimoMes)}</p>
                <p className="text-xs text-gray-400 mt-1">{ultimo?.mes || '—'}</p>
              </div>
              <ArrowUp className="h-8 w-8 text-emerald-600 opacity-60" />
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Despesas (mês actual)</p>
                <p className="text-xl font-bold text-red-600">AOA {formatAOA(despesaUltimoMes)}</p>
                <p className="text-xs text-gray-400 mt-1">{ultimo?.mes || '—'}</p>
              </div>
              <ArrowDown className="h-8 w-8 text-red-600 opacity-60" />
            </div>
          </div>
        </div>

        {/* ── Evolução Mensal ── */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Evolução Mensal</h3>
          {ultimosMeses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum dado disponível para o período selecionado.
            </div>
          ) : (
            <div className="space-y-3">
              {ultimosMeses.map((item, index) => {
                const barraWidth = maxReceita > 0 ? Math.min((item.receita / maxReceita) * 100, 100) : 0;
                const lucroPositivo = item.lucro >= 0;
                return (
                  <div key={index} className="p-3 border rounded-lg hover:bg-amber-50 transition-colors">
                    <div className="flex justify-between items-center mb-2 flex-wrap gap-1">
                      <span className="font-medium text-sm">{item.mes}</span>
                      <span className="text-xs text-gray-500">
                        R: AOA {formatAOA(item.receita)} | D: AOA {formatAOA(item.despesa)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${lucroPositivo ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ width: `${barraWidth}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium whitespace-nowrap ${lucroPositivo ? 'text-emerald-600' : 'text-red-600'}`}>
                        {lucroPositivo ? '+' : ''}AOA {formatAOA(item.lucro)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Projeções Futuras ── */}
        <div className="p-4 bg-amber-50 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-600" />
            Projeções Futuras
            <span className="text-xs text-gray-400 font-normal">(baseadas na média dos últimos 3 meses)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">Próximo Mês</p>
              <p className="text-xl font-bold text-amber-600">
                AOA {formatAOA(dadosAnalise.projecao?.proximo_mes || 0)}
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">Próximo Trimestre</p>
              <p className="text-xl font-bold text-amber-600">
                AOA {formatAOA(dadosAnalise.projecao?.trimestre || 0)}
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">Próximo Ano</p>
              <p className="text-xl font-bold text-amber-600">
                AOA {formatAOA(dadosAnalise.projecao?.ano || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Recomendações dinâmicas ── */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Recomendações</h3>
          <ul className="space-y-2 text-sm">
            {(() => {
              if (!ultimo) {
                return <li className="text-gray-500">Sem dados suficientes para recomendações.</li>;
              }
              const recomendacoes = [];

              if (ultimo.lucro < 0) {
                recomendacoes.push({ icon: TrendingDown, cor: 'text-red-600', texto: `Atenção: resultado negativo em ${ultimo.mes}. Reduza despesas não essenciais.` });
              } else {
                recomendacoes.push({ icon: TrendingUp, cor: 'text-green-600', texto: `Bom resultado em ${ultimo.mes} (AOA ${formatAOA(ultimo.lucro)}). Considere reinvestir parte do lucro.` });
              }

              if (ultimo.receita > 0 && ultimo.despesa > ultimo.receita * 0.7) {
                recomendacoes.push({ icon: TrendingDown, cor: 'text-orange-600', texto: `Despesas correspondem a ${Math.round((ultimo.despesa / ultimo.receita) * 100)}% das receitas. Reveja os custos operacionais.` });
              }

              if (ultimo.receita === 0 && ultimosMeses.length > 0) {
                recomendacoes.push({ icon: TrendingDown, cor: 'text-orange-600', texto: 'Sem receitas registadas neste mês. Verifique se os registos estão atualizados.' });
              }

              recomendacoes.push({ icon: Wallet, cor: 'text-amber-600', texto: 'Reserve 20% do lucro mensal para emergências e reinvestimento.' });

              return recomendacoes.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <r.icon className={`h-4 w-4 ${r.cor} mt-0.5 flex-shrink-0`} />
                  <span>{r.texto}</span>
                </li>
              ));
            })()}
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}