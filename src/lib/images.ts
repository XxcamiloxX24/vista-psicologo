import { authFetch, getToken } from './auth';

const IMAGES_API_URL = (import.meta.env.VITE_IMAGES_API_URL ?? 'https://api-imagenes-healthymind.onrender.com').replace(
  /\/+$/,
  ''
);

export interface ImageItem {
  _id: string;
  secureUrl: string;
  url?: string;
  context?: string;
  createdAt?: string;
}

export interface ProfileImageResult {
  url: string | null;
  id: string | null;
}

/**
 * Lista imágenes del usuario autenticado.
 * @param context - 'perfil' | 'chat' | 'documento'
 * @param limit - máximo de resultados (por defecto 50)
 */
export async function listImages(context: string, limit = 50): Promise<ImageItem[]> {
  if (typeof window === 'undefined') return [];
  if (!getToken()) return [];

  const url = new URL(`${IMAGES_API_URL}/api/images`);
  url.searchParams.set('context', context);
  url.searchParams.set('limit', String(limit));

  const res = await authFetch(url.toString());

  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Obtiene la URL y el ID de la imagen de perfil (la más reciente con context=perfil).
 */
export async function getProfileImage(): Promise<ProfileImageResult> {
  const images = await listImages('perfil', 10);
  const first = images[0];
  return {
    url: first?.secureUrl ?? null,
    id: first?._id ?? null,
  };
}

/** @deprecated Usar getProfileImage() para tener también el id. */
export async function getProfileImageUrl(): Promise<string | null> {
  const { url } = await getProfileImage();
  return url;
}

/**
 * Sube una imagen de perfil.
 * @throws Error si falla la subida
 */
export async function uploadProfileImage(file: File): Promise<{ url: string; id: string }> {
  if (!getToken()) throw new Error('Debes iniciar sesión');
  const formData = new FormData();
  formData.append('image', file);
  formData.append('context', 'perfil');

  const res = await authFetch(`${IMAGES_API_URL}/api/images/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Error al subir la imagen');
  }
  const data = (await res.json()) as { url?: string; id?: string; secureUrl?: string };
  return {
    url: data.url ?? data.secureUrl ?? '',
    id: data.id ?? '',
  };
}

/**
 * Elimina una imagen por ID.
 * @throws Error si falla la eliminación
 */
export async function deleteImage(id: string): Promise<void> {
  if (!getToken()) throw new Error('Debes iniciar sesión');
  const res = await authFetch(`${IMAGES_API_URL}/api/images/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Error al eliminar la imagen');
  }
}
