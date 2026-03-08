const BASE_URL = "http://127.0.0.1:8000";

// Função auxiliar para obter o token
export function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Verificar se o usuário está autenticado
export function isAuthenticated() {
  const token = getAuthToken();
  return !!token;
}

// Registro de usuário
export async function registerUser(formData) {
  const res = await fetch(`${BASE_URL}/api/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Login
export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/api/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await res.json();
  return res.json(); // espera token JWT
}

// Esqueceu a senha
export async function forgotPassword(email) {
  const res = await fetch(`${BASE_URL}/api/forgot-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Resetar senha com token
export async function resetPassword(token, password) {
  const res = await fetch(`${BASE_URL}/api/reset-password/${token}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Confirmar email
export async function confirmEmail(token) {
  const res = await fetch(`${BASE_URL}/api/confirm-email/${token}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Logout (apenas remove o token local)
export function logoutUser() {
  localStorage.removeItem("authToken");
}
