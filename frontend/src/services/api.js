const BASE_URL = "http://127.0.0.1:8000";

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

export async function forgotPassword(email) {
  return fetch("/api/auth/forgot-password/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token, password) {
  return fetch(`/api/auth/reset-password/${token}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
}

export async function confirmEmail(token) {
  return fetch(`/api/auth/confirm-email/${token}/`, { method: "POST" });
}
