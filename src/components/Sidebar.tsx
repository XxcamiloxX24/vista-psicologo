import { useState } from 'react';
import { Home, Calendar, MessageSquare, Activity, Info, Settings, Brain, Users, LogOut } from 'lucide-react';
import { usePsychologist } from '../contexts/PsychologistContext';
import { useTheme } from '../contexts/ThemeContext';

type Section = 'dashboard' | 'appointments' | 'messages' | 'followups' | 'students' | 'about' | 'settings' | 'profile-edit';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onLogout: () => void;
}

export function Sidebar({ activeSection, onSectionChange, onLogout }: SidebarProps) {
  const { displayName, initials, profileImageUrl } = usePsychologist();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [hoveredSettings, setHoveredSettings] = useState(false);
  const menuItems = [
    { id: 'dashboard' as Section, label: 'Inicio', icon: Home },
    { id: 'appointments' as Section, label: 'Citas', icon: Calendar },
    { id: 'messages' as Section, label: 'Mensajes', icon: MessageSquare },
    { id: 'followups' as Section, label: 'Seguimientos', icon: Activity },
    { id: 'students' as Section, label: 'Aprendices', icon: Users },
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
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-purple-600/10 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200/50 dark:border-purple-500/30'
                    : hoveredNav === item.id
                    ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-purple-600/10 text-purple-600 dark:text-purple-300 shadow-sm border border-purple-200/50 dark:border-purple-500/30'
                    : 'text-slate-600'
                }`}
                style={!isActive && !(hoveredNav === item.id) && isDark ? { color: 'white' } : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${isActive ? 'text-purple-600 dark:text-purple-400' : hoveredNav === item.id ? 'text-purple-600 dark:text-purple-400' : ''}`}
                  style={!isActive && !(hoveredNav === item.id) && isDark ? { color: 'white' } : undefined}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Settings Button */}
        <div className="p-4 border-t border-purple-100/50 dark:border-slate-600/50">
          <button
            onClick={() => onSectionChange('settings')}
            onMouseEnter={() => setHoveredSettings(true)}
            onMouseLeave={() => setHoveredSettings(false)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeSection === 'settings' || activeSection === 'profile-edit'
                ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-purple-600/10 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200/50 dark:border-purple-500/30'
                : hoveredSettings
                ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-purple-600/10 text-purple-600 dark:text-purple-300 shadow-sm border border-purple-200/50 dark:border-purple-500/30'
                : 'text-slate-600'
            }`}
            style={activeSection !== 'settings' && activeSection !== 'profile-edit' && !hoveredSettings && isDark ? { color: 'white' } : undefined}
          >
            <Settings
              className={`w-5 h-5 shrink-0 ${activeSection === 'settings' || activeSection === 'profile-edit' ? 'text-purple-600 dark:text-purple-400' : hoveredSettings ? 'text-purple-600 dark:text-purple-400' : ''}`}
              style={activeSection !== 'settings' && activeSection !== 'profile-edit' && !hoveredSettings && isDark ? { color: 'white' } : undefined}
            />
            <span>Configuración</span>
          </button>
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