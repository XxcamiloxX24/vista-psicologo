import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../lib/auth';
import { getSocketConfig } from '../lib/chat';

export interface AppNotification {
  id: string;
  type: 'NEW_CHAT' | 'NEW_MESSAGE' | string;
  title: string;
  message: string;
  appointmentId?: number;
  createdAt: Date;
  read: boolean;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback(
    (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      setNotifications((prev) => [
        {
          ...n,
          id: makeId(),
          createdAt: new Date(),
          read: false,
        },
        ...prev.slice(0, 99),
      ]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const [socketEpoch, setSocketEpoch] = useState(0);
  useEffect(() => {
    const onTokenRefresh = () => setSocketEpoch((e) => e + 1);
    window.addEventListener('healthymind-token-refreshed', onTokenRefresh);
    return () => window.removeEventListener('healthymind-token-refreshed', onTokenRefresh);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const config = getSocketConfig();
    if (!config.url) return;

    const socket = io(config.url, {
      ...config.options,
      transports: ['polling', 'websocket'],
    });

    socket.on('connect', () => {
      // El servidor nos une a la sala personal (Psicologo_<id>); las notificaciones llegan ahí
    });

    socket.on('notification', (data: { type?: string; title?: string; message?: string; appointmentId?: number }) => {
      addNotification({
        type: data.type ?? 'NEW_MESSAGE',
        title: data.title ?? 'Notificación',
        message: data.message ?? '',
        appointmentId: data.appointmentId,
      });
    });

    socket.on('connect_error', () => {});

    return () => {
      socket.disconnect();
    };
  }, [addNotification, socketEpoch]);

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications debe usarse dentro de NotificationsProvider');
  }
  return ctx;
}
