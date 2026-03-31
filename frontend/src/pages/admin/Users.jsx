import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [allUsers, pending] = await Promise.all([
        adminService.getUsers(),
        adminService.getPendingUsers()
      ]);
      setUsers(allUsers);
      setPendingUsers(pending);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await adminService.approveUser(userId);
      setMessage({ type: 'success', text: 'Usuário aprovado com sucesso!' });
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao aprovar usuário' });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setMessage({ type: 'success', text: 'Função atualizada com sucesso!' });
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar função' });
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await adminService.deleteUser(userId);
        setMessage({ type: 'success', text: 'Usuário deletado com sucesso!' });
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Erro ao deletar usuário' });
      }
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      administrador: 'bg-red-500',
      produtor: 'bg-blue-500',
      veterinario: 'bg-green-500',
      funcionario: 'bg-yellow-500',
      gestor_financeiro: 'bg-purple-500'
    };
    return (
      <Badge className={colors[role] || 'bg-gray-500'}>
        {role}
      </Badge>
    );
  };

  const displayUsers = activeTab === 'pending' ? pendingUsers : users;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Utilizadores</h1>
        <p className="text-gray-600 mt-2">Gerencie todos os usuários da plataforma</p>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'bg-green-50' : 'bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-2 border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('all')}
        >
          Todos ({users.length})
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'pending' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pendentes ({pendingUsers.length})
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Registro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    {user.is_approved ? (
                      <Badge className="bg-green-500">Aprovado</Badge>
                    ) : (
                      <Badge variant="secondary">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.date_joined).toLocaleDateString('pt-PT')}
                  </TableCell>
                  <TableCell className="space-x-2">
                    {!user.is_approved && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(user.id)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Aprovar
                      </Button>
                    )}
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                      disabled={user.is_superuser}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="produtor">Produtor</SelectItem>
                        <SelectItem value="veterinario">Veterinário</SelectItem>
                        <SelectItem value="funcionario">Funcionário</SelectItem>
                        <SelectItem value="gestor_financeiro">Gestor Financeiro</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    {!user.is_superuser && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user.id)}
                      >
                        Deletar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}