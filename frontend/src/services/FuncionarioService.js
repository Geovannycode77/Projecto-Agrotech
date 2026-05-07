import api from "./api";

export const funcionarioService = {
getDashboard: async () => {
    try {
      const response = await api.get("funcionario/dashboard/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dashboard:", error);
      throw error;
    }
  },

  // Tarefas
  getTarefas: async (params = {}) => {
    const response = await api.get("funcionario/tarefas/", { params });
    return response.data;
  },

  atualizarTarefa: async (id, data) => {
    const response = await api.patch(`funcionario/tarefas/${id}/`, data);
    return response.data;
  },

  // Alimentação
  getAlimentacoes: async (params = {}) => {
    const response = await api.get("funcionario/alimentacoes/", { params });
    return response.data;
  },

  registrarAlimentacao: async (data) => {
    const response = await api.post("funcionario/alimentacoes/", data);
    return response.data;
  },

  // Ocorrências
  getOcorrencias: async (params = {}) => {
    const response = await api.get("funcionario/ocorrencias/", { params });
    return response.data;
  },

  registrarOcorrencia: async (data) => {
    const response = await api.post("funcionario/ocorrencias/", data);
    return response.data;
  },

  // Atualização de Animais
  atualizarPeso: async (animalId, peso) => {
    const response = await api.patch(`funcionario/animais/${animalId}/peso/`, {
      peso,
    });
    return response.data;
  },

  getPerfil: async () => {
    const response = await api.get("funcionario/perfil/");
    return response.data;
  },

  atualizarPerfil: async (data) => {
    const response = await api.put("funcionario/perfil/", data);
    return response.data;
  },
  registrarNascimento: async (data) => {
    const response = await api.post("funcionario/animais/nascimento/", data);
    return response.data;
  },

  registrarMorte: async (data) => {
    const response = await api.post("funcionario/animais/morte/", data);
    return response.data;
  },

  getTiposRacao: async () => {
    const response = await api.get("funcionario/alimentacao/tipos-racao/");
    return response.data;
  },
};
