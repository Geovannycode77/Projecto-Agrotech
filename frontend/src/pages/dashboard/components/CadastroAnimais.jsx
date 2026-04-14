import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Plus, Save, Edit, Trash2, Search } from 'lucide-react';

export default function CadastroAnimais() {
  const [animais, setAnimais] = useState([]);
  const [formData, setFormData] = useState({
    brinco: '',
    nome: '',
    especie: 'bovino',
    raca: '',
    sexo: 'M',
    data_nascimento: '',
    peso_atual: '',
    observacoes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implementar lógica de salvamento
    console.log('Salvar animal:', formData);
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Cadastro */}
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Novo Animal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brinco">Número do Brinco *</Label>
                <Input
                  id="brinco"
                  value={formData.brinco}
                  onChange={(e) => setFormData({...formData, brinco: e.target.value})}
                  placeholder="Ex: BR-001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nome">Nome do Animal</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome opcional"
                />
              </div>
              <div>
                <Label htmlFor="especie">Espécie *</Label>
                <select
                  id="especie"
                  className="w-full border rounded-md p-2"
                  value={formData.especie}
                  onChange={(e) => setFormData({...formData, especie: e.target.value})}
                >
                  <option value="bovino">Bovino</option>
                  <option value="suino">Suíno</option>
                  <option value="caprino">Caprino</option>
                  <option value="ovino">Ovino</option>
                </select>
              </div>
              <div>
                <Label htmlFor="raca">Raça</Label>
                <Input
                  id="raca"
                  value={formData.raca}
                  onChange={(e) => setFormData({...formData, raca: e.target.value})}
                  placeholder="Ex: Nelore, Jersey"
                />
              </div>
              <div>
                <Label htmlFor="sexo">Sexo *</Label>
                <select
                  id="sexo"
                  className="w-full border rounded-md p-2"
                  value={formData.sexo}
                  onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                >
                  <option value="M">Macho</option>
                  <option value="F">Fêmea</option>
                </select>
              </div>
              <div>
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="peso_atual">Peso Atual (kg)</Label>
                <Input
                  id="peso_atual"
                  type="number"
                  step="0.1"
                  value={formData.peso_atual}
                  onChange={(e) => setFormData({...formData, peso_atual: e.target.value})}
                  placeholder="Ex: 450"
                />
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Informações adicionais"
                />
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Cadastrar Animal
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Animais */}
      <Card>
        <CardHeader>
          <CardTitle>Animais Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Brinco</th>
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2 text-left">Espécie</th>
                  <th className="px-4 py-2 text-left">Sexo</th>
                  <th className="px-4 py-2 text-left">Peso</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {animais.map((animal) => (
                  <tr key={animal.id} className="border-t">
                    <td className="px-4 py-2">{animal.brinco}</td>
                    <td className="px-4 py-2">{animal.nome}</td>
                    <td className="px-4 py-2">{animal.especie}</td>
                    <td className="px-4 py-2">{animal.sexo === 'M' ? 'Macho' : 'Fêmea'}</td>
                    <td className="px-4 py-2">{animal.peso_atual} kg</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        animal.status === 'ativo' ? 'bg-green-100 text-green-800' :
                        animal.status === 'doente' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                      }`}>
                        {animal.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}