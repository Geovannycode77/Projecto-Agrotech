import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminService } from "../../services/api";
import { Search, Filter, CheckCircle, Trash2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import useConfirm from "@/components/ui/useConfirm";

export default function AdminUsers() {
  const confirm = useConfirm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Erro:", err);
      setError("Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await adminService.approveUser(userId);
      fetchUsers();
    } catch (err) {
      console.error("Erro ao aprovar:", err);
      toast({
        title: "Erro",
        description: "Erro ao aprovar usuário. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (userId) => {
    try {
      const ok = await confirm(
        "Confirmar exclusão",
        "Tem certeza que deseja deletar este usuário?",
      );
      if (!ok) return;
      await adminService.deleteUser(userId);
      toast({ title: "Sucesso", description: "Usuário deletado com sucesso." });
      fetchUsers();
    } catch (err) {
      console.error("Erro ao deletar:", err);
      toast({
        title: "Erro",
        description: "Erro ao deletar usuário. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = filterRole ? user.role === filterRole : true;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const colors = {
      administrador: "bg-red-100 text-red-800",
      produtor: "bg-green-100 text-green-800",
      veterinario: "bg-blue-100 text-blue-800",
      funcionario: "bg-yellow-100 text-yellow-800",
      gestor_financeiro: "bg-purple-100 text-purple-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Gestão de Utilizadores
        </h1>
        <p className="text-gray-500 mt-1">
          Gerencie todos os usuários da plataforma
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todas as funções</option>
              <option value="administrador">Administrador</option>
              <option value="produtor">Produtor</option>
              <option value="veterinario">Veterinário</option>
              <option value="funcionario">Funcionário</option>
              <option value="gestor_financeiro">Gestor Financeiro</option>
            </select>
            <Button variant="outline" className="gap-2" onClick={fetchUsers}>
              <Filter className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Usuário
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Função
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Registro
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.email?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {user.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {user.is_approved ? (
                          <Badge className="bg-green-100 text-green-800">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pendente
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {user.date_joined
                          ? new Date(user.date_joined).toLocaleDateString(
                              "pt-PT",
                            )
                          : "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {!user.is_approved && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(user.id)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                          )}
                          {!user.is_superuser && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
