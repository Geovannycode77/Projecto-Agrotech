// src/services/gestorService.js
import api from "./api";

// Mapeia os valores do frontend para os que o backend espera
const mapPeriodo = (periodo) => {
  const mapa = {
    mes:       'mensal',
    trimestre: 'trimestral',
    ano:       'anual',
    // os de análise de lucros
    '6meses':  'mensal',   // backend não tem 6meses — usa mensal como fallback
    '12meses': 'anual',
  };
  return mapa[periodo] ?? periodo;
};

export const gestorService = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get("gestor-financeiro/dashboard/");
    return response.data;
  },

  getAnimaisFazenda: async () => {
    try {
      const response = await api.get('gestor-financeiro/animais/');
      return response.data;
    } catch {
      return [];
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
  // O backend devolve: { total_receitas, total_despesas, lucro_liquido,
  //   margem_lucro, dados_json: { receitas_por_categoria, despesas_por_categoria } }
  getRelatorioFinanceiro: async (periodo) => {
    const response = await api.get("gestor-financeiro/relatorios/gerar/", {
      params: { periodo: mapPeriodo(periodo) },
    });

    const d = response.data;
    const dados = d.dados_json || {};

    // Converte receitas_por_categoria de objecto para array
    const receitasCat = Object.entries(dados.receitas_por_categoria || {}).map(
      ([categoria, valor]) => ({
        categoria,
        valor,
        percentual: dados.total_receitas > 0
          ? Math.round((valor / dados.total_receitas) * 100)
          : 0,
      })
    );

    const despesasCat = Object.entries(dados.despesas_por_categoria || {}).map(
      ([categoria, valor]) => ({
        categoria,
        valor,
        percentual: dados.total_despesas > 0
          ? Math.round((valor / dados.total_despesas) * 100)
          : 0,
      })
    );

    return {
      receitas:                 d.total_receitas  || 0,
      despesas:                 d.total_despesas  || 0,
      lucro:                    d.lucro_liquido   || 0,
      receitas_por_categoria:   receitasCat,
      despesas_por_categoria:   despesasCat,
      margem_lucro:             d.margem_lucro    || 0,
      roi:                      dados.roi         || 0,
      custo_operacional:        dados.custo_operacional || 0,
      ticket_medio:             dados.ticket_medio      || 0,
    };
  },

  exportarRelatorio: async (periodo) => {
    const response = await api.get(
      "gestor-financeiro/relatorios/gerar/exportar/",
      {
        params: { periodo: mapPeriodo(periodo) },
        responseType: "blob",
      }
    );
    return response.data;
  },

getAnaliseLucros: async (periodo = '6meses') => {
  try {
    const response = await api.get(`gestor-financeiro/analise-lucros/?periodo=${periodo}`);
    return response.data;
  } catch (error) {
    console.error('Erro análise lucros:', error);
    return { lucro_mensal: [], tendencia: { lucro: '0%', receita: '0%', despesa: '0%' }, projecao: { proximo_mes: 0, trimestre: 0, ano: 0 } };
  }
},
getTodosDespesas: async () => {
  try {
    const response = await api.get('gestor-financeiro/todas-despesas/');
    return response.data;
  } catch {
    return [];
  }
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