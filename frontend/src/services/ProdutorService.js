import api from "./api";

export const produtorService = {
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

  updateAnimal: async (id, data) => {
    const response = await api.put(`produtor/animais/${id}/`, data);
    return response.data;
  },

  deleteAnimal: async (id) => {
    const response = await api.delete(`produtor/animais/${id}/`);
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

  registrarAlimentacao: async (data) => {
    const response = await api.post("produtor/alimentacao/", data);
    return response.data;
  },

  getEstoqueRacao: async () => {
    const response = await api.get("produtor/alimentacao/estoque/");
    return response.data;
  },

  // NOVO MÉTODO - Consumo Diário
  getConsumoDiario: async () => {
    const response = await api.get("produtor/alimentacao/consumo-diario/");
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
    const response = await api.get("produtor/relatorios/producao/", {
      params,
    });
    return response.data;
  },

  gerarRelatorio: async (tipo, periodo) => {
    const response = await api.post("produtor/relatorios/gerar/", {
      tipo,
      periodo,
    });
    return response.data;
  },

  // Alertas
  getAlertas: async () => {
    const response = await api.get("produtor/alertas/");
    return response.data;
  },

  marcarAlertaLido: async (id) => {
    const response = await api.patch(`produtor/alertas/${id}/marcar-lido/`);
    return response.data;
  },

  getAtividadesRecentes: async () => {
    const response = await api.get("produtor/atividades/recentes/");
    return response.data;
  },

  // Preferências de Notificações (para o componente AlertasNotificacoes)
  getPreferenciasNotificacoes: async () => {
    const response = await api.get("produtor/preferencias/notificacoes/");
    return response.data;
  },

  getEstatisticasPerfil: async () => {
    const response = await api.get("produtor/perfil/estatisticas/");
    return response.data;
  },

  updatePreferenciasNotificacoes: async (data) => {
    const response = await api.put("produtor/preferencias/notificacoes/", data);
    return response.data;
  },

  getIndicadoresProducao: async () => {
    const response = await api.get("produtor/relatorios/indicadores/");
    return response.data;
  },

  getRelatoriosDisponiveis: async () => {
    const response = await api.get("/produtor/relatorios/disponiveis/");
    return response.data;
  },

  downloadRelatorio: async (id) => {
    const response = await api.get(`/produtor/relatorios/${id}/download/`, {
      responseType: "blob",
    });
    return response.data;
  },
};
