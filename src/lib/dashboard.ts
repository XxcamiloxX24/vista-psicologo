import { authFetch } from './auth';
import { API_BASE_URL } from './config';

export interface ActividadMensualFila {
  mes: string;
  anio: number;
  mesNumero: number;
  citas: number;
  seguimientos: number;
  mensajes: number;
}

/**
 * Citas y seguimientos por mes desde la API principal (mensajes vienen del servicio de chat o 0).
 */
export async function getActividadMensual(psicologoCodigo: number, meses = 6): Promise<ActividadMensualFila[]> {
  const url = new URL(`${API_BASE_URL}/api/Psicologo/estadistica/actividad-mensual`);
  url.searchParams.set('psicologoCodigo', String(psicologoCodigo));
  url.searchParams.set('meses', String(meses));

  const res = await authFetch(url.toString());
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || 'Error al obtener actividad mensual');
  }
  const data = (await res.json()) as { datos?: ActividadMensualFila[] };
  return Array.isArray(data.datos) ? data.datos : [];
}
