import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, Send, Paperclip, MoreVertical, Plus, X } from 'lucide-react';
import { Label } from './ui/label';
import {
  createRoom,
  getConversations,
  getChatHistory,
  getSocketConfig,
  type Conversation,
  type ChatMessage,
} from '../lib/chat';
import { listarSeguimientos } from '../lib/seguimiento';
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
  };
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

export function Messages() {
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

  const [newChat, setNewChat] = useState({ apprenticeId: 0, apprenticeName: '', ficha: '', area: 'General' });
  const [availableApprentices, setAvailableApprentices] = useState<{ aprCodigo: number; name: string; ficha: string }[]>([]);
  const [loadingApprentices, setLoadingApprentices] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<number | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
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

  // Cargar aprendices para nuevo chat (desde seguimientos)
  useEffect(() => {
    if (showNewChatModal) {
      setLoadingApprentices(true);
      listarSeguimientos(1, 100)
        .then((res) => {
          const list: { aprCodigo: number; name: string; ficha: string }[] = [];
          const seen = new Set<number>();
          for (const r of res.resultados ?? []) {
            const codigo = r.aprendiz?.aprendiz?.codigo;
            if (codigo == null || seen.has(codigo)) continue;
            seen.add(codigo);
            const n = r.aprendiz?.aprendiz?.nombres;
            const a = r.aprendiz?.aprendiz?.apellidos;
            const firstName = (n?.primerNombre ?? n?.segundoNombre ?? '') as string;
            const secondName = (n?.segundoNombre ?? '') as string;
            const firstLastName = (a?.primerApellido ?? a?.segundoApellido ?? '') as string;
            const secondLastName = (a?.segundoApellido ?? '') as string;
            const name = [firstName, secondName, firstLastName, secondLastName].filter(Boolean).join(' ').trim() || 'Aprendiz';
            const ficha = String(r.aprendiz?.ficha?.ficCodigo ?? '');
            list.push({ aprCodigo: codigo, name, ficha });
          }
          setAvailableApprentices(list);
        })
        .catch(() => setAvailableApprentices([]))
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
  }, [selectedChat, psychologistId, chats, socketEpoch]);

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

    socketRef.current.emit('send_message', {
      appointmentId: selectedChat,
      content: text,
      type: 'text',
    });

    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat ? { ...c, lastMessage: text, timestamp: 'Ahora' } : c
      )
    );
    setSending(false);
  };

  const handleCreateChat = async () => {
    if (!newChat.apprenticeId || !newChat.apprenticeName) {
      alert('Por favor seleccione un aprendiz');
      return;
    }

    setCreating(true);
    try {
      const { appointmentId } = await createRoom({
        apprenticeId: newChat.apprenticeId,
        area: newChat.area,
        apprenticeName: newChat.apprenticeName,
        ficha: newChat.ficha,
      });

      const newChatObj: Chat = {
        id: appointmentId,
        name: newChat.apprenticeName,
        ficha: newChat.ficha,
        lastMessage: 'Nueva conversación',
        timestamp: 'Ahora',
        unread: 0,
        appointmentId,
      };

      setChats((prev) => [newChatObj, ...prev]);
      setChatMessages((prev) => ({ ...prev, [appointmentId]: [] }));
      setSelectedChat(appointmentId);
      setShowNewChatModal(false);
      setNewChat({ apprenticeId: 0, apprenticeName: '', ficha: '', area: 'General' });

      socketRef.current?.emit('join_chat', { appointmentId });
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
  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.ficha.includes(searchTerm)
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
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
                  <Label htmlFor="student">Seleccionar Aprendiz</Label>
                  <select
                    id="student"
                    value={newChat.apprenticeId}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      const ap = availableApprentices.find((a) => a.aprCodigo === v);
                      setNewChat({
                        apprenticeId: v,
                        apprenticeName: ap?.name ?? '',
                        ficha: ap?.ficha ?? '',
                        area: newChat.area,
                      });
                    }}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-purple-200/50 bg-slate-50'}`}
                  >
                    <option value={0}>Seleccione un aprendiz</option>
                    {availableApprentices.map((ap) => (
                      <option key={ap.aprCodigo} value={ap.aprCodigo}>
                        {ap.name} - Ficha: {ap.ficha}
                      </option>
                    ))}
                  </select>
                  {loadingApprentices && (
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cargando aprendices...</p>
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
                    disabled={creating || !newChat.apprenticeId}
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

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div
          className={`grid grid-cols-3 flex-1 min-h-0 backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-800/90 border-slate-600/50' : 'bg-white/90 border-purple-100/50'}`}
          style={{ minHeight: 0, gridTemplateRows: 'minmax(0, 1fr)' }}
        >
          {/* Lista de chats */}
          <div
            className={`border-r flex flex-col min-h-0 ${isDark ? 'border-slate-600/50' : 'border-purple-100/50'}`}
            style={isDark ? { backgroundColor: 'rgb(51 65 85)' } : undefined}
          >
            <div className={`p-4 border-b shrink-0 ${isDark ? 'border-slate-600/50' : 'border-purple-100/50'}`}>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar conversaciones..."
                  className={`w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm ${isDark ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-purple-200/50 bg-slate-50'}`}
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

          {/* Ventana de chat */}
          <div className={`col-span-2 flex flex-col min-h-0 overflow-hidden ${isDark ? 'bg-slate-800/95' : 'bg-white'}`}>
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
                    <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDark ? 'hover:bg-slate-600/50' : 'hover:bg-purple-100/50'}`}>
                      <MoreVertical className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                    </button>
                  </div>
                </div>

                <div className={`flex-1 min-h-0 overflow-y-auto p-6 space-y-4 ${isDark ? 'bg-slate-800/80' : 'bg-white'}`}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'psychologist' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] ${
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
