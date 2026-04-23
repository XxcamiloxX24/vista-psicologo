import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, Send, Paperclip, MoreVertical, Plus, X, Bell, BellOff, Trash2, MessageSquareOff } from 'lucide-react';
import { Label } from './ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  createRoom,
  getConversations,
  getChatHistory,
  getSocketConfig,
  archiveConversation,
  deleteConversationPermanent,
  type Conversation,
  type ChatMessage,
} from '../lib/chat';
import {
  getCitasParaNuevoChat,
  programarSolicitud,
  getStudentNameFromCita,
  getFichaFromCita,
  getApprenticeCodigoFromCita,
  getCitaFieldFromApi,
  type CitaApi,
} from '../lib/citas';
import { getPsychologistIdFromToken } from '../lib/psychologist';
import { io, type Socket } from 'socket.io-client';
import { usePsychologist } from '../contexts/PsychologistContext';
import { useTheme } from '../contexts/ThemeContext';

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  ficha: string;
  appointmentId: number;
  apprenticeId?: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'psychologist' | 'student';
  timestamp: string;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return 'Ahora';
  if (diff < 86400000) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return 'Ayer';
}

function conversationToChat(c: Conversation): Chat {
  const created = new Date(c.createdAt);
  return {
    id: c.appointmentId,
    name: c.apprenticeName ?? `Aprendiz #${c.apprenticeId}`,
    lastMessage: 'Nueva conversación',
    timestamp: formatTimestamp(created),
    unread: 0,
    ficha: c.ficha ?? '',
    appointmentId: c.appointmentId,
    apprenticeId: c.apprenticeId,
  };
}

const MUTED_CHATS_KEY = 'healthymind-muted-chats';

function loadMutedChats(): Set<number> {
  try {
    const raw = localStorage.getItem(MUTED_CHATS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveMutedChats(set: Set<number>) {
  localStorage.setItem(MUTED_CHATS_KEY, JSON.stringify([...set]));
}

function chatMessageToMessage(m: ChatMessage, psychologistId: number): Message {
  const isPsychologist = m.senderId === psychologistId;
  const date = new Date(m.timestamp);
  return {
    id: m._id,
    text: m.content,
    sender: isPsychologist ? 'psychologist' : 'student',
    timestamp: formatTimestamp(date),
  };
}

interface MessagesProps {
  /** Para abrir un chat específico al venir desde una notificación */
  initialChatToSelect?: number | null;
  onInitialChatApplied?: () => void;
}

export function Messages({ initialChatToSelect = null, onInitialChatApplied }: MessagesProps = {}) {
  const { psychologist } = usePsychologist();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const psychologistId = psychologist?.psiCodigo ?? getPsychologistIdFromToken();

  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const [chats, setChats] = useState<Chat[]>([]);
  const [chatMessages, setChatMessages] = useState<{ [key: number]: Message[] }>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);

  const [newChat, setNewChat] = useState({
    appointmentId: 0,
    apprenticeId: 0,
    apprenticeName: '',
    ficha: '',
    area: 'General',
  });
  const [availableCitas, setAvailableCitas] = useState<CitaApi[]>([]);
  const [loadingApprentices, setLoadingApprentices] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<number | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [mutedChats, setMutedChats] = useState<Set<number>>(loadMutedChats);
  const typingStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingStartSentRef = useRef(false);
  const typingAppointmentIdRef = useRef<number | null>(null);
  const selectedChatRef = useRef<number | null>(selectedChat);
  selectedChatRef.current = selectedChat;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, selectedChat]);

  // Al venir desde una notificación, seleccionar ese chat
  useEffect(() => {
    if (initialChatToSelect != null) {
      setSelectedChat(initialChatToSelect);
      onInitialChatApplied?.();
    }
  }, [initialChatToSelect, onInitialChatApplied]);

  // Cargar conversaciones
  useEffect(() => {
    getConversations()
      .then((convos) => {
        setChats(convos.map(conversationToChat));
        if (convos.length > 0 && !selectedChat) {
          setSelectedChat(convos[0].appointmentId);
        }
      })
      .catch(() => setChats([]))
      .finally(() => setLoading(false));
  }, []);

  // Cargar citas pendientes para nuevo chat (el psicólogo elige aprender con solicitud pendiente)
  useEffect(() => {
    if (showNewChatModal) {
      setLoadingApprentices(true);
      getCitasParaNuevoChat()
        .then((list) => {
          const soloNoPresenciales = list.filter((c) => {
            const tipo = (getCitaFieldFromApi<string>(c, 'citTipoCita', 'CitTipoCita') ?? '').trim().toLowerCase();
            return tipo === 'chat' || tipo === 'videollamada';
          });
          setAvailableCitas(soloNoPresenciales);
        })
        .catch(() => setAvailableCitas([]))
        .finally(() => setLoadingApprentices(false));
    }
  }, [showNewChatModal]);

  // Cargar historial al seleccionar chat
  useEffect(() => {
    if (!selectedChat || !psychologistId) return;
    getChatHistory(selectedChat)
      .then((msgs) => {
        setChatMessages((prev) => ({
          ...prev,
          [selectedChat]: msgs.map((m) => chatMessageToMessage(m, psychologistId)),
        }));
      })
      .catch(() => {
        setChatMessages((prev) => ({ ...prev, [selectedChat]: [] }));
      });
  }, [selectedChat, psychologistId]);

  const [socketEpoch, setSocketEpoch] = useState(0);
  useEffect(() => {
    const onTokenRefresh = () => setSocketEpoch((e) => e + 1);
    window.addEventListener('healthymind-token-refreshed', onTokenRefresh);
    return () => window.removeEventListener('healthymind-token-refreshed', onTokenRefresh);
  }, []);

  // Conexión Socket.io
  useEffect(() => {
    const config = getSocketConfig();
    if (!config.options.auth.token) return;

    const socket = io(config.url, {
      ...config.options,
      transports: ['polling', 'websocket'], // polling primero ayuda con cold starts de Render
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      if (selectedChat) {
        socket.emit('join_chat', { appointmentId: selectedChat });
      }
    });

    socket.on('receive_message', (msg: ChatMessage & { appointmentId?: number }) => {
      if (!psychologistId) return;
      const aptId = msg.appointmentId ?? selectedChat;
      if (!aptId) return;
      // No añadir nuestros propios mensajes: ya los mostramos con optimistic update
      if (msg.senderId === psychologistId) return;
      const m = chatMessageToMessage(msg, psychologistId);
      setChatMessages((prev) => ({
        ...prev,
        [aptId]: [...(prev[aptId] ?? []), m],
      }));
      setChats((prev) =>
        prev.map((c) =>
          c.appointmentId === aptId
            ? { ...c, lastMessage: m.text, timestamp: m.timestamp }
            : c
        )
      );
    });

    socket.on('user_typing', (data: { appointmentId: number; userId: number; isTyping: boolean }) => {
      if (data.appointmentId !== selectedChatRef.current || data.userId === psychologistId) return;
      setOtherUserTyping(data.isTyping);
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [selectedChat, psychologistId, socketEpoch]);

  const emitTypingStop = useCallback(() => {
    const aptId = typingAppointmentIdRef.current;
    if (typingStartSentRef.current && aptId !== null && socketRef.current) {
      socketRef.current.emit('typing_stop', { appointmentId: aptId });
      typingStartSentRef.current = false;
      typingAppointmentIdRef.current = null;
    }
    if (typingStopTimeoutRef.current) {
      clearTimeout(typingStopTimeoutRef.current);
      typingStopTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    setOtherUserTyping(false);
    return () => emitTypingStop();
  }, [selectedChat, emitTypingStop]);

  const handleMessageInputChange = useCallback(
    (value: string) => {
      setMessageText(value);
      if (selectedChat === null || !socketRef.current) return;
      if (typingStopTimeoutRef.current) {
        clearTimeout(typingStopTimeoutRef.current);
      }
      if (value.trim().length > 0) {
        if (!typingStartSentRef.current) {
          socketRef.current.emit('typing_start', { appointmentId: selectedChat });
          typingStartSentRef.current = true;
          typingAppointmentIdRef.current = selectedChat;
        }
        typingStopTimeoutRef.current = setTimeout(() => {
          emitTypingStop();
        }, 1500);
      } else {
        emitTypingStop();
      }
    },
    [selectedChat, emitTypingStop]
  );

  const handleSend = async () => {
    if (!messageText.trim() || selectedChat === null || !socketRef.current || !psychologistId) return;

    emitTypingStop();
    setSending(true);
    const text = messageText.trim();
    setMessageText('');

    // Optimistic update: mostrar el mensaje de inmediato
    const optimista: Message = {
      id: `temp-${Date.now()}`,
      text,
      sender: 'psychologist',
      timestamp: 'Ahora',
    };
    setChatMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] ?? []), optimista],
    }));

    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat ? { ...c, lastMessage: text, timestamp: 'Ahora' } : c
      )
    );

    socketRef.current.emit('send_message', {
      appointmentId: selectedChat,
      content: text,
      type: 'text',
    });

    setSending(false);
  };

  const handleCreateChat = async () => {
    if (!newChat.apprenticeId || !newChat.apprenticeName) {
      alert('Por favor seleccione una cita');
      return;
    }

    setCreating(true);
    try {
      const appointmentId = newChat.appointmentId;
      const citaSeleccionada = availableCitas.find((c) => getCitaFieldFromApi<number>(c, 'citCodigo', 'CitCodigo') === appointmentId);
      const estado = (citaSeleccionada ? getCitaFieldFromApi<string>(citaSeleccionada, 'citEstadoCita', 'CitEstadoCita') ?? '' : '').trim().toLowerCase();

      // Solo si es pendiente: programar como tipo "chat" (actualiza la cita en el API)
      if (appointmentId > 0 && estado === 'pendiente') {
        const hoy = new Date();
        const fecha = hoy.toISOString().split('T')[0];
        await programarSolicitud(appointmentId, {
          citFechaProgramada: fecha,
          citHoraInicio: '09:00',
          citHoraFin: '10:00',
          citTipoCita: 'chat',
          citEstadoCita: 'programada',
        });
      }

      // Si el estudiante ya tiene un chat con el psicólogo, abrir ese en lugar de crear uno nuevo
      const chatExistente = chats.find((c) => c.apprenticeId === newChat.apprenticeId);
      if (chatExistente) {
        setSelectedChat(chatExistente.appointmentId);
        setShowNewChatModal(false);
        setNewChat({ appointmentId: 0, apprenticeId: 0, apprenticeName: '', ficha: '', area: 'General' });
        socketRef.current?.emit('join_chat', { appointmentId: chatExistente.appointmentId });
        return;
      }

      // No existe chat previo: crear nuevo
      const { appointmentId: roomAppointmentId } = await createRoom({
        apprenticeId: newChat.apprenticeId,
        area: newChat.area,
        appointmentId: appointmentId > 0 ? appointmentId : undefined,
        apprenticeName: newChat.apprenticeName,
        ficha: newChat.ficha,
      });

      const finalAppointmentId = roomAppointmentId ?? appointmentId;

      const newChatObj: Chat = {
        id: finalAppointmentId,
        name: newChat.apprenticeName,
        ficha: newChat.ficha,
        lastMessage: 'Nueva conversación',
        timestamp: 'Ahora',
        unread: 0,
        appointmentId: finalAppointmentId,
        apprenticeId: newChat.apprenticeId,
      };

      setChats((prev) => [newChatObj, ...prev]);
      setChatMessages((prev) => ({ ...prev, [finalAppointmentId]: [] }));
      setSelectedChat(finalAppointmentId);
      setShowNewChatModal(false);
      setNewChat({ appointmentId: 0, apprenticeId: 0, apprenticeName: '', ficha: '', area: 'General' });

      socketRef.current?.emit('join_chat', { appointmentId: finalAppointmentId });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear la conversación');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = useCallback((aptId: number) => {
    socketRef.current?.emit('join_chat', { appointmentId: aptId });
  }, []);

  useEffect(() => {
    if (selectedChat && socketRef.current?.connected) {
      handleJoinRoom(selectedChat);
    }
  }, [selectedChat, handleJoinRoom]);

  const currentChat = chats.find((c) => c.id === selectedChat);
  const messages = selectedChat ? (chatMessages[selectedChat] ?? []) : [];
  const isMuted = selectedChat ? mutedChats.has(selectedChat) : false;

  const handleToggleMute = () => {
    if (!selectedChat) return;
    const next = new Set(mutedChats);
    if (next.has(selectedChat)) next.delete(selectedChat);
    else next.add(selectedChat);
    setMutedChats(next);
    saveMutedChats(next);
  };

  const handleRemoveChat = async (permanent = false) => {
    if (!selectedChat || !currentChat) return;
    const appointmentId = selectedChat;
    const msg = permanent
      ? `¿Eliminar permanentemente la conversación con ${currentChat.name}? Se borrará el historial de mensajes.`
      : `¿Quitar el chat con ${currentChat.name} de la lista?`;
    if (!window.confirm(msg)) return;

    try {
      if (permanent) {
        await deleteConversationPermanent(appointmentId);
      } else {
        await archiveConversation(appointmentId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo completar la acción';
      window.alert(message);
      return;
    }

    setChats((prev) => {
      const next = prev.filter((c) => c.appointmentId !== appointmentId);
      setSelectedChat(next.length > 0 ? next[0].appointmentId : null);
      return next;
    });
    setChatMessages((prev) => {
      const next = { ...prev };
      delete next[appointmentId];
      return next;
    });
  };
  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.ficha.includes(searchTerm)
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden min-w-0">
      <div className="flex items-center justify-between shrink-0 pb-4">
        <div>
          <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Mensajes
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Comunicación con aprendices</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewChatModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 shrink-0" />
          Nueva Conversación
        </button>
      </div>

      {/* Modal Nueva Conversación */}
      {showNewChatModal &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{
              zIndex: 2147483647,
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              className={`relative w-full max-w-md overflow-y-auto rounded-2xl shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 rounded-t-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Nueva Conversación</h2>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Seleccionar cita</Label>
                  <Select
                    value={newChat.appointmentId ? String(newChat.appointmentId) : '0'}
                    onValueChange={(v) => {
                      const citCodigo = parseInt(v, 10);
                      const cita = availableCitas.find((c) => getCitaFieldFromApi<number>(c, 'citCodigo', 'CitCodigo') === citCodigo);
                      const apprenticeId = cita ? getApprenticeCodigoFromCita(cita) ?? 0 : 0;
                      const name = cita ? getStudentNameFromCita(cita) : '';
                      const ficha = cita ? getFichaFromCita(cita) : '';
                      setNewChat({
                        appointmentId: citCodigo,
                        apprenticeId,
                        apprenticeName: name,
                        ficha,
                        area: newChat.area,
                      });
                    }}
                  >
                    <SelectTrigger
                      id="student"
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                        isDark ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-purple-200/50 bg-slate-50'
                      }`}
                    >
                      <SelectValue placeholder="Seleccione una cita" />
                    </SelectTrigger>
                    <SelectContent
                      container={document.body}
                      className={`!w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl ${
                        isDark ? '!bg-slate-700 border-slate-500 text-white settings-select-dark' : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                      }`}
                      style={{
                        ...(isDark ? { backgroundColor: '#334155' } : { backgroundColor: '#fff' }),
                        width: 'var(--radix-select-trigger-width)',
                        minWidth: 'var(--radix-select-trigger-width)',
                        zIndex: 2147483648,
                      }}
                    >
                      <SelectItem value="0" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>
                        Seleccione una cita
                      </SelectItem>
                      {availableCitas.map((c) => {
                        const cod = getCitaFieldFromApi<number>(c, 'citCodigo', 'CitCodigo') ?? 0;
                        const name = getStudentNameFromCita(c);
                        const ficha = getFichaFromCita(c);
                        const tipo = (getCitaFieldFromApi<string>(c, 'citTipoCita', 'CitTipoCita') ?? '').trim().toLowerCase();
                        const tipoEtiqueta = tipo === 'videollamada' ? 'Videollamada' : tipo === 'chat' ? 'Chat' : '';
                        return (
                          <SelectItem
                            key={cod}
                            value={String(cod)}
                            hideIndicator
                            className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}
                          >
                            {name} - Ficha: {ficha}{tipoEtiqueta ? ` · ${tipoEtiqueta}` : ''}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {loadingApprentices && (
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cargando citas...</p>
                  )}
                  {!loadingApprentices && availableCitas.length === 0 && (
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No hay citas disponibles. Sólo se listan citas por chat o videollamada que aún no hayan sido realizadas.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewChatModal(false)}
                    className={`flex-1 px-6 py-3 rounded-2xl border transition-all ${isDark ? 'border-slate-600 text-slate-200 hover:bg-slate-700' : 'border-purple-200/50 text-slate-700 hover:bg-slate-50'}`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateChat}
                    disabled={creating || !newChat.apprenticeId || !newChat.appointmentId}
                    className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {creating ? 'Creando...' : 'Crear Conversación'}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden w-full">
        <div
          className={`grid flex-1 min-h-0 w-full max-w-full backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-800/90 border-slate-600/50' : 'bg-white/90 border-purple-100/50'}`}
          style={{
            minHeight: 0,
            gridTemplateRows: 'minmax(0, 1fr)',
            gridTemplateColumns: '320px minmax(0, 1fr)',
          }}
        >
          {/* Lista de chats - ancho fijo 320px, nunca se oculta */}
          <div
            className={`border-r flex flex-col min-h-0 w-[320px] shrink-0 overflow-hidden ${isDark ? 'border-slate-600/50' : 'border-purple-100/50'}`}
            style={isDark ? { backgroundColor: 'rgb(51 65 85)' } : undefined}
          >
            <div className={`p-4 border-b shrink-0 ${isDark ? 'border-slate-600/50' : 'border-purple-100/50'}`}>
              <div className="relative w-full">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar conversaciones..."
                  className={`w-full min-w-0 pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm ${isDark ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-purple-200/50 bg-slate-50'}`}
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {loading ? (
                <div className={`p-4 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cargando...</div>
              ) : filteredChats.length === 0 ? (
                <div className={`p-4 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No hay conversaciones</div>
              ) : (
                filteredChats.map((chat) => {
                  const isHovered = hoveredChatId === chat.id;
                  const isSelected = selectedChat === chat.id;
                  const chatBg = isDark
                    ? isHovered || isSelected
                      ? 'rgb(71 85 105)' // slate-600 - bien visible sobre slate-700
                      : 'transparent'
                    : isHovered
                      ? 'rgba(243, 232, 255, 0.8)' // purple-100
                      : isSelected
                        ? 'rgba(250, 245, 255, 0.5)' // purple-50
                        : undefined;
                  return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    onMouseEnter={() => setHoveredChatId(chat.id)}
                    onMouseLeave={() => setHoveredChatId(null)}
                    className={`w-full p-4 border-b transition-colors duration-150 text-left ${
                      isDark ? 'border-slate-600/50' : 'border-purple-100/50'
                    }`}
                    style={chatBg ? { backgroundColor: chatBg } : undefined}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{chat.name}</h3>
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{chat.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate flex-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="ml-2 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs flex items-center justify-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                    {chat.ficha && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ficha: {chat.ficha}</p>
                    )}
                  </button>
                );
                })
              )}
            </div>
          </div>

          {/* Ventana de chat - toma el espacio restante */}
          <div className={`flex flex-col min-h-0 min-w-0 overflow-hidden ${isDark ? 'bg-slate-800/95' : 'bg-white'}`}>
            {currentChat && (
              <>
                <div className={`p-4 border-b shrink-0 ${
                  isDark
                    ? 'border-slate-600/50 bg-gradient-to-r from-slate-700/50 to-slate-800/50'
                    : 'border-purple-100/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={isDark ? 'text-slate-200' : 'text-slate-800'}>{currentChat.name}</h2>
                      {currentChat.ficha && (
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Ficha: {currentChat.ficha}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDark ? 'hover:bg-slate-600/50' : 'hover:bg-purple-100/50'}`}
                        >
                          <MoreVertical className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={6}
                        className={`chat-header-options-menu min-w-[15rem] p-1.5 rounded-2xl border shadow-xl flex flex-col gap-0.5 ${
                          isDark
                            ? 'border-slate-500 text-slate-100'
                            : 'border-slate-200 text-slate-800 shadow-slate-200/50'
                        }`}
                        style={{
                          zIndex: 2147483648,
                          backgroundColor: isDark ? 'rgb(30 41 59)' : 'rgb(255 255 255)',
                          boxShadow: isDark
                            ? '0 18px 40px -10px rgb(0 0 0 / 0.55), 0 0 0 1px rgb(71 85 105 / 0.5)'
                            : '0 18px 40px -10px rgb(0 0 0 / 0.12), 0 0 0 1px rgb(226 232 240 / 0.9)',
                        }}
                      >
                        <DropdownMenuItem
                          onClick={handleToggleMute}
                          className={`cursor-pointer !rounded-xl px-4 py-3 gap-3 text-sm font-medium border-0 outline-none transition-colors duration-150
                            focus:!bg-transparent focus:!text-inherit
                            ${isDark
                              ? '!text-slate-100 [&_svg]:!text-slate-400 data-[highlighted]:!bg-slate-600 data-[highlighted]:!text-white data-[highlighted]:[&_svg]:!text-slate-200'
                              : '!text-slate-700 [&_svg]:!text-slate-500 data-[highlighted]:!bg-violet-100 data-[highlighted]:!text-slate-900 data-[highlighted]:[&_svg]:!text-violet-700'}`}
                        >
                          {isMuted ? (
                            <>
                              <Bell className="w-4 h-4 shrink-0" />
                              Activar notificaciones
                            </>
                          ) : (
                            <>
                              <BellOff className="w-4 h-4 shrink-0" />
                              Silenciar notificaciones
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className={isDark ? '!bg-slate-600 my-1' : '!bg-slate-200 my-1'} />
                        <DropdownMenuItem
                          onClick={() => handleRemoveChat(false)}
                          className={`cursor-pointer !rounded-xl px-4 py-3 gap-3 text-sm font-medium border-0 outline-none transition-colors duration-150
                            focus:!bg-transparent focus:!text-inherit
                            ${isDark
                              ? '!text-red-300 [&_svg]:!text-red-400 data-[highlighted]:!bg-red-950/80 data-[highlighted]:!text-red-50 data-[highlighted]:[&_svg]:!text-red-200'
                              : '!text-red-600 [&_svg]:!text-red-600 data-[highlighted]:!bg-red-50 data-[highlighted]:!text-red-900 data-[highlighted]:[&_svg]:!text-red-800'}`}
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                          Eliminar el chat
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemoveChat(true)}
                          className={`cursor-pointer !rounded-xl px-4 py-3 gap-3 text-sm font-medium border-0 outline-none transition-colors duration-150
                            focus:!bg-transparent focus:!text-inherit
                            ${isDark
                              ? '!text-red-300 [&_svg]:!text-red-400 data-[highlighted]:!bg-red-950/80 data-[highlighted]:!text-red-50 data-[highlighted]:[&_svg]:!text-red-200'
                              : '!text-red-600 [&_svg]:!text-red-600 data-[highlighted]:!bg-red-50 data-[highlighted]:!text-red-900 data-[highlighted]:[&_svg]:!text-red-800'}`}
                        >
                          <MessageSquareOff className="w-4 h-4 shrink-0" />
                          Eliminar la conversación
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div
                  className={`flex-1 min-h-0 flex flex-col overflow-hidden ${isDark ? 'bg-slate-800/80' : 'bg-white'}`}
                  style={{ minHeight: 0, flex: '1 1 0%' }}
                >
                  <div
                    className="chat-messages-scroll min-h-0 p-6 scroll-smooth flex-1"
                    style={{
                      overscrollBehavior: 'contain',
                      flex: '1 1 0%',
                      minHeight: 0,
                    }}
                  >
                    <div className="max-w-2xl mx-auto w-full space-y-5">
                    {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'psychologist' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] ${
                          msg.sender === 'psychologist'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-tr-sm'
                            : isDark ? 'bg-slate-700 text-slate-200 rounded-2xl rounded-tl-sm' : 'bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm'
                        } px-4 py-3`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender === 'psychologist'
                              ? 'text-white/70'
                              : isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                    ))}
                    <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>

                {otherUserTyping && (
                  <div className={`px-4 py-1.5 border-t shrink-0 ${isDark ? 'border-slate-600/50 bg-slate-800/50' : 'border-purple-100/50 bg-purple-50/30'}`}>
                    <p className={`text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {currentChat.name} está escribiendo...
                    </p>
                  </div>
                )}

                <div className={`p-4 border-t shrink-0 ${isDark ? 'border-slate-600/50 bg-slate-800/95' : 'border-purple-100/50 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDark ? 'hover:bg-slate-600/50' : 'hover:bg-purple-100/50'}`}>
                      <Paperclip className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                    </button>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => handleMessageInputChange(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Escribe un mensaje..."
                      className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-purple-200/50 bg-slate-50'}`}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!messageText.trim() || sending}
                      className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {!currentChat && !loading && (
              <div className={`flex-1 min-h-0 flex items-center justify-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Selecciona una conversación o crea una nueva
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
