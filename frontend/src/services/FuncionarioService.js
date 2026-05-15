// src/services/funcionarioService.js
import api from "./api";

export const funcionarioService = {
  // Dashboard
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

  getTarefasHoje: async () => {
    const response = await api.get("funcionario/tarefas/hoje/");
    return response.data;
  },

  getTarefasProximas: async () => {
    const response = await api.get("funcionario/tarefas/proximas/");
    return response.data;
  },

  atualizarTarefa: async (id, data) => {
    const response = await api.patch(`funcionario/tarefas/${id}/`, data);
    return response.data;
  },

  concluirTarefa: async (id) => {
    const response = await api.post(`funcionario/tarefas/${id}/concluir/`);
    return response.data;
  },

  iniciarTarefa: async (id) => {
    const response = await api.post(`funcionario/tarefas/${id}/iniciar/`);
    return response.data;
  },

  // Alimentação
  getAlimentacoes: async (params = {}) => {
    const response = await api.get("funcionario/alimentacao/", { params });
    return response.data;
  },

  registrarAlimentacao: async (data) => {
    const response = await api.post("funcionario/alimentacao/", data);
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

  resolverOcorrencia: async (id) => {
    const response = await api.post(`funcionario/ocorrencias/${id}/resolver/`);
    return response.data;
  },

  // Atualização de Animais
  atualizarPeso: async (animalId, peso) => {
    const response = await api.post(`funcionario/atualizacoes/`, {
      animal: animalId,
      tipo: 'peso',
      novo_valor: peso,
      descricao: `Atualização de peso para ${peso}kg`
    });
    return response.data;
  },

  registrarNascimento: async (data) => {
    const response = await api.post("funcionario/nascimentos/", data);
    return response.data;
  },

  registrarMorte: async (data) => {
    const response = await api.post(`funcionario/atualizacoes/`, {
      ...data,
      tipo: 'obito'
    });
    return response.data;
  },

  // Perfil
  getPerfil: async () => {
    const response = await api.get("funcionario/funcionarios/");
    return response.data;
  },

  atualizarPerfil: async (data) => {
    const response = await api.put("funcionario/funcionarios/", data);
    return response.data;
  },

  // Tipos de Ração
  getTiposRacao: async () => {
    const response = await api.get("funcionario/alimentacao/tipos/");
    return response.data;
  },
};