import { authFetch } from './auth';

import { API_BASE_URL } from './config';

export interface TotalAprendicesResponse {
  totalAprendices: number;
}

export async function getTotalAprendices(): Promise<number> {
  const response = await authFetch(`${API_BASE_URL}/api/Aprendiz/estadistica/total-registrados`);

  if (!response.ok) {
    throw new Error('Error al obtener el total de aprendices');
  }

  const data: TotalAprendicesResponse = await response.json();
  return data.totalAprendices ?? 0;
}
