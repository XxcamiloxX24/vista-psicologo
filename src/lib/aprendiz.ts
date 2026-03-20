import { authFetch } from './auth';

import { API_BASE_URL } from './config';

export interface TotalAprendicesResponse {
  totalAprendices: number;
}

export type AprendizBusquedaRaw = {
  codigo?: number;
  Codigo?: number;
  tipoDocumento?: string | null;
  TipoDocumento?: string | null;
  nroDocumento?: string | null;
  NroDocumento?: string | null;
  nombres?: { primerNombre?: string | null; segundoNombre?: string | null } | null;
  Nombres?: { PrimerNombre?: string | null; SegundoNombre?: string | null } | null;
  apellidos?: { primerApellido?: string | null; segundoApellido?: string | null } | null;
  Apellidos?: { PrimerApellido?: string | null; SegundoApellido?: string | null } | null;
  contacto?: {
    telefono?: string | null;
    correoInstitucional?: string | null;
    correoPersonal?: string | null;
  } | null;
  Contacto?: {
    Telefono?: string | null;
    CorreoInstitucional?: string | null;
    CorreoPersonal?: string | null;
  } | null;
  [k: string]: unknown;
};

function getStr(obj: Record<string, unknown> | null | undefined, ...keys: string[]): string {
  if (!obj) return '';
  for (const k of keys) {
    const v = obj[k];
    if (v != null && typeof v === 'string') return v;
  }
  return '';
}

export function normalizarAprendizBusqueda(raw: AprendizBusquedaRaw) {
  const nombres = (raw.nombres ?? raw.Nombres) as Record<string, unknown> | null | undefined;
  const apellidos = (raw.apellidos ?? raw.Apellidos) as Record<string, unknown> | null | undefined;
  const contacto = (raw.contacto ?? raw.Contacto) as Record<string, unknown> | null | undefined;
  const primerNombre = getStr(nombres, 'primerNombre', 'PrimerNombre');
  const segundoNombre = getStr(nombres, 'segundoNombre', 'SegundoNombre');
  const primerApellido = getStr(apellidos, 'primerApellido', 'PrimerApellido');
  const segundoApellido = getStr(apellidos, 'segundoApellido', 'SegundoApellido');
  const fullName = [primerNombre, segundoNombre, primerApellido, segundoApellido]
    .filter(Boolean)
    .join(' ');
  const email =
    getStr(contacto, 'correoInstitucional', 'CorreoInstitucional') ||
    getStr(contacto, 'correoPersonal', 'CorreoPersonal');
  return {
    codigo: raw.codigo ?? raw.Codigo ?? 0,
    nroDocumento: String(raw.nroDocumento ?? raw.NroDocumento ?? ''),
    fullName,
    email,
  };
}

export async function buscarAprendicesDinamico(texto: string): Promise<AprendizBusquedaRaw[]> {
  const response = await authFetch(
    `${API_BASE_URL}/api/Aprendiz/busqueda-dinamica?texto=${encodeURIComponent(texto)}`,
  );
  if (!response.ok) {
    if (response.status === 404 || response.status === 400) return [];
    throw new Error('Error al buscar aprendices');
  }
  const data = (await response.json()) as AprendizBusquedaRaw[];
  return Array.isArray(data) ? data : [];
}

export async function getTotalAprendices(): Promise<number> {
  const response = await authFetch(`${API_BASE_URL}/api/Aprendiz/estadistica/total-registrados`);

  if (!response.ok) {
    throw new Error('Error al obtener el total de aprendices');
  }

  const data: TotalAprendicesResponse = await response.json();
  return data.totalAprendices ?? 0;
}
