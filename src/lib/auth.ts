import { API_BASE_URL } from './config';

const TOKEN_KEY = 'healthymind_token';
const REFRESH_KEY = 'healthymind_refresh_token';
const PSICOLOGO_ID_KEY = 'healthymind_psicologo_id';

export interface LoginCredentials {
  correoPersonal: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  data?: { token?: string; accessToken?: string; psicologoId?: number };
  psicologoId?: number;
  psiCodigo?: number;
}

function jwtExp(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let p = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = 4 - (p.length % 4);
    if (pad !== 4) p += '='.repeat(pad);
    const exp = JSON.parse(atob(p)).exp;
    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

/** true si el access JWT ya no sirve (caducado o a punto) */
export function isAccessExpired(token: string | null, skewSec = 35): boolean {
  if (!token) return true;
  const exp = jwtExp(token);
  if (exp == null) return true;
  return exp <= Math.floor(Date.now() / 1000) + skewSec;
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

function setRefreshToken(value: string): void {
  localStorage.setItem(REFRESH_KEY, value);
}

let refreshLock: Promise<boolean> | null = null;

function emitTokenRefreshed(): void {
  window.dispatchEvent(new Event('healthymind-token-refreshed'));
}

/**
 * Pide nuevos access + refresh al servidor. Devuelve false si no hay refresh o falla (y limpia sesión).
 */
export async function refreshSession(): Promise<boolean> {
  if (refreshLock) return refreshLock;

  refreshLock = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/Autenticacion/refrescar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) {
        removeToken();
        return false;
      }
      const data = (await res.json()) as LoginResponse;
      const access = data.accessToken ?? data.token;
      const nextRefresh = data.refreshToken;
      if (!access || !nextRefresh) {
        removeToken();
        return false;
      }
      localStorage.setItem(TOKEN_KEY, access);
      setRefreshToken(nextRefresh);
      emitTokenRefreshed();
      scheduleProactiveRefresh();
      return true;
    } catch {
      return false;
    } finally {
      refreshLock = null;
    }
  })();

  return refreshLock;
}

let proactiveTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleProactiveRefresh(): void {
  if (proactiveTimer) {
    clearTimeout(proactiveTimer);
    proactiveTimer = null;
  }
  if (!getRefreshToken()) return;
  const t = localStorage.getItem(TOKEN_KEY);
  if (!t) return;
  const exp = jwtExp(t);
  if (exp == null) return;
  const delayMs = Math.max((exp - Math.floor(Date.now() / 1000) - 90) * 1000, 8000);
  proactiveTimer = setTimeout(() => {
    proactiveTimer = null;
    void refreshSession().then((ok) => {
      if (ok) scheduleProactiveRefresh();
    });
  }, delayMs);
}

function clearProactiveRefresh(): void {
  if (proactiveTimer) {
    clearTimeout(proactiveTimer);
    proactiveTimer = null;
  }
}

/**
 * Al abrir la app: si el JWT caducó pero hay refresh, renueva sin pedir contraseña.
 */
export async function bootstrapSession(): Promise<void> {
  const access = localStorage.getItem(TOKEN_KEY);
  const refresh = getRefreshToken();

  if (access && !isAccessExpired(access, 45)) {
    if (getRefreshToken()) scheduleProactiveRefresh();
    return;
  }
  if (refresh) {
    const ok = await refreshSession();
    if (ok) return;
  }
  if (access && isAccessExpired(access, 0)) {
    removeToken();
  }
}

/**
 * Fetch con Bearer; ante 401 intenta refresh y repite una vez.
 * Con FormData no fuerza Content-Type.
 */
export async function authFetch(
  input: string | URL,
  init?: RequestInit
): Promise<Response> {
  const run = async () => {
    const headers = new Headers(init?.headers);
    const tok = localStorage.getItem(TOKEN_KEY);
    if (tok) headers.set('Authorization', `Bearer ${tok}`);
    const isForm = init?.body instanceof FormData;
    if (!isForm && init?.body != null && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return fetch(input, { ...init, headers });
  };

  let res = await run();
  if (res.status === 401) {
    const ok = await refreshSession();
    if (ok) res = await run();
  }
  return res;
}

export async function login(credentials: LoginCredentials): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/Autenticacion/ValidarPsicologo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      (errorData as { message?: string })?.message ||
      'Credenciales incorrectas. Intenta nuevamente.';
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

  const refresh = data.refreshToken;
  if (refresh) {
    setRefreshToken(refresh);
  }

  setToken(token);
  const psicologoId = data.psicologoId ?? data.psiCodigo ?? data.data?.psicologoId;
  if (typeof psicologoId === 'number') {
    localStorage.setItem(PSICOLOGO_ID_KEY, String(psicologoId));
  }
  scheduleProactiveRefresh();
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
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(PSICOLOGO_ID_KEY);
  clearProactiveRefresh();
}

export function getPsychologistId(): number | null {
  const id = localStorage.getItem(PSICOLOGO_ID_KEY);
  return id ? parseInt(id, 10) : null;
}

/** Tras bootstrapSession: hay JWT válido */
export function isAuthenticated(): boolean {
  const t = getToken();
  return !!t && !isAccessExpired(t, 60);
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export interface ChangePasswordPayload {
  passwordActual: string;
  passwordNueva: string;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/api/Psicologo/cambiar-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = (err as { message?: string })?.message ?? 'Error al cambiar la contraseña.';
    throw new Error(message);
  }
}
