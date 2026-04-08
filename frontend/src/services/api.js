import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api/auth/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
          refresh,
        });
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } 
      // eslint-disable-next-line no-unused-vars
      catch (err) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  register: async (userData) => {
    const response = await api.post('register/', userData);
    return response.data;
    
  },

  login: async (email, password) => {
    const response = await api.post('login/', { email, password });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      await api.post('logout/', { refresh });
    }
    localStorage.clear();
    window.location.href = '/login';
  },

  getCurrentUser: async () => {
    const response = await api.get('me/');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('profile/', profileData);
    return response.data;
  },

  googleLogin: async (data) => {
    const response = await api.post('google-login/', data);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  googleRegister: async (data) => {
  const response = await api.post('google-register/', data);
  return response.data;
},

  setPassword: async (data) => {
    const response = await api.post('set-password/', data);
    return response.data;
  },

  // ADICIONE ESTA FUNÇÃO AQUI
  completeProfile: async (data) => {
    const response = await api.post('complete-profile/', data);
    return response.data;
  },

  confirmEmail: async (token) => {
  const response = await api.post('confirm-email/', { token });
  return response.data;
 },

  resendConfirmation: async (email) => {
    const response = await api.post('resend-confirmation/', { email });
    return response.data;
  },
};

// Serviços de admin
export const adminService = {
  getUsers: async () => {
    const response = await api.get('admin/users/');
    return response.data;
  },

  getPendingUsers: async () => {
    const response = await api.get('admin/users/pending/');
    return response.data;
  },

  approveUser: async (userId) => {
    const response = await api.post(`admin/users/${userId}/approve/`);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`admin/users/${userId}/role/`, { role });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`admin/users/${userId}/delete/`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('admin/stats/');
    return response.data;
  },

   
  // Backups
  getBackups: async () => {
    const response = await api.get('admin/backups/');
    return response.data;
  },
  
  createBackup: async () => {
    const response = await api.post('admin/backups/create/');
    return response.data;
  },
  
  downloadBackup: async (id) => {
    const response = await api.get(`admin/backups/${id}/download/`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  deleteBackup: async (id) => {
    const response = await api.delete(`admin/backups/${id}/`);
    return response.data;
  },
  
  updateBackupSchedule: async (schedule) => {
    const response = await api.post('admin/backups/schedule/', schedule);
    return response.data;
  },
};

export default api;