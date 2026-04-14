import { authFetch } from './auth';
import { API_BASE_URL } from './config';

const BASE = `${API_BASE_URL}/api/AlertaRachaEmocional`;

export interface AlertaRachaEmocionalItem {
  areCodigo: number;
  areAprendizFk: number;
  arePsicologoFk: number;
  areSeguimientoFk: number | null;
  areFechaReciente: string;
  areRegla: 'CATEGORIA_NEG_CRIT' | 'ESCALA_LE_5' | 'AMBAS';
  areFechasJson: string;
  areEscalasJson: string | null;
  areMensaje: string | null;
  areEstado: 'nueva' | 'leida' | 'resuelta';
  areFechaCreacion: string;
  areFechaLectura: string | null;
  areFechaResolucion: string | null;
  areNotasResolucion: string | null;
  aprendiz: {
    aprCodigo: number;
    aprNombre: string;
    aprApellido: string;
    aprCorreoInstitucional: string | null;
  } | null;
}

function normalizar(raw: Record<string, unknown>): AlertaRachaEmocionalItem {
  return {
    areCodigo: Number(raw.areCodigo ?? 0),
    areAprendizFk: Number(raw.areAprendizFk ?? 0),
    arePsicologoFk: Number(raw.arePsicologoFk ?? 0),
    areSeguimientoFk: raw.areSeguimientoFk != null ? Number(raw.areSeguimientoFk) : null,
    areFechaReciente: String(raw.areFechaReciente ?? ''),
    areRegla: (raw.areRegla ?? 'AMBAS') as AlertaRachaEmocionalItem['areRegla'],
    areFechasJson: String(raw.areFechasJson ?? '[]'),
    areEscalasJson: raw.areEscalasJson != null ? String(raw.areEscalasJson) : null,
    areMensaje: raw.areMensaje != null ? String(raw.areMensaje) : null,
    areEstado: (raw.areEstado ?? 'nueva') as AlertaRachaEmocionalItem['areEstado'],
    areFechaCreacion: String(raw.areFechaCreacion ?? ''),
    areFechaLectura: raw.areFechaLectura != null ? String(raw.areFechaLectura) : null,
    areFechaResolucion: raw.areFechaResolucion != null ? String(raw.areFechaResolucion) : null,
    areNotasResolucion: raw.areNotasResolucion != null ? String(raw.areNotasResolucion) : null,
    aprendiz: raw.aprendiz as AlertaRachaEmocionalItem['aprendiz'] ?? null,
  };
}

export async function getMisAlertas(): Promise<AlertaRachaEmocionalItem[]> {
  const res = await authFetch(`${BASE}/mis-alertas`);
  if (!res.ok) throw new Error('Error al obtener alertas');
  const data = await res.json();
  return Array.isArray(data) ? data.map((r: Record<string, unknown>) => normalizar(r)) : [];
}

export async function getAlertasPorAprendiz(aprendizId: number): Promise<AlertaRachaEmocionalItem[]> {
  const res = await authFetch(`${BASE}/por-aprendiz/${aprendizId}`);
  if (!res.ok) throw new Error('Error al obtener alertas del aprendiz');
  const data = await res.json();
  return Array.isArray(data) ? data.map((r: Record<string, unknown>) => normalizar(r)) : [];
}

export async function marcarLeida(id: number): Promise<AlertaRachaEmocionalItem> {
  const res = await authFetch(`${BASE}/marcar-leida/${id}`, { method: 'PUT' });
  if (!res.ok) throw new Error('Error al marcar alerta como leída');
  const json = await res.json();
  return normalizar((json.alerta ?? json) as Record<string, unknown>);
}

export async function marcarResuelta(id: number, notas?: string): Promise<AlertaRachaEmocionalItem> {
  const res = await authFetch(`${BASE}/marcar-resuelta/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ notas: notas || null }),
  });
  if (!res.ok) throw new Error('Error al marcar alerta como resuelta');
  const json = await res.json();
  return normalizar((json.alerta ?? json) as Record<string, unknown>);
}

export function parseFechasJson(json: string): string[] {
  try { return JSON.parse(json); } catch { return []; }
}

export function parseEscalasJson(json: string | null): number[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}

export function etiquetaRegla(regla: string): string {
  switch (regla) {
    case 'CATEGORIA_NEG_CRIT': return 'Categoría negativa/crítica';
    case 'ESCALA_LE_5': return 'Escala promedio ≤ 5';
    case 'AMBAS': return 'Categoría negativa/crítica y escala ≤ 5';
    default: return regla;
  }
}
