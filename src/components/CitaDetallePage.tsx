import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, FileText, Edit, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  editarCita,
  type CitaApi,
  getCitaFieldFromApi,
  getStudentNameFromCita,
  getStudentEmailFromCita,
  getFichaFromCita,
  getPsychologistNameFromCita,
} from '../lib/citas';

const STATUS_UI_TO_API: Record<string, string> = {
  pending: 'pendiente',
  completed: 'completada',
  rescheduled: 'reprogramada',
  cancelled: 'cancelada',
};

const STATUS_API_TO_UI: Record<string, string> = {
  pendiente: 'pending',
  realizada: 'completed',
  completada: 'completed',
  reprogramada: 'rescheduled',
  cancelada: 'cancelled',
  programada: 'pending',
};

export interface CitaDetalleConfig {
  cita: CitaApi;
}

interface CitaDetallePageProps {
  config: CitaDetalleConfig;
  onBack: (refreshed?: boolean) => void;
}

/** Textarea que se auto-ajusta al contenido y permite redimensionar manualmente */
function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  className,
  minRows = 4,
  maxHeight = 400,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  maxHeight?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineHeight = 24;
    const minH = minRows * lineHeight;
    const newHeight = Math.min(Math.max(ta.scrollHeight, minH), maxHeight);
    ta.style.height = `${newHeight}px`;
    ta.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden';
  }, [minRows, maxHeight]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      rows={minRows}
      style={{ resize: 'vertical', minHeight: `${minRows * 24}px` }}
    />
  );
}

export function CitaDetallePage({ config, onBack }: CitaDetallePageProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { cita } = config;

  const dateStr = getCitaFieldFromApi<string>(cita, 'citFechaProgramada', 'CitFechaProgramada') ?? '';
  const startStr = (getCitaFieldFromApi<string>(cita, 'citHoraInicio', 'CitHoraInicio') ?? '09:00').replace(
    /^(\d{1,2}:\d{2})(:\d{2})?$/,
    '$1'
  );
  const endStr = (getCitaFieldFromApi<string>(cita, 'citHoraFin', 'CitHoraFin') ?? '').replace(
    /^(\d{1,2}:\d{2})(:\d{2})?$/,
    '$1'
  );
  const startDate = dateStr ? new Date(`${dateStr}T${startStr}:00`) : null;
  const endDate = endStr && dateStr ? new Date(`${dateStr}T${endStr}:00`) : startDate ? new Date(startDate.getTime() + 60 * 60 * 1000) : null;
  const duration =
    startDate && endDate && !isNaN(endDate.getTime())
      ? Math.round((endDate.getTime() - startDate.getTime()) / 60000)
      : 60;

  const estadoApi = (getCitaFieldFromApi<string>(cita, 'citEstadoCita', 'CitEstadoCita') ?? '').trim().toLowerCase();
  const estadoUi = STATUS_API_TO_UI[estadoApi] ?? 'pending';

  const [editedNotes, setEditedNotes] = useState(getCitaFieldFromApi<string>(cita, 'citAnotaciones', 'CitAnotaciones') ?? '');
  const [editedStatus, setEditedStatus] = useState(estadoUi);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const id = getCitaFieldFromApi<number>(cita, 'citCodigo', 'CitCodigo');
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await editarCita(id, {
        citFechaProgramada: dateStr,
        citHoraInicio: startStr,
        citHoraFin: endStr,
        citTipoCita: getCitaFieldFromApi<string>(cita, 'citTipoCita', 'CitTipoCita') ?? 'presencial',
        citEstadoCita: STATUS_UI_TO_API[editedStatus] ?? estadoApi,
        citMotivo: getCitaFieldFromApi<string>(cita, 'citMotivo', 'CitMotivo') ?? undefined,
        citAnotaciones: editedNotes,
      });
      onBack(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onBack()}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            isDark ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al calendario
        </button>
      </div>

      <div
        className={`rounded-2xl overflow-hidden border-2 ${
          isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200 shadow-lg'
        }`}
      >
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-4">
          <h1 className="text-2xl font-semibold text-white">Detalles de la Cita</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Datos del estudiante */}
          <div
            className={`rounded-xl p-6 ${
              isDark ? 'bg-slate-800/50 border border-slate-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-slate-200'
            }`}
          >
            <h2 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {getStudentNameFromCita(cita)}
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ficha: {getFichaFromCita(cita)}</p>
            {getStudentEmailFromCita(cita) && (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{getStudentEmailFromCita(cita)}</p>
            )}
          </div>

          {/* Datos de la cita */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800/50 border border-slate-600' : 'bg-slate-50 border border-slate-200'}`}>
              <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fecha</p>
              <p className={isDark ? 'text-white' : 'text-slate-800'}>
                {dateStr
                  ? new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                  : '—'}
              </p>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800/50 border border-slate-600' : 'bg-slate-50 border border-slate-200'}`}>
              <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Hora</p>
              <p className={isDark ? 'text-white' : 'text-slate-800'}>{startStr || '—'}</p>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800/50 border border-slate-600' : 'bg-slate-50 border border-slate-200'}`}>
              <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Duración</p>
              <p className={isDark ? 'text-white' : 'text-slate-800'}>{duration} min</p>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800/50 border border-slate-600' : 'bg-slate-50 border border-slate-200'}`}>
              <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Profesional</p>
              <p className={isDark ? 'text-white' : 'text-slate-800'}>{getPsychologistNameFromCita(cita) || '—'}</p>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800/50 border border-slate-600' : 'bg-slate-50 border border-slate-200'}`}>
              <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Motivo</p>
              <p className={isDark ? 'text-white' : 'text-slate-800'}>{getCitaFieldFromApi<string>(cita, 'citMotivo', 'CitMotivo') || '—'}</p>
            </div>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800/50 border border-slate-600' : 'bg-slate-50 border border-slate-200'}`}>
              <Label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Estado</Label>
              <Select value={editedStatus} onValueChange={setEditedStatus}>
                <SelectTrigger
                  className={`mt-1 h-10 ${isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-200 bg-white'}`}
                >
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

          {/* Bitácora de la Sesión */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              Bitácora de la Sesión
            </Label>
            <AutoResizeTextarea
              value={editedNotes}
              onChange={setEditedNotes}
              placeholder="Observaciones, notas y detalles..."
              minRows={6}
              maxHeight={400}
              className={`w-full rounded-xl border px-4 py-3 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                isDark
                  ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          {error && (
            <div className={`rounded-xl p-4 ${isDark ? 'bg-red-900/20 border border-red-500/50' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
            <Button variant="outline" onClick={() => onBack()} className="flex-1 rounded-xl" disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600" disabled={saving}>
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Edit className="w-5 h-5" />}
              <span className="ml-2">Guardar Cambios</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
