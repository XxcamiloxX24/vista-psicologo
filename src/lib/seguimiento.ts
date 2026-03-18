import { authFetch, getPsychologistId } from './auth';
import { getPsychologistIdFromToken } from './psychologist';

import { API_BASE_URL } from './config';

/* --- API SeguimientoAprendiz/mis-seguimientos --- */
export interface SeguimientoListarResult {
  segCodigo: number;
  aprendiz: {
    aprFicCodigo: number;
    aprendiz: {
      codigo: number;
      nombres?: { primerNombre?: string | null; segundoNombre?: string | null };
      apellidos?: { primerApellido?: string | null; segundoApellido?: string | null };
      contacto?: { correoInstitucional?: string | null };
    };
    ficha: {
      ficCodigo: number;
      programaFormacion?: { progNombre?: string };
    };
  };
  estadoSeguimiento: string;
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
