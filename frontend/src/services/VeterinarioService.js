// src/services/veterinarioService.js
import api from "./api";

export const veterinarioService = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await api.get("veterinario/dashboard/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dashboard:", error);
      throw error;
    }
  },

  // Consultas
  getConsultas: async (params = {}) => {
    const response = await api.get("veterinario/consultas/", { params });
    return response.data;
  },

  getConsultasHoje: async () => {
    const response = await api.get("veterinario/consultas/hoje/");
    return response.data;
  },

  agendarConsulta: async (data) => {
    const response = await api.post("veterinario/consultas/", data);
    return response.data;
  },

  concluirConsulta: async (id) => {
    const response = await api.post(`veterinario/consultas/${id}/concluir/`);
    return response.data;
  },

  // Vacinas
  getVacinas: async (params = {}) => {
    const response = await api.get("veterinario/vacinas/", { params });
    return response.data;
  },

  getProximasVacinas: async () => {
    const response = await api.get("veterinario/vacinas/proximas/");
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

  // Tratamentos
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

  concluirTratamento: async (id) => {
    const response = await api.post(`veterinario/tratamentos/${id}/concluir/`);
    return response.data;
  },

  // Alertas de Saúde
  getAlertas: async () => {
    try {
      const response = await api.get("veterinario/alertas/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar alertas:", error);
      throw error;
    }
  },

  getAlertasNaoLidos: async () => {
    const response = await api.get("veterinario/alertas/nao_lidos/");
    return response.data;
  },

  marcarAlertaLido: async (id) => {
    try {
      const response = await api.post(`veterinario/alertas/${id}/marcar_lido/`);
      return response.data;
    } catch (error) {
      console.error("Erro ao marcar alerta como lido:", error);
      throw error;
    }
  },

  // Lembretes de Saúde
  getLembretes: async (params = {}) => {
    const response = await api.get("veterinario/lembretes/", { params });
    return response.data;
  },

  criarLembrete: async (data) => {
    const response = await api.post("veterinario/lembretes/", data);
    return response.data;
  },

  // Animais
  getAnimais: async (params = {}) => {
    try {
      const response = await api.get("veterinario/animais/", { params });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar animais:", error);
      throw error;
    }
  },

  getAnimal: async (id) => {
    const response = await api.get(`veterinario/animais/${id}/`);
    return response.data;
  },

  // Histórico Médico
  getHistoricoMedico: async (animalId) => {
    try {
      const response = await api.get(`veterinario/historico/${animalId}/`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      throw error;
    }
  },

  // Resumo de Saúde do Rebanho
  getResumoSaudeRebanho: async () => {
    try {
      const response = await api.get("veterinario/saude/resumo/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar resumo de saúde:", error);
      throw error;
    }
  },

  // Perfil
  getPerfil: async () => {
    const response = await api.get("veterinario/veterinarios/");
    return response.data;
  },

  atualizarPerfil: async (data) => {
    const response = await api.put("veterinario/veterinarios/", data);
    return response.data;
  },

  getEstatisticasPerfil: async () => {
    const response = await api.get("veterinario/perfil/estatisticas/");
    return response.data;
  },
};