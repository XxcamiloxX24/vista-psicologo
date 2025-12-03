import { X, Calendar, Clock, User } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentModal({ isOpen, onClose }: AppointmentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
            <label className="flex items-center gap-2 text-sm text-slate-700 mb-2">
              <User className="w-4 h-4 text-purple-600" />
              Nombre del Aprendiz
            </label>
            <input
              type="text"
              placeholder="Nombre completo"
              className="w-full px-4 py-3 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50"
            />
          </div>

          {/* Ficha */}
          <div>
            <label className="text-sm text-slate-700 mb-2 block">
              Número de Ficha
            </label>
            <input
              type="text"
              placeholder="Ej: 2589634"
              className="w-full px-4 py-3 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50"
            />
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-700 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              Fecha
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50"
            />
          </div>

          {/* Time */}
          <div>
            <label className="flex items-center gap-2 text-sm text-slate-700 mb-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Hora
            </label>
            <input
              type="time"
              className="w-full px-4 py-3 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm text-slate-700 mb-2 block">
              Duración (minutos)
            </label>
            <select className="w-full px-4 py-3 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50">
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">60 minutos</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm text-slate-700 mb-2 block">
              Notas (opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Información adicional..."
              className="w-full px-4 py-3 rounded-xl border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-50 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-purple-200/50 text-slate-700 hover:bg-slate-50 transition-all"
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
}
