import { getAuthHeaders } from './auth';

import { API_BASE_URL } from './config';

export interface CitaPorDia {
  año: number;
  mes: number;
  dia: number;
  total_Citas: number;
}

export async function getCitasHoy(): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/Citas/estadistica/por-dia`, {
    headers: getAuthHeaders(),
  });

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
