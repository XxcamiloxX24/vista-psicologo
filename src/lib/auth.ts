const BASE_URL = 'http://healthymind10.runasp.net';
const TOKEN_KEY = 'healthymind_token';
const PSICOLOGO_ID_KEY = 'healthymind_psicologo_id';

export interface LoginCredentials {
  correoPersonal: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  data?: { token?: string; accessToken?: string; psicologoId?: number };
  psicologoId?: number;
  psiCodigo?: number;
}

export async function login(credentials: LoginCredentials): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/Autenticacion/ValidarPsicologo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = (errorData as { message?: string })?.message || 'Credenciales incorrectas. Intenta nuevamente.';
    throw new Error(message);
  }

  const data: LoginResponse = await response.json();

  const token =
    data.token ??
    data.accessToken ??
    data.data?.token ??
    data.data?.accessToken;

  if (!token) {
    throw new Error('No se recibió el token del servidor.');
  }

  setToken(token);
  const psicologoId = data.psicologoId ?? data.psiCodigo ?? data.data?.psicologoId;
  if (typeof psicologoId === 'number') {
    localStorage.setItem(PSICOLOGO_ID_KEY, String(psicologoId));
  }
  return token;
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PSICOLOGO_ID_KEY);
}

export function getPsychologistId(): number | null {
  const id = localStorage.getItem(PSICOLOGO_ID_KEY);
  return id ? parseInt(id, 10) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}
