// src/services/produtorService.js
import api from "./api";

export const produtorService = {
  // Dashboard - CORRIGIDO
  getDashboard: async () => {
    try {
      const response = await api.get("produtor/dashboard/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dashboard:", error);
      throw error;
    }
  },

  // Gestão de Animais
  getAnimais: async (params = {}) => {
    const response = await api.get("produtor/animais/", { params });
    return response.data;
  },

  getAnimal: async (id) => {
    const response = await api.get(`produtor/animais/${id}/`);
    return response.data;
  },

  createAnimal: async (data) => {
    const response = await api.post("produtor/animais/", data);
    return response.data;
  },

  // Tarefas do funcionário
  getTarefas: async (params = {}) => {
    const response = await api.get("funcionario/tarefas/", { params });
    return response.data;
  },

  createTarefa: async (data) => {
    try {
      const response = await api.post("funcionario/tarefas/", data);
      return response.data;
    } catch (error) {
      console.error("Erro na requisição createTarefa:", error.response?.data || error);
      throw error;
    }
  },

  getFuncionarios: async (params = {}) => {
    const response = await api.get("funcionario/funcionarios-list/", {
      params,
    });
    return response.data;
  },

  async updateAnimal(id, data) {
    try {
      // Garantir que os dados estão no formato correto
      const dadosFormatados = {
        brinco: data.brinco,
        nome: data.nome || "",
        raca: data.raca || "",
        sexo: data.sexo,
        data_nascimento: data.data_nascimento || null,
        peso_atual: data.peso_atual ? parseFloat(data.peso_atual) : 0,
        observacoes: data.observacoes || "",
        status: data.status || "ativo",
        vacinacao: data.vacinacao || "pendente",
      };

      console.log("📤 Enviando PUT para:", `produtor/animais/${id}/`);
      console.log("📦 Dados enviados:", dadosFormatados);

      const response = await api.put(
        `produtor/animais/${id}/`,
        dadosFormatados,
      );
      return response.data;
    } catch (error) {
      console.error("❌ Erro ao atualizar animal:", error);
      console.error("📋 Resposta do erro:", error.response?.data);
      console.error("🔍 Status:", error.response?.status);
      throw error;
    }
  },

  deleteAnimal: async (id) => {
    const response = await api.delete(`produtor/animais/${id}/`);
    return response.data;
  },

  // Estatísticas dos animais
  getAnimaisStats: async () => {
    const response = await api.get("produtor/animais/stats/");
    return response.data;
  },

  getUltimosAnimais: async (limit = 5) => {
    const response = await api.get(`produtor/animais/ultimos/?limit=${limit}`);
    return response.data;
  },

  // Saúde Animal
  getSaudeAnimal: async (animalId = null) => {
    const params = animalId ? { animal_id: animalId } : {};
    const response = await api.get("produtor/saude/", { params });
    return response.data;
  },

  registrarEventoSaude: async (data) => {
    const response = await api.post("produtor/saude/", data);
    return response.data;
  },

  getAlertasSaude: async () => {
    const response = await api.get("produtor/saude/alertas/");
    return response.data;
  },

  // Alimentação
  getAlimentacoes: async (params = {}) => {
    const response = await api.get("produtor/alimentacao/", { params });
    return response.data;
  },

  async registrarAlimentacao(data) {
    try {
      // O backend já deve adicionar a fazenda automaticamente baseado no usuário
      // Não precisa enviar o campo fazenda
      const response = await api.post("produtor/alimentacao/", {
        tipo_racao: data.tipo_racao,
        quantidade_sacos: data.quantidade_sacos,
        data: data.data || new Date().toISOString().split("T")[0],
        observacoes: data.observacoes || "",
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar alimentação:", error);
      throw error;
    }
  },

  getEstoqueRacao: async () => {
    const response = await api.get("produtor/alimentacao/estoque/");
    return response.data;
  },

  getConsumoDiario: async () => {
    try {
      const response = await api.get("produtor/alimentacao/consumo_diario/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar consumo diário:", error);
      // Retornar dados mockados em caso de erro
      return {
        total: 0,
        por_animal: 0,
        sacos_por_dia: 0,
        custo_diario: 0,
        custo_mensal: 0,
      };
    }
  },

  getConsumoMensal: async () => {
    const response = await api.get("produtor/alimentacao/consumo_mensal/");
    return response.data;
  },

  // Financeiro
  getTransacoes: async (params = {}) => {
    const response = await api.get("produtor/financeiro/", { params });
    return response.data;
  },

  registrarTransacao: async (data) => {
    const response = await api.post("produtor/financeiro/", data);
    return response.data;
  },

  getResumoFinanceiro: async (periodo = "ultimo_mes") => {
    const response = await api.get("produtor/financeiro/resumo/", {
      params: { periodo },
    });
    return response.data;
  },

  // Relatórios
  getRelatoriosProducao: async (params = {}) => {
    const response = await api.get("produtor/relatorios/", { params });
    return response.data;
  },

  async gerarRelatorio(data) {
    try {
      const response = await api.post("produtor/relatorios/gerar/", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      throw error;
    }
  },

  async downloadRelatorio(id) {
    try {
      const response = await api.get(`produtor/relatorios/${id}/download/`, {
        responseType: "blob",
      });

      // Criar um link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `relatorio_${id}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      console.error("Erro ao baixar relatório:", error);
      throw error;
    }
  },

  // frontend/src/services/ProdutorService.js

  async getIndicadoresProducao() {
    try {
      // URL mais curta
      const response = await api.get("produtor/indicadores/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar indicadores:", error);
      return {
        taxa_natalidade: 0,
        taxa_mortalidade: 0,
        peso_medio: 0,
        producao_mensal: 0,
        variacao_natalidade: 0,
        variacao_mortalidade: 0,
        variacao_peso: 0,
        variacao_producao: 0,
      };
    }
  },

  // Para compatibilidade, mantenha este mas usando o mesmo endpoint
  async getRelatoriosDisponiveis() {
    try {
      const response = await this.getRelatoriosProducao({ limit: 10 });
      return response;
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
      return { results: [], count: 0 };
    }
  },

  // Alertas
  getAlertas: async () => {
    const response = await api.get("produtor/alertas/");
    return response.data;
  },

  marcarAlertaLido: async (id) => {
    const response = await api.post(`produtor/alertas/${id}/marcar_lido/`);
    return response.data;
  },

  marcarTodosAlertasLidos: async () => {
    const response = await api.post("produtor/alertas/marcar_todos_lidos/");
    return response.data;
  },

  getAtividadesRecentes: async () => {
    const response = await api.get("produtor/atividades/");
    return response.data;
  },

  // Preferências de Notificações
  getPreferenciasNotificacoes: async () => {
    try {
      const response = await api.get("produtor/preferencias/notificacoes/");
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          alertas_saude: true,
          alertas_estoque: true,
          alertas_relatorios: false,
          frequencia_saude: "imediato",
          frequencia_estoque: "imediato",
          frequencia_relatorios: "mensal",
        };
      }
      throw error;
    }
  },

  updatePreferenciasNotificacoes: async (data) => {
    try {
      const response = await api.put(
        "produtor/preferencias/notificacoes/",
        data,
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return data;
      }
      throw error;
    }
  },

  // Estatísticas do Perfil
  getEstatisticasPerfil: async () => {
    const response = await api.get("produtor/perfil/estatisticas/");
    return response.data;
  },

  async criarTipoRacao(data) {
    const response = await api.post("produtor/tipos-racao/", data);
    return response.data;
  },

  async getTiposRacao() {
    const response = await api.get("produtor/tipos-racao/");
    return response.data;
  },

  // frontend/src/services/produtorService.js

  async adicionarEstoque(data) {
    try {
      // Garantir que os dados estão no formato correto
      const dadosEnvio = {
        tipo_racao: data.tipo_racao, // ID do tipo de ração
        quantidade_sacos: parseFloat(data.quantidade_sacos),
        valor_total:
          parseFloat(data.preco_pago_saco) * parseFloat(data.quantidade_sacos),
        data: new Date().toISOString().split("T")[0],
        fornecedor: data.fornecedor || "",
        observacoes: data.observacoes || "",
      };

      console.log("📤 Enviando compra:", dadosEnvio);

      const response = await api.post("produtor/compras-racao/", dadosEnvio);
      return response.data;
    } catch (error) {
      console.error("Erro ao adicionar estoque:", error);
      console.error("Resposta do erro:", error.response?.data);
      throw error;
    }
  },

  async atualizarTipoRacao(id, data) {
    try {
      const response = await api.put(`produtor/tipos-racao/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar tipo de ração:", error);
      throw error;
    }
  },

  async deletarTipoRacao(id) {
    try {
      const response = await api.delete(`produtor/tipos-racao/${id}/`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar tipo de ração:", error);
      throw error;
    }
  },


getOcorrenciasFazenda: async (apenasPendentes = false) => {
  const params = apenasPendentes ? '?pendentes=true' : '';
  const response = await api.get(`produtor/ocorrencias/${params}`);
  return response.data;
},

resolverOcorrencia: async (id) => {
  const response = await api.post(`produtor/ocorrencias/${id}/resolver/`);
  return response.data;
},
};