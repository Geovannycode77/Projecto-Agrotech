import api from './api';

  export const gestorService = {
  getDashboard: async () => {
    try {
      const response = await api.get('../gestor/dashboard/');
      return response;
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      throw error;
    }
  },
  
  getUltimasAtividades: async () => {
  const response = await api.get('/gestor/atividades/recentes/');
  return response.data;
  },
  // Receitas
  getReceitas: async (params = {}) => {
    const response = await api.get('/gestor/receitas/', { params });
    return response.data;
  },
  getPerfil: async () => {
    const response = await api.get('/gestor/perfil/');
    return response.data;
  },

  atualizarPerfil: async (data) => {
    const response = await api.put('/gestor/perfil/', data);
    return response.data;
  },

  getEstatisticas: async () => {
    const response = await api.get('/gestor/estatisticas/');
    return response.data;
  },
  registrarReceita: async (data) => {
    const response = await api.post('/gestor/receitas/', data);
    return response.data;
  },

  // Despesas
  getDespesas: async (params = {}) => {
    const response = await api.get('/gestor/despesas/', { params });
    return response.data;
  },

  registrarDespesa: async (data) => {
    const response = await api.post('/gestor/despesas/', data);
    return response.data;
  },

  // Relatórios Financeiros
  getRelatorioFinanceiro: async (periodo) => {
    const response = await api.get('/gestor/relatorios/financeiro/', { params: { periodo } });
    return response.data;
  },

  exportarRelatorio: async (periodo) => {
  const response = await api.get('/gestor/relatorios/financeiro/exportar/', { 
    params: { periodo },
    responseType: 'blob'
  });
  return response.data;
  },

  getAnaliseLucros: async (periodo) => {
    const response = await api.get('/gestor/analise/lucros/', { params: { periodo } });
    return response.data;
  },

  // Vendas de Gado
  getVendasGado: async (params = {}) => {
    const response = await api.get('/gestor/vendas/gado/', { params });
    return response.data;
  },
  registrarVendaGado: async (data) => {
    const response = await api.post('/gestor/vendas/gado/', data);
    return response.data;
  },
};