// AuthContext.jsx - Versão corrigida com expiração de token

import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Verificar se o token expirou
  const isTokenExpired = () => {
    const tokenExpiry = localStorage.getItem("token_expiry");
    if (!tokenExpiry) return true;
    return new Date().getTime() > parseInt(tokenExpiry);
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");

    // Se não tem token, já pode marcar como não autenticado
    if (!token) {
      clearAuthData();
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    // Verificar se o token expirou
    if (isTokenExpired()) {
      console.log("⏰ Token expirado, limpando...");
      clearAuthData();
      setLoading(false);
      setIsAuthenticated(false);

      // Redirecionar para login se não estiver já lá
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register" &&
        !window.location.pathname.includes("/confirm-email")
      ) {
        window.location.href = "/login";
      }
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      console.log("✅ User carregado:", userData);
      setUser(userData);
      setIsAuthenticated(true);

      // Carregar perfil do usuário
      try {
        console.log("🔄 Carregando perfil...");
        const perfilData = await authService.getProfile();
        console.log("✅ Perfil carregado:", perfilData);
        setPerfil(perfilData);
      } catch (error) {
        console.error(
          "❌ Erro ao carregar perfil:",
          error.response?.data || error.message,
        );
      }
    } catch (error) {
      console.error("❌ Token inválido ou expirado:", error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expiry");
    setUser(null);
    setPerfil(null);
    setIsAuthenticated(false);
  };

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      console.log("✅ Login realizado, user:", data.user);

      // Salvar token com expiração (exemplo: 8 horas)
      const expiryTime = new Date().getTime() + 8 * 60 * 60 * 1000; // 8 horas
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("token_expiry", expiryTime.toString());
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setIsAuthenticated(true);

      try {
        console.log("🔄 Carregando perfil após login...");
        const perfilData = await authService.getProfile();
        console.log("✅ Perfil carregado após login:", perfilData);
        setPerfil(perfilData);
      } catch (error) {
        console.error(
          "❌ Erro ao carregar perfil após login:",
          error.response?.data || error.message,
        );
      }

      return { success: true, user: data.user };
    } catch (error) {
      if (error.response?.data?.requires_confirmation) {
        return {
          success: false,
          requires_confirmation: true,
          error: error.response?.data?.error,
        };
      }

      let errorMsg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        (error.response?.data?.non_field_errors
          ? error.response.data.non_field_errors[0]
          : null) ||
        (error.response?.data?.errors &&
        Object.values(error.response.data.errors)[0]
          ? Object.values(error.response.data.errors)[0][0]
          : null) ||
        "Erro ao fazer login";
      console.error("Login error details:", error.response?.data);
      return { success: false, error: errorMsg };
    }
  };

  const refreshProfile = async () => {
    try {
      const perfilData = await authService.getProfile();
      console.log("✅ Perfil atualizado:", perfilData);
      setPerfil(perfilData);
      return perfilData;
    } catch (error) {
      console.error("❌ Erro ao atualizar perfil:", error);
      return null;
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await authService.googleLogin({ credential });

      if (response.access) {
        // Salvar token com expiração (8 horas)
        const expiryTime = new Date().getTime() + 8 * 60 * 60 * 1000;
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
        localStorage.setItem("token_expiry", expiryTime.toString());
        localStorage.setItem("user", JSON.stringify(response.user));

        setUser(response.user);
        setIsAuthenticated(true);

        try {
          const perfilData = await authService.getProfile();
          setPerfil(perfilData);
        } catch (error) {
          console.error("Erro ao carregar perfil:", error);
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
          error: response.error,
        };
      }

      if (response.requires_confirmation) {
        return {
          success: false,
          requires_confirmation: true,
          email: response.email,
          error: response.error || "Email não confirmado",
        };
      }

      return {
        success: false,
        error: response.error || "Erro ao autenticar com Google",
      };
    } catch (error) {
      console.error("Google login error:", error);

      let errorMsg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        (error.response?.data?.non_field_errors
          ? error.response.data.non_field_errors[0]
          : null) ||
        (error.response?.data?.errors &&
        Object.values(error.response.data.errors)[0]
          ? Object.values(error.response.data.errors)[0][0]
          : null) ||
        "Erro ao fazer login com Google";
      console.error("Google login error details:", error.response?.data);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      return { success: true, message: data.message };
    } catch (error) {
      const errors = error.response?.data;
      let errorMsg =
        errors?.error ||
        errors?.detail ||
        (errors?.non_field_errors ? errors.non_field_errors[0] : null) ||
        (errors?.errors && Object.values(errors.errors)[0]
          ? Object.values(errors.errors)[0][0]
          : null) ||
        "Erro ao registrar";
      console.error("Register error details:", errors);
      return {
        success: false,
        error: errorMsg,
        errors: errors,
      };
    }
  };

  const completeProfile = async (data) => {
    try {
      const response = await authService.completeProfile(data);

      if (response.success === false) {
        return { success: false, error: response.error };
      }

      // Se a resposta já inclui token (utilizador já existia e está confirmado)
      if (response.access) {
        const expiryTime = new Date().getTime() + 8 * 60 * 60 * 1000;
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
        localStorage.setItem("token_expiry", expiryTime.toString());
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);

        try {
          const perfilData = await authService.getProfile();
          setPerfil(perfilData);
        } catch (error) {
          console.error("Complete profile error:", error);
          console.error("Status:", error.response?.status);
          console.error("Detalhes:", error.response?.data);
          console.error("Detalhes JSON:", JSON.stringify(error.response?.data));
        }
        return {
          success: true,
          message: response.message || "Perfil atualizado com sucesso.",
        };
      }

      // Caso normal: novo utilizador criado, email de confirmação enviado
      // NÃO tenta carregar perfil — não há token ainda
      if (response.user) {
        setUser(response.user);
      }

      return {
        success: true,
        message:
          response.message || "Cadastro realizado! Verifique o seu email.",
      };
    } catch (error) {
      console.error("Complete profile error:", error);
      console.error("Detalhes:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "Erro ao completar perfil",
      };
    }
  };

  const confirmEmail = async (token) => {
    try {
      const response = await authService.confirmEmail(token);

      if (response.success) {
        if (response.access) {
          const expiryTime = new Date().getTime() + 8 * 60 * 60 * 1000;
          localStorage.setItem("access_token", response.access);
          localStorage.setItem("refresh_token", response.refresh);
          localStorage.setItem("token_expiry", expiryTime.toString());
          localStorage.setItem("user", JSON.stringify(response.user));
          setUser(response.user);
          setIsAuthenticated(true);

          try {
            const perfilData = await authService.getProfile();
            setPerfil(perfilData);
          } catch (error) {
            console.error("Erro ao carregar perfil:", error);
          }
        }
        return { success: true, message: response.message };
      }

      return { success: false, error: response.error };
    } catch (error) {
      console.error("Confirm email error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Erro ao confirmar email",
      };
    }
  };

  const googleRegister = async (googleData) => {
    try {
      const response = await authService.googleRegister(googleData);
      return { success: true, message: response.message };
    } catch (error) {
      console.error("Google register error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Erro ao criar conta",
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updated = await authService.updateProfile(profileData);
      setPerfil(updated);
      return { success: true, data: updated };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Erro ao atualizar perfil",
      };
    }
  };

  const logout = async () => {
    await authService.logout();
    clearAuthData();
    // Redirecionar para login
    window.location.href = "/login";
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
    refreshProfile,
    clearAuthData, // Adicionar esta função para uso externo se necessário
    isAdmin: user?.role === "administrador" || user?.is_superuser,
    isProdutor: user?.role === "produtor",
    isVeterinario: user?.role === "veterinario",
    isFuncionario: user?.role === "funcionario",
    isGestorFinanceiro: user?.role === "gestor_financeiro",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
