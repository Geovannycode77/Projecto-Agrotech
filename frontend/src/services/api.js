import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Cliente para autenticação (baseURL: /api/auth/)
const authApi = axios.create({
  baseURL: `${API_URL}/api/auth/`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cliente para dashboards e endpoints da API (baseURL: /api/)
const api = axios.create({
  baseURL: `${API_URL}/api/`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token em ambos os clientes
const addTokenInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");

      // Garante que o header só é setado quando existir token válido
      // e evita enviar Authorization inválido (que quebra no backend com "bad_authorization_header").
      if (token && typeof token === "string" && token.trim().length > 0) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token.trim()}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );
};

// Interceptor para refresh token em ambos os clientes
const addRefreshInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Debug: ajudar a entender se o refresh está sendo acionado
          // eslint-disable-next-line no-console
          console.debug('[api] 401 detectado, tentando refresh...');

          const refresh = localStorage.getItem("refresh_token");
          if (!refresh) throw new Error("Missing refresh_token");

          // Requisita refresh usando a instância correta (mantém config/baseURL/cabeçalhos)
          const refreshResponse = await authApi.post("token/refresh/", { refresh });
          const newAccessToken = refreshResponse.data.access;

          // eslint-disable-next-line no-console
          console.debug('[api] refresh ok, reexecutando request:', originalRequest?.url);

          localStorage.setItem("access_token", newAccessToken);

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return instance(originalRequest);
        } catch (refreshError) {
          // se refresh falhar, não mascara o erro original
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    },
  );
};

// Aplicar interceptors a ambos os clientes
addTokenInterceptor(authApi);
addTokenInterceptor(api);
addRefreshInterceptor(authApi);
addRefreshInterceptor(api);

// Serviços de autenticação
export const authService = {
  register: async (userData) => {
    const response = await authApi.post("register/", userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await authApi.post("change-password/", passwordData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await authApi.post("login/", { email, password });
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      try {
        await authApi.post("logout/", { refresh });
      } catch (error) {
        console.error("Erro no logout:", error);
      }
    }
    // Remove apenas os tokens, sem redirecionar
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    // NÃO coloque window.location.href aqui
  },
  
      getProfile: async () => {
      const response = await authApi.get('profile/');
      return response.data;
    },


  getCurrentUser: async () => {
    const response = await authApi.get("me/");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await authApi.put("profile/", profileData);
    return response.data;
  },

  googleLogin: async (data) => {
    const response = await authApi.post("google-login/", data);
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  googleRegister: async (data) => {
    const response = await authApi.post("google-register/", data);
    return response.data;
  },

  setPassword: async (data) => {
    const response = await authApi.post("set-password/", data);
    return response.data;
  },

  completeProfile: async (data) => {
    const response = await authApi.post("complete-profile/", data);
    return response.data;
  },

  confirmEmail: async (token) => {
    const response = await authApi.post("confirm-email/", { token });
    return response.data;
  },

  resendConfirmation: async (email) => {
    const response = await authApi.post("resend-confirmation/", { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await authApi.post("forgot-password/", { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await authApi.post("reset-password/", {
      token,
      new_password: newPassword,
    });
    return response.data;
  },
};

/// Serviços de admin

export const adminService = {
  // USERS
  getUsers: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `dashboard-admin/users/${queryParams ? `?${queryParams}` : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  getPendingUsers: async () => {
    const response = await api.get("dashboard-admin/users/?status=pending");
    return response.data;
  },

  approveUser: async (userId) => {
    const response = await api.post(`dashboard-admin/users/${userId}/approve/`);
    return response.data;
  },

  blockUser: async (userId) => {
    const response = await api.post(`dashboard-admin/users/${userId}/block/`);
    return response.data;
  },

  unblockUser: async (userId) => {
    const response = await api.post(`dashboard-admin/users/${userId}/unblock/`);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(
      `dashboard-admin/users/${userId}/change_role/`,
      { role },
    );
    return response.data;
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(
        `dashboard-admin/users/${userId}/delete/`,
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        const response = await api.delete(`dashboard-admin/users/${userId}/`);
        return response.data;
      }
      throw error;
    }
  },

  getUserStats: async () => {
    const response = await api.get("dashboard-admin/users/stats/");
    return response.data;
  },

  exportUsers: async (format = "csv") => {
    const response = await api.get(
      `dashboard-admin/users/export/?format=${format}`,
      {
        responseType: "blob",
      },
    );
    return response.data;
  },

  // BACKUPS
  getBackups: async () => {
    try {
      const response = await api.get("dashboard-admin/backups/");
      return response.data;
    } catch (error) {
      console.warn("Erro ao buscar backups, retornando dados mock");
      // Dados mock para teste
      return [
        {
          id: 1,
          filename: "backup_20240511_120000.sql",
          size: 10485760,
          created_at: new Date().toISOString(),
          status: "completed",
          type: "database",
        },
        {
          id: 2,
          filename: "backup_20240510_120000.sql",
          size: 10485760,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          status: "completed",
          type: "database",
        },
      ];
    }
  },

  createBackup: async () => {
    const response = await api.post("dashboard-admin/backups/create/");
    return response.data;
  },

  downloadBackup: async (id) => {
    const response = await api.get(`dashboard-admin/backups/${id}/download/`, {
      responseType: "blob",
    });
    return response.data;
  },

  deleteBackup: async (id) => {
    const response = await api.delete(`dashboard-admin/backups/${id}/delete/`);
    return response.data;
  },

  updateBackupSchedule: async (schedule) => {
    const response = await api.post(
      "dashboard-admin/backups/schedule/",
      schedule,
    );
    return response.data;
  },

  getBackupSettings: async () => {
    const response = await api.get("dashboard-admin/backups/settings/");
    return response.data;
  },

  // STATS
  getStats: async () => {
    const response = await api.get("dashboard-admin/stats/");
    return response.data;
  },

  // SECURITY (Segurança)
  // SECURITY (Sem mock)
  getSecuritySettings: async () => {
    const response = await api.get("dashboard-admin/security/settings/");
    return response.data;
  },

  updateSecuritySettings: async (settings) => {
    const response = await api.put(
      "dashboard-admin/security/settings/",
      settings,
    );
    return response.data;
  },

  getActivityLog: async () => {
    const response = await api.get("dashboard-admin/activity-log/");
    return response.data;
  },

  // SETTINGS
  getSystemSettings: async () => {
    const response = await api.get("dashboard-admin/settings/");
    return response.data;
  },

  getSystemSetting: async (key) => {
    const response = await api.get(`dashboard-admin/settings/${key}/`);
    return response.data;
  },

  updateSystemSetting: async (key, value) => {
    const response = await api.put(`dashboard-admin/settings/${key}/`, {
      value,
    });
    return response.data;
  },

  updateMultipleSettings: async (settings) => {
    const response = await api.post(
      "dashboard-admin/settings/update_multiple/",
      settings,
    );
    return response.data;
  },

  getPublicSettings: async () => {
    const response = await api.get("dashboard-admin/settings/public/");
    return response.data;
  },

  // WIDGETS
  getWidgets: async () => {
    const response = await api.get("dashboard-admin/widgets/");
    return response.data;
  },

  updateWidget: async (widgetId, data) => {
    const response = await api.put(
      `dashboard-admin/widgets/${widgetId}/`,
      data,
    );
    return response.data;
  },

  // LOGS
  getLogs: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `dashboard-admin/logs/${queryParams ? `?${queryParams}` : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  // NOTIFICATIONS
  createNotification: async (notificationData) => {
    const response = await api.post(
      "dashboard-admin/notifications/",
      notificationData,
    );
    return response.data;
  },

  // PERMISSÕES SIMPLIFICADAS
  getSimplePermissions: async () => {
    try {
      const response = await api.get("dashboard-admin/simple-permissions/");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar permissões:", error);
      // Dados padrão em caso de erro
      return {
        camadas: {
          administrador: {
            nome: "Administrador",
            descricao: "Acesso total ao sistema",
            cor: "red",
            permissoes: ["*"],
          },
          produtor: {
            nome: "Produtor",
            descricao: "Gestão de produção, animais e fazenda",
            cor: "green",
            permissoes: ["animais", "producao", "fazenda", "dashboard"],
          },
          veterinario: {
            nome: "Veterinário",
            descricao: "Gestão de saúde animal",
            cor: "blue",
            permissoes: ["animais", "vacinas", "consultas", "dashboard"],
          },
          funcionario: {
            nome: "Funcionário",
            descricao: "Tarefas operacionais",
            cor: "yellow",
            permissoes: ["tarefas", "animais_leitura", "dashboard"],
          },
          gestor_financeiro: {
            nome: "Gestor Financeiro",
            descricao: "Gestão financeira",
            cor: "purple",
            permissoes: ["financas", "relatorios", "dashboard"],
          },
        },
        modulos: [
          { id: "dashboard", nome: "Dashboard" },
          { id: "animais", nome: "Animais" },
          { id: "producao", nome: "Produção" },
          { id: "fazenda", nome: "Fazenda" },
          { id: "vacinas", nome: "Vacinas" },
          { id: "consultas", nome: "Consultas" },
          { id: "tarefas", nome: "Tarefas" },
          { id: "financas", nome: "Finanças" },
          { id: "relatorios", nome: "Relatórios" },
          { id: "animais_leitura", nome: "Animais (Leitura)" },
        ],
      };
    }
  },

  saveSimplePermissions: async (permissions) => {
    const response = await api.post(
      "dashboard-admin/simple-permissions/save/",
      permissions,
    );
    return response.data;
  },

  // MONITORING (Monitoramento)
  getSystemStatus: async () => {
    const response = await api.get("dashboard-admin/system/status/");
    return response.data;
  },

  getSystemMetrics: async () => {
    const response = await api.get("dashboard-admin/system/metrics/");
    return response.data;
  },

  getHealthCheck: async () => {
    const response = await api.get("dashboard-admin/health/");
    return response.data;
  },
};

export default api;
