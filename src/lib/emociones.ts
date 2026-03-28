import { authFetch } from './auth';
import { API_BASE_URL } from './config';

const BASE = `${API_BASE_URL}/api/Emociones`;

export interface Emocion {
  emoCodigo: number;
  emoNombre: string;
  emoEmoji: string | null;
  emoEscala: number;
  emoColorFondo: string | null;
  emoDescripcion: string | null;
  emoImage: string | null;
  emoEstadoRegistro: string;
  categoria: string;
}

export interface CategoriaEmocion {
  nombre: string;
  escalaMin: number;
  escalaMax: number;
  color: string;
}

export interface CrearEmocionPayload {
  emoNombre: string;
  emoEmoji?: string | null;
  emoEscala: number;
  emoColorFondo?: string | null;
  emoDescripcion?: string | null;
  emoImage?: string | null;
}

export type EditarEmocionPayload = Partial<CrearEmocionPayload>;

/* ── helpers de respuesta ── */

function normalizar(raw: Record<string, unknown>): Emocion {
  return {
    emoCodigo: Number(raw.emoCodigo ?? raw.EmoCodigo ?? 0),
    emoNombre: String(raw.emoNombre ?? raw.EmoNombre ?? ''),
    emoEmoji: (raw.emoEmoji ?? raw.EmoEmoji ?? null) as string | null,
    emoEscala: Number(raw.emoEscala ?? raw.EmoEscala ?? 5),
    emoColorFondo: (raw.emoColorFondo ?? raw.EmoColorFondo ?? null) as string | null,
    emoDescripcion: (raw.emoDescripcion ?? raw.EmoDescripcion ?? null) as string | null,
    emoImage: (raw.emoImage ?? raw.EmoImage ?? null) as string | null,
    emoEstadoRegistro: String(raw.emoEstadoRegistro ?? raw.EmoEstadoRegistro ?? 'activo'),
    categoria: String(raw.categoria ?? raw.Categoria ?? ''),
  };
}

/* ── CRUD ── */

export async function getEmociones(): Promise<Emocion[]> {
  const res = await authFetch(`${BASE}`);
  if (!res.ok) throw new Error('Error al obtener emociones');
  const data = await res.json();
  const list = Array.isArray(data) ? data : [];
  return list.map((e: Record<string, unknown>) => normalizar(e));
}

export async function getEmocionPorId(id: number): Promise<Emocion | null> {
  const res = await authFetch(`${BASE}/${id}`);
  if (!res.ok) return null;
  return normalizar(await res.json());
}

export async function crearEmocion(payload: CrearEmocionPayload): Promise<Emocion> {
  const res = await authFetch(`${BASE}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Error al crear emoción');
  }
  const json = await res.json();
  const datos = json.datos ?? json;
  return normalizar(datos as Record<string, unknown>);
}

export async function editarEmocion(id: number, payload: EditarEmocionPayload): Promise<Emocion> {
  const res = await authFetch(`${BASE}/editar/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Error al editar emoción');
  }
  return normalizar(await res.json());
}

export async function eliminarEmocion(id: number): Promise<void> {
  const res = await authFetch(`${BASE}/eliminar/${id}`, { method: 'PUT' });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Error al eliminar emoción');
  }
}

export async function getCategorias(): Promise<CategoriaEmocion[]> {
  const res = await authFetch(`${BASE}/categorias`);
  if (!res.ok) {
    return [
      { nombre: 'Critica', escalaMin: 1, escalaMax: 2, color: '#ef4444' },
      { nombre: 'Negativa', escalaMin: 3, escalaMax: 4, color: '#f97316' },
      { nombre: 'Neutral', escalaMin: 5, escalaMax: 6, color: '#eab308' },
      { nombre: 'Positiva', escalaMin: 7, escalaMax: 10, color: '#22c55e' },
    ];
  }
  return res.json();
}

/* ── Estadísticas emocionales (consumidas desde StudentProfile) ── */

export interface DiaEmocional {
  fecha: string;
  emocion: {
    emoCodigo: number;
    emoNombre: string;
    emoEmoji: string | null;
    emoEscala: number;
    emoColorFondo: string | null;
    categoria: string;
  } | null;
  promedioEscala: number;
  categoriaDia: string;
  totalPaginas: number;
}

export interface ResumenMensual {
  positivas: number;
  neutrales: number;
  negativas: number;
  criticas: number;
  promedioEscala: number;
  totalDias: number;
}

export interface EstadisticaMensualResponse {
  aprendizId: number;
  anio: number;
  mes: number;
  dias: DiaEmocional[];
  resumen: ResumenMensual;
}

export async function getEstadisticaEmocionalMensual(
  aprendizId: number,
  anio: number,
  mes: number,
): Promise<EstadisticaMensualResponse> {
  const url = `${API_BASE_URL}/api/PaginaDiario/estadistica/emociones-mensual?aprendizId=${aprendizId}&anio=${anio}&mes=${mes}`;
  const res = await authFetch(url);
  if (!res.ok) {
    return { aprendizId, anio, mes, dias: [], resumen: { positivas: 0, neutrales: 0, negativas: 0, criticas: 0, promedioEscala: 0, totalDias: 0 } };
  }
  return res.json();
}

export interface TendenciaItem {
  anio: number;
  mes: number;
  mesNombre: string;
  promedioEscala: number;
  totalRegistros: number;
  categoria: string;
}

export interface TendenciaResponse {
  aprendizId: number;
  mesesConsultados: number;
  tendencia: TendenciaItem[];
}

export async function getTendenciaEmocional(
  aprendizId: number,
  meses = 6,
): Promise<TendenciaResponse> {
  const url = `${API_BASE_URL}/api/PaginaDiario/estadistica/tendencia-emocional?aprendizId=${aprendizId}&meses=${meses}`;
  const res = await authFetch(url);
  if (!res.ok) {
    return { aprendizId, mesesConsultados: meses, tendencia: [] };
  }
  return res.json();
}

/* ── Utilidad: categoría local (para cuando no viene del server) ── */

export function categoriaDeEscala(escala: number): string {
  if (escala <= 2) return 'Critica';
  if (escala <= 4) return 'Negativa';
  if (escala <= 6) return 'Neutral';
  return 'Positiva';
}

export function colorDeCategoria(cat: string): string {
  switch (cat) {
    case 'Critica': return '#ef4444';
    case 'Negativa': return '#f97316';
    case 'Neutral': return '#eab308';
    case 'Positiva': return '#22c55e';
    default: return '#94a3b8';
  }
}
