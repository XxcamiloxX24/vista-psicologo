import { useState } from 'react';
import { Calendar, Clock, User, Plus, Check, X, RotateCcw, ChevronLeft, ChevronRight, Edit, FileText } from 'lucide-react';
import { AppointmentModal } from './AppointmentModal.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

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
          <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Citas
          </h1>
          <p className="text-slate-600">Gestión de citas y agendamientos</p>
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
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800">Calendario</h2>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => changeYear(-1)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <p className="text-sm text-slate-700">
              {selectedDate.getFullYear()}
            </p>
            <button
              onClick={() => changeYear(1)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <p className="text-sm text-slate-600 capitalize">
              {selectedDate.toLocaleDateString('es-ES', { month: 'long' })}
            </p>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs text-slate-500 py-2">
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
                      ? 'bg-purple-100 text-purple-700'
                      : 'hover:bg-slate-100 text-slate-700'
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
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl text-slate-800 mb-2">Citas del día</h2>
            <p className="text-sm text-slate-500 capitalize">{formatDate(selectedDate)}</p>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No hay citas programadas para este día</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-xl p-5 border border-purple-100/50 hover:border-purple-200/50 transition-all cursor-pointer"
                  onClick={() => handleOpenDetail(apt)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-slate-800 mb-1">{apt.studentName}</h3>
                        <p className="text-sm text-slate-500">Ficha: {apt.ficha}</p>
                      </div>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-purple-100/50">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Hora</p>
                      <p className="text-sm text-slate-800">{apt.time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Profesional</p>
                      <p className="text-sm text-slate-800">{apt.psychologist}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Duración</p>
                      <p className="text-sm text-slate-800">{apt.duration} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Detalles de la Cita
            </DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl text-slate-800 mb-1">{selectedAppointment.studentName}</h3>
                    <p className="text-sm text-slate-600">Ficha: {selectedAppointment.ficha}</p>
                    <p className="text-sm text-slate-600">{selectedAppointment.studentEmail}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
                    {selectedAppointment.studentName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">Fecha</p>
                    <p className="text-slate-800">
                      {new Date(selectedAppointment.date).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">Hora</p>
                    <p className="text-slate-800">{selectedAppointment.time}</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">Duración</p>
                    <p className="text-slate-800">{selectedAppointment.duration} minutos</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">Profesional</p>
                    <p className="text-slate-800">{selectedAppointment.psychologist}</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">Motivo</p>
                    <p className="text-slate-800">{selectedAppointment.reason}</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <Label htmlFor="status">Estado de la Cita</Label>
                    <Select value={editedStatus} onValueChange={(value) => setEditedStatus(value as AppointmentStatus)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                        <SelectItem value="rescheduled">Reprogramada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notes/Bitacora */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Bitácora de la Sesión
                </Label>
                <Textarea
                  id="notes"
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Escriba las observaciones, notas y detalles de la sesión..."
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-slate-500">
                  Registre aquí los puntos importantes discutidos, el progreso del aprendiz, recomendaciones y próximos pasos.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveAppointment}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg transition-all"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}