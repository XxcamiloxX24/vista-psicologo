import { getAuthHeaders, getToken, getPsychologistId as getStoredPsychologistId } from './auth';

import { API_BASE_URL } from './config';

export interface Psychologist {
  psiCodigo: number;
  psiDocumento: string;
  psiNombre: string;
  psiApellido: string;
  psiEspecialidad: string;
  psiTelefono: string;
  psiFechaRegistro: string;
  psiFechaNac: string;
  psiDireccion: string;
  psiCorreoInstitucional: string;
  psiCorreoPersonal: string;
  psiEstadoRegistro: string;
}

export interface PsychologistUpdate {
  psiDocumento?: string;
  psiNombre?: string;
  psiApellido?: string;
  psiEspecialidad?: string;
  psiTelefono?: string;
  psiFechaNac?: string;
  psiDireccion?: string;
  psiCorreoInstitucional?: string;
  psiCorreoPersonal?: string;
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return null;
  }
}

export function getPsychologistIdFromToken(): number | null {
  const token = getToken();
  if (!token) return null;
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  const raw =
    payload.nameid ??
    payload.sub ??
    payload.userId ??
    payload.psicologoId ??
    payload.psiCodigo;
  const id = typeof raw === 'number' ? raw : typeof raw === 'string' ? parseInt(raw, 10) : null;
  return id != null && !isNaN(id) ? id : null;
}

export async function getPsychologist(id?: number): Promise<Psychologist | null> {
  let psychologistId = id ?? getPsychologistIdFromToken() ?? getStoredPsychologistId();

  if (psychologistId == null) {
    const meResponse = await fetch(`${API_BASE_URL}/api/Psicologo/me`, {
      headers: getAuthHeaders(),
    });
    if (meResponse.ok) {
      const meData = await meResponse.json();
      const me = Array.isArray(meData) ? meData[0] : meData;
      return me ?? null;
    }
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/Psicologo/${psychologistId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const psychologist = Array.isArray(data) ? data[0] : data;
  return psychologist ?? null;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function updatePsychologist(
  id: number,
  data: PsychologistUpdate
): Promise<Psychologist | null> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/api/Psicologo/editar/${id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = (errorData as { message?: string })?.message || 'Error al actualizar el perfil.';
    throw new Error(message);
  }

  const text = await response.text();
  if (!text || text.trim() === '') {
    return null;
  }
  try {
    const result = JSON.parse(text);
    return Array.isArray(result) ? result[0] : result;
  } catch {
    return null;
  }
}

export function getDisplayName(psi: Psychologist | null): string {
  if (!psi) return 'Psicólogo';
  const fullName = [psi.psiNombre, psi.psiApellido].filter(Boolean).join(' ').trim();
  return fullName || 'Psicólogo';
}

export function getInitials(psi: Psychologist | null): string {
  if (!psi) return 'DR';
  const first = psi.psiNombre?.charAt(0) || '';
  const last = psi.psiApellido?.charAt(0) || psi.psiNombre?.charAt(1) || '';
  return (first + last).toUpperCase().slice(0, 2) || 'DR';
}
