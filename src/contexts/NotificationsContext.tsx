import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../lib/auth';
import { getSocketConfig } from '../lib/chat';
import { getSolicitudesPendientes, getStudentNameFromCita, getFichaFromCita } from '../lib/citas';

export interface AppNotification {
  id: string;
  type: 'NEW_CHAT' | 'NEW_MESSAGE' | 'RACHA_EMOCIONAL' | string;
  title: string;
  message: string;
  appointmentId?: number;
  seguimientoId?: number;
  deepLink?: string;
  createdAt: Date;
  read: boolean;
}

export interface NotificationPreferences {
  citas: boolean;
  mensajes: boolean;
  casosCriticos: boolean;
}

const PREFS_KEY = 'healthymind_notif_prefs';

function loadPreferences(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        citas: parsed.citas !== false,
        mensajes: parsed.mensajes !== false,
        casosCriticos: parsed.casosCriticos !== false,
      };
    }
  } catch { /* corrupted → defaults */ }
  return { citas: true, mensajes: true, casosCriticos: true };
}

function savePreferences(prefs: NotificationPreferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function isTypeAllowed(type: string, prefs: NotificationPreferences): boolean {
  const t = type.toUpperCase();
  if (t === 'CITA_SOLICITADA' || t === 'CITA_PROGRAMADA' || t === 'CITA_RECHAZADA' || t === 'CITA_CANCELADA')
    return prefs.citas;
  if (t === 'NEW_MESSAGE' || t === 'NEW_CHAT')
    return prefs.mensajes;
  if (t === 'CASO_CRITICO' || t === 'RACHA_EMOCIONAL')
    return prefs.casosCriticos;
  return true;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  preferences: NotificationPreferences;
  setPreference: <K extends keyof NotificationPreferences>(key: K, value: boolean) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(loadPreferences);

  const setPreference = useCallback(<K extends keyof NotificationPreferences>(key: K, value: boolean) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value };
      savePreferences(next);
      return next;
    });
  }, []);

  const prefsRef = useRef(preferences);
  useEffect(() => { prefsRef.current = preferences; }, [preferences]);

  const addNotification = useCallback(
    (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      if (!isTypeAllowed(n.type, prefsRef.current)) return;
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

    console.info('[HM-Notif] Intentando Socket.IO en', config.url);

    const socket = io(config.url, {
      ...config.options,
      transports: ['polling', 'websocket'],
    });

    socket.on('connect', () => {
      console.info('[HM-Notif] Socket conectado:', config.url, 'sid:', socket.id);
    });

    socket.on('notification', (data: { type?: string; title?: string; message?: string; appointmentId?: number; seguimientoId?: number; deepLink?: string }) => {
      console.debug('[HM-Notif] Notificación recibida:', data);
      if (data.appointmentId != null) {
        seenCitaIdsRef.current.add(data.appointmentId);
      }
      addNotification({
        type: data.type ?? 'NEW_MESSAGE',
        title: data.title ?? 'Notificación',
        message: data.message ?? '',
        appointmentId: data.appointmentId,
        seguimientoId: data.seguimientoId,
        deepLink: data.deepLink,
      });
    });

    socket.on('connect_error', (err) => {
      console.warn('[HM-Notif] Socket connect_error en', config.url, ':', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.debug('[HM-Notif] Socket desconectado:', reason);
    });

    return () => {
      socket.disconnect();
    };
  }, [addNotification, socketEpoch]);

  // --- Polling de citas pendientes como red de seguridad ---
  const seenCitaIdsRef = useRef<Set<number>>(new Set());
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    if (!prefsRef.current.citas) return;

    let cancelled = false;
    initialLoadDoneRef.current = false;

    const poll = async () => {
      try {
        const list = await getSolicitudesPendientes();
        if (cancelled) return;

        if (!initialLoadDoneRef.current) {
          for (const c of list) seenCitaIdsRef.current.add(c.citCodigo);
          initialLoadDoneRef.current = true;
          return;
        }

        for (const c of list) {
          if (seenCitaIdsRef.current.has(c.citCodigo)) continue;
          seenCitaIdsRef.current.add(c.citCodigo);
          const name = getStudentNameFromCita(c);
          const ficha = getFichaFromCita(c);
          const tipo = c.citTipoCita ?? '';
          addNotification({
            type: 'CITA_SOLICITADA',
            title: 'Nueva solicitud de cita',
            message: `${name}${ficha ? ` — Ficha ${ficha}` : ''}${tipo ? `. Tipo: ${tipo}` : ''}`,
            appointmentId: c.citCodigo,
          });
        }
      } catch {
        /* network error, 401, etc. → skip silently */
      }
    };

    poll();
    const handle = setInterval(poll, 60_000);
    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, [addNotification, socketEpoch]);

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    preferences,
    setPreference,
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
