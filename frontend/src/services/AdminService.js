import api from './api';

export const adminService = {
  // Dashboard
  getStats: async () => {
    const response = await api.get('/admin/stats/');
    return response.data;
  },

  // Usuários
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users/', { params });
    return response.data;
  },

  getPendingUsers: async () => {
    const response = await api.get('/admin/users/pending/');
    return response.data;
  },

  approveUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/approve/`);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role/`, { role });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}/delete/`);
    return response.data;
  },

  // Permissões
  getPermissions: async () => {
    const response = await api.get('/admin/permissions/');
    return response.data;
  },

  updatePermissions: async (data) => {
    const response = await api.put('/admin/permissions/', data);
    return response.data;
  },

  // Backups
  getBackups: async () => {
    const response = await api.get('/admin/backups/');
    return response.data;
  },

  createBackup: async () => {
    const response = await api.post('/admin/backups/create/');
    return response.data;
  },

  downloadBackup: async (id) => {
    const response = await api.get(`/admin/backups/${id}/download/`, {
      responseType: 'blob'
    });
    return response.data;
  },

  deleteBackup: async (id) => {
    const response = await api.delete(`/admin/backups/${id}/`);
    return response.data;
  },

  // Configurações
  getSettings: async () => {
    const response = await api.get('/admin/settings/');
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await api.put('/admin/settings/', data);
    return response.data;
  },

  // Relatórios
  getReports: async (params = {}) => {
    const response = await api.get('/admin/reports/', { params });
    return response.data;
  },

  generateReport: async (data) => {
    const response = await api.post('/admin/reports/generate/', data);
    return response.data;
  },
};