// src/services/gestorService.js
import api from "./api";

const periodoMap = {
  mes: 'mensal',
  trimestre: 'trimestral',
  ano: 'anual',
};

export const gestorService = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await api.get("gestor-financeiro/dashboard/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dashboard:", error);
      throw error;
    }
  },

  // Atividades Recentes
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

  // Relatórios Financeiros
  getRelatorioFinanceiro: async (periodo) => {
    const mappedPeriodo = periodoMap[periodo] || 'mensal';
    const response = await api.get("gestor-financeiro/relatorios/gerar/", {
      params: { periodo: mappedPeriodo },
    });
    const data = response.data;
    const totalReceitas = parseFloat(data.total_receitas || 0);
    const totalDespesas = parseFloat(data.total_despesas || 0);
    const receitasPorCategoria = Object.entries(data.dados_json?.receitas_por_categoria || {}).map(
      ([categoria, valor]) => ({
        categoria,
        valor: parseFloat(valor),
        percentual: totalReceitas > 0 ? (parseFloat(valor) / totalReceitas) * 100 : 0,
      }),
    );
    const despesasPorCategoria = Object.entries(data.dados_json?.despesas_por_categoria || {}).map(
      ([categoria, valor]) => ({
        categoria,
        valor: parseFloat(valor),
        percentual: totalDespesas > 0 ? (parseFloat(valor) / totalDespesas) * 100 : 0,
      }),
    );

    return {
      ...data,
      receitas: totalReceitas,
      despesas: totalDespesas,
      lucro: parseFloat(data.lucro_liquido || 0),
      receitas_por_categoria: receitasPorCategoria,
      despesas_por_categoria: despesasPorCategoria,
      indicadores: {
        margem_lucro: parseFloat(data.margem_lucro || 0),
        roi: 0,
        custo_operacional: 0,
        ticket_medio: 0,
      },
    };
  },

  exportarRelatorio: async (periodo) => {
    throw new Error('Exportação de relatórios ainda não está disponível.');
  },

  // Análise de Lucros
  getAnaliseLucros: async (periodo) => {
    const response = await api.get("gestor-financeiro/analise/", {
      params: { periodo },
    });
    return response.data;
  },

  // Perfil
  getPerfil: async () => {
    const response = await api.get("gestor-financeiro/perfil/");
    return response.data;
  },

  atualizarPerfil: async (data) => {
    const response = await api.put("gestor-financeiro/perfil/", data);
    return response.data;
  },

  getEstatisticas: async () => {
    const response = await api.get("gestor-financeiro/relatorios/estatisticas/");
    return response.data;
  },
};