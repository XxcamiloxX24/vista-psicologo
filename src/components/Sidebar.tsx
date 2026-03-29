import { useState } from 'react';
import { Home, Calendar, MessageSquare, Activity, Info, Settings, Brain, Users, LogOut, Bell, LayoutGrid, SmilePlus, ClipboardList } from 'lucide-react';
import { usePsychologist } from '../contexts/PsychologistContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type Section =
  | 'dashboard'
  | 'appointments'
  | 'messages'
  | 'followups'
  | 'followups-create'
  | 'students'
  | 'cards-info'
  | 'cards-info-detail'
  | 'cards-info-create'
  | 'emotions-manager'
  | 'test-templates'
  | 'about'
  | 'settings'
  | 'profile-edit';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onLogout: () => void;
  /** Se llama al hacer clic en una notificación de chat; appointmentId para abrir ese chat */
  onNotificationChatClick?: (appointmentId?: number) => void;
}

export function Sidebar({ activeSection, onSectionChange, onLogout, onNotificationChatClick }: SidebarProps) {
  const { displayName, initials, profileImageUrl } = usePsychologist();
  const { resolvedTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const isDark = resolvedTheme === 'dark';
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [hoveredSettings, setHoveredSettings] = useState(false);
  const [hoveredNotifications, setHoveredNotifications] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuItems = [
    { id: 'dashboard' as Section, label: 'Inicio', icon: Home },
    { id: 'appointments' as Section, label: 'Citas', icon: Calendar },
    { id: 'messages' as Section, label: 'Mensajes', icon: MessageSquare },
    { id: 'followups' as Section, label: 'Seguimientos', icon: Activity },
    { id: 'students' as Section, label: 'Fichas', icon: Users },
    { id: 'cards-info' as Section, label: 'Tarjetas informativas', icon: LayoutGrid },
    { id: 'emotions-manager' as Section, label: 'Emociones', icon: SmilePlus },
    { id: 'test-templates' as Section, label: 'Plantillas de Test', icon: ClipboardList },
    { id: 'about' as Section, label: 'Sobre Nosotros', icon: Info },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-r border-purple-100/50 dark:border-slate-600/50 shadow-lg z-40">
      <div className="flex flex-col h-full">
        {/* Logo & Brand */}
        <div className="p-6 border-b border-purple-100/50 dark:border-slate-600/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HealthyMind
              </h1>
              <p className="text-xs text-slate-500" style={isDark ? { color: 'white' } : undefined}>SENA Institucional</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeSection === item.id ||
              (item.id === 'followups' && activeSection === 'followups-create') ||
              (item.id === 'cards-info' && (activeSection === 'cards-info-detail' || activeSection === 'cards-info-create'));
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-purple-600/10 text-purple-700 dark:text-purple-300 shadow-sm border-purple-200/50 dark:border-purple-500/30'
                    : hoveredNav === item.id
                    ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-purple-600/10 text-purple-600 dark:text-purple-300 shadow-sm border-purple-200/50 dark:border-purple-500/30'
                    : 'text-slate-600 border-transparent'
                }`}
                style={!isActive && !(hoveredNav === item.id) && isDark ? { color: 'white' } : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${isActive ? 'text-purple-600 dark:text-purple-400' : hoveredNav === item.id ? 'text-purple-600 dark:text-purple-400' : ''}`}
                  style={!isActive && !(hoveredNav === item.id) && isDark ? { color: 'white' } : undefined}
                />
                <span className="min-w-0 flex-1 text-left whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Configuración y Notificaciones */}
        <div className="p-4 border-t border-purple-100/50 dark:border-slate-600/50 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => onSectionChange('settings')}
              onMouseEnter={() => setHoveredSettings(true)}
              onMouseLeave={() => setHoveredSettings(false)}
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border ${
                activeSection === 'settings' || activeSection === 'profile-edit'
                  ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-purple-600/10 text-purple-700 dark:text-purple-300 shadow-sm border-purple-200/50 dark:border-purple-500/30'
                  : hoveredSettings
                  ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-purple-600/10 text-purple-600 dark:text-purple-300 shadow-sm border-purple-200/50 dark:border-purple-500/30'
                  : 'text-slate-600 border-transparent'
              }`}
              style={activeSection !== 'settings' && activeSection !== 'profile-edit' && !hoveredSettings && isDark ? { color: 'white' } : undefined}
            >
              <Settings
                className={`w-5 h-5 shrink-0 ${activeSection === 'settings' || activeSection === 'profile-edit' ? 'text-purple-600 dark:text-purple-400' : hoveredSettings ? 'text-purple-600 dark:text-purple-400' : ''}`}
                style={activeSection !== 'settings' && activeSection !== 'profile-edit' && !hoveredSettings && isDark ? { color: 'white' } : undefined}
              />
              <span>Configuración</span>
            </button>
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <button
                  onClick={() => setNotificationsOpen((v) => !v)}
                  onMouseEnter={() => setHoveredNotifications(true)}
                  onMouseLeave={() => setHoveredNotifications(false)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                    hoveredNotifications
                      ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-purple-600/10 text-purple-600 dark:text-purple-300 shadow-sm border border-purple-200/50 dark:border-purple-500/30'
                      : 'text-slate-600'
                  }`}
                  style={!hoveredNotifications && isDark ? { color: 'white' } : undefined}
                  title="Notificaciones"
                  aria-label="Ver notificaciones"
                >
                  <Bell className="w-5 h-5 shrink-0" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-0 rounded-xl border border-purple-200/50 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl"
                align="start"
                side="right"
                sideOffset={8}
              >
                <div className="p-3 border-b border-purple-100/50 dark:border-slate-600 flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Notificaciones</span>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Marcar todas leídas
                    </button>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                      No tienes notificaciones
                    </p>
                  ) : (
                    <ul className="divide-y divide-purple-100/50 dark:divide-slate-600">
                      {notifications.map((n) => (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => {
                              markAsRead(n.id);
                              onSectionChange('messages');
                              setNotificationsOpen(false);
                              onNotificationChatClick?.(n.appointmentId);
                            }}
                            className={`w-full text-left p-3 hover:bg-purple-50/50 dark:hover:bg-slate-700/50 transition-colors ${!n.read ? 'bg-purple-50/30 dark:bg-slate-700/30' : ''}`}
                          >
                            <p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                              {new Date(n.createdAt).toLocaleString('es-CO', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-purple-100/50 dark:border-slate-600/50">
          <div className="flex items-center gap-3">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt=""
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white shrink-0">
                <span>{initials}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate text-slate-800" style={isDark ? { color: 'white' } : undefined}>{displayName}</p>
              <p className="text-xs text-slate-500" style={isDark ? { color: 'white' } : undefined}>Psicólogo</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
              style={isDark ? { color: 'white' } : undefined}
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}