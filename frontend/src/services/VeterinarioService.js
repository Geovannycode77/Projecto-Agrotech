import api from "./api";

export const veterinarioService = {
  getDashboard: async () => {
    try {
      const response = await api.get("veterinario/dashboard/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dashboard:", error);
      throw error;
    }
  },

  getConsultas: async (params = {}) => {
    const response = await api.get("veterinario/consultas/", { params });
    return response.data;
  },

  getAlertas: async () => {
    try {
      const response = await api.get("veterinario/alertas/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar alertas:", error);
      throw error;
    }
  },

  getEstatisticasPerfil: async () => {
    const response = await api.get("veterinario/perfil/estatisticas/");
    return response.data;
  },

  getAnimais: async (params) => {
    try {
      const response = await api.get("veterinario/animais/", { params });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar animais:", error);
      throw error;
    }
  },

  getHistoricoMedico: async (animalId) => {
    try {
      const response = await api.get(`veterinario/historico/${animalId}/`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      throw error;
    }
  },

  getVacinas: async (params = {}) => {
    const response = await api.get("veterinario/vacinas/", { params });
    return response.data;
  },
registrarVacina: async (data) => {
    try {
      const response = await api.post("veterinario/vacinas/", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar vacina:", error);
      throw error;
    }
  },

  getTratamentos: async (params = {}) => {
    const response = await api.get("veterinario/tratamentos/", { params });
    return response.data;
  },

  registrarTratamento: async (data) => {
    try {
      const response = await api.post("veterinario/tratamentos/", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar tratamento:", error);
      throw error;
    }
  },

  // NOVOS MÉTODOS - ADICIONADOS CORRETAMENTE DENTRO DO OBJETO
  getResumoSaudeRebanho: async () => {
    try {
      const response = await api.get("../veterinario/saude/resumo/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar resumo de saúde:", error);
      throw error;
    }
  },
  marcarAlertaLido: async (id) => {
    try {
      const response = await api.patch(
        `../veterinario/alertas/${id}/marcar-lido/`,
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao marcar alerta como lido:", error);
      throw error;
    }
  },
};
