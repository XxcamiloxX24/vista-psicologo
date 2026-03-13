import { createPortal } from 'react-dom';
import { X, Calendar, Clock, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputBase = 'w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50';
const inputLight = 'border border-purple-200/50 bg-slate-50';
const inputDark = 'border border-slate-600 bg-slate-800 text-white placeholder:text-slate-400 [color-scheme:dark]';

export function AppointmentModal({ isOpen, onClose }: AppointmentModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 2147483647,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className={`relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl shadow-2xl ${
          isDark ? 'bg-slate-900 border border-slate-600' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl text-white">Agendar Nueva Cita</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Student Name */}
          <div>
            <label className={`flex items-center gap-2 text-sm mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
              <User className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              Nombre del Aprendiz
            </label>
            <input
              type="text"
              placeholder="Nombre completo"
              className={`${inputBase} ${isDark ? inputDark : inputLight}`}
            />
          </div>

          {/* Ficha */}
          <div>
            <label className={`text-sm mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Número de Ficha
            </label>
            <input
              type="text"
              placeholder="Ej: 2589634"
              className={`${inputBase} ${isDark ? inputDark : inputLight}`}
            />
          </div>

          {/* Date */}
          <div>
            <label className={`flex items-center gap-2 text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              <Calendar className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              Fecha
            </label>
            <input
              type="date"
              className={`${inputBase} ${isDark ? inputDark : inputLight}`}
            />
          </div>

          {/* Time */}
          <div>
            <label className={`flex items-center gap-2 text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              <Clock className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              Hora
            </label>
            <input
              type="time"
              className={`${inputBase} ${isDark ? inputDark : inputLight}`}
            />
          </div>

          {/* Duration */}
          <div>
            <label className={`text-sm mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Duración (minutos)
            </label>
            <Select defaultValue="30">
              <SelectTrigger
                className={`${inputBase} h-12 ${
                  isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-purple-200/50 bg-white text-slate-900'
                }`}
              >
                <SelectValue placeholder="Seleccione duración" />
              </SelectTrigger>
              <SelectContent
                className={`!z-[2147483648] !w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl ${
                  isDark ? '!bg-slate-700 border-slate-500 text-white settings-select-dark' : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                }`}
                style={isDark ? { backgroundColor: '#334155', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)', zIndex: 2147483648 } : { backgroundColor: '#fff', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)', zIndex: 2147483648 }}
              >
                <SelectItem value="30" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>30 minutos</SelectItem>
                <SelectItem value="45" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>45 minutos</SelectItem>
                <SelectItem value="60" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>60 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <label className={`text-sm mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Notas (opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Información adicional..."
              className={`${inputBase} resize-none ${isDark ? inputDark : inputLight}`}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className={`flex-1 px-6 py-3 rounded-xl transition-all ${
                isDark
                  ? 'border border-slate-600 text-slate-300 hover:bg-slate-700/50'
                  : 'border border-purple-200/50 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Cancelar
            </button>
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
              Agendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
