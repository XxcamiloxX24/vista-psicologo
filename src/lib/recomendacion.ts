import { authFetch } from './auth';
import { API_BASE_URL } from './config';

const BASE = `${API_BASE_URL}/api/Recomendacion`;

export interface RecomendacionItem {
  recCodigo: number;
  recSeguimientoFk: number;
  recTitulo: string;
  recDescripcion: string | null;
  recFechaVencimiento: string | null;
  recEstado: string | null;
  recFechaCreacion: string | null;
  recFechaActualizacion: string | null;
}

export interface CrearRecomendacionPayload {
  recSeguimientoFk: number;
  recTitulo: string;
  recDescripcion?: string | null;
  recEstado?: string | null;
}

export interface ActualizarRecomendacionPayload {
  recTitulo?: string;
  recDescripcion?: string | null;
  recEstado?: string | null;
}

/** Lista recomendaciones activas de un seguimiento */
export async function listarPorSeguimiento(seguimientoId: number): Promise<RecomendacionItem[]> {
  const res = await authFetch(`${BASE}/por-seguimiento/${seguimientoId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = (err as { message?: string })?.message ?? 'Error al listar recomendaciones.';
    throw new Error(message);
  }
  return res.json();
}

/** Obtiene una recomendación por ID */
export async function obtenerPorId(id: number): Promise<RecomendacionItem> {
  const res = await authFetch(`${BASE}/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('No se encontró la recomendación.');
    const err = await res.json().catch(() => ({}));
    const message = (err as { message?: string })?.message ?? 'Error al obtener la recomendación.';
    throw new Error(message);
  }
  return res.json();
}

/** Crea una nueva recomendación */
export async function crear(payload: CrearRecomendacionPayload): Promise<void> {
  const res = await authFetch(`${BASE}`, {
    method: 'POST',
    body: JSON.stringify({
      recSeguimientoFk: payload.recSeguimientoFk,
      recTitulo: payload.recTitulo.trim(),
      recDescripcion: payload.recDescripcion?.trim() || null,
      recEstado: payload.recEstado || 'Pendiente',
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = (err as { message?: string })?.message ?? 'Error al crear la recomendación.';
    throw new Error(message);
  }
}

/** Actualiza una recomendación existente */
export async function actualizar(id: number, payload: ActualizarRecomendacionPayload): Promise<void> {
  const res = await authFetch(`${BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      recTitulo: payload.recTitulo?.trim() ?? undefined,
      recDescripcion: payload.recDescripcion?.trim() ?? null,
      recEstado: payload.recEstado ?? undefined,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = (err as { message?: string })?.message ?? 'Error al actualizar la recomendación.';
    throw new Error(message);
  }
}

/** Elimina (soft delete) una recomendación */
export async function eliminar(id: number): Promise<void> {
  const res = await authFetch(`${BASE}/eliminar/${id}`, {
    method: 'PUT',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = (err as { message?: string })?.message ?? 'Error al eliminar la recomendación.';
    throw new Error(message);
  }
}

/** Devuelve los estados válidos para el campo estado */
export function getEstados(): string[] {
  return ['Pendiente', 'En Progreso', 'Completada'];
}
