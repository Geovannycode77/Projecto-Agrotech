import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Exporta o contexto separadamente
export const AuthContext = createContext();

// Exporta o Provider como componente
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        
        // Carregar perfil do usuário
        try {
          const perfilData = await authService.getProfile();
          setPerfil(perfilData);
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
        }
        
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.clear();
        setUser(null);
        setPerfil(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Carregar perfil após login
      try {
        const perfilData = await authService.getProfile();
        setPerfil(perfilData);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      if (error.response?.data?.requires_confirmation) {
        return { 
          success: false, 
          requires_confirmation: true,
          error: error.response?.data?.error 
        };
      }
      let errorMsg = error.response?.data?.error || error.response?.data?.detail || 
        (error.response?.data?.non_field_errors ? error.response.data.non_field_errors[0] : null) || 
        (error.response?.data?.errors && Object.values(error.response.data.errors)[0] ? Object.values(error.response.data.errors)[0][0] : null) || 
        'Erro ao fazer login';
      console.error('Login error details:', error.response?.data);
      return { success: false, error: errorMsg };
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await authService.googleLogin({ credential });
      
      if (response.access) {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Carregar perfil após login Google
        try {
          const perfilData = await authService.getProfile();
          setPerfil(perfilData);
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
        }
        
        return { success: true, user: response.user };
      }
      
      if (response.requires_registration) {
        return { 
          success: false, 
          requires_registration: true,
          email: response.email,
          name: response.name,
          picture: response.picture,
          google_id: response.google_id,
          error: response.error 
        };
      }
      
      if (response.requires_confirmation) {
        return { 
          success: false, 
          requires_confirmation: true,
          email: response.email,
          error: response.error || 'Email não confirmado' 
        };
      }
      
      return { success: false, error: response.error || 'Erro ao autenticar com Google' };
    } catch (error) {
      console.error('Google login error:', error);
      let errorMsg = error.response?.data?.error || error.response?.data?.detail || 
        (error.response?.data?.non_field_errors ? error.response.data.non_field_errors[0] : null) || 
        (error.response?.data?.errors && Object.values(error.response.data.errors)[0] ? Object.values(error.response.data.errors)[0][0] : null) || 
        'Erro ao fazer login com Google';
      console.error('Google login error details:', error.response?.data);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      return { success: true, message: data.message };
    } catch (error) {
      const errors = error.response?.data;
      let errorMsg = errors?.error || errors?.detail || 
        (errors?.non_field_errors ? errors.non_field_errors[0] : null) || 
        (errors?.errors && Object.values(errors.errors)[0] ? Object.values(errors.errors)[0][0] : null) || 
        'Erro ao registrar';
      console.error('Register error details:', errors);
      return { 
        success: false, 
        error: errorMsg,
        errors: errors
      };
    }
  };

  const completeProfile = async (data) => {
    try {
      const response = await authService.completeProfile(data);
      if (response.success === false) {
        return { success: false, error: response.error };
      }
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Complete profile error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao completar perfil' 
      };
    }
  };

  const confirmEmail = async (token) => {
    try {
      const response = await authService.confirmEmail(token);
      
      if (response.success) {
        if (response.access) {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          localStorage.setItem('user', JSON.stringify(response.user));
          setUser(response.user);
          setIsAuthenticated(true);
          
          // Carregar perfil após confirmação de email
          try {
            const perfilData = await authService.getProfile();
            setPerfil(perfilData);
          } catch (error) {
            console.error('Erro ao carregar perfil:', error);
          }
        }
        return { success: true, message: response.message };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Confirm email error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao confirmar email' 
      };
    }
  };

  const googleRegister = async (googleData) => {
    try {
      const response = await authService.googleRegister(googleData);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Google register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao criar conta' 
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updated = await authService.updateProfile(profileData);
      setPerfil(updated);
      return { success: true, data: updated };
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao atualizar perfil' 
      };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setPerfil(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    perfil,
    loading,
    isAuthenticated,
    login,
    googleLogin,
    register,
    completeProfile,
    confirmEmail,
    googleRegister,
    updateProfile,
    logout,
    isAdmin: user?.role === 'administrador' || user?.is_superuser,
    isProdutor: user?.role === 'produtor',
    isVeterinario: user?.role === 'veterinario',
    isFuncionario: user?.role === 'funcionario',
    isGestorFinanceiro: user?.role === 'gestor_financeiro',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;