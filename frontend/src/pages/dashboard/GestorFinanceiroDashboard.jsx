import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, BarChart, Wallet, PiggyBank } from 'lucide-react';

export default function GestorFinanceiroDashboard() {
  const { user } = useAuth();

  const stats = [
    { title: 'Receita Total', value: 'R$ 145.180', icon: TrendingUp, change: '+12%', color: 'text-green-600' },
    { title: 'Despesas', value: 'R$ 42.180', icon: TrendingDown, change: '+5%', color: 'text-red-600' },
    { title: 'Lucro Líquido', value: 'R$ 103.000', icon: DollarSign, change: '+15%', color: 'text-blue-600' },
    { title: 'Margem', value: '71%', icon: BarChart, change: 'Excelente', color: 'text-purple-600' }
  ];

  const receitasMensais = [
    { mes: 'Janeiro', valor: 45230 },
    { mes: 'Fevereiro', valor: 48750 },
    { mes: 'Março', valor: 51200 }
  ];

  const despesasCategorias = [
    { categoria: 'Insumos', valor: 15230 },
    { categoria: 'Mão de obra', valor: 18750 },
    { categoria: 'Manutenção', valor: 8200 }
  ];

  const ultimosPagamentos = [
    { descricao: 'Fornecedor ABC', valor: 'R$ 5.230', data: '10/03/2026', status: 'Pago' },
    { descricao: 'Salários', valor: 'R$ 12.500', data: '05/03/2026', status: 'Pago' },
    { descricao: 'Manutenção Tratores', valor: 'R$ 3.200', data: '15/03/2026', status: 'Pendente' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Painel Financeiro
          </h1>
          <p className="text-gray-600 mt-2">
            Olá {user?.email?.split('@')[0] || 'Gestor'} - Gerencie as finanças da fazenda
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs mt-1 ${stat.change.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Receitas Mensais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {receitasMensais.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{item.mes}</span>
                    <div className="flex items-center space-x-4 flex-1 ml-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(item.valor / 51200) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        R$ {item.valor.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span>R$ 145.180</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Despesas por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {despesasCategorias.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{item.categoria}</span>
                    <div className="flex items-center space-x-4 flex-1 ml-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${(item.valor / 18750) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        R$ {item.valor.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Despesas</span>
                    <span>R$ 42.180</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Últimos Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ultimosPagamentos.map((pagamento, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{pagamento.descricao}</p>
                      <p className="text-sm text-gray-500">{pagamento.data}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{pagamento.valor}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        pagamento.status === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pagamento.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}