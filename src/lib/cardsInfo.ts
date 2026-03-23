import { authFetch } from './auth';
import { API_BASE_URL } from './config';

export interface CardInfo {
  carCodigo?: number | null;
  carTitulo?: string | null;
  carDescripcion?: string | null;
  carImagenUrl?: string | null;
  carLink?: string | null;
  carEstadoRegistro?: string | null;
}

export interface CardsInfoPaginadoResponse {
  paginaActual: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  resultados: CardInfo[];
}

export async function listarCardsPaginado(
  pagina = 1,
  tamanoPagina = 12
): Promise<CardsInfoPaginadoResponse> {
  const url = new URL(`${API_BASE_URL}/api/CardsInfo/paginado`);
  url.searchParams.set('Pagina', String(pagina));
  url.searchParams.set('TamanoPagina', String(tamanoPagina));
  const response = await authFetch(url.toString());
  if (!response.ok) throw new Error('Error al listar tarjetas informativas');
  return response.json();
}

export async function buscarCardsDinamico(texto: string): Promise<CardInfo[]> {
  if (!texto || texto.trim().length < 3) return [];
  const response = await authFetch(
    `${API_BASE_URL}/api/CardsInfo/busqueda-dinamica?texto=${encodeURIComponent(texto.trim())}`
  );
  if (!response.ok) {
    if (response.status === 400 || response.status === 404) return [];
    throw new Error('Error al buscar');
  }
  const data = (await response.json()) as CardInfo[];
  return Array.isArray(data) ? data : [];
}

export async function obtenerCardPorId(id: number): Promise<CardInfo | null> {
  const response = await authFetch(`${API_BASE_URL}/api/CardsInfo/${id}`);
  if (!response.ok) return null;
  return response.json();
}

/** Alterna el estado (activo ↔ inactivo) de una card. No requiere body. */
export async function cambiarEstadoCard(id: number): Promise<CardInfo> {
  const response = await authFetch(`${API_BASE_URL}/api/CardsInfo/estado/${id}`, {
    method: 'PUT',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string })?.message ?? 'Error al cambiar estado');
  }
  const data = await response.json();
  return (data as { regObtenido?: CardInfo }).regObtenido ?? data;
}

export async function crearCard(card: Omit<CardInfo, 'carCodigo'>): Promise<CardInfo> {
  const response = await authFetch(`${API_BASE_URL}/api/CardsInfo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      carTitulo: card.carTitulo ?? '',
      carDescripcion: card.carDescripcion ?? '',
      carImagenUrl: card.carImagenUrl ?? null,
      carLink: card.carLink ?? null,
      carEstadoRegistro: card.carEstadoRegistro ?? 'activo',
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string })?.message ?? 'Error al crear tarjeta');
  }
  return response.json();
}

export async function editarCard(id: number, card: CardInfo): Promise<CardInfo> {
  const response = await authFetch(`${API_BASE_URL}/api/CardsInfo/editar/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      carTitulo: card.carTitulo ?? '',
      carDescripcion: card.carDescripcion ?? '',
      carImagenUrl: card.carImagenUrl ?? null,
      carLink: card.carLink ?? null,
      carEstadoRegistro: card.carEstadoRegistro ?? 'activo',
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string })?.message ?? 'Error al editar tarjeta');
  }
  const data = await response.json();
  return (data as { regObtenido?: CardInfo }).regObtenido ?? data;
}

export async function eliminarCard(id: number): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/api/CardsInfo/eliminar/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string })?.message ?? 'Error al eliminar tarjeta');
  }
}
