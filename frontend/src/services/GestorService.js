import api from "./api";

export const gestorService = {
getDashboard: async () => {
    try {
      const response = await api.get("gestor-financeiro/dashboard/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dashboard:", error);
      throw error;
    }
  },

  getUltimasAtividades: async () => {
    const response = await api.get("gestor-financeiro/atividades/recentes/");
    return response.data;
  },
  // Receitas
  getReceitas: async (params = {}) => {
    const response = await api.get("gestor-financeiro/receitas/", { params });
    return response.data;
  },
  getPerfil: async () => {
    const response = await api.get("gestor-financeiro/perfil/");
    return response.data;
  },

  atualizarPerfil: async (data) => {
    const response = await api.put("gestor-financeiro/perfil/", data);
    return response.data;
  },

  getEstatisticas: async () => {
    const response = await api.get("gestor-financeiro/estatisticas/");
    return response.data;
  },
  registrarReceita: async (data) => {
    const response = await api.post("gestor-financeiro/receitas/", data);
    return response.data;
  },

  // Despesas
  getDespesas: async (params = {}) => {
    const response = await api.get("gestor-financeiro/despesas/", { params });
    return response.data;
  },

  registrarDespesa: async (data) => {
    const response = await api.post("gestor-financeiro/despesas/", data);
    return response.data;
  },

  // Relatórios Financeiros
  getRelatorioFinanceiro: async (periodo) => {
    const response = await api.get("gestor-financeiro/relatorios/financeiro/", {
      params: { periodo },
    });
    return response.data;
  },

  exportarRelatorio: async (periodo) => {
    const response = await api.get(
      "gestor-financeiro/relatorios/financeiro/exportar/",
      {
        params: { periodo },
        responseType: "blob",
      },
    );
    return response.data;
  },

  getAnaliseLucros: async (periodo) => {
    const response = await api.get("gestor-financeiro/analise/lucros/", {
      params: { periodo },
    });
    return response.data;
  },

  // Vendas de Gado
  getVendasGado: async (params = {}) => {
    const response = await api.get("gestor-financeiro/vendas/gado/", {
      params,
    });
    return response.data;
  },
  registrarVendaGado: async (data) => {
    const response = await api.post("gestor-financeiro/vendas/gado/", data);
    return response.data;
  },
};
