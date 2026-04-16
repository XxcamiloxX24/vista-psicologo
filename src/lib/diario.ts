import { authFetch } from './auth';
import { API_BASE_URL } from './config';

const DIARIO_BASE = `${API_BASE_URL}/api/Diario`;
const PAGINA_BASE = `${API_BASE_URL}/api/PaginaDiario`;

/* ── Interfaces ── */

export interface DiarioResumen {
  diaCodigo: number;
  diaTitulo: string;
  diaFechaCreacion: string;
  totalPaginas: number;
  fechaUltimaEntrada: string | null;
}

export interface PaginaDiarioEmocion {
  emoCodigo: number;
  emoNombre: string;
  emoEmoji: string | null;
  emoEscala: number;
  emoColorFondo: string | null;
}

export interface PaginaDiarioItem {
  pagCodigo: number;
  pagTitulo: string;
  pagContenido: string;
  pagImagenUrl: string | null;
  pagFechaRealizacion: string;
  emociones: PaginaDiarioEmocion | null;
}

export interface PaginacionPorFechaResponse {
  diarioId: number;
  fechaCorrespondiente: string;
  totalRegistrosEnFecha: number;
  totalDiasConEntradas: number;
  indiceDia: number;
  fechaMasNuevaConEntradas: string | null;
  fechaMasAntiguaConEntradas: string | null;
  fechasConEntradas: string[];
  datos: PaginaDiarioItem[];
}

/* ── Funciones ── */

export async function getDiarioPorAprendiz(aprendizId: number): Promise<DiarioResumen | null> {
  const res = await authFetch(`${DIARIO_BASE}/por-aprendiz/${aprendizId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Error al obtener el diario del aprendiz.');
  return res.json();
}

export async function getPaginasPorFecha(
  diarioId: number,
  fecha?: string,
): Promise<PaginacionPorFechaResponse> {
  const params = new URLSearchParams({ diarioId: String(diarioId) });
  if (fecha) params.set('fecha', fecha);
  const res = await authFetch(`${PAGINA_BASE}/paginacion-por-fecha?${params}`);
  if (!res.ok) throw new Error('Error al obtener las páginas del diario.');
  return res.json();
}

/* ── Utilidades ── */

export function tieneActividadReciente(fechaUltimaEntrada: string | null, diasUmbral = 7): boolean {
  if (!fechaUltimaEntrada) return false;
  const ultima = new Date(fechaUltimaEntrada);
  const ahora = new Date();
  const diff = ahora.getTime() - ultima.getTime();
  return diff <= diasUmbral * 24 * 60 * 60 * 1000;
}

export function formatearHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatearFechaLarga(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
