import { authFetch, getToken } from './auth';

export const IMAGES_API_URL = (import.meta.env.VITE_IMAGES_API_URL ?? 'https://api-imagenes-healthymind.onrender.com').replace(
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
  if (Array.isArray(data)) return data as ImageItem[];
  const list = (data as { data?: unknown[]; images?: unknown[] }).data ?? (data as { images?: unknown[] }).images;
  return Array.isArray(list) ? (list as ImageItem[]) : [];
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
 * Sube una imagen de firma (context=firma).
 * @param file - Archivo de imagen (p. ej. desde canvas.toBlob)
 * @returns URL de la imagen subida
 * @throws Error si falla la subida
 */
export async function uploadSignatureImage(file: File): Promise<string> {
  if (!getToken()) throw new Error('Debes iniciar sesión');
  const formData = new FormData();
  formData.append('image', file);
  formData.append('context', 'firma');

  const res = await authFetch(`${IMAGES_API_URL}/api/images/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Error al subir la firma');
  }
  const data = (await res.json()) as { url?: string; secureUrl?: string };
  const url = (data?.secureUrl ?? data?.url ?? '').trim();
  if (!url || !url.startsWith('http')) {
    throw new Error('La API no devolvió una URL válida de la imagen');
  }
  return url;
}

/**
 * Obtiene la URL para cargar una imagen vía proxy (evita CORS/hotlink de Cloudinary).
 * Usar con fetch + blob para visualizar en <img>.
 */
export function getImageProxyUrl(id: string): string {
  return `${IMAGES_API_URL}/api/images/${id}/proxy`;
}

/**
 * Obtiene una imagen como blob URL usando el proxy (requiere auth).
 * El caller debe revocar la URL con URL.revokeObjectURL cuando ya no la necesite.
 */
export async function fetchImageAsBlobUrl(id: string): Promise<string> {
  const res = await authFetch(getImageProxyUrl(id));
  if (!res.ok) throw new Error('No se pudo cargar la imagen');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
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
