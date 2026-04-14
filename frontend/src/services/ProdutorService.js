import api from './api';

// Note: Seu api.js tem baseURL: `${API_URL}/api/auth/`
// Para os endpoints do produtor, precisamos usar caminhos relativos
// que vão para fora da pasta auth

export const produtorService = {
  // Dashboard
  getDashboard: async () => {
    try {
      // Como api aponta para /api/auth/, usamos .. para sair da pasta auth
      const response = await api.get('../produtor/dashboard/');
      return response;
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      // Retornar dados mockados para desenvolvimento
      return { data: getMockDashboardData() };
    }
  },

  // Gestão de Animais
  getAnimais: async (params = {}) => {
    try {
      const response = await api.get('../produtor/animais/', { params });
      return response;
    } catch (error) {
      console.error('Erro ao buscar animais:', error);
      return { data: getMockAnimais() };
    }
  },

  getAnimal: async (id) => {
    try {
      const response = await api.get(`../produtor/animais/${id}/`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar animal:', error);
      throw error;
    }
  },

  createAnimal: async (data) => {
    try {
      const response = await api.post('../produtor/animais/', data);
      return response;
    } catch (error) {
      console.error('Erro ao criar animal:', error);
      throw error;
    }
  },

  updateAnimal: async (id, data) => {
    try {
      const response = await api.put(`../produtor/animais/${id}/`, data);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar animal:', error);
      throw error;
    }
  },

  deleteAnimal: async (id) => {
    try {
      const response = await api.delete(`../produtor/animais/${id}/`);
      return response;
    } catch (error) {
      console.error('Erro ao deletar animal:', error);
      throw error;
    }
  },

  // Saúde
  getSaudeAnimal: async (animalId = null) => {
    try {
      const params = animalId ? { animal_id: animalId } : {};
      const response = await api.get('../produtor/saude/', { params });
      return response;
    } catch (error) {
      console.error('Erro ao buscar saúde animal:', error);
      return { data: [] };
    }
  },

  registrarEventoSaude: async (data) => {
    try {
      const response = await api.post('../produtor/saude/', data);
      return response;
    } catch (error) {
      console.error('Erro ao registrar evento de saúde:', error);
      throw error;
    }
  },

  getAlertasSaude: async () => {
    try {
      const response = await api.get('../produtor/saude/alertas/');
      return response;
    } catch (error) {
      console.error('Erro ao buscar alertas de saúde:', error);
      return { data: [] };
    }
  },

  // Alimentação
  getAlimentacoes: async (params = {}) => {
    try {
      const response = await api.get('../produtor/alimentacao/', { params });
      return response;
    } catch (error) {
      console.error('Erro ao buscar alimentações:', error);
      return { data: [] };
    }
  },

  registrarAlimentacao: async (data) => {
    try {
      const response = await api.post('../produtor/alimentacao/', data);
      return response;
    } catch (error) {
      console.error('Erro ao registrar alimentação:', error);
      throw error;
    }
  },

  getEstoqueRacao: async () => {
    try {
      const response = await api.get('../produtor/alimentacao/estoque/');
      return response;
    } catch (error) {
      console.error('Erro ao buscar estoque de ração:', error);
      return { data: { quantidade: 3200, alerta_minimo: 500 } };
    }
  },

  // Financeiro
  getTransacoes: async (params = {}) => {
    try {
      const response = await api.get('../produtor/financeiro/', { params });
      return response;
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return { data: [] };
    }
  },

  registrarTransacao: async (data) => {
    try {
      const response = await api.post('../produtor/financeiro/', data);
      return response;
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      throw error;
    }
  },

  getResumoFinanceiro: async (periodo = 'ultimo_mes') => {
    try {
      const response = await api.get('../produtor/financeiro/resumo/', { params: { periodo } });
      return response;
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      return { data: getMockResumoFinanceiro() };
    }
  },

  // Relatórios
  getRelatoriosProducao: async (params = {}) => {
    try {
      const response = await api.get('../produtor/relatorios/producao/', { params });
      return response;
    } catch (error) {
      console.error('Erro ao buscar relatórios de produção:', error);
      return { data: getMockRelatorioProducao() };
    }
  },

  gerarRelatorio: async (tipo, periodo) => {
    try {
      const response = await api.post('../produtor/relatorios/gerar/', { tipo, periodo });
      return response;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  },

  // Alertas
  getAlertas: async () => {
    try {
      const response = await api.get('../produtor/alertas/');
      return response;
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return { data: getMockAlertas() };
    }
  },

  marcarAlertaLido: async (id) => {
    try {
      const response = await api.patch(`../produtor/alertas/${id}/marcar-lido/`);
      return response;
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
      throw error;
    }
  },

  getAtividadesRecentes: async () => {
    try {
      const response = await api.get('../produtor/atividades/recentes/');
      return response;
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      return { data: getMockAtividadesRecentes() };
    }
  }
};

// Dados Mockados para desenvolvimento enquanto a API não está pronta
function getMockDashboardData() {
  return {
    rebanho: {
      total: 156,
      por_especie: { bovino: 120, suino: 25, caprino: 11 },
      por_status: { ativo: 142, doente: 8, vendido: 4, morto: 2 },
      machos: 68,
      femeas: 88,
      novos_ultimo_mes: 12
    },
    alimentacao: {
      consumo_mensal: 4850,
      estoque_atual: 3200,
      custo_mensal: 8750
    }
  };
}

function getMockAnimais() {
  return {
    results: [
      { id: 1, brinco: 'BR-001', nome: 'Mimosa', especie: 'bovino', sexo: 'F', peso_atual: 450, status: 'ativo' },
      { id: 2, brinco: 'BR-002', nome: 'Trovão', especie: 'bovino', sexo: 'M', peso_atual: 520, status: 'ativo' },
      { id: 3, brinco: 'BR-003', nome: 'Pintada', especie: 'suino', sexo: 'F', peso_atual: 180, status: 'ativo' },
      { id: 4, brinco: 'BR-004', nome: 'Caramelo', especie: 'bovino', sexo: 'M', peso_atual: 380, status: 'doente' },
      { id: 5, brinco: 'BR-005', nome: 'Branquinha', especie: 'caprino', sexo: 'F', peso_atual: 65, status: 'ativo' }
    ]
  };
}

function getMockResumoFinanceiro() {
  return {
    total_receitas: 45230,
    total_despesas: 28750,
    saldo: 16480,
    receitas_por_categoria: { Venda: 35000, Outros: 10230 },
    despesas_por_categoria: { Ração: 12000, Veterinário: 5000, Medicamentos: 3000, Outros: 8750 }
  };
}

function getMockRelatorioProducao() {
  return {
    periodo: 'Último Mês',
    total_animais: 156,
    nascimentos: 8,
    mortes: 2,
    vendas: 4,
    peso_medio: 320,
    taxa_mortalidade: 1.28,
    natalidade: 5.13
  };
}

function getMockAlertas() {
  return [
    { id: 1, tipo: 'saude', mensagem: 'Vacinação do rebanho programada para amanhã', prioridade: 'alta', lido: false, data_alerta: new Date().toISOString() },
    { id: 2, tipo: 'alimentacao', mensagem: 'Estoque de ração está baixo (15% restante)', prioridade: 'media', lido: false, data_alerta: new Date().toISOString() },
    { id: 3, tipo: 'reproducao', mensagem: '3 animais prontos para reprodução', prioridade: 'alta', lido: false, data_alerta: new Date().toISOString() }
  ];
}

function getMockAtividadesRecentes() {
  return [
    { id: 1, tipo: 'Cadastro', descricao: 'Novo animal cadastrado: Mimosa', data: new Date().toISOString(), usuario: 'João Silva' },
    { id: 2, tipo: 'Saúde', descricao: 'Vacinação em massa aplicada', data: new Date().toISOString(), usuario: 'Maria Santos' },
    { id: 3, tipo: 'Financeiro', descricao: 'Venda de 2 bovinos realizada', data: new Date().toISOString(), usuario: 'Carlos Lima' }
  ];
}

export default produtorService;