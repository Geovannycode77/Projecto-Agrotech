import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Exporta o contexto separadamente
export const AuthContext = createContext();

// Exporta o Provider como componente
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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
        
        // REMOVA COMPLETAMENTE ESTE BLOCO
        // Verificar se o usuário precisa definir senha
        // (usuário do Google sem senha definida)
        // const needsPassword = userData.needs_password === true;
        // if (needsPassword && window.location.pathname !== '/set-password') {
        //   window.location.href = '/set-password';
        // }
        
      } catch (error) {
        localStorage.clear();
        setUser(null);
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
      return { success: true, user: data.user };
    } catch (error) {
      if (error.response?.data?.requires_confirmation) {
        return { 
          success: false, 
          requires_confirmation: true,
          error: error.response?.data?.error 
        };
      }
let errorMsg = error.response?.data?.error || error.response?.data?.detail || (error.response?.data?.non_field_errors ? error.response.data.non_field_errors[0] : null) || (error.response?.data?.errors && Object.values(error.response.data.errors)[0] ? Object.values(error.response.data.errors)[0][0] : null) || 'Erro ao fazer login';
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
let errorMsg = error.response?.data?.error || error.response?.data?.detail || (error.response?.data?.non_field_errors ? error.response.data.non_field_errors[0] : null) || (error.response?.data?.errors && Object.values(error.response.data.errors)[0] ? Object.values(error.response.data.errors)[0][0] : null) || 'Erro ao fazer login com Google';
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
let errorMsg = errors?.error || errors?.detail || (errors?.non_field_errors ? errors.non_field_errors[0] : null) || (errors?.errors && Object.values(errors.errors)[0] ? Object.values(errors.errors)[0][0] : null) || 'Erro ao registrar';
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

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    googleLogin,
    register,
    completeProfile,
    confirmEmail,
    googleRegister,
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