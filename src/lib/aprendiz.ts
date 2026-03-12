import { getAuthHeaders } from './auth';

const BASE_URL = 'http://healthymind10.runasp.net';

export interface TotalAprendicesResponse {
  totalAprendices: number;
}

export async function getTotalAprendices(): Promise<number> {
  const response = await fetch(`${BASE_URL}/api/Aprendiz/estadistica/total-registrados`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener el total de aprendices');
  }

  const data: TotalAprendicesResponse = await response.json();
  return data.totalAprendices ?? 0;
}
