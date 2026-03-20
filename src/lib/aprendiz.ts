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

export function normalizarAprendizBusqueda(raw: AprendizBusquedaRaw) {
  const nombres = raw.nombres ?? raw.Nombres;
  const apellidos = raw.apellidos ?? raw.Apellidos;
  const contacto = raw.contacto ?? raw.Contacto;
  const primerNombre = nombres?.primerNombre ?? nombres?.PrimerNombre ?? '';
  const segundoNombre = nombres?.segundoNombre ?? nombres?.SegundoNombre ?? '';
  const primerApellido = apellidos?.primerApellido ?? apellidos?.PrimerApellido ?? '';
  const segundoApellido = apellidos?.segundoApellido ?? apellidos?.SegundoApellido ?? '';
  const fullName = [primerNombre, segundoNombre, primerApellido, segundoApellido]
    .filter(Boolean)
    .join(' ');
  return {
    codigo: raw.codigo ?? raw.Codigo ?? 0,
    nroDocumento: String(raw.nroDocumento ?? raw.NroDocumento ?? ''),
    fullName,
    email:
      String(contacto?.correoInstitucional ?? contacto?.CorreoInstitucional ?? '') ||
      String(contacto?.correoPersonal ?? contacto?.CorreoPersonal ?? ''),
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
