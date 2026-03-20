import { authFetch } from './auth';
import { API_BASE_URL } from './config';

/**
 * Estas interfaces contemplan tanto camelCase (serialización a JSON)
 * como PascalCase (por si algún endpoint serializa sin policy de camelCase).
 */
export type MisFichaRaw = {
  // camelCase
  ficCodigo?: number;
  ficJornada?: string | null;
  ficFechaInicio?: string | null;
  ficFechaFin?: string | null;
  ficEstadoFormacion?: string | null;
  programaFormacion?: {
    progCodigo?: number | null;
    progNombre?: string | null;
    progModalidad?: string | null;
    progFormaModalidad?: string | null;
    area?: { areaNombre?: string | null } | null;
    centro?: {
      cenNombre?: string | null;
      regional?: { regNombre?: string | null } | null;
    } | null;
    [k: string]: unknown;
  } | null;

  // PascalCase fallback
  FicCodigo?: number;
  FicJornada?: string | null;
  FicFechaInicio?: string | null;
  FicFechaFin?: string | null;
  FicEstadoFormacion?: string | null;
  ProgramaFormacion?: {
    ProgCodigo?: number | null;
    ProgNombre?: string | null;
    ProgModalidad?: string | null;
    ProgFormaModalidad?: string | null;
    Area?: { AreaNombre?: string | null } | null;
    Centro?: {
      CenNombre?: string | null;
      Regional?: { RegNombre?: string | null } | null;
    } | null;
    [k: string]: unknown;
  } | null;

  [k: string]: unknown;
};

export type AprendizFichaRaw = {
  // camelCase
  codigo?: number;
  aprendiz?: {
    codigo?: number;
    fechaCreacion?: string | null;
    nroDocumento?: string | number | null;
    nombres?: { primerNombre?: string | null; segundoNombre?: string | null } | null;
    apellidos?: { primerApellido?: string | null; segundoApellido?: string | null } | null;
    contacto?: {
      telefono?: string | null;
      correoInstitucional?: string | null;
      correoPersonal?: string | null;
    } | null;
    [k: string]: unknown;
  } | null;
  ficha?: {
    ficCodigo?: number | null;
    ficJornada?: string | null;
    ficFechaInicio?: string | null;
    ficFechaFin?: string | null;
    ficEstadoFormacion?: string | null;
    programaFormacion?: {
      progNombre?: string | null;
      area?: { areaNombre?: string | null } | null;
      [k: string]: unknown;
    } | null;
    ProgramaFormacion?: unknown;
    [k: string]: unknown;
  } | null;

  // PascalCase fallback
  Codigo?: number;
  Aprendiz?: {
    Codigo?: number;
    FechaCreacion?: string | null;
    NroDocumento?: string | number | null;
    Nombres?: { PrimerNombre?: string | null; SegundoNombre?: string | null } | null;
    Apellidos?: { PrimerApellido?: string | null; SegundoApellido?: string | null } | null;
    Contacto?: {
      Telefono?: string | null;
      CorreoInstitucional?: string | null;
      CorreoPersonal?: string | null;
    } | null;
    [k: string]: unknown;
  } | null;
  Ficha?: {
    FicCodigo?: number | null;
    FicJornada?: string | null;
    FicFechaInicio?: string | null;
    FicFechaFin?: string | null;
    FicEstadoFormacion?: string | null;
    programaFormacion?: {
      ProgNombre?: string | null;
      Area?: { AreaNombre?: string | null } | null;
      [k: string]: unknown;
    } | null;
    ProgramaFormacion?: {
      ProgNombre?: string | null;
      Area?: { AreaNombre?: string | null } | null;
      [k: string]: unknown;
    } | null;
    [k: string]: unknown;
  } | null;

  [k: string]: unknown;
};

export async function getMisFichas(): Promise<MisFichaRaw[]> {
  const response = await authFetch(`${API_BASE_URL}/api/Ficha/mis-fichas`);
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error('Error al obtener las fichas del psicólogo');
  }
  const data = (await response.json()) as MisFichaRaw[];
  return Array.isArray(data) ? data : [];
}

export async function getAprendicesPorFicha(fichaCodigo: number): Promise<AprendizFichaRaw[]> {
  const response = await authFetch(
    `${API_BASE_URL}/api/AprendizFicha/buscar?FichaCodigo=${encodeURIComponent(String(fichaCodigo))}`,
  );
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error('Error al obtener aprendices por ficha');
  }
  const data = (await response.json()) as AprendizFichaRaw[];
  return Array.isArray(data) ? data : [];
}

export async function getAprendizFichaPorDocumento(documento: string): Promise<AprendizFichaRaw[]> {
  const response = await authFetch(
    `${API_BASE_URL}/api/AprendizFicha/buscar?AprendizDocumento=${encodeURIComponent(documento)}`,
  );
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error('Error al obtener vínculos aprendiz-ficha');
  }
  const data = (await response.json()) as AprendizFichaRaw[];
  return Array.isArray(data) ? data : [];
}

