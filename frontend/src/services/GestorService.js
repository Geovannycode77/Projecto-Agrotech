// src/services/gestorService.js
import api from "./api";

export const gestorService = {
  // Dashboard - CORRIGIDO (o backend espera apenas "dashboard/")
  getDashboard: async () => {
    try {
      const response = await api.get("gestor-financeiro/dashboard/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dashboard:", error);
      throw error;
    }
  },

  // Atividades Recentes - CORRIGIDO
  getUltimasAtividades: async () => {
    const response = await api.get("gestor-financeiro/atividades/");
    return response.data;
  },

  // Receitas
  getReceitas: async (params = {}) => {
    const response = await api.get("gestor-financeiro/receitas/", { params });
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

  // Metas Financeiras
  getMetas: async (params = {}) => {
    const response = await api.get("gestor-financeiro/metas/", { params });
    return response.data;
  },

  criarMeta: async (data) => {
    const response = await api.post("gestor-financeiro/metas/", data);
    return response.data;
  },

  atualizarMeta: async (id, data) => {
    const response = await api.put(`gestor-financeiro/metas/${id}/`, data);
    return response.data;
  },

  // Relatórios Financeiros - CORRIGIDO
  getRelatorioFinanceiro: async (periodo) => {
    const response = await api.get("gestor-financeiro/relatorios/gerar/", {
      params: { periodo },
    });
    return response.data;
  },

  exportarRelatorio: async (periodo) => {
    const response = await api.get(
      "gestor-financeiro/relatorios/gerar/exportar/",
      {
        params: { periodo },
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Análise de Lucros - CORRIGIDO (usa o mesmo relatório)
  getAnaliseLucros: async (periodo) => {
    const response = await api.get("gestor-financeiro/relatorios/gerar/", {
      params: { periodo },
    });
    return response.data;
  },

  // Perfil
  getPerfil: async () => {
    const response = await api.get("gestor-financeiro/gestores/");
    return response.data;
  },

  atualizarPerfil: async (data) => {
    const response = await api.put("gestor-financeiro/gestores/", data);
    return response.data;
  },

  getEstatisticas: async () => {
    const response = await api.get("gestor-financeiro/relatorios/estatisticas/");
    return response.data;
  },
};