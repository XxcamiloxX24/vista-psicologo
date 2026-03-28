import { authFetch, getPsychologistId } from './auth';
import { getPsychologistIdFromToken } from './psychologist';

import { API_BASE_URL } from './config';

/* --- API SeguimientoAprendiz/mis-seguimientos --- */
export interface SeguimientoListarResult {
  segCodigo: number;
  aprendiz: {
    aprFicCodigo?: number;
    AprFicCodigo?: number;
    aprendiz?: {
      codigo?: number;
      Codigo?: number;
      nroDocumento?: string | number | null;
      NroDocumento?: string | number | null;
      nombres?: { primerNombre?: string | null; segundoNombre?: string | null };
      apellidos?: { primerApellido?: string | null; segundoApellido?: string | null };
      Nombres?: { PrimerNombre?: string | null; SegundoNombre?: string | null };
      Apellidos?: { PrimerApellido?: string | null; SegundoApellido?: string | null };
      contacto?: { correoInstitucional?: string | null; correoPersonal?: string | null; telefono?: string | null };
      Contacto?: { CorreoInstitucional?: string | null; CorreoPersonal?: string | null; Telefono?: string | null };
    };
    ficha?: {
      ficCodigo?: number;
      FicCodigo?: number;
      ficJornada?: string | null;
      FicJornada?: string | null;
      programaFormacion?: {
        progNombre?: string | null;
        ProgNombre?: string | null;
        progModalidad?: string | null;
        ProgModalidad?: string | null;
        progFormaModalidad?: string | null;
        ProgFormaModalidad?: string | null;
        area?: { areaNombre?: string | null };
        Area?: { areaNombre?: string | null; AreaNombre?: string | null };
        centro?: { cenNombre?: string | null };
        Centro?: { cenNombre?: string | null; CenNombre?: string | null };
        nivelFormacion?: { nivForNombre?: string | null } | null;
        NivelFormacion?: { nivForNombre?: string | null; NivForNombre?: string | null } | null;
      };
      ProgramaFormacion?: unknown;
    };
    Ficha?: unknown;
    Aprendiz?: unknown;
  };
  estadoSeguimiento?: string;
  EstadoSeguimiento?: string;
}

export interface SeguimientoListarResponse {
  paginaActual: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  resultados: SeguimientoListarResult[];
}

export async function listarSeguimientos(pagina = 1, tamanoPagina = 10): Promise<SeguimientoListarResponse> {
  const url = new URL(`${API_BASE_URL}/api/SeguimientoAprendiz/mis-seguimientos`);
  url.searchParams.set('Pagina', String(pagina));
  url.searchParams.set('TamanoPagina', String(tamanoPagina));
  const response = await authFetch(url.toString());
  if (!response.ok) throw new Error('Error al listar seguimientos');
  return response.json();
}

/** Seguimiento con todos los campos (respuesta de GET por ID) */
export interface SeguimientoDetalle extends SeguimientoListarResult {
  segAprendizFk?: number | null;
  segPsicologoFk?: number | null;
  fechaInicioSeguimiento?: string | null;
  fechaFinSeguimiento?: string | null;
  areaRemitido?: string | null;
  trimestreActual?: number | null;
  motivo?: string | null;
  descripcion?: string | null;
  firmaProfesional?: string | null;
  firmaAprendiz?: string | null;
}

/** Payload para PUT EditarInformacion (campos del DTO) */
export interface EditarSeguimientoPayload {
  segAprendizFk?: number | null;
  segPsicologoFk?: number | null;
  segFechaSeguimiento?: string | null;
  segFechaFin?: string | null;
  segAreaRemitido?: string | null;
  segTrimestreActual?: number | null;
  segMotivo?: string | null;
  segDescripcion?: string | null;
  segEstadoSeguimiento?: string | null;
  segFirmaProfesional?: string | null;
  segFirmaAprendiz?: string | null;
}

function getField<T>(data: Record<string, unknown>, camel: string, pascal: string): T | undefined {
  return (data[camel] ?? data[pascal]) as T | undefined;
}

/** Obtiene un seguimiento por ID con datos completos (área, centro, nivel formación, descripción, fechas, etc.) */
export async function getSeguimientoPorId(id: number): Promise<SeguimientoDetalle | null> {
  const response = await authFetch(`${API_BASE_URL}/api/SeguimientoAprendiz/${id}`);
  if (!response.ok) return null;
  const data = (await response.json()) as Record<string, unknown>;
  const segCodigo = getField<number>(data, 'segCodigo', 'SegCodigo');
  const aprendiz = data.aprendiz ?? data.Aprendiz;
  const estado = getField<string>(data, 'estadoSeguimiento', 'EstadoSeguimiento');
  if (aprendiz == null) return null;
  const apr = aprendiz as Record<string, unknown>;
  const psi = (data.psicologo ?? data.Psicologo) as Record<string, unknown> | undefined;
  return {
    segCodigo: Number(segCodigo ?? 0),
    aprendiz: aprendiz as SeguimientoListarResult['aprendiz'],
    estadoSeguimiento: String(estado ?? ''),
    segAprendizFk: (apr?.AprFicCodigo ?? apr?.aprFicCodigo) as number | undefined,
    segPsicologoFk: psi ? (psi.PsiCodigo ?? psi.psiCodigo) as number | undefined : undefined,
    fechaInicioSeguimiento: getField<string>(data, 'fechaInicioSeguimiento', 'FechaInicioSeguimiento'),
    fechaFinSeguimiento: getField<string>(data, 'fechaFinSeguimiento', 'FechaFinSeguimiento'),
    areaRemitido: getField<string>(data, 'areaRemitido', 'AreaRemitido'),
    trimestreActual: getField<number>(data, 'trimestreActual', 'TrimestreActual'),
    motivo: getField<string>(data, 'motivo', 'Motivo'),
    descripcion: getField<string>(data, 'descripcion', 'Descripcion'),
    firmaProfesional: getField<string>(data, 'firmaProfesional', 'FirmaProfesional'),
    firmaAprendiz: getField<string>(data, 'firmaAprendiz', 'FirmaAprendiz'),
  };
}

/** Actualiza un seguimiento (PUT). Usar para finalizar o editar información. */
export async function editarSeguimiento(id: number, payload: EditarSeguimientoPayload): Promise<unknown> {
  const body = {
    segAprendizFk: payload.segAprendizFk ?? null,
    segPsicologoFk: payload.segPsicologoFk ?? null,
    segFechaSeguimiento: payload.segFechaSeguimiento ?? null,
    segFechaFin: payload.segFechaFin ?? null,
    segAreaRemitido: payload.segAreaRemitido ?? null,
    segTrimestreActual: payload.segTrimestreActual ?? null,
    segMotivo: payload.segMotivo ?? null,
    segDescripcion: payload.segDescripcion ?? null,
    segEstadoSeguimiento: payload.segEstadoSeguimiento ?? null,
    segFirmaProfesional: payload.segFirmaProfesional ?? null,
    segFirmaAprendiz: payload.segFirmaAprendiz ?? null,
  };
  const response = await authFetch(`${API_BASE_URL}/api/SeguimientoAprendiz/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    let message = text || 'Error al actualizar el seguimiento';
    try {
      const j = JSON.parse(text) as { message?: string; title?: string };
      if (j.message) message = j.message;
    } catch {
      /* usar texto plano */
    }
    throw new Error(message);
  }
  return response.json();
}

/** Marca el seguimiento como inactivo (PUT eliminar/{id}). */
export async function eliminarSeguimiento(id: number): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/api/SeguimientoAprendiz/eliminar/${id}`, {
    method: 'PUT',
  });
  if (!response.ok) {
    const text = await response.text();
    let message = text || 'No se pudo eliminar el seguimiento';
    try {
      const j = JSON.parse(text) as { message?: string; title?: string };
      if (j.message) message = j.message;
    } catch {
      /* texto plano */
    }
    throw new Error(message);
  }
}

/** Valores exactos que acepta la API (EstadosSeguimiento.Normalizar) */
export const ESTADOS_SEGUIMIENTO_API = {
  estable: 'Estables',
  observacion: 'En Observacion',
  critico: 'Criticos',
} as const;

export type EstadoSeguimientoApi = (typeof ESTADOS_SEGUIMIENTO_API)[keyof typeof ESTADOS_SEGUIMIENTO_API];

export interface CrearSeguimientoPayload {
  /** FK a tabla aprendiz_ficha (AprFicCodigo), no al código del aprendiz solo */
  segAprendizFk: number;
  segPsicologoFk: number;
  segFechaSeguimiento: string;
  segFechaFin?: string | null;
  segAreaRemitido?: string | null;
  segTrimestreActual: number;
  segMotivo: string;
  segDescripcion: string;
  segEstadoSeguimiento: string;
  segFirmaProfesional?: string | null;
  segFirmaAprendiz?: string | null;
}

export async function crearSeguimiento(payload: CrearSeguimientoPayload): Promise<unknown> {
  const response = await authFetch(`${API_BASE_URL}/api/SeguimientoAprendiz`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    let message = text || 'Error al crear el seguimiento';
    try {
      const j = JSON.parse(text) as { message?: string; title?: string };
      if (j.message) message = j.message;
    } catch {
      /* usar texto plano */
    }
    throw new Error(message);
  }
  return response.json();
}

/** GET api/SeguimientoAprendiz/estados → [{ valor: string }, ...] */
export async function getEstadosSeguimientoCatalogo(): Promise<string[]> {
  const response = await authFetch(`${API_BASE_URL}/api/SeguimientoAprendiz/estados`);
  if (!response.ok) return Object.values(ESTADOS_SEGUIMIENTO_API);
  const data = (await response.json()) as { valor?: string; Valor?: string }[];
  if (!Array.isArray(data)) return Object.values(ESTADOS_SEGUIMIENTO_API);
  return data.map((x) => x.valor ?? x.Valor ?? '').filter(Boolean);
}

export interface TendenciaEstadoItem {
  mes: string;
  estables: number;
  observacion: number;
  criticos: number;
}

export interface TendenciaEstadoParams {
  modo: 'recientes' | 'cuatrimestre' | 'rango';
  anio?: number;
  cuatrimestre?: number;
  desde?: string;
  hasta?: string;
  psicologoId?: number;
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const toMonthLabel = (value: unknown, index: number) => {
  if (typeof value === 'number' && value >= 1 && value <= 12) {
    return MESES[value - 1];
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return String(index + 1);
};

const firstNumber = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      const n = parseFloat(value);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
};

export async function getTendenciaEstado(params: TendenciaEstadoParams): Promise<TendenciaEstadoItem[]> {
  const psicologoId = params.psicologoId ?? getPsychologistIdFromToken() ?? getPsychologistId();
  if (!psicologoId) return [];

  const url = new URL(`${API_BASE_URL}/api/SeguimientoAprendiz/estadistica/tendencia-estado`);
  url.searchParams.set('psicologoId', String(psicologoId));

  if (params.modo === 'cuatrimestre') {
    if (params.anio) url.searchParams.set('anio', String(params.anio));
    if (params.cuatrimestre) url.searchParams.set('cuatrimestre', String(params.cuatrimestre));
  }

  if (params.modo === 'rango') {
    if (params.desde) url.searchParams.set('desde', params.desde);
    if (params.hasta) url.searchParams.set('hasta', params.hasta);
  }

  const response = await authFetch(url.toString());
  if (!response.ok) {
    throw new Error('Error al obtener tendencia por estado');
  }

  const raw = await response.json();
  const rawData = (raw && typeof raw === 'object' && 'data' in (raw as Record<string, unknown>))
    ? (raw as { data?: unknown }).data
    : raw;

  // Formato esperado por el endpoint en producción:
  // { meses: string[], series: { criticos: number[], observacion: number[], estables: number[] } }
  const meses = (rawData as Record<string, unknown>)?.meses;
  const series = (rawData as Record<string, unknown>)?.series as Record<string, unknown> | undefined;

  if (Array.isArray(meses) && series) {
    const criticos = Array.isArray(series.criticos) ? series.criticos : [];
    const observacion = Array.isArray(series.enObservacion)
      ? series.enObservacion
      : Array.isArray(series.observacion)
        ? series.observacion
        : [];
    const estables = Array.isArray(series.estables) ? series.estables : [];

    return meses.map((mes, index) => ({
      mes: toMonthLabel(mes, index),
      criticos: firstNumber(criticos[index]),
      observacion: firstNumber(observacion[index]),
      estables: firstNumber(estables[index]),
    }));
  }

  // Fallback: lista de objetos (formato antiguo)
  const list = Array.isArray(rawData) ? rawData : [];
  return list.map((item: Record<string, unknown>, index: number) => {
    const mesRaw = item.mes ?? item.month ?? item.mesNombre ?? item.mes_nombre ?? item.mesNumero ?? item.mes_numero;
    return {
      mes: toMonthLabel(mesRaw, index),
      estables: firstNumber(item.estables, item.estable, item.total_estables, item.totalEstables),
      observacion: firstNumber(
        item.observacion,
        item.enObservacion,
        item.en_observacion,
        item['enObservación'],
        item.totalObservacion,
        item.total_observacion
      ),
      criticos: firstNumber(item.criticos, item.critico, item.total_criticos, item.totalCriticos),
    };
  });
}
