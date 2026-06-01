import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Building,
  CheckCircle,
  TrendingUp,
  Wallet,
  Edit,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { gestorService } from "@/services/GestorService";
import { toast } from "@/hooks/use-toast";

export default function PerfilGestor() {
  const { user } = useAuth();
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [dadosPerfil, setDadosPerfil] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
    data_admissao: "",
    departamento: "",
    id_gestor: "",
    area_atuacao: "",
    fazenda: "",
  });
  const [estatisticas, setEstatisticas] = useState({
    total_gerenciado: 0,
    economia_gerada: 0,
    projetos_aprovados: 0,
  });

  useEffect(() => {
    if (user) {
      carregarPerfil();
      carregarEstatisticas();
    }
  }, [user]);

  const carregarPerfil = async () => {
    setLoading(true);
    try {
      const data = await gestorService.getPerfil();
      setDadosPerfil({
        nome: data.nome || user?.nome || "",
        email: data.email || user?.email || "",
        telefone: data.telefone || "",
        cargo: data.cargo || "Gestor Financeiro",
        data_admissao: data.data_admissao || "",
        departamento: data.departamento || "Financeiro",
        id_gestor: data.id_gestor || "G001",
        area_atuacao: data.area_atuacao || "",
        fazenda: data.fazenda || "",
      });
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      // Fallback para dados do usuário autenticado
      setDadosPerfil({
        nome: user?.nome || user?.email?.split("@")[0] || "Gestor",
        email: user?.email || "gestor@agrotech.com",
        telefone: user?.telefone || "",
        cargo: "Gestor Financeiro",
        data_admissao: user?.data_admissao || "",
        departamento: "Financeiro",
        id_gestor: user?.id_gestor || "G001",
        area_atuacao: "",
        fazenda: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const data = await gestorService.getEstatisticas();
      setEstatisticas({
        total_gerenciado: data.total_gerenciado || 0,
        economia_gerada: data.economia_gerada || 0,
        projetos_aprovados: data.projetos_aprovados || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const updated = await gestorService.atualizarPerfil(dadosPerfil);
      setDadosPerfil(updated);
      setEditando(false);
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar alterações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "AOA",
    }).format(valor);
  };

  const informacoes = [
    {
      label: "Nome Completo",
      value: dadosPerfil.nome,
      icon: User,
      editable: true,
      field: "nome",
    },
    {
      label: "E-mail",
      value: dadosPerfil.email,
      icon: Mail,
      editable: true,
      field: "email",
    },
    {
      label: "Telefone",
      value: dadosPerfil.telefone,
      icon: Phone,
      editable: true,
      field: "telefone",
    },
    {
      label: "Cargo",
      value: dadosPerfil.cargo,
      icon: Briefcase,
      editable: false,
      field: "cargo",
    },
    {
      label: "Data de Admissão",
      value: dadosPerfil.data_admissao
        ? new Date(dadosPerfil.data_admissao).toLocaleDateString("pt-BR")
        : "Não informada",
      icon: Calendar,
      editable: false,
      field: "data_admissao",
    },
    {
      label: "Departamento",
      value: dadosPerfil.departamento,
      icon: Building,
      editable: true,
      field: "departamento",
    },
    {
      label: "Área de Atuação",
      value: dadosPerfil.area_atuacao || "Não informada",
      icon: Briefcase,
      editable: true,
      field: "area_atuacao",
    },
    {
      label: "Fazenda",
      value: dadosPerfil.fazenda || "Não informada",
      icon: Building,
      editable: false,
      field: "fazenda",
    },
  ];

  const estatisticasCards = [
    {
      label: "Total Gerenciado",
      valor: formatarMoeda(estatisticas.total_gerenciado),
      icon: Wallet,
      cor: "text-amber-600",
    },
    {
      label: "Economia Gerada",
      valor: `${estatisticas.economia_gerada}%`,
      icon: TrendingUp,
      cor: "text-green-600",
    },
    {
      label: "Projetos Aprovados",
      valor: estatisticas.projetos_aprovados,
      icon: CheckCircle,
      cor: "text-emerald-600",
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-amber-600" />
            Meu Perfil
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
          <User className="h-5 w-5 text-amber-600" />
          Meu Perfil
        </CardTitle>
        {!editando ? (
          <Button variant="outline" onClick={() => setEditando(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditando(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={salvando}
            >
              {salvando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{dadosPerfil.nome}</h2>
            <p className="text-gray-500">
              Gestor Financeiro • ID: {dadosPerfil.id_gestor}
            </p>
            <Badge className="bg-amber-100 text-amber-800 mt-1">Ativo</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {estatisticasCards.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <stat.icon className={`h-5 w-5 ${stat.cor}`} />
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="font-bold">{stat.valor}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {informacoes.map((info, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <info.icon className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">{info.label}</p>
                {editando && info.editable ? (
                  <input
                    type={info.label === "E-mail" ? "email" : "text"}
                    className="w-full font-medium text-gray-800 bg-transparent border-b border-gray-300 focus:border-amber-500 outline-none"
                    value={dadosPerfil[info.field]}
                    onChange={(e) =>
                      setDadosPerfil({
                        ...dadosPerfil,
                        [info.field]: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="font-medium">{info.value || "-"}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Conta Verificada</p>
            <p className="text-sm text-green-600">
              Acesso total ao módulo financeiro
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
