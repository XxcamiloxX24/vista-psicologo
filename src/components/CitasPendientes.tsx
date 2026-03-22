import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Clock,
  User,
  Mail,
  FileText,
  Check,
  X,
  Loader2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  getSolicitudesPendientes,
  programarSolicitud,
  rechazarSolicitud,
  type CitaApi,
} from '../lib/citas';

function getCitaField<T>(c: Record<string, unknown>, camel: string, pascal: string): T | undefined {
  return (c[camel] ?? c[pascal]) as T | undefined;
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
    ?? '';
}

function getFicha(c: CitaApi): string {
  const f = c.aprendizCita?.ficha ?? (c.aprendizCita as Record<string, unknown>)?.Ficha;
  if (!f || typeof f !== 'object') return '';
  const code = (f as { ficCodigo?: number }).ficCodigo ?? (f as Record<string, number>).FicCodigo;
  return code != null ? String(code) : '';
}

const TIPOS_CITA = ['presencial', 'videollamada', 'chat'] as const;

interface CitasPendientesProps {
  onSuccess?: () => void;
}

export function CitasPendientes({ onSuccess }: CitasPendientesProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [pendientes, setPendientes] = useState<CitaApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programandoId, setProgramandoId] = useState<number | null>(null);
  const [rechazandoId, setRechazandoId] = useState<number | null>(null);
  const [modalCita, setModalCita] = useState<CitaApi | null>(null);
  const [formFecha, setFormFecha] = useState('');
  const [formHoraInicio, setFormHoraInicio] = useState('09:00');
  const [formHoraFin, setFormHoraFin] = useState('10:00');
  const [formTipo, setFormTipo] = useState<string>('presencial');
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getSolicitudesPendientes();
      setPendientes(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
      setPendientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openProgramar = (c: CitaApi) => {
    const hoy = new Date();
    setFormFecha(hoy.toISOString().split('T')[0]);
    setFormHoraInicio('09:00');
    setFormHoraFin('10:00');
    const tipo = getCitaField<string>(c as unknown as Record<string, unknown>, 'citTipoCita', 'CitTipoCita');
    setFormTipo(typeof tipo === 'string' ? tipo : 'presencial');
    setFormError(null);
    setModalCita(c);
  };

  const handleProgramar = async () => {
    if (!modalCita) return;
    if (!formFecha || !formHoraInicio || !formHoraFin) {
      setFormError('Completa fecha, hora inicio y hora fin.');
      return;
    }
    const codigo = getCitaField<number>(modalCita as unknown as Record<string, unknown>, 'citCodigo', 'CitCodigo');
    if (!codigo) return;
    setProgramandoId(codigo);
    setFormError(null);
    try {
      await programarSolicitud(codigo, {
        citFechaProgramada: formFecha,
        citHoraInicio: formHoraInicio,
        citHoraFin: formHoraFin,
        citTipoCita: formTipo,
        citEstadoCita: 'programada',
      });
      setModalCita(null);
      await load();
      onSuccess?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al programar');
    } finally {
      setProgramandoId(null);
    }
  };

  const handleRechazar = async (c: CitaApi) => {
    const codigo = getCitaField<number>(c as unknown as Record<string, unknown>, 'citCodigo', 'CitCodigo');
    if (!codigo) return;
    if (!window.confirm('¿Rechazar esta solicitud? El estudiante será notificado.')) return;
    setRechazandoId(codigo);
    try {
      await rechazarSolicitud(codigo);
      await load();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar');
    } finally {
      setRechazandoId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Solicitudes pendientes
        </h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
          Estudiantes que solicitaron cita y esperan que las programes o rechaces
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
      ) : error ? (
        <div className={`rounded-xl p-6 ${isDark ? 'bg-red-900/20 border border-red-500/50' : 'bg-red-50 border border-red-200'}`}>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <Button variant="outline" onClick={load} className="mt-4">
            Reintentar
          </Button>
        </div>
      ) : pendientes.length === 0 ? (
        <div className={`rounded-2xl p-12 text-center border ${
          isDark ? 'bg-slate-800/50 border-slate-600' : 'bg-slate-50 border-slate-200'
        }`}>
          <AlertCircle className={`w-14 h-14 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            No hay solicitudes pendientes
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Cuando un estudiante solicite una cita, aparecerá aquí para que la programes o rechaces.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendientes.map((c) => {
            const r = c as unknown as Record<string, unknown>;
            const codigo = getCitaField<number>(r, 'citCodigo', 'CitCodigo') ?? 0;
            const motivo = getCitaField<string>(r, 'citMotivo', 'CitMotivo') ?? getCitaField<string>(r, 'citMotivoSolicitud', 'CitMotivoSolicitud') ?? '—';
            const tipo = getCitaField<string>(r, 'citTipoCita', 'CitTipoCita') ?? '—';
            const fechaCreacion = getCitaField<string>(r, 'citFechaCreacion', 'CitFechaCreacion');
            const fechaStr = fechaCreacion
              ? new Date(fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : '—';

            return (
              <div
                key={codigo}
                className={`rounded-2xl p-6 border-2 transition-all ${
                  isDark ? '' : 'bg-white border-slate-300 hover:border-purple-300 shadow-sm'
                }`}
                style={
                  isDark
                    ? {
                        backgroundColor: '#334155',
                        borderColor: '#64748b',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -1px rgba(0,0,0,0.2)',
                      }
                    : undefined
                }
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <User className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {getStudentName(c)}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                          Ficha: {getFicha(c)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        <Mail className="w-4 h-4 shrink-0" />
                        {getStudentEmail(c) || 'Sin correo'}
                      </span>
                      <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        <FileText className="w-4 h-4 shrink-0" />
                        {tipo}
                      </span>
                      <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        <Clock className="w-4 h-4 shrink-0" />
                        Solicitado: {fechaStr}
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
                      <strong>Motivo:</strong> {motivo}
                    </p>
                  </div>
                  <div className="flex gap-3 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openProgramar(c)}
                      disabled={!!programandoId}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm min-h-[44px] transition-all border-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 hover:bg-green-500 hover:text-white"
                      style={
                        isDark
                          ? { borderColor: '#22c55e', color: '#4ade80', backgroundColor: 'rgba(22, 163, 74, 0.2)' }
                          : { borderColor: '#16a34a', color: '#15803d', backgroundColor: '#f0fdf4' }
                      }
                    >
                      {programandoId === codigo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      Programar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRechazar(c)}
                      disabled={!!rechazandoId}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm min-h-[44px] transition-all border-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 hover:bg-red-500 hover:text-white"
                      style={
                        isDark
                          ? { borderColor: '#ef4444', color: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.2)' }
                          : { borderColor: '#dc2626', color: '#dc2626', backgroundColor: '#fef2f2' }
                      }
                    >
                      {rechazandoId === codigo ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalCita && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-[2147483647]"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setModalCita(null)}
          role="presentation"
        >
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-900 border border-slate-600' : 'bg-white border border-slate-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 drop-shadow-sm">
                <Calendar className="w-5 h-5 shrink-0" />
                Programar cita — {getStudentName(modalCita)}
              </h3>
              <button
                type="button"
                onClick={() => setModalCita(null)}
                className="shrink-0 p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {formError && (
                <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
              )}
              <div>
                <Label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Fecha</Label>
                <input
                  type="date"
                  value={formFecha}
                  onChange={(e) => setFormFecha(e.target.value)}
                  className={`w-full min-h-[48px] px-4 py-3 text-base rounded-xl border ${
                    isDark ? 'bg-slate-800 border-slate-600 text-white [color-scheme:dark]' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Hora inicio</Label>
                  <input
                    type="time"
                    value={formHoraInicio}
                    onChange={(e) => setFormHoraInicio(e.target.value)}
                    className={`w-full min-h-[48px] px-4 py-3 text-base rounded-xl border ${
                      isDark ? 'bg-slate-800 border-slate-600 text-white [color-scheme:dark]' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <Label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Hora fin</Label>
                  <input
                    type="time"
                    value={formHoraFin}
                    onChange={(e) => setFormHoraFin(e.target.value)}
                    className={`w-full min-h-[48px] px-4 py-3 text-base rounded-xl border ${
                      isDark ? 'bg-slate-800 border-slate-600 text-white [color-scheme:dark]' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
              <div>
                <Label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tipo de cita</Label>
                <Select value={formTipo} onValueChange={setFormTipo}>
                  <SelectTrigger
                    className={`mt-0 min-h-[48px] px-4 py-3 text-base ${
                      isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900 border'
                    }`}
                  >
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent
                    className="!z-[2147483648] !w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl border"
                    style={{
                      backgroundColor: isDark ? '#334155' : '#fff',
                      zIndex: 2147483648,
                      width: 'var(--radix-select-trigger-width)',
                      minWidth: 'var(--radix-select-trigger-width)',
                    }}
                  >
                    {TIPOS_CITA.map((t) => (
                      <SelectItem
                        key={t}
                        value={t}
                        hideIndicator
                        className={
                          isDark
                            ? 'px-4 py-3 text-base text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500'
                            : 'px-4 py-3 text-base text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'
                        }
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setModalCita(null)}
                  className={`flex-1 min-h-[48px] px-6 py-3 rounded-xl font-semibold text-base transition-all ${
                    isDark
                      ? 'border-2 border-slate-500 text-slate-200 hover:bg-slate-700/50'
                      : 'border-2 border-slate-400 text-slate-700 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleProgramar}
                  disabled={!!programandoId}
                  className="flex-1 min-h-[48px] px-6 py-3 rounded-xl font-semibold text-base bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {programandoId ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Programar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
