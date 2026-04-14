import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Utensils, Package, TrendingDown } from 'lucide-react';

export default function AlimentacaoGado() {
  return (
    <div className="space-y-6">
      {/* Status do Estoque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consumo Mensal</p>
                <p className="text-2xl font-bold text-blue-600">4.850 kg</p>
              </div>
              <Utensils className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estoque Atual</p>
                <p className="text-2xl font-bold text-green-600">3.200 kg</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Custo Mensal</p>
                <p className="text-2xl font-bold text-red-600">R$ 8.750</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registro de Alimentação */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar Alimentação</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Ração</Label>
                <select className="w-full border rounded-md p-2">
                  <option value="">Selecione...</option>
                  <option value="milho">Milho</option>
                  <option value="soja">Soja</option>
                  <option value="silagem">Silagem</option>
                  <option value="concentrado">Concentrado</option>
                </select>
              </div>
              <div>
                <Label>Quantidade (kg)</Label>
                <Input type="number" placeholder="Ex: 500" />
              </div>
              <div>
                <Label>Data da Alimentação</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Animais Alimentados</Label>
                <select className="w-full border rounded-md p-2" multiple>
                  <option value="1">Todos os animais</option>
                  <option value="2">Bovinos</option>
                  <option value="3">Suínos</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label>Observações</Label>
                <Input placeholder="Informações adicionais" />
              </div>
            </div>
            <Button type="submit">Registrar Alimentação</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}