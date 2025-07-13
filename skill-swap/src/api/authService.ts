const API_BASE_URL = "http://localhost:5209"; // Change if your backend runs on a different port

export interface AuthRequest {
  email: string;
  password: string;
}

export async function register(request: AuthRequest) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  return await response.json();
}

export async function login(request: AuthRequest) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  return await response.json();
}

export async function getUser(token: string) {
  const response = await fetch(`${API_BASE_URL}/auth/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
}
