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
    const horarioMap = {
      manha: '07:00:00',
      tarde: '15:00:00',
      noite: '19:00:00',
    };
    const dataHora = data.data_hora || `${new Date().toISOString().split('T')[0]}T${horarioMap[data.horario] || '12:00:00'}`;

    const payload = {
      animal: data.animal || data.animal_id,
      tipo_racao: data.tipo_racao || data.tipo_racao_id,
      quantidade_kg: data.quantidade_kg ?? data.quantidade,
      data_hora: dataHora,
      observacoes: data.observacoes,
    };

    const response = await api.post("funcionario/alimentacao/", payload);
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
    const response = await api.get("funcionario/perfil/");
    return response.data;
  },

  atualizarPerfil: async (data) => {
    const response = await api.put("funcionario/perfil/", data);
    return response.data;
  },

  getAnimais: async (params = {}) => {
    const response = await api.get("funcionario/animais/", { params });
    return response.data;
  },

  // Tipos de Ração
  getTiposRacao: async () => {
    const response = await api.get("funcionario/alimentacao/tipos/");
    return response.data;
  },
};