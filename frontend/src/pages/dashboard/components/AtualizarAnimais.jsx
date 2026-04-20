import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PawPrint, Weight, Baby, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AtualizarAnimais() {
  const [pesoData, setPesoData] = useState({ animal: '', peso: '' });
  const [nascimentoData, setNascimentoData] = useState({ nome: '', mae: '', data: '' });
  const [morteData, setMorteData] = useState({ animal: '', data: '', causa: '' });
  const [success, setSuccess] = useState({ peso: false, nascimento: false, morte: false });

  const handlePesoSubmit = (e) => {
    e.preventDefault();
    console.log('Atualizar peso:', pesoData);
    setSuccess({ ...success, peso: true });
    setTimeout(() => setSuccess({ ...success, peso: false }), 3000);
    setPesoData({ animal: '', peso: '' });
  };

  const handleNascimentoSubmit = (e) => {
    e.preventDefault();
    console.log('Registrar nascimento:', nascimentoData);
    setSuccess({ ...success, nascimento: true });
    setTimeout(() => setSuccess({ ...success, nascimento: false }), 3000);
    setNascimentoData({ nome: '', mae: '', data: '' });
  };

  const handleMorteSubmit = (e) => {
    e.preventDefault();
    console.log('Registrar óbito:', morteData);
    setSuccess({ ...success, morte: true });
    setTimeout(() => setSuccess({ ...success, morte: false }), 3000);
    setMorteData({ animal: '', data: '', causa: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PawPrint className="h-5 w-5 text-purple-600" />
          Atualizar Dados dos Animais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Atualizar Peso */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Weight className="h-4 w-4 text-purple-600" />
              Atualizar Peso
            </h3>
            {success.peso && (
              <div className="mb-3 p-2 bg-green-50 text-green-800 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Peso atualizado com sucesso!
              </div>
            )}
            <form onSubmit={handlePesoSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select 
                className="border rounded-lg p-2"
                value={pesoData.animal}
                onChange={(e) => setPesoData({...pesoData, animal: e.target.value})}
                required
              >
                <option value="">Selecione o animal</option>
                <option>Boi 123 - Mimosa</option>
                <option>Boi 124 - Trovão</option>
                <option>Boi 125 - Caramelo</option>
                <option>Vaca 101 - Estrela</option>
              </select>
              <input 
                type="number" 
                className="border rounded-lg p-2" 
                placeholder="Peso atual (kg)"
                value={pesoData.peso}
                onChange={(e) => setPesoData({...pesoData, peso: e.target.value})}
                required
              />
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Atualizar Peso</Button>
            </form>
          </div>

          {/* Registrar Nascimento */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Baby className="h-4 w-4 text-purple-600" />
              Registrar Nascimento
            </h3>
            {success.nascimento && (
              <div className="mb-3 p-2 bg-green-50 text-green-800 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Nascimento registrado com sucesso!
              </div>
            )}
            <form onSubmit={handleNascimentoSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input 
                type="text" 
                className="border rounded-lg p-2" 
                placeholder="Nome do animal"
                value={nascimentoData.nome}
                onChange={(e) => setNascimentoData({...nascimentoData, nome: e.target.value})}
                required
              />
              <select 
                className="border rounded-lg p-2"
                value={nascimentoData.mae}
                onChange={(e) => setNascimentoData({...nascimentoData, mae: e.target.value})}
                required
              >
                <option value="">Mãe</option>
                <option>Vaca 101 - Estrela</option>
                <option>Vaca 102 - Lua</option>
                <option>Vaca 103 - Flor</option>
              </select>
              <input 
                type="date" 
                className="border rounded-lg p-2"
                value={nascimentoData.data}
                onChange={(e) => setNascimentoData({...nascimentoData, data: e.target.value})}
                required
              />
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Registrar Nascimento</Button>
            </form>
          </div>

          {/* Registrar Morte */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Registrar Óbito
            </h3>
            {success.morte && (
              <div className="mb-3 p-2 bg-green-50 text-green-800 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Óbito registrado com sucesso!
              </div>
            )}
            <form onSubmit={handleMorteSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select 
                className="border rounded-lg p-2"
                value={morteData.animal}
                onChange={(e) => setMorteData({...morteData, animal: e.target.value})}
                required
              >
                <option value="">Selecione o animal</option>
                <option>Boi 123 - Mimosa</option>
                <option>Boi 124 - Trovão</option>
                <option>Vaca 101 - Estrela</option>
              </select>
              <input 
                type="date" 
                className="border rounded-lg p-2"
                value={morteData.data}
                onChange={(e) => setMorteData({...morteData, data: e.target.value})}
                required
              />
              <select 
                className="border rounded-lg p-2"
                value={morteData.causa}
                onChange={(e) => setMorteData({...morteData, causa: e.target.value})}
                required
              >
                <option value="">Causa</option>
                <option>Doença</option>
                <option>Acidente</option>
                <option>Idade avançada</option>
                <option>Outro</option>
              </select>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">Registrar Óbito</Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}