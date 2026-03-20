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
