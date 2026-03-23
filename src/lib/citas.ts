import { authFetch } from './auth';

import { API_BASE_URL } from './config';

export interface CitaPorDia {
  año: number;
  mes: number;
  dia: number;
  total_Citas: number;
}

export async function getCitasHoy(): Promise<number> {
  const response = await authFetch(`${API_BASE_URL}/api/Citas/estadistica/por-dia`);

  if (!response.ok) {
    throw new Error('Error al obtener las citas del día');
  }

  const data: CitaPorDia[] = await response.json();
  const today = new Date();
  const año = today.getFullYear();
  const mes = today.getMonth() + 1;
  const dia = today.getDate();

  const hoy = data.find((c) => c.año === año && c.mes === mes && c.dia === dia);
  return hoy?.total_Citas ?? 0;
}

/* --- API Citas/estadistica/comparacion-semanal --- */
export interface ComparacionSemanalDia {
  day: string;
  semanaActual: number;
  semanaAnterior: number;
}

export interface ComparacionSemanalResponse {
  psicologoCodigo: number;
  estadoCita: string;
  rangoSemanaActual: { inicio: string; fin: string };
  rangoSemanaAnterior: { inicio: string; fin: string };
  semanaActual: { total: number; dias: { dia: string; cantidad: number }[] };
  semanaAnterior: { total: number; dias: { dia: string; cantidad: number }[] };
}

const DIAS_LABEL: Record<string, string> = { Mie: 'Mié', Sab: 'Sáb' };

/** Cita devuelta por la API (mis-citas, buscar, listar-activas, etc.) */
export interface CitaApi {
  citCodigo: number;
  citTipoCita?: string | null;
  citFechaProgramada?: string | null; // "2026-03-20"
  citHoraInicio?: string | null;     // "09:00:00" o "09:00"
  citHoraFin?: string | null;
  citMotivo?: string | null;
  citAnotaciones?: string | null;
  citEstadoCita?: string | null;
  aprendizCita?: {
    aprFicCodigo?: number;
    aprendiz?: {
      nroDocumento?: string | number;
      nombres?: { primerNombre?: string; segundoNombre?: string };
      apellidos?: { primerApellido?: string; segundoApellido?: string };
      contacto?: { correoInstitucional?: string; correoPersonal?: string; telefono?: string };
    };
    ficha?: { ficCodigo?: number; ficNombre?: string };
  };
  psicologo?: { psiCodigo?: number; psiDocumento?: string; psiNombre?: string; psiApellido?: string };
}

/** Helpers para extraer datos de CitaApi */
export function getCitaFieldFromApi<T>(c: CitaApi, camel: string, pascal: string): T | undefined {
  const r = c as unknown as Record<string, unknown>;
  return (r[camel] ?? r[pascal]) as T | undefined;
}

export function getStudentNameFromCita(c: CitaApi): string {
  const apRaw = c.aprendizCita as Record<string, unknown> | undefined;
  const ap = apRaw?.aprendiz ?? apRaw?.Aprendiz;
  if (!ap || typeof ap !== 'object') return 'Aprendiz';
  const apObj = ap as Record<string, unknown>;
  const n = apObj.nombres ?? apObj.Nombres;
  const a = apObj.apellidos ?? apObj.Apellidos;
  if (!n || !a) return 'Aprendiz';
  const pn = (n as { primerNombre?: string }).primerNombre ?? (n as Record<string, string>).PrimerNombre ?? '';
  const sn = (n as { segundoNombre?: string }).segundoNombre ?? (n as Record<string, string>).SegundoNombre ?? '';
  const pa = (a as { primerApellido?: string }).primerApellido ?? (a as Record<string, string>).PrimerApellido ?? '';
  const sa = (a as { segundoApellido?: string }).segundoApellido ?? (a as Record<string, string>).SegundoApellido ?? '';
  return [pn, sn, pa, sa].filter(Boolean).join(' ') || 'Aprendiz';
}

export function getStudentEmailFromCita(c: CitaApi): string {
  const apRaw = c.aprendizCita as Record<string, unknown> | undefined;
  const ap = apRaw?.aprendiz ?? apRaw?.Aprendiz;
  if (!ap || typeof ap !== 'object') return '';
  const apObj = ap as Record<string, unknown>;
  const contact = apObj.contacto ?? apObj.Contacto;
  if (!contact || typeof contact !== 'object') return '';
  return (contact as { correoPersonal?: string }).correoPersonal
    ?? (contact as Record<string, string>).CorreoPersonal
    ?? (contact as { correoInstitucional?: string }).correoInstitucional
    ?? '';
}

export function getFichaFromCita(c: CitaApi): string {
  const f = c.aprendizCita?.ficha ?? (c.aprendizCita as Record<string, unknown>)?.Ficha;
  if (!f || typeof f !== 'object') return '';
  const code = (f as { ficCodigo?: number }).ficCodigo ?? (f as Record<string, number>).FicCodigo;
  return code != null ? String(code) : '';
}

export function getPsychologistNameFromCita(c: CitaApi): string {
  const p = c.psicologo ?? (c as unknown as Record<string, unknown>).Psicologo;
  if (!p || typeof p !== 'object') return '';
  const n = (p as { psiNombre?: string }).psiNombre ?? (p as Record<string, string>).PsiNombre ?? '';
  const a = (p as { psiApellido?: string }).psiApellido ?? (p as Record<string, string>).PsiApellido ?? '';
  return [n, a].filter(Boolean).join(' ') || '';
}

/** Código del aprendiz (AprCodigo) desde una cita. Necesario para createRoom. */
export function getApprenticeCodigoFromCita(c: CitaApi): number | undefined {
  const apRaw = c.aprendizCita as Record<string, unknown> | undefined;
  const ap = apRaw?.aprendiz ?? apRaw?.Aprendiz;
  if (!ap || typeof ap !== 'object') return undefined;
  const cod = (ap as { codigo?: number }).codigo ?? (ap as Record<string, number>).Codigo;
  return typeof cod === 'number' ? cod : undefined;
}

export interface CitasActivasResponse {
  paginaActual: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  resultados: CitaApi[];
}

/** Obtiene citas activas paginadas (filtra por psicólogo en el cliente si se pasa psicologoId) */
export async function listarCitasActivas(pagina = 1, tamanoPagina = 300): Promise<CitasActivasResponse> {
  const url = new URL(`${API_BASE_URL}/api/Citas/listar-activas`);
  url.searchParams.set('Pagina', String(pagina));
  url.searchParams.set('TamanoPagina', String(tamanoPagina));
  const response = await authFetch(url.toString());
  if (!response.ok) {
    if (response.status === 404) {
      return { paginaActual: 1, tamanoPagina, totalRegistros: 0, totalPaginas: 0, resultados: [] };
    }
    throw new Error('Error al listar citas');
  }
  return response.json();
}

/**
 * Obtiene citas del psicólogo para nuevo chat: cualquier estado excepto realizadas/completadas.
 * Endpoint: GET /api/Citas/citas-para-nuevo-chat
 */
export async function getCitasParaNuevoChat(): Promise<CitaApi[]> {
  const response = await authFetch(`${API_BASE_URL}/api/Citas/citas-para-nuevo-chat`);
  if (!response.ok) {
    if (response.status === 403) return [];
    throw new Error('Error al obtener citas para nuevo chat');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Obtiene las solicitudes pendientes del psicólogo (estudiantes que solicitaron cita y no se han programado).
 * Endpoint: GET /api/Citas/solicitudes-pendientes
 */
export async function getSolicitudesPendientes(): Promise<CitaApi[]> {
  const response = await authFetch(`${API_BASE_URL}/api/Citas/solicitudes-pendientes`);
  if (!response.ok) {
    if (response.status === 403) return [];
    throw new Error('Error al obtener solicitudes pendientes');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/** Normaliza hora HH:mm a HH:mm:ss para la API .NET (TimeOnly) */
function toTimeOnlyStr(h: string): string {
  if (!h || typeof h !== 'string') return '09:00:00';
  const trimmed = h.trim();
  if (/^\d{1,2}:\d{2}:\d{2}/.test(trimmed)) return trimmed;
  if (/^\d{1,2}:\d{2}/.test(trimmed)) return `${trimmed}:00`;
  return '09:00:00';
}

/**
 * Programa una solicitud pendiente (cambia estado a programada/reprogramada con fecha y hora).
 * PUT /api/Citas/editar-solicitudes/{id}
 */
export async function programarSolicitud(id: number, dto: {
  citFechaProgramada: string;
  citHoraInicio: string;
  citHoraFin: string;
  citTipoCita: string;
  citEstadoCita: string;
  citMotivo?: string;
}): Promise<void> {
  const body = {
    citFechaProgramada: dto.citFechaProgramada,
    citHoraInicio: toTimeOnlyStr(dto.citHoraInicio),
    citHoraFin: toTimeOnlyStr(dto.citHoraFin),
    citTipoCita: dto.citTipoCita,
    citEstadoCita: dto.citEstadoCita,
    citMotivo: dto.citMotivo ?? '',
    citAnotaciones: '',
  };
  const response = await authFetch(`${API_BASE_URL}/api/Citas/editar-solicitudes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    let msg = 'Error al programar la cita';
    try {
      const err = JSON.parse(text) as { message?: string; detail?: string };
      msg = err.message ?? err.detail ?? (text || msg);
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }
}

/**
 * Edita una cita existente (anotaciones, estado, etc.).
 * PUT /api/Citas/editar/{id}
 */
export async function editarCita(id: number, dto: {
  citFechaProgramada: string;
  citHoraInicio: string;
  citHoraFin: string;
  citTipoCita: string;
  citEstadoCita: string;
  citMotivo?: string;
  citAnotaciones?: string;
}): Promise<void> {
  const body = {
    citFechaProgramada: dto.citFechaProgramada,
    citHoraInicio: toTimeOnlyStr(dto.citHoraInicio),
    citHoraFin: toTimeOnlyStr(dto.citHoraFin),
    citTipoCita: dto.citTipoCita,
    citEstadoCita: dto.citEstadoCita,
    citMotivo: dto.citMotivo ?? '',
    citAnotaciones: dto.citAnotaciones ?? '',
  };
  const response = await authFetch(`${API_BASE_URL}/api/Citas/editar/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    let msg = 'Error al guardar los cambios';
    try {
      const err = JSON.parse(text) as { message?: string; detail?: string };
      msg = err.message ?? err.detail ?? (text || msg);
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }
}

/**
 * Rechaza/cancela una solicitud pendiente.
 * PUT /api/Citas/cancelar-cita/{id}
 */
export async function rechazarSolicitud(id: number): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/api/Citas/cancelar-cita/${id}`, {
    method: 'PUT',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Error al rechazar la solicitud');
  }
}

/**
 * Obtiene las citas del psicólogo autenticado en un rango de fechas.
 * Excluye citas pendientes. Endpoint: GET /api/Citas/agenda
 */
export async function getCitasAgenda(desde: string, hasta: string): Promise<CitaApi[]> {
  const url = new URL(`${API_BASE_URL}/api/Citas/agenda`);
  url.searchParams.set('desde', desde);
  url.searchParams.set('hasta', hasta);
  const response = await authFetch(url.toString());
  if (!response.ok) {
    if (response.status === 403) return [];
    if (response.status === 404) return [];
    throw new Error('Error al obtener la agenda de citas');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/** Busca citas por documento del psicólogo (filtro servidor) - alternativo para admin */
export async function buscarCitasPorPsicologo(psicologoDocumento: string): Promise<CitaApi[]> {
  const url = new URL(`${API_BASE_URL}/api/Citas/buscar`);
  url.searchParams.set('PsicologoDocumento', psicologoDocumento);
  const response = await authFetch(url.toString());
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error('Error al buscar citas del psicólogo');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function getComparacionSemanal(
  psicologoId: number,
  opts?: { estadoCita?: string; fechaReferencia?: string }
): Promise<ComparacionSemanalDia[]> {
  const url = new URL(`${API_BASE_URL}/api/Citas/estadistica/comparacion-semanal`);
  url.searchParams.set('psicologoCodigo', String(psicologoId));
  if (opts?.estadoCita) url.searchParams.set('estadoCita', opts.estadoCita);
  if (opts?.fechaReferencia) url.searchParams.set('fechaReferencia', opts.fechaReferencia);

  const response = await authFetch(url.toString());
  if (!response.ok) {
    throw new Error('Error al obtener la comparación semanal de citas');
  }

  const data: ComparacionSemanalResponse = await response.json();
  const actual = data.semanaActual?.dias ?? [];
  const anterior = data.semanaAnterior?.dias ?? [];

  return actual.map((a, i) => {
    const b = anterior[i];
    const label = DIAS_LABEL[a.dia] ?? a.dia;
    return {
      day: label,
      semanaActual: a.cantidad ?? 0,
      semanaAnterior: b?.cantidad ?? 0,
    };
  });
}
