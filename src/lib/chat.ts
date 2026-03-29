import { authFetch, getToken } from './auth';

// Normalizar: quitar barra final para evitar doble "//" en las URLs
const CHAT_API_URL = (import.meta.env.VITE_CHAT_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export interface Conversation {
  _id: string;
  appointmentId: number;
  psychologistId: number;
  apprenticeId: number;
  area: string;
  apprenticeName?: string;
  ficha?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: number;
  content: string;
  type: string;
  timestamp: string;
}

export interface CreateRoomParams {
  apprenticeId: number;
  area: string;
  appointmentId?: number;
  apprenticeName?: string;
  ficha?: string;
}

export async function createRoom(params: CreateRoomParams): Promise<{ roomId: string; appointmentId: number }> {
  const response = await authFetch(`${CHAT_API_URL}/api/chat/room`, {
    method: 'POST',
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Error al crear la conversación');
  }

  const data = await response.json();
  return {
    roomId: data.roomId,
    appointmentId: data.appointmentId ?? params.appointmentId,
  };
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await authFetch(`${CHAT_API_URL}/api/chat/conversations`);

  if (!response.ok) {
    throw new Error('Error al obtener conversaciones');
  }

  return response.json();
}

export interface MensajesPorMesFila {
  año: number;
  mes: number;
  total: number;
}

/** Mensajes agrupados por año/mes en las conversaciones del psicólogo (MongoDB). Falla silenciosamente si el chat no está disponible. */
export async function getMensajesPorMes(meses = 6): Promise<MensajesPorMesFila[]> {
  const url = `${CHAT_API_URL}/api/chat/stats/mensajes-por-mes?meses=${meses}`;
  const response = await authFetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function getChatHistory(appointmentId: number): Promise<ChatMessage[]> {
  const response = await authFetch(`${CHAT_API_URL}/api/chat/history/${appointmentId}`);

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error('Error al obtener historial');
  }

  return response.json();
}

export function getSocketConfig() {
  const token = getToken();
  return {
    url: CHAT_API_URL,
    options: {
      auth: { token: token ?? '' },
      extraHeaders: token ? { token } : undefined,
    },
  };
}
