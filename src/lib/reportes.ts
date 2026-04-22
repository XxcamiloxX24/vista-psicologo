import { API_BASE_URL } from './config';
import { authFetch } from './auth';

export type ReportePrioridad = 'baja' | 'media' | 'alta' | 'critica';

export interface ReporteCreatePayload {
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad?: ReportePrioridad;
}

export interface ReporteCreated {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  categoria: string;
  fecha: string;
}

/**
 * Crea un nuevo reporte desde la vista del psicólogo.
 * El backend toma el rol del JWT y asocia el reporte al psicólogo autenticado.
 */
export async function crearReporte(payload: ReporteCreatePayload): Promise<ReporteCreated> {
  const res = await authFetch(`${API_BASE_URL}/api/Reporte`, {
    method: 'POST',
    body: JSON.stringify({
      titulo: payload.titulo.trim(),
      descripcion: payload.descripcion.trim(),
      categoria: payload.categoria.trim(),
      prioridad: payload.prioridad ?? 'media',
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'No se pudo crear el reporte. Inténtalo más tarde.');
  }

  return (await res.json()) as ReporteCreated;
}
