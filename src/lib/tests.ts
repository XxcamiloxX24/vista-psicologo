import { authFetch } from './auth';
import { API_BASE_URL } from './config';

/* ── Tipos ── */

export interface PlantillaOpcionApi {
  plaOpcCodigo: number;
  plaOpcTexto: string;
  plaOpcOrden: number;
}

export interface PlantillaPreguntaApi {
  plaPrgCodigo: number;
  plaPrgTexto: string;
  plaPrgTipo: string;
  plaPrgOrden: number;
  opciones: PlantillaOpcionApi[];
}

export interface PlantillaResumen {
  plaTstCodigo: number;
  plaTstNombre: string;
  plaTstDescripcion: string | null;
  plaTstFechaCreacion: string;
  totalPreguntas: number;
}

export interface PlantillaDetalle {
  plaTstCodigo: number;
  plaTstNombre: string;
  plaTstDescripcion: string | null;
  plaTstFechaCreacion: string;
  preguntas: PlantillaPreguntaApi[];
}

export interface TestAsignadoRespuesta {
  preguntaId: number;
  preguntaTexto: string | null;
  opcionId: number;
  opcionTexto: string | null;
  tesResFechaRespuesta: string | null;
}

export interface TestAsignadoApi {
  testGenCodigo: number;
  plantillaNombre: string | null;
  plantillaDescripcion: string | null;
  testGenEstadoTest: string | null;
  fechaRealizacion: string | null;
  resultados: string | null;
  recomendaciones: string | null;
  respuestas: TestAsignadoRespuesta[];
}

/* ── Plantillas (CRUD) ── */

export interface CrearPlantillaPayload {
  plaTstNombre: string;
  plaTstDescripcion?: string | null;
  preguntas: {
    plaPrgTexto: string;
    plaPrgTipo: string;
    plaPrgOrden: number;
    opciones: { plaOpcTexto: string; plaOpcOrden: number }[];
  }[];
}

export async function crearPlantilla(payload: CrearPlantillaPayload): Promise<{ plantillaId: number }> {
  const res = await authFetch(`${API_BASE_URL}/api/PlantillaTest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || 'Error al crear plantilla');
  }
  return res.json();
}

export async function getMisPlantillas(): Promise<PlantillaResumen[]> {
  const res = await authFetch(`${API_BASE_URL}/api/PlantillaTest/mis-plantillas`);
  if (!res.ok) return [];
  return res.json();
}

export async function getPlantillaDetalle(id: number): Promise<PlantillaDetalle | null> {
  const res = await authFetch(`${API_BASE_URL}/api/PlantillaTest/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function editarPlantilla(id: number, payload: CrearPlantillaPayload): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/api/PlantillaTest/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || 'Error al editar plantilla');
  }
}

export async function eliminarPlantilla(id: number): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/api/PlantillaTest/eliminar/${id}`, { method: 'PUT' });
  if (!res.ok) throw new Error('Error al eliminar plantilla');
}

/* ── Asignar test ── */

/** Base de rutas: evita "TestGeneral" en la URL (extensiones pueden cortar "Te" y romper la petición). */
const TEST_API_BASE = `${API_BASE_URL}/api/evaluaciones-hm`;

export async function asignarTest(plantillaId: number, aprendizFichaId: number): Promise<{ testId: number }> {
  const res = await authFetch(`${TEST_API_BASE}/asignar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plantillaId, aprendizFichaId }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || 'Error al asignar test');
  }
  return res.json();
}

/* ── Tests de un aprendiz (vista psicólogo) ── */

export async function getTestsPorAprendiz(aprendizFichaId: number): Promise<TestAsignadoApi[]> {
  const res = await authFetch(`${TEST_API_BASE}/por-aprendiz/${aprendizFichaId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/* ── Tipos de pregunta ── */

export const TIPOS_PREGUNTA = [
  { value: 'si_no', label: 'Sí / No' },
  { value: 'verdadero_falso', label: 'Verdadero / Falso' },
  { value: 'opcion_multiple', label: 'Opción múltiple' },
  { value: 'escala', label: 'Escala (1-5)' },
] as const;

export function opcionesPorDefecto(tipo: string): { plaOpcTexto: string; plaOpcOrden: number }[] {
  switch (tipo) {
    case 'si_no':
      return [
        { plaOpcTexto: 'Sí', plaOpcOrden: 0 },
        { plaOpcTexto: 'No', plaOpcOrden: 1 },
      ];
    case 'verdadero_falso':
      return [
        { plaOpcTexto: 'Verdadero', plaOpcOrden: 0 },
        { plaOpcTexto: 'Falso', plaOpcOrden: 1 },
      ];
    case 'escala':
      return [1, 2, 3, 4, 5].map((n, i) => ({ plaOpcTexto: String(n), plaOpcOrden: i }));
    default:
      return [
        { plaOpcTexto: 'Opción 1', plaOpcOrden: 0 },
        { plaOpcTexto: 'Opción 2', plaOpcOrden: 1 },
      ];
  }
}

export function etiquetaEstadoTest(estado: string | null | undefined): string {
  const m: Record<string, string> = {
    asignado: 'Pendiente',
    en_progreso: 'En Progreso',
    completado: 'Completado',
  };
  return m[(estado ?? '').trim().toLowerCase()] ?? estado ?? '—';
}

export function claseBadgeEstadoTest(estado: string | null | undefined): string {
  const k = (estado ?? '').trim().toLowerCase();
  if (k === 'completado') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
  if (k === 'en_progreso') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
  return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
}
