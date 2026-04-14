import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react';

export default function GestaoFinanceira() {
  const [transacoes, setTransacoes] = useState([]);
  const [tipoTransacao, setTipoTransacao] = useState('despesa');

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receitas Totais</p>
                <p className="text-2xl font-bold text-green-600">R$ 45.230</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Despesas Totais</p>
                <p className="text-2xl font-bold text-red-600">R$ 28.750</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saldo</p>
                <p className="text-2xl font-bold text-blue-600">R$ 16.480</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de Transação */}
      <Card>
        <CardHeader>
          <CardTitle>Nova Transação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button
              variant={tipoTransacao === 'receita' ? 'default' : 'outline'}
              onClick={() => setTipoTransacao('receita')}
              className={tipoTransacao === 'receita' ? 'bg-green-600' : ''}
            >
              Receita
            </Button>
            <Button
              variant={tipoTransacao === 'despesa' ? 'default' : 'outline'}
              onClick={() => setTipoTransacao('despesa')}
              className={tipoTransacao === 'despesa' ? 'bg-red-600' : ''}
            >
              Despesa
            </Button>
          </div>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <select className="w-full border rounded-md p-2">
                  <option value="">Selecione...</option>
                  <option value="venda">Venda de Animais</option>
                  <option value="racao">Compra de Ração</option>
                  <option value="veterinario">Veterinário</option>
                  <option value="medicamentos">Medicamentos</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              <div>
                <Label>Valor</Label>
                <Input type="number" placeholder="R$ 0,00" />
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Input placeholder="Descrição da transação" />
              </div>
            </div>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Transação
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { tipo: 'receita', descricao: 'Venda de 2 bovinos', valor: 15000, data: '15/03/2026' },
              { tipo: 'despesa', descricao: 'Compra de ração', valor: 3200, data: '14/03/2026' },
              { tipo: 'despesa', descricao: 'Consulta veterinária', valor: 500, data: '13/03/2026' }
            ].map((transacao, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{transacao.descricao}</p>
                  <p className="text-sm text-gray-500">{transacao.data}</p>
                </div>
                <div className={`font-bold ${
                  transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}