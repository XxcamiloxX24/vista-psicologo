import { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, MoreVertical, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  ficha: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'psychologist' | 'student';
  timestamp: string;
}

export function Messages() {
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      name: 'Ana García Pérez',
      lastMessage: 'Gracias por la sesión de hoy',
      timestamp: '10:30',
      unread: 2,
      ficha: '2589634'
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      lastMessage: 'Puedo reagendar mi cita?',
      timestamp: 'Ayer',
      unread: 0,
      ficha: '2589635'
    },
    {
      id: 3,
      name: 'María López Santos',
      lastMessage: 'He completado las actividades',
      timestamp: 'Ayer',
      unread: 1,
      ficha: '2589636'
    },
  ]);

  const [chatMessages, setChatMessages] = useState<{ [key: number]: Message[] }>({
    1: [
      {
        id: 1,
        text: 'Hola Dr. Rodríguez, buenos días',
        sender: 'student',
        timestamp: '09:15'
      },
      {
        id: 2,
        text: 'Buenos días Ana, ¿cómo te sientes hoy?',
        sender: 'psychologist',
        timestamp: '09:16'
      },
      {
        id: 3,
        text: 'Mucho mejor, he estado practicando las técnicas que me enseñó',
        sender: 'student',
        timestamp: '09:18'
      },
      {
        id: 4,
        text: 'Me alegra escuchar eso. ¿Has tenido alguna dificultad?',
        sender: 'psychologist',
        timestamp: '09:20'
      },
      {
        id: 5,
        text: 'No, todo ha ido bien. Gracias por la sesión de hoy',
        sender: 'student',
        timestamp: '10:30'
      },
    ],
    2: [
      {
        id: 1,
        text: 'Hola doctor, puedo reagendar mi cita?',
        sender: 'student',
        timestamp: 'Ayer 14:30'
      }
    ],
    3: [
      {
        id: 1,
        text: 'He completado las actividades que me asignó',
        sender: 'student',
        timestamp: 'Ayer 16:45'
      }
    ]
  });

  const [newChat, setNewChat] = useState({
    studentName: '',
    ficha: ''
  });

  const availableStudents = [
    { name: 'Juan Martínez Díaz', ficha: '2589637' },
    { name: 'Laura Pérez González', ficha: '2589638' },
    { name: 'Pedro González Ruiz', ficha: '2589639' },
    { name: 'Sofia Ramírez Torres', ficha: '2589640' },
    { name: 'Diego Hernández Silva', ficha: '2589641' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, selectedChat]);

  const handleSend = () => {
    if (!messageText.trim() || selectedChat === null) return;

    const now = new Date();
    const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newMessage: Message = {
      id: (chatMessages[selectedChat]?.length || 0) + 1,
      text: messageText,
      sender: 'psychologist',
      timestamp
    };

    setChatMessages({
      ...chatMessages,
      [selectedChat]: [...(chatMessages[selectedChat] || []), newMessage]
    });

    // Update last message in chat list
    setChats(chats.map(chat => 
      chat.id === selectedChat 
        ? { ...chat, lastMessage: messageText, timestamp }
        : chat
    ));

    setMessageText('');
  };

  const handleCreateChat = () => {
    if (!newChat.studentName || !newChat.ficha) {
      alert('Por favor complete todos los campos');
      return;
    }

    const newChatId = Math.max(...chats.map(c => c.id)) + 1;
    const newChatObj: Chat = {
      id: newChatId,
      name: newChat.studentName,
      ficha: newChat.ficha,
      lastMessage: 'Nueva conversación',
      timestamp: 'Ahora',
      unread: 0
    };

    setChats([newChatObj, ...chats]);
    setChatMessages({ ...chatMessages, [newChatId]: [] });
    setSelectedChat(newChatId);
    setShowNewChatModal(false);
    setNewChat({ studentName: '', ficha: '' });
  };

  const currentChat = chats.find(c => c.id === selectedChat);
  const messages = selectedChat ? (chatMessages[selectedChat] || []) : [];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.ficha.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Mensajes
          </h1>
          <p className="text-slate-600">Comunicación con aprendices</p>
        </div>
        <Button
          onClick={() => setShowNewChatModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Conversación
        </Button>
      </div>

      {/* New Chat Modal */}
      <Dialog open={showNewChatModal} onOpenChange={setShowNewChatModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nueva Conversación
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Seleccionar Aprendiz</Label>
              <Select 
                value={newChat.studentName} 
                onValueChange={(value) => {
                  const student = availableStudents.find(s => s.name === value);
                  setNewChat({ studentName: value, ficha: student?.ficha || '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un aprendiz" />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.map((student) => (
                    <SelectItem key={student.ficha} value={student.name}>
                      {student.name} - Ficha: {student.ficha}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNewChatModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateChat}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all"
              >
                Crear Conversación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100/50 shadow-sm overflow-hidden h-[calc(100vh-240px)]">
        <div className="grid grid-cols-3 h-full">
          {/* Chat List */}
          <div className="border-r border-purple-100/50 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-purple-100/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar conversaciones..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50 text-sm"
                />
              </div>
            </div>

            {/* Chats */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full p-4 border-b border-purple-100/50 hover:bg-purple-50/50 transition-all text-left ${
                    selectedChat === chat.id ? 'bg-purple-50/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-slate-800 text-sm">{chat.name}</h3>
                    <span className="text-xs text-slate-500">{chat.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 truncate flex-1">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="ml-2 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Ficha: {chat.ficha}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="col-span-2 flex flex-col">
            {/* Chat Header */}
            {currentChat && (
              <div className="p-4 border-b border-purple-100/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-slate-800">{currentChat.name}</h2>
                    <p className="text-xs text-slate-500">Ficha: {currentChat.ficha}</p>
                  </div>
                  <button className="w-8 h-8 rounded-lg hover:bg-purple-100/50 flex items-center justify-center transition-all">
                    <MoreVertical className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'psychologist' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      msg.sender === 'psychologist'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm'
                    } px-4 py-3`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === 'psychologist' ? 'text-white/70' : 'text-slate-500'
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-purple-100/50">
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-xl hover:bg-purple-100/50 flex items-center justify-center transition-all">
                  <Paperclip className="w-5 h-5 text-slate-600" />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-3 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50"
                />
                <button
                  onClick={handleSend}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}