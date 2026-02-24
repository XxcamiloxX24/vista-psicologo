import { Home, Calendar, MessageSquare, Activity, Info, Settings, Brain, Users } from 'lucide-react';

type Section = 'dashboard' | 'appointments' | 'messages' | 'followups' | 'students' | 'about' | 'settings';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as Section, label: 'Inicio', icon: Home },
    { id: 'appointments' as Section, label: 'Citas', icon: Calendar },
    { id: 'messages' as Section, label: 'Mensajes', icon: MessageSquare },
    { id: 'followups' as Section, label: 'Seguimientos', icon: Activity },
    { id: 'students' as Section, label: 'Aprendices', icon: Users },
    { id: 'about' as Section, label: 'Sobre Nosotros', icon: Info },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/95 backdrop-blur-xl border-r border-purple-100/50 shadow-lg z-40">
      <div className="flex flex-col h-full">
        {/* Logo & Brand */}
        <div className="p-6 border-b border-purple-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HealthyMind
              </h1>
              <p className="text-xs text-slate-500">SENA Institucional</p>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-purple-600/10 text-purple-700 shadow-sm border border-purple-200/50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-purple-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : ''}`} />
                <span className={isActive ? '' : ''}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Settings Button */}
        <div className="p-4 border-t border-purple-100/50">
          <button
            onClick={() => onSectionChange('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeSection === 'settings'
                ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-purple-600/10 text-purple-700 shadow-sm border border-purple-200/50'
                : 'text-slate-600 hover:bg-slate-50 hover:text-purple-600'
            }`}
          >
            <Settings className={`w-5 h-5 ${activeSection === 'settings' ? 'text-purple-600' : ''}`} />
            <span>Configuración</span>
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-purple-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
              <span>DR</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate text-slate-800">Dr. Paola Garizabalo</p>
              <p className="text-xs text-slate-500">Psicólogo</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}