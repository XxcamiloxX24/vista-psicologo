import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Plus, Edit, FileText, Loader2, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AppointmentModal } from './AppointmentModal';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getCitasAgenda, getSolicitudesPendientes, type CitaApi } from '../lib/citas';

interface AppointmentsProps {
  onViewCitaDetalle?: (cita: CitaApi) => void;
}
import type { EventClickArg } from '@fullcalendar/core';
import { CitasPendientes } from './CitasPendientes';

const ESTADO_COLORS: Record<string, { bg: string; border: string }> = {
  programada: { bg: '#3b82f6', border: '#2563eb' },
  reprogramada: { bg: '#f97316', border: '#ea580c' },
  realizada: { bg: '#22c55e', border: '#16a34a' },
  completada: { bg: '#22c55e', border: '#16a34a' },
  cancelada: { bg: '#64748b', border: '#475569' },
  'no asistió': { bg: '#ef4444', border: '#dc2626' },
};

type AppointmentStatus = 'completed' | 'rescheduled' | 'cancelled' | 'pending';

/** Cita unificada para el modal de detalle */
interface AppointmentDetail {
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

const STATUS_MAP: Record<string, AppointmentStatus> = {
  completada: 'completed',
  realizada: 'completed',
  reprogramada: 'rescheduled',
  cancelada: 'cancelled',
  pendiente: 'pending',
  programada: 'pending',
};

function parseStatus(estado: string | null | undefined): AppointmentStatus {
  if (!estado) return 'pending';
  const key = estado.trim().toLowerCase();
  return STATUS_MAP[key] ?? 'pending';
}

function getStudentName(c: CitaApi): string {
  const apRaw = c.aprendizCita as Record<string, unknown> | undefined;
  const ap = apRaw?.aprendiz ?? apRaw?.Aprendiz;
  if (!ap || typeof ap !== 'object') return 'Aprendiz';
  const apObj = ap as Record<string, unknown>;
  const n = apObj.nombres ?? apObj.Nombres;
  const a = apObj.apellidos ?? apObj.Apellidos;
  if (!n || !a) return 'Aprendiz';
  const pn = (n as { primerNombre?: string }).primerNombre ?? (n as Record<string, string>).PrimerNombre ?? '';
  const sn = (n as { segundoNombre?: string }).segundoNombre ?? (n as Record<string, string>).SegundoNombre ?? '';
  const pa = (a as { primerApellido?: string }).primerApellido ?? (a as Record<string, string>).PrimerApellido ?? '';
  const sa = (a as { segundoApellido?: string }).segundoApellido ?? (a as Record<string, string>).SegundoApellido ?? '';
  return [pn, sn, pa, sa].filter(Boolean).join(' ') || 'Aprendiz';
}

function getStudentEmail(c: CitaApi): string {
  const apRaw = c.aprendizCita as Record<string, unknown> | undefined;
  const ap = apRaw?.aprendiz ?? apRaw?.Aprendiz;
  if (!ap || typeof ap !== 'object') return '';
  const apObj = ap as Record<string, unknown>;
  const contact = apObj.contacto ?? apObj.Contacto;
  if (!contact || typeof contact !== 'object') return '';
  return (contact as { correoPersonal?: string }).correoPersonal
    ?? (contact as Record<string, string>).CorreoPersonal
    ?? (contact as { correoInstitucional?: string }).correoInstitucional
    ?? ''
}

function getFicha(c: CitaApi): string {
  const f = c.aprendizCita?.ficha ?? (c.aprendizCita as Record<string, unknown>)?.Ficha;
  if (!f || typeof f !== 'object') return '';
  const code = (f as { ficCodigo?: number }).ficCodigo ?? (f as Record<string, number>).FicCodigo;
  return code != null ? String(code) : '';
}

function getPsychologistName(c: CitaApi): string {
  const p = c.psicologo ?? (c as unknown as Record<string, unknown>).Psicologo;
  if (!p || typeof p !== 'object') return '';
  const n = (p as { psiNombre?: string }).psiNombre ?? (p as Record<string, string>).PsiNombre ?? '';
  const a = (p as { psiApellido?: string }).psiApellido ?? (p as Record<string, string>).PsiApellido ?? '';
  return [n, a].filter(Boolean).join(' ') || '';
}

function getCitaField<T>(c: Record<string, unknown>, camel: string, pascal: string): T | undefined {
  return (c[camel] ?? c[pascal]) as T | undefined;
}

function citaToEvent(c: CitaApi): { id: string; title: string; start: Date; end: Date; extendedProps: { cita: CitaApi } } {
  const r = c as unknown as Record<string, unknown>;
  const dateStr = getCitaField<string>(r, 'citFechaProgramada', 'CitFechaProgramada') ?? new Date().toISOString().split('T')[0];
  const startStr = (getCitaField<string>(r, 'citHoraInicio', 'CitHoraInicio') ?? '09:00').replace(/^(\d{1,2}:\d{2})(:\d{2})?$/, '$1');
  const endStr = (getCitaField<string>(r, 'citHoraFin', 'CitHoraFin') ?? '').replace(/^(\d{1,2}:\d{2})(:\d{2})?$/, '$1');
  const start = new Date(`${dateStr}T${startStr.includes(':') ? startStr : startStr + ':00'}:00`);
  let end: Date;
  if (endStr) {
    end = new Date(`${dateStr}T${endStr.includes(':') ? endStr : endStr + ':00'}:00`);
  } else {
    end = new Date(start);
    end.setMinutes(end.getMinutes() + 60);
  }
  if (isNaN(start.getTime())) end = new Date(start.getTime() + 60 * 60 * 1000);
  if (isNaN(end.getTime())) {
    end = new Date(start);
    end.setMinutes(end.getMinutes() + 60);
  }
  // Evitar start === end (mostraría "09:00 - 09:00")
  if (end.getTime() <= start.getTime()) {
    end = new Date(start);
    end.setMinutes(end.getMinutes() + 60);
  }
  const title = getStudentName(c);
  const codigo = getCitaField<number>(r, 'citCodigo', 'CitCodigo') ?? 0;
  const estado = (getCitaField<string>(r, 'citEstadoCita', 'CitEstadoCita') ?? '').trim().toLowerCase();
  const colors = ESTADO_COLORS[estado] ?? { bg: '#8b5cf6', border: '#7c3aed' };
  return {
    id: String(codigo),
    title: title || 'Cita',
    start,
    end,
    backgroundColor: colors.bg,
    borderColor: colors.border,
    extendedProps: { cita: c },
  };
}

function citaToDetail(c: CitaApi): AppointmentDetail {
  const r = c as unknown as Record<string, unknown>;
  const dateStr = getCitaField<string>(r, 'citFechaProgramada', 'CitFechaProgramada') ?? '';
  const startStr = (getCitaField<string>(r, 'citHoraInicio', 'CitHoraInicio') ?? '09:00').replace(/^(\d{1,2}:\d{2})(:\d{2})?$/, '$1');
  const endStr = (getCitaField<string>(r, 'citHoraFin', 'CitHoraFin') ?? '').replace(/^(\d{1,2}:\d{2})(:\d{2})?$/, '$1');
  const start = new Date(`${dateStr}T${startStr}:00`);
  let end = endStr ? new Date(`${dateStr}T${endStr}:00`) : new Date(start.getTime() + 60 * 60 * 1000);
  if (isNaN(end.getTime())) end = new Date(start.getTime() + 60 * 60 * 1000);
  const duration = Math.round((end.getTime() - start.getTime()) / 60000);
  const codigo = getCitaField<number>(r, 'citCodigo', 'CitCodigo') ?? 0;
  return {
    id: codigo,
    time: startStr,
    studentName: getStudentName(c),
    psychologist: getPsychologistName(c) || 'Psicólogo',
    duration,
    status: parseStatus(getCitaField<string>(r, 'citEstadoCita', 'CitEstadoCita')),
    ficha: getFicha(c),
    date: dateStr,
    notes: getCitaField<string>(r, 'citAnotaciones', 'CitAnotaciones') ?? undefined,
    studentEmail: getStudentEmail(c) || undefined,
    reason: getCitaField<string>(r, 'citMotivo', 'CitMotivo') ?? undefined,
  };
}

/** Datos mock para demostración cuando no hay API */
const MOCK_CITAS: CitaApi[] = (() => {
  const today = new Date().toISOString().split('T')[0];
  return [
    { citCodigo: 1, citFechaProgramada: today, citHoraInicio: '09:00', citHoraFin: '10:00', citMotivo: 'Seguimiento de ansiedad', citEstadoCita: 'completada', citAnotaciones: 'Mejoras significativas.', aprendizCita: { aprendiz: { nombres: { primerNombre: 'Ana', segundoNombre: '' }, apellidos: { primerApellido: 'García', segundoApellido: 'Pérez' }, contacto: { correoPersonal: 'ana.garcia@sena.edu.co' } }, ficha: { ficCodigo: 2589634 } }, psicologo: { psiNombre: 'Paola', psiApellido: 'Garizabalo' } },
    { citCodigo: 2, citFechaProgramada: today, citHoraInicio: '10:30', citHoraFin: '11:15', citMotivo: 'Primera consulta', citEstadoCita: 'pendiente', aprendizCita: { aprendiz: { nombres: { primerNombre: 'Carlos', segundoNombre: '' }, apellidos: { primerApellido: 'Rodríguez', segundoApellido: 'Martínez' }, contacto: { correoPersonal: 'carlos.rodriguez@sena.edu.co' } }, ficha: { ficCodigo: 2589635 } }, psicologo: { psiNombre: 'Paola', psiApellido: 'Garizabalo' } },
    { citCodigo: 3, citFechaProgramada: today, citHoraInicio: '14:00', citHoraFin: '15:00', citMotivo: 'Estrés académico', citEstadoCita: 'reprogramada', citAnotaciones: 'Reprogramada.', aprendizCita: { aprendiz: { nombres: { primerNombre: 'María', segundoNombre: '' }, apellidos: { primerApellido: 'López', segundoApellido: 'Santos' }, contacto: { correoPersonal: 'maria.lopez@sena.edu.co' } }, ficha: { ficCodigo: 2589636 } }, psicologo: { psiNombre: 'Paola', psiApellido: 'Garizabalo' } },
    { citCodigo: 4, citFechaProgramada: today, citHoraInicio: '16:00', citHoraFin: '16:45', citMotivo: 'Consulta de seguimiento', citEstadoCita: 'cancelada', aprendizCita: { aprendiz: { nombres: { primerNombre: 'Juan', segundoNombre: '' }, apellidos: { primerApellido: 'Martínez', segundoApellido: 'Díaz' }, contacto: { correoPersonal: 'juan.martinez@sena.edu.co' } }, ficha: { ficCodigo: 2589637 } }, psicologo: { psiNombre: 'Paola', psiApellido: 'Garizabalo' } },
  ];
})();

function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function Appointments({ onViewCitaDetalle }: AppointmentsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedStatus, setEditedStatus] = useState<AppointmentStatus>('pending');
  const [citas, setCitas] = useState<CitaApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);
  const [tab, setTab] = useState<'calendario' | 'pendientes'>('calendario');
  const [pendientesCount, setPendientesCount] = useState(0);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    if (tab === 'calendario') {
      getSolicitudesPendientes()
        .then((list) => setPendientesCount(list.length))
        .catch(() => setPendientesCount(0));
    }
  }, [tab]);

  const fetchCitas = useCallback(async (start: Date, end: Date) => {
    setLoading(true);
    setError(null);
    try {
      const desde = toYYYYMMDD(start);
      const hasta = toYYYYMMDD(end);
      const list = await getCitasAgenda(desde, hasta);
      setCitas(list);
      setUseMock(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las citas');
      setCitas(MOCK_CITAS);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDatesSet = useCallback((arg: { start: Date; end: Date }) => {
    fetchCitas(arg.start, arg.end);
  }, [fetchCitas]);

  const events = useMemo(() => {
    return citas
      .filter((c) => {
        const est = (getCitaField<string>(c as unknown as Record<string, unknown>, 'citEstadoCita', 'CitEstadoCita') ?? '').trim().toLowerCase();
        return est !== 'pendiente';
      })
      .map(citaToEvent);
  }, [citas]);

  const handleEventClick = (info: EventClickArg) => {
    const cita = info.event.extendedProps?.cita as CitaApi | undefined;
    if (!cita) return;
    if (onViewCitaDetalle) {
      onViewCitaDetalle(cita);
    } else {
      const detail = citaToDetail(cita);
      setSelectedAppointment(detail);
      setEditedNotes(detail.notes || '');
      setEditedStatus(detail.status);
      setShowDetailModal(true);
    }
  };

  const handleSaveAppointment = () => {
    if (selectedAppointment && useMock) {
      setCitas((prev) =>
        prev.map((c) => {
          const cod = getCitaField<number>(c as unknown as Record<string, unknown>, 'citCodigo', 'CitCodigo') ?? 0;
          return cod === selectedAppointment.id
            ? { ...c, citAnotaciones: editedNotes, citEstadoCita: editedStatus === 'completed' ? 'completada' : editedStatus === 'cancelled' ? 'cancelada' : editedStatus === 'rescheduled' ? 'reprogramada' : 'pendiente' }
            : c;
        })
      );
    }
    setShowDetailModal(false);
    setSelectedAppointment(null);
  };

  if (tab === 'pendientes') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-4xl mb-2 ${isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'}`}>
              Citas
            </h1>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}>
              Gestión de citas y agendamientos
            </p>
          </div>
          <button
            onClick={() => setTab('calendario')}
            className={`px-4 py-2 rounded-xl border transition-all ${
              isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-purple-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            ← Ver calendario
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('calendario')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Calendario
          </button>
          <button
            onClick={() => setTab('pendientes')}
            className={`px-4 py-2 rounded-xl text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700`}
          >
            Solicitudes pendientes
          </button>
        </div>
        <CitasPendientes onSuccess={() => getSolicitudesPendientes().then((l) => setPendientesCount(l.length)).catch(() => setPendientesCount(0))} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-4xl mb-2 ${isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'}`}>
            Citas
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}>
            Gestión de citas y agendamientos — vista semanal con duración
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendientesCount > 0 && (
            <button
              onClick={() => setTab('pendientes')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all"
            >
              <span className="font-medium">Solicitudes pendientes</span>
              <span className="flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-amber-500 text-white text-sm font-bold">
                {pendientesCount}
              </span>
            </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Nueva Cita
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setTab('calendario')}
          className={`px-4 py-2 rounded-xl text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700`}
        >
          Calendario
        </button>
        <button
          onClick={() => setTab('pendientes')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Solicitudes pendientes
          {pendientesCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500 text-white text-xs font-bold">
              {pendientesCount}
            </span>
          )}
        </button>
      </div>

      <div className={`flex flex-wrap gap-4 py-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: ESTADO_COLORS.programada.bg }} />
          Programada
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: ESTADO_COLORS.reprogramada.bg }} />
          Reprogramada
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: ESTADO_COLORS.realizada.bg }} />
          Realizada / Completada
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: ESTADO_COLORS.cancelada.bg }} />
          Cancelada
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: ESTADO_COLORS['no asistió'].bg }} />
          No asistió
        </span>
      </div>

      <div
        className={`rounded-2xl border overflow-hidden ${
          isDark ? 'bg-slate-800/90 border-slate-600/50' : 'bg-white/90 border-purple-100/50'
        }`}
      >
        <div className={`relative ${isDark ? 'fc-dark' : ''}`}>
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-800/80 rounded-2xl">
              <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            </div>
          )}
          <FullCalendar
              ref={calendarRef}
              plugins={[timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              locale={esLocale}
              headerToolbar={{
                left: 'today prev,next',
                center: 'title',
                right: 'timeGridWeek,timeGridDay,dayGridMonth,listWeek',
              }}
              buttonText={{
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                list: 'Lista',
              }}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              events={events}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              eventMaxStack={4}
              height="auto"
              eventDisplay="block"
              nowIndicator
              editable={false}
              selectable={false}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
              }}
              dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
              firstDay={1}
              themeSystem="standard"
              eventClassNames="!cursor-pointer"
            />
        </div>
      </div>

      {showDetailModal && selectedAppointment &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 2147483647, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          >
            <div
              className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
                isDark ? 'bg-slate-900 border border-slate-600' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 rounded-t-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Detalles de la Cita</h2>
                <button type="button" onClick={() => setShowDetailModal(false)} className="rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className={`rounded-xl p-6 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
                  <h3 className={`text-xl mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedAppointment.studentName}</h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ficha: {selectedAppointment.ficha}</p>
                  {selectedAppointment.studentEmail && (
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{selectedAppointment.studentEmail}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-50'}`}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fecha</p>
                    <p className={isDark ? 'text-white' : 'text-slate-800'}>
                      {new Date(selectedAppointment.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-50'}`}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Hora</p>
                    <p className={isDark ? 'text-white' : 'text-slate-800'}>{selectedAppointment.time}</p>
                  </div>
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-50'}`}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Duración</p>
                    <p className={isDark ? 'text-white' : 'text-slate-800'}>{selectedAppointment.duration} min</p>
                  </div>
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-50'}`}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Profesional</p>
                    <p className={isDark ? 'text-white' : 'text-slate-800'}>{selectedAppointment.psychologist}</p>
                  </div>
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-50'}`}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Motivo</p>
                    <p className={isDark ? 'text-white' : 'text-slate-800'}>{selectedAppointment.reason || '—'}</p>
                  </div>
                  <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-50'}`}>
                    <Label className={isDark ? 'text-slate-400' : ''}>Estado</Label>
                    <Select value={editedStatus} onValueChange={(v) => setEditedStatus(v as AppointmentStatus)}>
                      <SelectTrigger className={`mt-2 h-10 ${isDark ? 'border-slate-600 bg-slate-700 text-white' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={isDark ? 'bg-slate-700 border-slate-500' : ''}>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                        <SelectItem value="rescheduled">Reprogramada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    Bitácora de la Sesión
                  </Label>
                  <Textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Observaciones, notas y detalles..."
                    rows={6}
                    className={isDark ? 'bg-slate-800 border-slate-600 text-white' : ''}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
                  <Button variant="outline" onClick={() => setShowDetailModal(false)} className="flex-1 rounded-2xl">
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveAppointment} className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600">
                    <Edit className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      <AppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {error && (
        <div className={`rounded-xl p-4 flex items-center justify-between ${
          isDark ? 'bg-red-900/30 border border-red-500/50' : 'bg-red-50 border border-red-200'
        }`}>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => {
              setError(null);
              const now = new Date();
              const start = new Date(now);
              start.setDate(start.getDate() - 7);
              const end = new Date(now);
              end.setDate(end.getDate() + 30);
              fetchCitas(start, end);
            }}
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {useMock && !error && (
        <p className="text-xs text-slate-500 text-center">
          Mostrando datos de demostración. Verifica que la API esté disponible y que hayas iniciado sesión como psicólogo.
        </p>
      )}
    </div>
  );
}
