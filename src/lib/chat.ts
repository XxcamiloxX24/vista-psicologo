import { authFetch, getToken } from './auth';

/** Misma URL que en .env.example; evita socket a localhost si Netlify no define VITE_CHAT_API_URL en el build. */
const DEFAULT_PROD_CHAT_URL = 'https://chat-healthy-mind.onrender.com';

function resolveChatApiUrl(): string {
  const fromEnv = import.meta.env.VITE_CHAT_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  if (import.meta.env.PROD) return DEFAULT_PROD_CHAT_URL;
  return 'http://localhost:3000';
}

// Normalizar: quitar barra final para evitar doble "//" en las URLs
const CHAT_API_URL = resolveChatApiUrl();

export interface Conversation {
  _id: string;
  appointmentId: number;
  psychologistId: number;
  apprenticeId: number;
  area: string;
  apprenticeName?: string;
  ficha?: string;
  isActive: boolean;
  archivedByPsychologist?: boolean;
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

/** Oculta la conversación de la lista del psicólogo sin borrarla (el aprendiz la sigue viendo). */
export async function archiveConversation(appointmentId: number): Promise<void> {
  const response = await authFetch(
    `${CHAT_API_URL}/api/chat/conversations/${appointmentId}/archive`,
    { method: 'PATCH' }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'No se pudo archivar la conversación');
  }
}

/** Borra la conversación y todo su historial de mensajes. Acción irreversible. */
export async function deleteConversationPermanent(appointmentId: number): Promise<void> {
  const response = await authFetch(
    `${CHAT_API_URL}/api/chat/conversations/${appointmentId}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'No se pudo eliminar la conversación');
  }
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
