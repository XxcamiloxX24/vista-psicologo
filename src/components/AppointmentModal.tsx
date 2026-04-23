import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Calendar,
  Clock,
  User,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  IdCard,
  GraduationCap,
  MapPin,
  RefreshCw,
  FileText,
  Type,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  buscarAprendizFichaPorFicha,
  buscarAprendizFichaPorDocumento,
  crearCita,
  nombreCompletoAprendizFicha,
  type AprendizFichaResumen,
} from '../lib/citas';
import { getPsychologistId } from '../lib/auth';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Se invoca al crear exitosamente una cita. Útil para refrescar la agenda y opcionalmente mover el calendario a esa fecha. */
  onCitaCreada?: (info: { fecha: string }) => void;
}

type BusquedaModo = 'ficha' | 'documento';
type TipoCita = 'presencial' | 'videollamada' | 'chat';

/** Debe coincidir con una clase `max-w-*` definida en `src/index.css` (los `max-w-[arbitrary]` suelen no estar en el bundle). */
const APPOINTMENT_MODAL_MAX_CLASS = 'max-w-3xl';

const inputBaseCore =
  'px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50';
const inputBase = `w-full ${inputBaseCore}`;
const inputLight = 'border border-purple-200/50 bg-slate-50 text-slate-900 placeholder:text-slate-400';
const inputDark = 'border border-slate-600 bg-slate-800 text-white placeholder:text-slate-400 [color-scheme:dark]';

/** Calcula HH:mm sumando `minutos` a una hora HH:mm. */
function sumarMinutos(hora: string, minutos: number): string {
  const m = hora.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return hora;
  const total = Number(m[1]) * 60 + Number(m[2]) + minutos;
  const h = Math.floor((total % (24 * 60)) / 60);
  const mm = total % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Hoy en formato yyyy-MM-dd (local, no UTC). */
function hoyLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

export function AppointmentModal({ isOpen, onClose, onCitaCreada }: AppointmentModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [step, setStep] = useState<'buscar' | 'detalles'>('buscar');

  // Paso A – búsqueda de aprendiz
  const [modoBusqueda, setModoBusqueda] = useState<BusquedaModo>('ficha');
  const [queryFicha, setQueryFicha] = useState('');
  const [queryDoc, setQueryDoc] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [resultados, setResultados] = useState<AprendizFichaResumen[]>([]);
  const [seleccionado, setSeleccionado] = useState<AprendizFichaResumen | null>(null);

  // Paso B – detalles
  const [fecha, setFecha] = useState(hoyLocal());
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [duracion, setDuracion] = useState<'30' | '45' | '60'>('30');
  const [tipo, setTipo] = useState<TipoCita>('presencial');
  const [motivo, setMotivo] = useState('');
  const [notas, setNotas] = useState('');

  // Envío
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const horaFin = useMemo(() => sumarMinutos(horaInicio, Number(duracion)), [horaInicio, duracion]);

  // Reset interno al cerrar/abrir
  useEffect(() => {
    if (!isOpen) return;
    setStep('buscar');
    setModoBusqueda('ficha');
    setQueryFicha('');
    setQueryDoc('');
    setBuscando(false);
    setErrorBusqueda(null);
    setResultados([]);
    setSeleccionado(null);
    setFecha(hoyLocal());
    setHoraInicio('09:00');
    setDuracion('30');
    setTipo('presencial');
    setMotivo('');
    setNotas('');
    setEnviando(false);
    setErrorEnvio(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBuscar = async () => {
    setErrorBusqueda(null);
    setResultados([]);
    try {
      if (modoBusqueda === 'ficha') {
        const raw = queryFicha.trim();
        if (!raw) {
          setErrorBusqueda('Ingresa un número de ficha.');
          return;
        }
        const ficha = Number(raw);
        if (!Number.isFinite(ficha) || ficha <= 0) {
          setErrorBusqueda('El número de ficha debe ser numérico.');
          return;
        }
        setBuscando(true);
        const lista = await buscarAprendizFichaPorFicha(ficha);
        if (lista.length === 0) {
          setErrorBusqueda(`No se encontraron aprendices activos en la ficha ${ficha}.`);
          return;
        }
        setResultados(lista);
        if (lista.length === 1) setSeleccionado(lista[0]);
      } else {
        const doc = queryDoc.trim();
        if (!doc) {
          setErrorBusqueda('Ingresa el número de documento.');
          return;
        }
        setBuscando(true);
        const lista = await buscarAprendizFichaPorDocumento(doc);
        if (lista.length === 0) {
          setErrorBusqueda('No se encontró un aprendiz activo con ese documento.');
          return;
        }
        setResultados(lista);
        if (lista.length === 1) setSeleccionado(lista[0]);
      }
    } catch (err) {
      setErrorBusqueda(err instanceof Error ? err.message : 'Error al buscar aprendiz.');
    } finally {
      setBuscando(false);
    }
  };

  const irAPasoDetalles = () => {
    if (!seleccionado) return;
    setErrorEnvio(null);
    setStep('detalles');
  };

  const cambiarAprendiz = () => {
    setSeleccionado(null);
    setResultados([]);
    setErrorEnvio(null);
    setStep('buscar');
  };

  const handleAgendar = async () => {
    setErrorEnvio(null);
    if (!seleccionado) {
      setErrorEnvio('Selecciona un aprendiz primero.');
      return;
    }
    if (!fecha) {
      setErrorEnvio('Selecciona una fecha.');
      return;
    }
    if (!horaInicio) {
      setErrorEnvio('Selecciona la hora de inicio.');
      return;
    }
    if (!motivo.trim()) {
      setErrorEnvio('El motivo de la cita es obligatorio.');
      return;
    }
    if (horaFin <= horaInicio) {
      setErrorEnvio('La hora de fin debe ser mayor que la de inicio.');
      return;
    }

    const psiId = getPsychologistId();
    if (!psiId) {
      setErrorEnvio('No se pudo identificar tu sesión. Vuelve a iniciar sesión e inténtalo de nuevo.');
      return;
    }

    setEnviando(true);
    try {
      await crearCita({
        citTipoCita: tipo,
        citFechaProgramada: fecha,
        citHoraInicio: horaInicio,
        citHoraFin: horaFin,
        citEstadoCita: 'programada',
        citMotivo: motivo.trim(),
        citAnotaciones: notas.trim(),
        citAprCodFk: seleccionado.codigo,
        citPsiCodFk: psiId,
      });
      onCitaCreada?.({ fecha });
      onClose();
    } catch (err) {
      setErrorEnvio(err instanceof Error ? err.message : 'No se pudo agendar la cita.');
    } finally {
      setEnviando(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 2147483647,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-modal-title"
        className={`relative mx-auto min-w-0 max-h-[90vh] w-full ${APPOINTMENT_MODAL_MAX_CLASS} overflow-y-auto rounded-2xl shadow-2xl ${
          isDark ? 'bg-slate-900 border border-slate-600' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-5 rounded-t-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h2 id="appointment-modal-title" className="text-xl py-2 font-semibold text-white">
                Agendar nueva cita
              </h2>
              <p className="text-sm text-white/85 mt-1">
                {step === 'buscar'
                  ? 'Paso 1 de 2 · Identifica al aprendiz'
                  : 'Paso 2 de 2 · Detalles de la cita'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors shrink-0 py-2"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Stepper visual */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: step === 'buscar' ? '50%' : '100%' }}
              />
            </div>
            <span className="text-xs text-white/85 font-medium shrink-0 py-2">
              {step === 'buscar' ? '1/2' : '2/2'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {step === 'buscar' && (
            <>
              {/* Toggle modo */}
              <div
                className={`inline-flex p-1 rounded-xl ${
                  isDark ? 'bg-slate-800 border border-slate-600' : 'bg-slate-100'
                }`}
                role="tablist"
                aria-label="Modo de búsqueda"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={modoBusqueda === 'ficha'}
                  onClick={() => setModoBusqueda('ficha')}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    modoBusqueda === 'ficha'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                      : isDark
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Por ficha
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={modoBusqueda === 'documento'}
                  onClick={() => setModoBusqueda('documento')}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    modoBusqueda === 'documento'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                      : isDark
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Por documento
                </button>
              </div>

              {/* Input de búsqueda */}
              <div>
                <label
                  htmlFor="search-input"
                  className={`flex items-center gap-2 text-sm mb-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {modoBusqueda === 'ficha' ? (
                    <GraduationCap className="w-4 h-4 text-purple-500" />
                  ) : (
                    <IdCard className="w-4 h-4 text-purple-500" />
                  )}
                  {modoBusqueda === 'ficha' ? 'Número de ficha' : 'Número de documento'}
                </label>
                <div className="flex w-full flex-row items-stretch gap-2 sm:gap-3">
                  <input
                    id="search-input"
                    type={modoBusqueda === 'ficha' ? 'number' : 'text'}
                    inputMode={modoBusqueda === 'ficha' ? 'numeric' : 'text'}
                    autoFocus
                    placeholder={modoBusqueda === 'ficha' ? 'Ej: 2589634' : 'Ej: 1001234567'}
                    value={modoBusqueda === 'ficha' ? queryFicha : queryDoc}
                    onChange={(e) =>
                      modoBusqueda === 'ficha'
                        ? setQueryFicha(e.target.value)
                        : setQueryDoc(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleBuscar();
                    }}
                    disabled={buscando}
                    className={`${inputBaseCore} min-w-0 flex-1 ${isDark ? inputDark : inputLight} disabled:opacity-60`}
                  />
                  <button
                    type="button"
                    onClick={handleBuscar}
                    disabled={buscando}
                    aria-busy={buscando}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:text-base"
                  >
                    {buscando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    Buscar
                  </button>
                </div>
                <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  {modoBusqueda === 'ficha'
                    ? 'Puede haber varios aprendices por ficha; elige uno de la lista.'
                    : 'Introduce el documento sin espacios ni puntos.'}
                </p>
              </div>

              {/* Error búsqueda */}
              {errorBusqueda && (
                <div
                  className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
                    isDark
                      ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorBusqueda}</span>
                </div>
              )}

              {/* Resultados */}
              {resultados.length > 0 && (
                <div className="space-y-2">
                  <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {resultados.length === 1
                      ? 'Aprendiz encontrado'
                      : `${resultados.length} aprendices encontrados`}
                  </p>
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {resultados.map((a) => {
                      const isSel = seleccionado?.codigo === a.codigo;
                      const nombre = nombreCompletoAprendizFicha(a) || 'Aprendiz sin nombre';
                      const ficha = a.ficha?.ficCodigo ?? '—';
                      const programa = a.ficha?.programaFormacion?.progNombre ?? '';
                      const doc = a.aprendiz?.nroDocumento;
                      return (
                        <li key={a.codigo}>
                          <button
                            type="button"
                            aria-pressed={isSel}
                            onClick={() => setSeleccionado(a)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              isSel
                                ? isDark
                                  ? 'border-purple-500 bg-transparent'
                                  : 'border-purple-500 bg-purple-50 shadow-sm hover:bg-purple-50/90'
                                : isDark
                                  ? 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                                  : 'border-slate-200 bg-white hover:border-purple-300'
                            }`}
                            style={
                              isSel && isDark
                                ? {
                                    backgroundColor: 'rgba(76, 29, 149, 0.42)',
                                    boxShadow:
                                      'inset 0 0 0 1px rgba(196, 181, 253, 0.35), 0 0 0 2px rgba(167, 139, 250, 0.85), 0 10px 28px -8px rgba(109, 40, 217, 0.55)',
                                  }
                                : undefined
                            }
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSel
                                    ? 'bg-purple-500 text-white'
                                    : isDark
                                      ? 'bg-slate-700 text-purple-300'
                                      : 'bg-purple-100 text-purple-600'
                                }`}
                              >
                                {isSel ? <CheckCircle2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                  {nombre}
                                </p>
                                <div
                                  className={`mt-2 grid grid-cols-1 gap-y-2 text-xs sm:grid-cols-2 sm:gap-x-8 sm:gap-y-1 ${
                                    isDark ? 'text-slate-400' : 'text-slate-500'
                                  }`}
                                >
                                  <div className="min-w-0 sm:pr-2">
                                    <span className={`block text-[10px] uppercase tracking-wide ${
                                      isDark ? 'text-slate-500' : 'text-slate-400'
                                    }`}
                                    >
                                      Ficha
                                    </span>
                                    <span
                                      className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                                    >
                                      {ficha}
                                    </span>
                                  </div>
                                  <div
                                    className={`min-w-0 sm:border-l sm:pl-6 ${
                                      isDark ? 'sm:border-slate-600' : 'sm:border-slate-200'
                                    }`}
                                  >
                                    <span className={`block text-[10px] uppercase tracking-wide ${
                                      isDark ? 'text-slate-500' : 'text-slate-400'
                                    }`}
                                    >
                                      Documento
                                    </span>
                                    <span
                                      className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                                    >
                                      {doc ?? '—'}
                                    </span>
                                  </div>
                                </div>
                                {programa && (
                                  <p
                                    className={`mt-2 text-xs leading-snug sm:mt-2 ${
                                      isDark ? 'text-slate-500' : 'text-slate-500'
                                    }`}
                                  >
                                    <span
                                      className={`mr-1.5 text-[10px] font-medium uppercase tracking-wide ${
                                        isDark ? 'text-slate-500' : 'text-slate-400'
                                      }`}
                                    >
                                      Programa
                                    </span>
                                    <span className="break-words">{programa}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}

          {step === 'detalles' && seleccionado && (
            <>
              {/* Tarjeta resumen de aprendiz */}
              <div
                className={`rounded-xl p-4 border ${
                  isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {nombreCompletoAprendizFicha(seleccionado) || 'Aprendiz'}
                      </p>
                      <button
                        type="button"
                        onClick={cambiarAprendiz}
                        className={`text-xs inline-flex items-center gap-1 shrink-0 ${
                          isDark ? 'text-purple-300 hover:text-purple-200' : 'text-purple-600 hover:text-purple-700'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Cambiar
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div
                        className={`min-w-0 rounded-lg border px-3 py-2 ${
                          isDark ? 'border-slate-600 bg-slate-900/40' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div
                          className={`flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide ${
                            isDark ? 'text-slate-500' : 'text-slate-500'
                          }`}
                        >
                          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-purple-500" aria-hidden />
                          Ficha
                        </div>
                        <p
                          className={`mt-1 break-words text-sm font-semibold ${
                            isDark ? 'text-white' : 'text-slate-800'
                          }`}
                        >
                          {seleccionado.ficha?.ficCodigo ?? '—'}
                        </p>
                      </div>
                      <div
                        className={`min-w-0 rounded-lg border px-3 py-2 ${
                          isDark ? 'border-slate-600 bg-slate-900/40' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div
                          className={`flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide ${
                            isDark ? 'text-slate-500' : 'text-slate-500'
                          }`}
                        >
                          <IdCard className="h-3.5 w-3.5 shrink-0 text-purple-500" aria-hidden />
                          Documento
                        </div>
                        <p
                          className={`mt-1 break-words text-sm font-semibold ${
                            isDark ? 'text-white' : 'text-slate-800'
                          }`}
                        >
                          {seleccionado.aprendiz?.nroDocumento ?? '—'}
                        </p>
                      </div>
                      <div
                        className={`min-w-0 rounded-lg border px-3 py-2 ${
                          isDark ? 'border-slate-600 bg-slate-900/40' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div
                          className={`flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide ${
                            isDark ? 'text-slate-500' : 'text-slate-500'
                          }`}
                        >
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-purple-500" aria-hidden />
                          Centro
                        </div>
                        <p
                          className={`mt-1 break-words text-sm font-semibold hyphens-auto ${
                            isDark ? 'text-white' : 'text-slate-800'
                          }`}
                          lang="es"
                        >
                          {seleccionado.ficha?.programaFormacion?.centro?.cenNombre ?? '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fecha */}
              <div>
                <label
                  htmlFor="cita-fecha"
                  className={`flex items-center gap-2 text-sm mb-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-purple-500" />
                  Fecha
                </label>
                <input
                  id="cita-fecha"
                  type="date"
                  value={fecha}
                  min={hoyLocal()}
                  onChange={(e) => setFecha(e.target.value)}
                  className={`${inputBase} ${isDark ? inputDark : inputLight}`}
                />
              </div>

              {/* Hora + duración */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="cita-hora"
                    className={`flex items-center gap-2 text-sm mb-2 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-purple-500" />
                    Hora de inicio
                  </label>
                  <input
                    id="cita-hora"
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className={`${inputBase} ${isDark ? inputDark : inputLight}`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="cita-duracion"
                    className={`text-sm mb-2 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    Duración
                  </label>
                  <Select value={duracion} onValueChange={(v) => setDuracion(v as typeof duracion)}>
                    <SelectTrigger
                      id="cita-duracion"
                      className={`${inputBase} h-12 ${
                        isDark
                          ? 'border-slate-600 bg-slate-800 text-white'
                          : 'border-purple-200/50 bg-white text-slate-900'
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={`!z-[2147483648] !w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl ${
                        isDark
                          ? '!bg-slate-700 border-slate-500 text-white settings-select-dark'
                          : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                      }`}
                      style={
                        isDark
                          ? {
                              backgroundColor: '#334155',
                              width: 'var(--radix-select-trigger-width)',
                              minWidth: 'var(--radix-select-trigger-width)',
                              zIndex: 2147483648,
                            }
                          : {
                              backgroundColor: '#fff',
                              width: 'var(--radix-select-trigger-width)',
                              minWidth: 'var(--radix-select-trigger-width)',
                              zIndex: 2147483648,
                            }
                      }
                    >
                      <SelectItem
                        value="30"
                        hideIndicator
                        className={
                          isDark
                            ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500'
                            : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'
                        }
                      >
                        30 minutos
                      </SelectItem>
                      <SelectItem
                        value="45"
                        hideIndicator
                        className={
                          isDark
                            ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500'
                            : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'
                        }
                      >
                        45 minutos
                      </SelectItem>
                      <SelectItem
                        value="60"
                        hideIndicator
                        className={
                          isDark
                            ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500'
                            : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'
                        }
                      >
                        60 minutos
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Finaliza a las <strong>{horaFin}</strong>
                  </p>
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label
                  htmlFor="cita-tipo"
                  className={`flex items-center gap-2 text-sm mb-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  <Type className="w-4 h-4 text-purple-500" />
                  Tipo de cita
                </label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoCita)}>
                  <SelectTrigger
                    id="cita-tipo"
                    className={`${inputBase} h-12 ${
                      isDark
                        ? 'border-slate-600 bg-slate-800 text-white'
                        : 'border-purple-200/50 bg-white text-slate-900'
                    }`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`!z-[2147483648] !w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl ${
                      isDark
                        ? '!bg-slate-700 border-slate-500 text-white settings-select-dark'
                        : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                    }`}
                    style={
                      isDark
                        ? {
                            backgroundColor: '#334155',
                            width: 'var(--radix-select-trigger-width)',
                            minWidth: 'var(--radix-select-trigger-width)',
                            zIndex: 2147483648,
                          }
                        : {
                            backgroundColor: '#fff',
                            width: 'var(--radix-select-trigger-width)',
                            minWidth: 'var(--radix-select-trigger-width)',
                            zIndex: 2147483648,
                          }
                    }
                  >
                    <SelectItem
                      value="presencial"
                      hideIndicator
                      className={
                        isDark
                          ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500'
                          : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'
                      }
                    >
                      Presencial
                    </SelectItem>
                    <SelectItem
                      value="videollamada"
                      hideIndicator
                      className={
                        isDark
                          ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500'
                          : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'
                      }
                    >
                      Videollamada
                    </SelectItem>
                    <SelectItem
                      value="chat"
                      hideIndicator
                      className={
                        isDark
                          ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500'
                          : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'
                      }
                    >
                      Chat
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Motivo */}
              <div>
                <label
                  htmlFor="cita-motivo"
                  className={`flex items-center gap-2 text-sm mb-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4 text-purple-500" />
                  Motivo <span className="text-red-500">*</span>
                </label>
                <input
                  id="cita-motivo"
                  type="text"
                  maxLength={160}
                  placeholder="Ej: Seguimiento de ansiedad"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className={`${inputBase} ${isDark ? inputDark : inputLight}`}
                />
              </div>

              {/* Notas */}
              <div>
                <label
                  htmlFor="cita-notas"
                  className={`text-sm mb-2 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                >
                  Notas (opcional)
                </label>
                <textarea
                  id="cita-notas"
                  rows={3}
                  maxLength={400}
                  placeholder="Información adicional..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className={`${inputBase} resize-none ${isDark ? inputDark : inputLight}`}
                />
              </div>

              {/* Error envío */}
              {errorEnvio && (
                <div
                  className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
                    isDark
                      ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorEnvio}</span>
                </div>
              )}
            </>
          )}

          {/* Footer / acciones */}
          <div
            className={`grid gap-2 border-t pt-4 sm:gap-3 ${
              step === 'detalles'
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-2'
            } ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
          >
            {step === 'detalles' && (
              <button
                type="button"
                onClick={() => setStep('buscar')}
                disabled={enviando}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all disabled:opacity-60 ${
                  isDark
                    ? 'border border-slate-600 text-slate-300 hover:bg-slate-800'
                    : 'border border-purple-200/50 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={enviando}
              className={`px-6 py-3 rounded-xl transition-all disabled:opacity-60 ${
                isDark
                  ? 'border border-slate-600 text-slate-300 hover:bg-slate-800'
                  : 'border border-purple-200/50 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Cancelar
            </button>
            {step === 'buscar' ? (
              <button
                type="button"
                onClick={irAPasoDetalles}
                disabled={!seleccionado || buscando}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAgendar}
                disabled={enviando}
                aria-busy={enviando}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Agendar cita
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
