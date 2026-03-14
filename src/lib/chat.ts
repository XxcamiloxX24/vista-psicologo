import { getAuthHeaders, getToken } from './auth';

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL ?? 'http://localhost:3000';

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
  const response = await fetch(`${CHAT_API_URL}/api/chat/room`, {
    method: 'POST',
    headers: getAuthHeaders(),
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
  const response = await fetch(`${CHAT_API_URL}/api/chat/conversations`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener conversaciones');
  }

  return response.json();
}

export async function getChatHistory(appointmentId: number): Promise<ChatMessage[]> {
  const response = await fetch(`${CHAT_API_URL}/api/chat/history/${appointmentId}`, {
    headers: getAuthHeaders(),
  });

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
