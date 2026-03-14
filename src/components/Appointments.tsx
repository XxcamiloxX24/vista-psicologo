import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, Plus, Check, X, RotateCcw, ChevronLeft, ChevronRight, Edit, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AppointmentModal } from './AppointmentModal.tsx';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type AppointmentStatus = 'completed' | 'rescheduled' | 'cancelled' | 'pending';

interface Appointment {
  id: number;
  time: string;
  studentName: string;
  psychologist: string;
  duration: number;
  status: AppointmentStatus;
  ficha: string;
  date: string;
  notes?: string;
  studentEmail?: string;
  reason?: string;
}

export function Appointments() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedStatus, setEditedStatus] = useState<AppointmentStatus>('pending');

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      time: '09:00',
      studentName: 'Ana García Pérez',
      psychologist: 'Dr. Paola Garizabalo',
      duration: 60,
      status: 'completed',
      ficha: '2589634',
      date: new Date().toISOString().split('T')[0],
      studentEmail: 'ana.garcia@sena.edu.co',
      reason: 'Seguimiento de ansiedad',
      notes: 'Paciente mostró mejoras significativas en el manejo de ansiedad. Se practicaron técnicas de respiración y mindfulness. Recomiendo continuar con sesiones semanales.'
    },
    {
      id: 2,
      time: '10:30',
      studentName: 'Carlos Rodríguez Martínez',
      psychologist: 'Dr. Paola Garizabalo',
      duration: 45,
      status: 'pending',
      ficha: '2589635',
      date: new Date().toISOString().split('T')[0],
      studentEmail: 'carlos.rodriguez@sena.edu.co',
      reason: 'Primera consulta'
    },
    {
      id: 3,
      time: '14:00',
      studentName: 'María López Santos',
      psychologist: 'Dr. Paola Garizabalo',
      duration: 60,
      status: 'rescheduled',
      ficha: '2589636',
      date: new Date().toISOString().split('T')[0],
      studentEmail: 'maria.lopez@sena.edu.co',
      reason: 'Estrés académico',
      notes: 'Cita reprogramada a solicitud del estudiante por conflicto académico.'
    },
    {
      id: 4,
      time: '16:00',
      studentName: 'Juan Martínez Díaz',
      psychologist: 'Dr. Paola Garizabalo',
      duration: 45,
      status: 'cancelled',
      ficha: '2589637',
      date: new Date().toISOString().split('T')[0],
      studentEmail: 'juan.martinez@sena.edu.co',
      reason: 'Consulta de seguimiento',
      notes: 'Cita cancelada por inasistencia del estudiante.'
    }
  ]);

  const handleOpenDetail = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setEditedNotes(apt.notes || '');
    setEditedStatus(apt.status);
    setShowDetailModal(true);
  };

  const handleSaveAppointment = () => {
    if (selectedAppointment) {
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id
          ? { ...apt, notes: editedNotes, status: editedStatus }
          : apt
      ));
      setShowDetailModal(false);
      setSelectedAppointment(null);
    }
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const changeYear = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(newDate.getFullYear() + delta);
    setSelectedDate(newDate);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const badges = {
      completed: { color: 'bg-green-100 text-green-700 border-green-200', icon: Check, label: 'Completada' },
      rescheduled: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: RotateCcw, label: 'Reprogramada' },
      cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: X, label: 'Cancelada' },
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pendiente' }
    };
    
    const badge = badges[status];
    const Icon = badge.icon;
    
    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs border ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  // Simple calendar for date selection
  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysArray = [];
    
    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysArray.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push(new Date(year, month, i));
    }
    
    return daysArray;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Filter appointments for selected date
  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-4xl mb-2 ${isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'}`}>
            Citas
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}>Gestión de citas y agendamientos</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 dark:border-slate-600/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className={isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}>Calendario</h2>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => changeYear(-1)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              <ChevronLeft className={`w-4 h-4 ${isDark ? 'text-white' : 'text-slate-600'}`} />
            </button>
            <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>
              {selectedDate.getFullYear()}
            </p>
            <button
              onClick={() => changeYear(1)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              <ChevronRight className={`w-4 h-4 ${isDark ? 'text-white' : 'text-slate-600'}`} />
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-600'}`} />
            </button>
            <p className={`text-sm capitalize ${isDark ? 'text-white' : 'text-slate-600'}`}>
              {selectedDate.toLocaleDateString('es-ES', { month: 'long' })}
            </p>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              <ChevronRight className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-600'}`} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
              <div key={i} className={`text-center text-xs py-2 ${isDark ? 'text-white' : 'text-slate-500'}`}>
                {day}
              </div>
            ))}
            {getDaysInMonth().map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} className="aspect-square" />;
              }
              
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = day.toDateString() === selectedDate.toDateString();
              const hasAppointments = appointments.some(apt => {
                const aptDate = new Date(apt.date);
                return aptDate.toDateString() === day.toDateString();
              });
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square rounded-lg text-sm transition-all relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : isToday
                      ? isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                      : isDark
                      ? 'hover:bg-slate-700 text-slate-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {day.getDate()}
                  {hasAppointments && !isSelected && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 dark:border-slate-600/50 shadow-sm">
          <div className="mb-6">
            <h2 className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>Citas del día</h2>
            <p className={`text-sm capitalize ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>{formatDate(selectedDate)}</p>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className={isDark ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}>No hay citas programadas para este día</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`rounded-xl p-5 border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-transparent border-slate-600/50 hover:border-slate-500/50'
                      : 'bg-gradient-to-r from-slate-50 to-purple-50/30 border-purple-100/50 hover:border-purple-200/50'
                  }`}
                  onClick={() => handleOpenDetail(apt)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className={`mb-1 ${isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{apt.studentName}</h3>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Ficha: {apt.ficha}</p>
                      </div>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>

                  <div className={`grid grid-cols-3 gap-4 mt-4 pt-4 border-t ${isDark ? 'border-slate-600/50' : 'border-purple-100/50'}`}>
                    <div>
                      <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Hora</p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{apt.time}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Profesional</p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{apt.psychologist}</p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Duración</p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{apt.duration} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex: 2147483647,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
              isDark ? 'bg-slate-900 border border-slate-600' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 rounded-t-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Detalles de la Cita</h2>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
            <div className="space-y-6">
              {/* Patient Info */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
                <div>
                  <h3 className={`text-xl mb-1 ${isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{selectedAppointment.studentName}</h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>Ficha: {selectedAppointment.ficha}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>{selectedAppointment.studentEmail}</p>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Fecha</p>
                    <p className={isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}>
                      {new Date(selectedAppointment.date).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Hora</p>
                    <p className={isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}>{selectedAppointment.time}</p>
                  </div>

                  <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Duración</p>
                    <p className={isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}>{selectedAppointment.duration} minutos</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Profesional</p>
                    <p className={isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}>{selectedAppointment.psychologist}</p>
                  </div>

                  <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>Motivo</p>
                    <p className={isDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}>{selectedAppointment.reason}</p>
                  </div>

                  <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                    <Label htmlFor="status" className={isDark ? 'text-slate-400' : ''}>Estado de la Cita</Label>
                    <Select value={editedStatus} onValueChange={(v) => setEditedStatus(v as AppointmentStatus)}>
                      <SelectTrigger
                        id="status"
                        className={`mt-2 h-10 ${isDark ? 'border-slate-600 bg-slate-700 text-white' : ''}`}
                      >
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                      <SelectContent
                        className={`!z-[2147483648] !w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl ${
                          isDark ? '!bg-slate-700 border-slate-500 text-white settings-select-dark' : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                        }`}
                        style={isDark ? { backgroundColor: '#334155', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)', zIndex: 2147483648 } : { backgroundColor: '#fff', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)', zIndex: 2147483648 }}
                      >
                        <SelectItem value="pending" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>Pendiente</SelectItem>
                        <SelectItem value="completed" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>Completada</SelectItem>
                        <SelectItem value="rescheduled" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>Reprogramada</SelectItem>
                        <SelectItem value="cancelled" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notes/Bitacora */}
              <div className="space-y-2">
                <Label htmlFor="notes" className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : ''}`}>
                  <FileText className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  Bitácora de la Sesión
                </Label>
                <Textarea
                  id="notes"
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Escriba las observaciones, notas y detalles de la sesión..."
                  rows={8}
                  className={`resize-none ${
                    isDark ? '!bg-slate-800 border-slate-600 text-white placeholder:text-slate-400' : ''
                  }`}
                  style={isDark ? { color: 'white' } : undefined}
                />
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Registre aquí los puntos importantes discutidos, el progreso del aprendiz, recomendaciones y próximos pasos.
                </p>
              </div>

              {/* Actions */}
              <div className={`flex gap-3 pt-4 border-t ${isDark ? 'border-slate-600' : ''}`}>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className={`flex-1 rounded-2xl ${
                    isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700/50' : ''
                  }`}
                >
                  Cancelar
                </Button>
                <button
                  type="button"
                  onClick={handleSaveAppointment}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white font-medium hover:shadow-lg transition-all"
                >
                  <Edit className="w-4 h-4 shrink-0" strokeWidth={2} />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
        document.body
      )}

      <AppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}