import { useState, useEffect, useCallback, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  BarChart3,
  ClipboardList,
  ListChecks,
  Pencil,
  Trash2,
  Plus,
  X,
  Info,
  CheckCircle2,
  PenLine,
  Image,
  Upload,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  listarPorSeguimiento,
  crear,
  actualizar,
  eliminar,
  getEstados,
  type RecomendacionItem,
  type CrearRecomendacionPayload,
} from '../lib/recomendacion';
import { editarSeguimiento, eliminarSeguimiento, ESTADOS_SEGUIMIENTO_API, type SeguimientoDetalle } from '../lib/seguimiento';
import {
  getEstadisticaEmocionalMensual,
  getTendenciaEmocional,
  type EstadisticaMensualResponse,
  type TendenciaResponse,
} from '../lib/emociones';
import { uploadSignatureImage, listImages, deleteImage, type ImageItem } from '../lib/images';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

/* Estilos explícitos para modales portaled (evitan contraste bajo en dark) */
const inputBase = 'w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors';
const inputLight = 'border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-500';
const inputDark = 'border border-slate-500 bg-slate-800 text-white placeholder:text-slate-400';
const textareaBase = 'w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors';

interface Student {
  id: number;
  name: string;
  ficha: string;
  email: string;
  status: 'stable' | 'observation' | 'critical';
  program: string;
  phone?: string;
  area?: string;
  centro?: string;
  jornada?: string;
  nivelFormacion?: string;
  modalidad?: string;
  formaModalidad?: string;
  estadoFormacion?: string;
  /** Código real del aprendiz en la tabla aprendiz (para estadísticas de diario). */
  aprendizId?: number;
}

interface StudentProfileProps {
  student: Student;
  seguimiento?: SeguimientoDetalle | null;
  onBack: () => void;
  onSeguimientoUpdated?: () => void;
  /** Tras eliminar con éxito (cerrar detalle y refrescar listas en el padre). */
  onSeguimientoDeleted?: () => void;
}

type Tab = 'info' | 'calendar' | 'charts' | 'test' | 'recommendations';

function FirmaDisplayPlaceholder({
  label,
  isDark,
  onAdd,
}: {
  label: string;
  isDark: boolean;
  onAdd?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
              isDark
                ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar firma
          </button>
        )}
      </div>
      <div
        className={`w-48 h-20 rounded-lg border-2 border-dashed flex items-center justify-center ${
          isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-300 bg-slate-50/80'
        }`}
      >
        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin firma</p>
      </div>
    </div>
  );
}

function FirmaDisplay({
  label,
  url,
  isDark,
  onEdit,
}: {
  label: string;
  url: string;
  isDark: boolean;
  onEdit?: () => void;
}) {
  const [error, setError] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
              isDark
                ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar firma
          </button>
        )}
      </div>
      <div
        className={`w-48 h-20 rounded-lg border-2 overflow-hidden flex items-center justify-center ${
          isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-200 bg-slate-50'
        }`}
      >
        {error ? (
          <p className={`text-xs text-center px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Imagen no disponible
          </p>
        ) : (
          <img
            src={url}
            alt={label}
            className="max-w-full max-h-full object-contain"
            onError={() => setError(true)}
          />
        )}
      </div>
    </div>
  );
}

/** Campos de solo lectura en la pestaña Información (layout tipo tarjeta). */
function SeguimientoReadonlyField({
  label,
  value,
  isDark,
  className = '',
}: {
  label: string;
  value: ReactNode;
  isDark: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p
        className={`mb-1.5 text-[11px] font-semibold uppercase tracking-wider ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}
      >
        {label}
      </p>
      <div
        className={`min-h-[2.75rem] rounded-xl border px-4 py-3 text-sm leading-relaxed ${
          isDark
            ? 'border-slate-600/90 bg-slate-800/95 text-slate-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'
            : 'border-slate-100 bg-white text-slate-800 shadow-sm'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/** Estilos inline en oscuro: el preflight pone button { background transparent; color inherit } y anula utilidades. */
const chipEditDarkStyle: CSSProperties = {
  backgroundColor: 'rgba(180, 83, 9, 0.58)',
  border: '1px solid rgba(250, 204, 21, 0.8)',
  color: '#fffbeb',
  borderRadius: 9999,
};

const chipDeleteDarkStyle: CSSProperties = {
  backgroundColor: 'rgba(153, 27, 27, 0.55)',
  border: '1px solid rgba(252, 165, 165, 0.75)',
  color: '#fecaca',
  borderRadius: 9999,
};

/** Preflight anula bg/color en <button>; el modal de eliminar debe usar estilos explícitos. */
const modalCancelBtnLight: CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 12,
};

const modalCancelBtnDark: CSSProperties = {
  backgroundColor: 'rgba(51, 65, 85, 0.55)',
  color: '#f1f5f9',
  border: '1px solid #64748b',
  borderRadius: 12,
};

const modalDangerConfirmBtnStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: 12,
  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
};

export function StudentProfile({ student, seguimiento, onBack, onSeguimientoUpdated, onSeguimientoDeleted }: StudentProfileProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const nombreSeguimientoModal = (() => {
    const n = student.name?.trim() ?? '';
    if (n && n !== '—' && n !== '-') return n;
    const f = student.ficha?.trim();
    if (f) return `aprendiz (ficha ${f})`;
    return 'este aprendiz';
  })();
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const [recomendaciones, setRecomendaciones] = useState<RecomendacionItem[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [errorRecs, setErrorRecs] = useState<string | null>(null);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState<RecomendacionItem | null>(null);
  const [modalEliminarOpen, setModalEliminarOpen] = useState<RecomendacionItem | null>(null);
  const [finalizando, setFinalizando] = useState(false);
  const [showConfirmFinalizar, setShowConfirmFinalizar] = useState(false);
  const [showConfirmEliminarSeguimiento, setShowConfirmEliminarSeguimiento] = useState(false);
  const [eliminandoSeguimiento, setEliminandoSeguimiento] = useState(false);
  const [showFirmaModal, setShowFirmaModal] = useState(false);
  const [showEditarFirmaModal, setShowEditarFirmaModal] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [editForm, setEditForm] = useState({
    descripcion: '',
    motivo: '',
    areaRemitido: '',
    fechaInicio: '',
    fechaFin: '',
  });

  const tabs = [
    { id: 'info' as Tab, label: 'Información', icon: Info },
    { id: 'calendar' as Tab, label: 'Calendario', icon: Calendar },
    { id: 'charts' as Tab, label: 'Gráficos', icon: BarChart3 },
    { id: 'test' as Tab, label: 'Test', icon: ClipboardList },
    { id: 'recommendations' as Tab, label: 'Recomendaciones', icon: ListChecks },
  ];

  const cargarRecomendaciones = useCallback(async () => {
    if (student.id == null) return;
    setLoadingRecs(true);
    setErrorRecs(null);
    try {
      const data = await listarPorSeguimiento(student.id);
      setRecomendaciones(data);
    } catch (e) {
      setErrorRecs(e instanceof Error ? e.message : 'Error al cargar recomendaciones.');
    } finally {
      setLoadingRecs(false);
    }
  }, [student.id]);

  useEffect(() => {
    if (activeTab === 'recommendations') {
      cargarRecomendaciones();
    }
  }, [activeTab, cargarRecomendaciones]);

  /* ── Estadísticas emocionales (reales desde API) ── */
  const [emoMensual, setEmoMensual] = useState<EstadisticaMensualResponse | null>(null);
  const [emoTendencia, setEmoTendencia] = useState<TendenciaResponse | null>(null);
  const [emoLoading, setEmoLoading] = useState(false);
  const now = new Date();
  const [emoAnio, setEmoAnio] = useState(now.getFullYear());
  const [emoMes, setEmoMes] = useState(now.getMonth() + 1);

  useEffect(() => {
    if (!student.aprendizId) return;
    if (activeTab !== 'calendar' && activeTab !== 'charts') return;
    let cancelled = false;
    setEmoLoading(true);
    Promise.all([
      getEstadisticaEmocionalMensual(student.aprendizId, emoAnio, emoMes),
      getTendenciaEmocional(student.aprendizId, 6),
    ]).then(([mensual, tendencia]) => {
      if (cancelled) return;
      setEmoMensual(mensual);
      setEmoTendencia(tendencia);
    }).finally(() => { if (!cancelled) setEmoLoading(false); });
    return () => { cancelled = true; };
  }, [student.aprendizId, activeTab, emoAnio, emoMes]);

  const diasMap = new Map((emoMensual?.dias ?? []).map(d => [new Date(d.fecha).getDate(), d]));
  const resumen = emoMensual?.resumen ?? { positivas: 0, neutrales: 0, negativas: 0, criticas: 0, promedioEscala: 0, totalDias: 0 };
  const totalCat = resumen.positivas + resumen.neutrales + resumen.negativas + resumen.criticas || 1;
  const pct = (v: number) => `${Math.round((v / totalCat) * 100)}%`;

  const emotionalEvolutionData = (emoTendencia?.tendencia ?? []).map(t => ({
    day: t.mesNombre,
    score: t.promedioEscala,
  }));

  const emotionalDistributionData = [
    { name: 'Positiva', value: resumen.positivas, color: '#22c55e' },
    { name: 'Neutral', value: resumen.neutrales, color: '#eab308' },
    { name: 'Negativa', value: resumen.negativas, color: '#f97316' },
    { name: 'Crítica', value: resumen.criticas, color: '#ef4444' },
  ];

  /** Solo categorías con días > 0: evita segmentos invisibles y etiquetas superpuestas en Recharts. */
  const pieDistributionData = emotionalDistributionData.filter((d) => d.value > 0);

  const sessionAttendanceData = [
    { month: 'Ago', asistidas: 4, programadas: 4 },
    { month: 'Sep', asistidas: 3, programadas: 4 },
    { month: 'Oct', asistidas: 4, programadas: 4 },
    { month: 'Nov', asistidas: 4, programadas: 5 },
    { month: 'Dic', asistidas: 2, programadas: 3 },
  ];

  const getEstadoFormacionLabel = (estado?: string): string => {
    if (!estado?.trim()) return '';
    const e = estado.toLowerCase().trim();
    if (e.includes('ejecucion') || e.includes('en ejecución')) return 'En Formación';
    if (e.includes('cancelada')) return 'Cancelada';
    if (e.includes('terminada por fecha')) return 'Terminada por fecha';
    if (e.includes('terminada')) return 'Terminada';
    return estado;
  };

  const getEstadoFormacionStyle = (estado?: string): { className?: string; style?: React.CSSProperties } => {
    if (!estado?.trim()) return {};
    const e = estado.toLowerCase().trim();
    if (e.includes('ejecucion') || e.includes('en ejecución'))
      return isDark ? { style: { backgroundColor: '#059669', color: '#fff' } } : { className: 'bg-green-100 text-green-700' };
    if (e.includes('cancelada'))
      return isDark ? { style: { backgroundColor: '#475569', color: '#e2e8f0' } } : { className: 'bg-slate-100 text-slate-700' };
    if (e.includes('terminada'))
      return isDark ? { style: { backgroundColor: '#2563eb', color: '#fff' } } : { className: 'bg-blue-100 text-blue-700' };
    return isDark ? { style: { backgroundColor: '#475569', color: '#e2e8f0' } } : { className: 'bg-slate-100 text-slate-700' };
  };

  const formatearFecha = (iso?: string | null): string => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return iso;
    }
  };

  const getEstadoBadgeStyle = (estado?: string | null): { className?: string; style?: React.CSSProperties } => {
    const e = (estado ?? '').toLowerCase();
    if (e.includes('completada'))
      return isDark ? { style: { backgroundColor: '#059669', color: '#fff' } } : { className: 'bg-green-100 text-green-700' };
    if (e.includes('progreso'))
      return isDark ? { style: { backgroundColor: '#d97706', color: '#fff' } } : { className: 'bg-amber-100 text-amber-700' };
    return isDark ? { style: { backgroundColor: '#475569', color: '#e2e8f0' } } : { className: 'bg-slate-100 text-slate-700' };
  };

  const getEmotionBg = (cat: string) => {
    switch (cat) {
      case 'Positiva': return 'bg-green-500';
      case 'Neutral':  return 'bg-yellow-500';
      case 'Negativa': return 'bg-orange-500';
      case 'Critica':  return 'bg-red-500';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <button
        onClick={onBack}
        className={`flex items-center gap-2 transition-colors ${isDark ? 'text-white hover:text-purple-400' : 'text-slate-600 hover:text-purple-600'}`}
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a la lista
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Student Info */}
        <div className="lg:col-span-1">
          <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-sm sticky top-6 ${
            isDark ? 'bg-slate-800/90 border-slate-600' : 'bg-white/90 border-purple-100/50'
          }`}>
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <h2 className={`mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{student.name}</h2>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    !isDark
                      ? student.status === 'stable'
                        ? 'bg-green-100 text-green-700'
                        : student.status === 'observation'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                      : ''
                  }`}
                  style={
                    isDark
                      ? student.status === 'stable'
                        ? { backgroundColor: '#16a34a', color: '#fff' }
                        : student.status === 'observation'
                        ? { backgroundColor: '#f59e0b', color: '#0f172a' }
                        : { backgroundColor: '#dc2626', color: '#fff' }
                      : undefined
                  }
                >
                  {student.status === 'stable' ? 'Estable' :
                   student.status === 'observation' ? 'En Observación' :
                   'Crítico'}
                </span>
                {student.estadoFormacion &&
                  getEstadoFormacionLabel(student.estadoFormacion) && (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEstadoFormacionStyle(student.estadoFormacion).className ?? ''}`}
                      style={getEstadoFormacionStyle(student.estadoFormacion).style}
                    >
                      {getEstadoFormacionLabel(student.estadoFormacion)}
                    </span>
                  )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ficha</p>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{student.ficha}</p>
              </div>
              <div>
                <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Programa</p>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{student.program}</p>
              </div>
              {student.area && (
                <div>
                  <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Área / Facultad</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{student.area}</p>
                </div>
              )}
              {student.nivelFormacion && (
                <div>
                  <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Nivel de formación</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{student.nivelFormacion}</p>
                </div>
              )}
              {student.centro && (
                <div>
                  <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Centro</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{student.centro}</p>
                </div>
              )}
              {student.jornada && (
                <div>
                  <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Jornada</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{student.jornada}</p>
                </div>
              )}
              {student.modalidad && (
                <div>
                  <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Modalidad</p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{student.modalidad}</p>
                </div>
              )}
              <div>
                <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Correo</p>
                <p className={`text-sm break-all ${isDark ? 'text-white' : 'text-slate-800'}`}>{student.email || '—'}</p>
              </div>
              <div>
                <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Teléfono</p>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{student.phone || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className={`backdrop-blur-sm rounded-2xl border shadow-sm overflow-hidden ${
            isDark ? 'bg-slate-800/90 border-slate-600' : 'bg-white/90 border-purple-100/50'
          }`}>
            {/* Tabs */}
            <div className={`flex border-b overflow-x-auto ${isDark ? 'border-slate-600' : 'border-purple-100/50'}`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? isDark ? 'border-purple-500 text-white bg-purple-900/30' : 'border-purple-600 text-purple-700 bg-purple-50/50'
                        : isDark ? 'border-transparent text-slate-400 hover:text-white hover:bg-slate-700/50' : 'border-transparent text-slate-600 hover:text-purple-600 hover:bg-purple-50/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>Información del seguimiento</h3>
                    {seguimiento && !editingInfo && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditForm({
                              descripcion: seguimiento.descripcion?.trim() ?? '',
                              motivo: seguimiento.motivo?.trim() ?? '',
                              areaRemitido: seguimiento.areaRemitido?.trim() ?? '',
                              fechaInicio: seguimiento.fechaInicioSeguimiento
                                ? new Date(seguimiento.fechaInicioSeguimiento).toISOString().slice(0, 10)
                                : '',
                              fechaFin: seguimiento.fechaFinSeguimiento
                                ? new Date(seguimiento.fechaFinSeguimiento).toISOString().slice(0, 10)
                                : '',
                            });
                            setEditingInfo(true);
                          }}
                          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                            isDark
                              ? 'shadow-md shadow-amber-950/40 hover:brightness-110'
                              : 'rounded-full border border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100/90'
                          }`}
                          style={isDark ? chipEditDarkStyle : undefined}
                        >
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${isDark ? 'bg-amber-300' : 'bg-yellow-500'}`}
                            aria-hidden
                          />
                          <Pencil className={`h-4 w-4 shrink-0 ${isDark ? 'text-amber-100' : 'text-yellow-700'}`} />
                          Editar información
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowConfirmEliminarSeguimiento(true)}
                          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                            isDark
                              ? 'shadow-md shadow-red-950/50 hover:brightness-110'
                              : 'rounded-full border border-red-300 bg-red-50 text-red-800 hover:bg-red-100/90'
                          }`}
                          style={isDark ? chipDeleteDarkStyle : undefined}
                        >
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${isDark ? 'bg-red-300' : 'bg-red-600'}`}
                            aria-hidden
                          />
                          <Trash2 className={`h-4 w-4 shrink-0 ${isDark ? 'text-red-100' : 'text-red-700'}`} />
                          Eliminar seguimiento
                        </button>
                      </div>
                    )}
                  </div>
                  {editingInfo ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!seguimiento || !student.id) return;
                        setEditandoInfo(true);
                        try {
                          await editarSeguimiento(student.id, {
                            segAprendizFk: seguimiento.segAprendizFk,
                            segPsicologoFk: seguimiento.segPsicologoFk,
                            segFechaSeguimiento: editForm.fechaInicio || undefined,
                            segFechaFin: editForm.fechaFin || undefined,
                            segAreaRemitido: editForm.areaRemitido || undefined,
                            segTrimestreActual: seguimiento.trimestreActual ?? undefined,
                            segMotivo: editForm.motivo || undefined,
                            segDescripcion: editForm.descripcion || undefined,
                            segEstadoSeguimiento: seguimiento.estadoSeguimiento ?? ESTADOS_SEGUIMIENTO_API.estable,
                            segFirmaProfesional: seguimiento.firmaProfesional ?? undefined,
                            segFirmaAprendiz: seguimiento.firmaAprendiz ?? undefined,
                          });
                          setEditingInfo(false);
                          onSeguimientoUpdated?.();
                        } catch (err) {
                          alert(err instanceof Error ? err.message : 'Error al guardar los cambios');
                        } finally {
                          setEditandoInfo(false);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Descripción</label>
                          <textarea
                            value={editForm.descripcion}
                            onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.target.value }))}
                            rows={3}
                            disabled={editandoInfo}
                            className={`${inputBase} ${textareaBase} ${isDark ? inputDark : inputLight}`}
                            placeholder="Descripción del seguimiento"
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Motivo</label>
                          <textarea
                            value={editForm.motivo}
                            onChange={(e) => setEditForm((f) => ({ ...f, motivo: e.target.value }))}
                            rows={3}
                            disabled={editandoInfo}
                            className={`${inputBase} ${textareaBase} ${isDark ? inputDark : inputLight}`}
                            placeholder="Motivo del seguimiento"
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Área remitido</label>
                          <input
                            type="text"
                            value={editForm.areaRemitido}
                            onChange={(e) => setEditForm((f) => ({ ...f, areaRemitido: e.target.value }))}
                            disabled={editandoInfo}
                            className={`${inputBase} ${isDark ? inputDark : inputLight}`}
                            placeholder="Ej: Sistemas, Administración"
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fecha inicio</label>
                          <input
                            type="date"
                            value={editForm.fechaInicio}
                            onChange={(e) => setEditForm((f) => ({ ...f, fechaInicio: e.target.value }))}
                            disabled={editandoInfo}
                            className={`${inputBase} ${isDark ? inputDark : inputLight}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fecha fin</label>
                          <input
                            type="date"
                            value={editForm.fechaFin}
                            onChange={(e) => setEditForm((f) => ({ ...f, fechaFin: e.target.value }))}
                            disabled={editandoInfo}
                            className={`${inputBase} ${isDark ? inputDark : inputLight}`}
                            placeholder="Dejar vacío si no está finalizado"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingInfo(false)}
                          disabled={editandoInfo}
                          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                            isDark
                              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-50'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50'
                          }`}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={editandoInfo}
                          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 transition-all"
                        >
                          {editandoInfo ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Guardando…
                            </>
                          ) : (
                            'Guardar cambios'
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                  <div className="space-y-5">
                    <div
                      className={`overflow-hidden rounded-2xl border shadow-sm ${
                        isDark
                          ? 'border-slate-600/90 bg-gradient-to-b from-slate-900/70 to-slate-800/50'
                          : 'border-purple-100/90 bg-gradient-to-br from-white via-purple-50/25 to-slate-50/90'
                      }`}
                    >
                      <div
                        className={`border-b px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${
                          isDark
                            ? 'border-slate-600/80 bg-slate-900/60 text-purple-200/90'
                            : 'border-purple-100/80 bg-purple-50/50 text-purple-800/90'
                        }`}
                      >
                        Detalle del seguimiento
                      </div>
                      <div className="grid gap-4 p-4 sm:p-5 sm:grid-cols-2">
                        <SeguimientoReadonlyField
                          label="Descripción"
                          isDark={isDark}
                          className="sm:col-span-2"
                          value={seguimiento?.descripcion?.trim() || '—'}
                        />
                        <SeguimientoReadonlyField
                          label="Motivo"
                          isDark={isDark}
                          className="sm:col-span-2"
                          value={seguimiento?.motivo?.trim() || '—'}
                        />
                        <SeguimientoReadonlyField
                          label="Área remitido"
                          isDark={isDark}
                          value={seguimiento?.areaRemitido?.trim() || '—'}
                        />
                      </div>
                    </div>

                    <div
                      className={`grid gap-4 rounded-2xl border p-4 sm:grid-cols-2 sm:p-5 ${
                        isDark
                          ? 'border-slate-600/80 bg-slate-900/35'
                          : 'border-slate-200/90 bg-slate-50/70'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            isDark ? 'bg-purple-900/60 text-purple-200' : 'bg-purple-100 text-purple-600'
                          }`}
                        >
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`mb-1 text-[11px] font-semibold uppercase tracking-wider ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            Fecha inicio
                          </p>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {seguimiento?.fechaInicioSeguimiento
                              ? new Date(seguimiento.fechaInicioSeguimiento).toLocaleDateString('es-CO', {
                                  dateStyle: 'long',
                                })
                              : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            isDark ? 'bg-indigo-900/50 text-indigo-200' : 'bg-indigo-100 text-indigo-600'
                          }`}
                        >
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`mb-1 text-[11px] font-semibold uppercase tracking-wider ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            Fecha fin
                          </p>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {seguimiento?.fechaFinSeguimiento
                              ? new Date(seguimiento.fechaFinSeguimiento).toLocaleDateString('es-CO', {
                                  dateStyle: 'long',
                                })
                              : 'Sin finalizar'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}
                  <div
                    className={`mt-6 grid grid-cols-1 gap-4 overflow-hidden rounded-2xl border sm:grid-cols-2 ${
                      isDark
                        ? 'border-slate-600/80 bg-slate-900/30'
                        : 'border-slate-200/90 bg-slate-50/40'
                    }`}
                  >
                    <div
                      className={`col-span-full border-b px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${
                        isDark
                          ? 'border-slate-600/80 bg-slate-900/50 text-slate-300'
                          : 'border-slate-200/90 bg-white/60 text-slate-600'
                      }`}
                    >
                      Firmas del seguimiento
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
                      <div>
                        {seguimiento?.firmaProfesional ? (
                          <FirmaDisplay
                            label="Firma del profesional"
                            url={seguimiento.firmaProfesional}
                            isDark={isDark}
                            onEdit={() => setShowEditarFirmaModal(true)}
                          />
                        ) : (
                          <FirmaDisplayPlaceholder
                            label="Firma del profesional"
                            isDark={isDark}
                            onAdd={() => setShowEditarFirmaModal(true)}
                          />
                        )}
                      </div>
                      <div>
                        {seguimiento?.firmaAprendiz ? (
                          <FirmaDisplay
                            label="Firma del aprendiz"
                            url={seguimiento.firmaAprendiz}
                            isDark={isDark}
                          />
                        ) : (
                          <FirmaDisplayPlaceholder
                            label="Firma del aprendiz"
                            isDark={isDark}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  {!seguimiento?.fechaFinSeguimiento && (
                    <div className="pt-4">
                      <Button
                        disabled={finalizando}
                        onClick={() => setShowConfirmFinalizar(true)}
                        className={`flex items-center gap-2 min-h-[48px] rounded-xl px-6 py-3 text-sm font-medium text-white disabled:opacity-60 transition-all ${
                          isDark
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-md hover:shadow-lg'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Finalizar seguimiento
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'calendar' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Registro Emocional</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { const prev = emoMes === 1 ? 12 : emoMes - 1; setEmoMes(prev); if (prev === 12) setEmoAnio(a => a - 1); }}
                        className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                      >←</button>
                      <span className={`text-sm font-medium min-w-[120px] text-center ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        {['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][emoMes]} {emoAnio}
                      </span>
                      <button
                        onClick={() => { const next = emoMes === 12 ? 1 : emoMes + 1; setEmoMes(next); if (next === 1) setEmoAnio(a => a + 1); }}
                        className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                      >→</button>
                    </div>
                  </div>

                  {!student.aprendizId ? (
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No se pudo determinar el ID del aprendiz para consultar su diario.</p>
                  ) : emoLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>
                  ) : (
                    <>
                      <div className="grid grid-cols-7 gap-3">
                        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
                          <div key={i} className={`text-center text-sm py-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{day}</div>
                        ))}
                        {(() => {
                          const totalDays = new Date(emoAnio, emoMes, 0).getDate();
                          const firstDow = new Date(emoAnio, emoMes - 1, 1).getDay();
                          const blanks = Array.from({ length: firstDow }, (_, i) => (
                            <div key={`b${i}`} className="aspect-square" />
                          ));
                          const days = Array.from({ length: totalDays }, (_, i) => {
                            const dia = diasMap.get(i + 1);
                            const cat = dia?.categoriaDia;
                            const emoji = dia?.emocion?.emoEmoji;
                            return (
                              <div
                                key={i}
                                title={dia ? `${dia.emocion?.emoNombre ?? ''} (${dia.promedioEscala})` : ''}
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative ${
                                  cat ? `${getEmotionBg(cat)} text-white` : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {emoji && <span className="text-base leading-none">{emoji}</span>}
                                <span className={emoji ? 'text-[10px]' : ''}>{i + 1}</span>
                              </div>
                            );
                          });
                          return [...blanks, ...days];
                        })()}
                      </div>
                      <div className="mt-6 flex flex-wrap gap-4">
                        {[
                          { label: 'Positiva', cls: 'bg-green-500' },
                          { label: 'Neutral', cls: 'bg-yellow-500' },
                          { label: 'Negativa', cls: 'bg-orange-500' },
                          { label: 'Crítica', cls: 'bg-red-500' },
                        ].map(l => (
                          <div key={l.label} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${l.cls}`} />
                            <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-600'}`}>{l.label}</span>
                          </div>
                        ))}
                      </div>
                      {resumen.totalDias > 0 && (
                        <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-purple-50/50'}`}>
                          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                            Promedio del mes: <span className="text-purple-600 dark:text-purple-400">{resumen.promedioEscala}/10</span>
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {resumen.totalDias} días con registro emocional
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'charts' && (
                <div>
                  <h3 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Estadísticas de Evolución</h3>
                  {emoLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>
                  ) : (
                  <div className="space-y-6">
                    {/* Emotional Evolution Chart */}
                    <div className={`rounded-xl p-6 ${isDark ? 'bg-slate-700/50' : 'bg-gradient-to-r from-slate-50 to-purple-50/30'}`}>
                      <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Evolución Emocional (últimos 6 meses)</p>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={emotionalEvolutionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="day" stroke="#64748b" />
                          <YAxis stroke="#64748b" domain={[0, 10]} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="url(#colorGradient)" 
                            strokeWidth={3}
                            dot={{ fill: '#8b5cf6', r: 5 }}
                            activeDot={{ r: 8 }}
                          />
                          <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Session Attendance Chart */}
                    <div className={`rounded-xl p-6 ${isDark ? 'bg-slate-700/50' : 'bg-gradient-to-r from-slate-50 to-blue-50/30'}`}>
                      <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Asistencia a Sesiones</p>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={sessionAttendanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="asistidas" fill="#22c55e" name="Asistidas" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="programadas" fill="#94a3b8" name="Programadas" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Emotional Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`rounded-xl p-6 ${isDark ? 'bg-slate-700/50' : 'bg-gradient-to-r from-slate-50 to-green-50/30'}`}>
                        <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Distribución emocional (mes seleccionado)</p>
                        {pieDistributionData.length === 0 ? (
                          <div className={`flex h-[200px] items-center justify-center rounded-lg text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Sin registros emocionales en este mes
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={pieDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                              >
                                {pieDistributionData.map((entry) => (
                                  <Cell key={entry.name} fill={entry.color} stroke={isDark ? '#1e293b' : '#fff'} strokeWidth={1} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: number) => [`${value} día${value === 1 ? '' : 's'}`, '']}
                                contentStyle={{
                                  backgroundColor: isDark ? '#fff' : '#fff',
                                  border: `1px solid ${isDark ? '#475569' : '#e5e7eb'}`,
                                  borderRadius: 8,
                                  color: isDark ? '#f1f5f9' : '#0f172a',
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                        <ul className={`mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`} aria-label="Leyenda distribución emocional">
                          {emotionalDistributionData.map((d) => {
                            const pctVal = totalCat > 0 ? Math.round((d.value / totalCat) * 100) : 0;
                            return (
                              <li
                                key={d.name}
                                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${isDark ? 'border-slate-600/80 bg-slate-800/60' : 'border-slate-200/80 bg-white/60'}`}
                              >
                                <span className="h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/20" style={{ backgroundColor: d.color }} />
                                <span className="min-w-0 flex-1 font-medium" style={{ color: d.color }}>
                                  {d.name}
                                </span>
                                <span className={`shrink-0 tabular-nums ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                  {d.value} ({pctVal}%)
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <div className={`rounded-xl p-4 border ${isDark ? 'bg-green-900/30 border-green-700/50' : 'bg-green-50 border-green-200'}`}>
                          <p className={`text-sm mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Días Positivos</p>
                          <p className={`text-2xl ${isDark ? 'text-green-300' : 'text-green-700'}`}>{resumen.positivas}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{pct(resumen.positivas)} del mes</p>
                        </div>
                        <div className={`rounded-xl p-4 border ${isDark ? 'bg-yellow-900/30 border-yellow-700/50' : 'bg-yellow-50 border-yellow-200'}`}>
                          <p className={`text-sm mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Días Neutrales</p>
                          <p className={`text-2xl ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{resumen.neutrales}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{pct(resumen.neutrales)} del mes</p>
                        </div>
                        <div className={`rounded-xl p-4 border ${isDark ? 'bg-orange-900/30 border-orange-700/50' : 'bg-orange-50 border-orange-200'}`}>
                          <p className={`text-sm mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Días Negativos</p>
                          <p className={`text-2xl ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>{resumen.negativas}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{pct(resumen.negativas)} del mes</p>
                        </div>
                        <div className={`rounded-xl p-4 border ${isDark ? 'bg-red-900/30 border-red-700/50' : 'bg-red-50 border-red-200'}`}>
                          <p className={`text-sm mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Días Críticos</p>
                          <p className={`text-2xl ${isDark ? 'text-red-300' : 'text-red-700'}`}>{resumen.criticas}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{pct(resumen.criticas)} del mes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              )}

              {activeTab === 'test' && (
                <div>
                  <h3 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Test de Salud Mental</h3>
                  <div className={`rounded-xl p-6 mb-6 ${isDark ? 'bg-slate-700/50' : 'bg-gradient-to-r from-slate-50 to-purple-50/30'}`}>
                    <div className="text-center mb-4">
                      <p className={`text-sm mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Resultado General</p>
                      <div className="text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        7.5/10
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>
                        Salud Mental Estable
                      </span>
                    </div>
                    <p className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Última evaluación: 28 de Noviembre 2025
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-purple-100/50'}`}>
                      <p className={`text-sm mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Estado Emocional</p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${resumen.promedioEscala * 10}%` }}></div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-purple-100/50'}`}>
                      <p className={`text-sm mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Nivel de Estrés</p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-purple-100/50'}`}>
                      <p className={`text-sm mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Autoestima</p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Recomendaciones</h3>
                    <Button
                      onClick={() => setModalCrearOpen(true)}
                      variant="ghost"
                      className={`flex items-center gap-2 ${
                        isDark ? 'text-slate-300 hover:text-white hover:bg-slate-700/50' : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50/50'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Nueva recomendación
                    </Button>
                  </div>
                  {loadingRecs && (
                    <div className="space-y-3 py-4">
                      <div className={`animate-pulse rounded-xl w-full h-24 ${isDark ? 'bg-slate-700/50' : 'bg-slate-200'}`} />
                      <div className={`animate-pulse rounded-xl w-full h-24 ${isDark ? 'bg-slate-700/50' : 'bg-slate-200'}`} />
                      <div className={`animate-pulse rounded-xl w-full h-24 ${isDark ? 'bg-slate-700/50' : 'bg-slate-200'}`} />
                    </div>
                  )}
                  {!loadingRecs && errorRecs && (
                    <div className={`rounded-xl p-4 border ${isDark ? 'bg-red-900/30 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`}>
                      {errorRecs}
                    </div>
                  )}
                  {!loadingRecs && !errorRecs && recomendaciones.length === 0 && (
                    <div className={`rounded-xl p-8 text-center border ${isDark ? 'bg-slate-800/60 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      <p>No hay recomendaciones. Agregar una.</p>
                    </div>
                  )}
                  {!loadingRecs && !errorRecs && recomendaciones.length > 0 && (
                    <div className="space-y-3">
                      {recomendaciones.map((rec) => {
                        const badgeStyle = getEstadoBadgeStyle(rec.recEstado);
                        return (
                        <div
                          key={rec.recCodigo}
                          className={`rounded-xl p-4 border transition-all ${isDark ? 'bg-slate-800/70 border-slate-600 hover:border-slate-500' : 'bg-white border-purple-100/50 hover:border-purple-200 shadow-sm'}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className={`flex-1 min-w-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>{rec.recTitulo}</h4>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${badgeStyle.className ?? ''}`}
                                style={badgeStyle.style}
                              >
                                {rec.recEstado || 'Pendiente'}
                              </span>
                              <button
                                onClick={() => setModalEditarOpen(rec)}
                                className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-600' : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50'}`}
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setModalEliminarOpen(rec)}
                                className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-600' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'}`}
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {rec.recDescripcion && (
                            <p className={`text-sm mb-2 ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>{rec.recDescripcion}</p>
                          )}
                          {rec.recFechaVencimiento && (
                            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                              Finalizada: {formatearFecha(rec.recFechaVencimiento)}
                            </p>
                          )}
                        </div>
                      );})}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Crear Recomendación */}
      <ModalCrearRecomendacion
        open={modalCrearOpen}
        onOpenChange={setModalCrearOpen}
        seguimientoId={student.id}
        onSuccess={cargarRecomendaciones}
        isDark={isDark}
      />

      {/* Modal Editar Recomendación */}
      {modalEditarOpen && (
        <ModalEditarRecomendacion
          open={!!modalEditarOpen}
          onOpenChange={(o) => !o && setModalEditarOpen(null)}
          rec={modalEditarOpen}
          onSuccess={() => {
            cargarRecomendaciones();
            setModalEditarOpen(null);
          }}
          isDark={isDark}
        />
      )}

      {/* Modal Eliminar Recomendación */}
      {modalEliminarOpen && (
        <ModalEliminarRecomendacion
          open={!!modalEliminarOpen}
          onOpenChange={(o) => !o && setModalEliminarOpen(null)}
          rec={modalEliminarOpen}
          onSuccess={() => {
            cargarRecomendaciones();
            setModalEliminarOpen(null);
          }}
          isDark={isDark}
        />
      )}

      {/* Modal Confirmar Eliminar Seguimiento */}
      {showConfirmEliminarSeguimiento &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{
              zIndex: 2147483648,
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => !eliminandoSeguimiento && setShowConfirmEliminarSeguimiento(false)}
            role="presentation"
          >
            <div
              className="relative max-w-[23rem] overflow-hidden rounded-2xl shadow-2xl"
              style={{
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                border: isDark ? '1px solid rgba(248, 113, 113, 0.25)' : '1px solid rgba(252, 165, 165, 0.45)',
                boxShadow: isDark
                  ? '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)'
                  : '0 25px 50px -12px rgba(0,0,0,0.18)',
              }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="eliminar-seguimiento-titulo"
              aria-describedby="eliminar-seguimiento-desc"
            >
              <div className="flex items-start justify-items-center gap-3 border-b px-4 py-3 sm:items-center " style={{ borderColor: isDark ? 'rgba(51,65,85,0.9)' : '#f1f5f9' }}>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark ? 'rgba(127, 29, 29, 0.45)' : '#fee2e2',
                  }}
                  aria-hidden
                >
                  <AlertTriangle className="h-5 w-5 shrink-0" style={{ color: isDark ? '#f87171' : '#dc2626' }} strokeWidth={2.25} />
                </div>
                <div className="min-w-0 h-full flex-1 pt-0.5">
                  <h2 id="eliminar-seguimiento-titulo" className={`text-[15px] font-semibold leading-tight h-full flex-1 pt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Eliminar seguimiento
                  </h2>
                </div>
              </div>

              <div id="eliminar-seguimiento-desc" className="space-y-1 px-4 py-3">
                <p className={`text-[13px] leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  ¿Confirmas que deseas eliminar el seguimiento de{' '}
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{nombreSeguimientoModal}</span>?
                </p>
              </div>
              <div
                className="flex flex-col gap-3 px-4 py-4 pt-3 pb-8 sm:flex-row sm:items-center sm:justify-end"
                style={{
                  borderColor: isDark ? 'rgba(51,65,85,0.9)' : '#f1f5f9',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                }}
              >
                
                <button
                  type="button"
                  disabled={eliminandoSeguimiento}
                  onClick={() => setShowConfirmEliminarSeguimiento(false)}
                  style={isDark ? modalCancelBtnDark : modalCancelBtnLight}
                  className="min-h-[40px] w-full px-2 py-2 text-sm font-medium transition-[opacity,transform] hover:opacity-95 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45 sm:w-auto sm:min-w-[7.5rem]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={eliminandoSeguimiento || !student.id}
                  onClick={async () => {
                    if (!student.id) return;
                    setEliminandoSeguimiento(true);
                    try {
                      await eliminarSeguimiento(student.id);
                      setShowConfirmEliminarSeguimiento(false);
                      onSeguimientoDeleted?.();
                    } catch (e) {
                      alert(e instanceof Error ? e.message : 'Error al eliminar el seguimiento');
                    } finally {
                      setEliminandoSeguimiento(false);
                    }
                  }}
                  style={modalDangerConfirmBtnStyle}
                  className="inline-flex min-h-[40px] w-full shrink-0 items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-[filter,opacity] hover:brightness-110 active:brightness-95 disabled:pointer-events-none disabled:opacity-45 sm:w-auto sm:min-w-[10rem]"
                >
                  {eliminandoSeguimiento ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white" aria-hidden />
                      Eliminando…
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 shrink-0 text-white opacity-95" aria-hidden />
                      Sí, eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal Confirmar Finalizar Seguimiento */}
      {showConfirmFinalizar &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{
              zIndex: 2147483648,
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={() => setShowConfirmFinalizar(false)}
          >
            <div
              className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              style={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: isDark ? '1px solid rgba(100,116,139,0.4)' : '1px solid rgba(216,180,254,0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Finalizar seguimiento</h2>
              </div>
              <div className="p-6 space-y-4">
                <p className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                  ¿Deseas finalizar el seguimiento de{' '}
                  <span className="font-semibold">{student.name}</span>? A continuación deberás firmar como profesional.
                </p>
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmFinalizar(false)}
                    className={`flex-1 min-h-[48px] rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                      isDark
                        ? 'border-slate-500 text-slate-200 hover:bg-slate-700/80'
                        : 'border-purple-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmFinalizar(false);
                      setShowFirmaModal(true);
                    }}
                    className="flex-1 min-h-[48px] rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:shadow-lg transition-all"
                  >
                    Sí, continuar
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal Firma del Profesional (finalizar) */}
      {showFirmaModal && (
        <ModalFirmaFinalizar
          isDark={isDark}
          studentName={student.name}
          onClose={() => setShowFirmaModal(false)}
          onSuccess={async (firmaUrl: string) => {
            if (!seguimiento || !student.id) return;
            setFinalizando(true);
            try {
              const now = new Date().toISOString();
              await editarSeguimiento(student.id, {
                segAprendizFk: seguimiento.segAprendizFk,
                segPsicologoFk: seguimiento.segPsicologoFk,
                segFechaSeguimiento: seguimiento.fechaInicioSeguimiento ?? undefined,
                segFechaFin: now,
                segAreaRemitido: seguimiento.areaRemitido ?? undefined,
                segTrimestreActual: seguimiento.trimestreActual ?? undefined,
                segMotivo: seguimiento.motivo ?? undefined,
                segDescripcion: seguimiento.descripcion ?? undefined,
                segEstadoSeguimiento: ESTADOS_SEGUIMIENTO_API.estable,
                segFirmaProfesional: firmaUrl,
                segFirmaAprendiz: seguimiento.firmaAprendiz ?? undefined,
              });
              setShowFirmaModal(false);
              onSeguimientoUpdated?.();
            } catch (e) {
              alert(e instanceof Error ? e.message : 'Error al finalizar');
            } finally {
              setFinalizando(false);
            }
          }}
          finalizando={finalizando}
        />
      )}

      {/* Modal Editar Firma del Profesional */}
      {showEditarFirmaModal && (
        <ModalFirmaFinalizar
          isDark={isDark}
          studentName={student.name}
          onClose={() => setShowEditarFirmaModal(false)}
          title="Editar firma del profesional"
          description={`Actualiza tu firma para el seguimiento de ${student.name}.`}
          confirmLabel="Guardar cambios"
          loadingLabel="Guardando…"
          onImageDeleted={async (deletedUrl) => {
            if (!seguimiento || !student.id || seguimiento.firmaProfesional !== deletedUrl) return;
            try {
              await editarSeguimiento(student.id, {
                segAprendizFk: seguimiento.segAprendizFk,
                segPsicologoFk: seguimiento.segPsicologoFk,
                segFechaSeguimiento: seguimiento.fechaInicioSeguimiento ?? undefined,
                segFechaFin: seguimiento.fechaFinSeguimiento ?? undefined,
                segAreaRemitido: seguimiento.areaRemitido ?? undefined,
                segTrimestreActual: seguimiento.trimestreActual ?? undefined,
                segMotivo: seguimiento.motivo ?? undefined,
                segDescripcion: seguimiento.descripcion ?? undefined,
                segEstadoSeguimiento: seguimiento.estadoSeguimiento ?? ESTADOS_SEGUIMIENTO_API.estable,
                segFirmaProfesional: '',
                segFirmaAprendiz: seguimiento.firmaAprendiz ?? undefined,
              });
              onSeguimientoUpdated?.();
            } catch {
              /* ya mostramos error en el delete */
            }
          }}
          onSuccess={async (firmaUrl: string) => {
            if (!seguimiento || !student.id) return;
            setFinalizando(true);
            try {
              await editarSeguimiento(student.id, {
                segAprendizFk: seguimiento.segAprendizFk,
                segPsicologoFk: seguimiento.segPsicologoFk,
                segFechaSeguimiento: seguimiento.fechaInicioSeguimiento ?? undefined,
                segFechaFin: seguimiento.fechaFinSeguimiento ?? undefined,
                segAreaRemitido: seguimiento.areaRemitido ?? undefined,
                segTrimestreActual: seguimiento.trimestreActual ?? undefined,
                segMotivo: seguimiento.motivo ?? undefined,
                segDescripcion: seguimiento.descripcion ?? undefined,
                segEstadoSeguimiento: seguimiento.estadoSeguimiento ?? ESTADOS_SEGUIMIENTO_API.estable,
                segFirmaProfesional: firmaUrl,
                segFirmaAprendiz: seguimiento.firmaAprendiz ?? undefined,
              });
              setShowEditarFirmaModal(false);
              onSeguimientoUpdated?.();
            } catch (e) {
              alert(e instanceof Error ? e.message : 'Error al actualizar la firma');
            } finally {
              setFinalizando(false);
            }
          }}
          finalizando={finalizando}
        />
      )}
    </div>
  );
}

function ModalCrearRecomendacion({
  open,
  onOpenChange,
  seguimientoId,
  onSuccess,
  isDark,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  seguimientoId: number;
  onSuccess: () => void;
  isDark: boolean;
}) {
  const [selectContainer, setSelectContainer] = useState<HTMLDivElement | null>(null);
  const estadoSelectRef = useRef<HTMLDivElement>(null);
  const [estadoSelectWidth, setEstadoSelectWidth] = useState(280);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = estadoSelectRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === 'number' && w > 0) setEstadoSelectWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: CrearRecomendacionPayload = {
        recSeguimientoFk: seguimientoId,
        recTitulo: titulo.trim(),
        recDescripcion: descripcion.trim() || null,
        recEstado: estado,
      };
      await crear(payload);
      setTitulo('');
      setDescripcion('');
      setEstado('Pendiente');
      onOpenChange(false);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const modalContent = (
    <div
      ref={(el) => { if (el) setSelectContainer(el); }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 2147483647 }}
      onClick={() => !loading && onOpenChange(false)}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-900 border border-slate-600' : 'bg-white border border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Nueva recomendación</h3>
          <button
            type="button"
            onClick={() => !loading && onOpenChange(false)}
            className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="rec-titulo" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id="rec-titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título de la recomendación"
              className={`${inputBase} ${isDark ? inputDark : inputLight}`}
              required
            />
          </div>
          <div>
            <label htmlFor="rec-descripcion" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Descripción
            </label>
            <textarea
              id="rec-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
              className={`${textareaBase} ${isDark ? inputDark : inputLight}`}
            />
          </div>
          <div ref={estadoSelectRef} className="space-y-2">
            <label htmlFor="rec-estado" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Estado
            </label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger
                id="rec-estado"
                className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-purple-500/50 ${
                  isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-purple-200/50 bg-slate-50 text-slate-700'
                }`}
              >
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent
                container={selectContainer}
                className={`z-[9999] rounded-xl shadow-lg ${
                  isDark ? 'border-slate-500 text-white settings-select-dark' : 'border-slate-200 text-slate-900 select-light-dropdown'
                }`}
                style={isDark ? { backgroundColor: '#334155', width: estadoSelectWidth, minWidth: estadoSelectWidth } : { backgroundColor: '#fff', width: estadoSelectWidth, minWidth: estadoSelectWidth }}
                position="popper"
                sideOffset={4}
              >
                {getEstados().map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                    hideIndicator
                    className={isDark ? 'px-4 py-2.5 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2.5 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className={`flex-1 rounded-2xl border px-6 py-3 transition-all disabled:opacity-50 ${
                isDark ? 'border-slate-600 text-slate-200 hover:bg-slate-700' : 'border-purple-200/50 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white transition-all hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

type FirmaMode = 'draw' | 'saved' | 'upload';

function ModalFirmaFinalizar({
  isDark,
  studentName,
  onClose,
  onSuccess,
  onImageDeleted,
  finalizando,
  title = 'Firma del profesional',
  description,
  confirmLabel = 'Confirmar y finalizar',
  loadingLabel = 'Finalizando…',
}: {
  isDark: boolean;
  studentName: string;
  onClose: () => void;
  onSuccess: (firmaUrl: string) => Promise<void>;
  onImageDeleted?: (deletedUrl: string) => Promise<void>;
  finalizando: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loadingLabel?: string;
}) {
  const desc = description ?? `Elige cómo firmar para finalizar el seguimiento de ${studentName}.`;
  const [mode, setMode] = useState<FirmaMode>('draw');
  const [savedFirmas, setSavedFirmas] = useState<ImageItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [selectedSavedUrl, setSelectedSavedUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshSavedFirmas = useCallback(() => {
    setSavedLoading(true);
    listImages('firma', 20)
      .then((list) => {
        setSavedFirmas(list);
        setSelectedSavedUrl((prev) => {
          if (!prev) return null;
          const stillExists = list.some((i) => (i.secureUrl ?? i.url) === prev);
          return stillExists ? prev : null;
        });
      })
      .finally(() => setSavedLoading(false));
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (mode === 'saved') {
      refreshSavedFirmas();
      setSelectedSavedUrl(null);
    } else if (mode === 'upload') {
      setUploadedUrl(null);
    }
  }, [mode, refreshSavedFirmas]);

  useEffect(() => {
    if (mode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const init = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = isDark ? '#ffffff' : '#1e293b';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.fillStyle = isDark ? '#334155' : '#f8fafc';
      ctx.fillRect(0, 0, rect.width, rect.height);
    };
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(init);
    });
    return () => cancelAnimationFrame(id);
  }, [isDark, mode]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const draw = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    isDrawingRef.current = true;
    lastPosRef.current = pos;
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const pos = getPos(e);
    if (!pos || !lastPosRef.current) return;
    draw(lastPosRef.current, pos);
    lastPosRef.current = pos;
  };

  const onPointerUp = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = isDark ? '#334155' : '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const handleConfirmDraw = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          alert('No se pudo generar la imagen de la firma. Intenta de nuevo.');
          return;
        }
        const file = new File([blob], 'firma.png', { type: 'image/png' });
        try {
          const url = await uploadSignatureImage(file);
          await onSuccess(url);
        } catch (e) {
          alert(e instanceof Error ? e.message : 'Error al subir la firma');
        }
      },
      'image/png',
      0.95
    );
  };

  const handleConfirmSaved = () => {
    if (selectedSavedUrl) onSuccess(selectedSavedUrl);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const url = await uploadSignatureImage(file);
      setUploadedUrl(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al subir la imagen');
    }
    e.target.value = '';
  };

  const handleConfirmUpload = () => {
    if (uploadedUrl) onSuccess(uploadedUrl);
  };

  const canConfirm =
    (mode === 'draw') ||
    (mode === 'saved' && selectedSavedUrl) ||
    (mode === 'upload' && uploadedUrl);

  const handleConfirm = () => {
    if (mode === 'draw') handleConfirmDraw();
    else if (mode === 'saved') handleConfirmSaved();
    else if (mode === 'upload') handleConfirmUpload();
  };

  const tabClass = (m: FirmaMode) =>
    `flex items-center gap-2 flex-1 justify-center min-h-[44px] rounded-lg text-sm font-medium transition-all shrink-0 ${
      mode === m
        ? isDark
          ? 'bg-purple-600 text-white shadow-md'
          : 'bg-purple-100 text-purple-700 border border-purple-200'
        : isDark
          ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600'
          : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-slate-200'
    }`;

  const btnSecundario = `flex-1 min-h-[48px] rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
    isDark
      ? 'border-slate-500 bg-slate-700/80 text-slate-100 hover:bg-slate-600 hover:border-slate-400'
      : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
  }`;

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 2147483648,
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={() => !finalizando && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          border: isDark ? '1px solid rgba(100,116,139,0.4)' : '1px solid rgba(216,180,254,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={() => !finalizando && onClose()}
            className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            {desc}
          </p>

          <div
            className={`flex gap-2 p-1.5 rounded-xl ${
              isDark
                ? 'bg-slate-800/60 border border-slate-600'
                : 'bg-slate-100 border border-slate-200'
            }`}
          >
            <button type="button" onClick={() => setMode('draw')} className={tabClass('draw')}>
              <PenLine className="w-4 h-4 shrink-0" />
              <span>Dibujar</span>
            </button>
            <button type="button" onClick={() => setMode('saved')} className={tabClass('saved')}>
              <Image className="w-4 h-4 shrink-0" />
              <span>Usar guardada</span>
            </button>
            <button type="button" onClick={() => setMode('upload')} className={tabClass('upload')}>
              <Upload className="w-4 h-4 shrink-0" />
              <span>Cargar imagen</span>
            </button>
          </div>

          {mode === 'draw' && (
            <canvas
              ref={canvasRef}
              className={`w-full h-40 rounded-xl border-2 cursor-crosshair touch-none ${
                isDark ? 'border-slate-500 bg-slate-700/50' : 'border-slate-200 bg-slate-50'
              }`}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              onTouchEnd={onPointerUp}
              style={{ touchAction: 'none' }}
            />
          )}

          {mode === 'saved' && (
            <div
              className={`min-h-[10rem] rounded-xl border-2 p-4 ${
                isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              {savedLoading ? (
                <p className={`text-sm text-center py-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Cargando firmas guardadas…
                </p>
              ) : savedFirmas.length === 0 ? (
                <p className={`text-sm text-center py-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  No tienes firmas guardadas. Dibuja una o carga una imagen para guardarla.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {savedFirmas.map((img) => {
                    const url = img.secureUrl ?? img.url ?? '';
                    const sel = selectedSavedUrl === url;
                    const isDeleting = deletingId === img._id;
                    return (
                      <div
                        key={img._id}
                        className={`relative aspect-square rounded-lg border-2 overflow-visible bg-white dark:bg-slate-800 transition-all ${
                          sel
                            ? 'border-purple-500 ring-2 ring-purple-500'
                            : isDark
                              ? 'border-slate-600 hover:border-slate-500'
                              : 'border-slate-200 hover:border-slate-300'
                        }`}
                        style={sel ? { boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.6), 0 4px 14px rgba(139, 92, 246, 0.35)' } : undefined}
                      >
                        <div className="absolute inset-0 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setSelectedSavedUrl(url)}
                            className="absolute inset-0 w-full h-full flex items-center justify-center p-1 bg-transparent"
                          >
                            <img src={url} alt="Firma guardada" className="max-w-full max-h-full object-contain" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (isDeleting) return;
                            setDeletingId(img._id);
                            try {
                              await deleteImage(img._id);
                              if (selectedSavedUrl === url) setSelectedSavedUrl(null);
                              await onImageDeleted?.(url);
                              refreshSavedFirmas();
                            } catch (err) {
                              alert(err instanceof Error ? err.message : 'Error al eliminar');
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                          disabled={isDeleting}
                          title="Eliminar firma"
                          style={{ backgroundColor: 'gray' }}
                          className="absolute -top-1 -right-1 z-20 w-5 h-5 flex items-center justify-center p-2 text-white border-2 border-white drop-shadow-lg hover:brightness-110 disabled:opacity-60"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                          ) : (
                            <X className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {mode === 'upload' && (
            <div
              className={`min-h-[10rem] rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-3 ${
                isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {uploadedUrl ? (
                <div className="w-full space-y-2">
                  <div className="aspect-video rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
                    <img src={uploadedUrl} alt="Imagen cargada" className="w-full h-full object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`text-sm ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                  >
                    Cambiar imagen
                  </button>
                </div>
              ) : (
                <>
                  <Upload className={`w-12 h-12 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <p className={`text-sm text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Selecciona una imagen de tu firma
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={finalizando}
                    className="min-h-[44px] px-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-60"
                  >
                    Seleccionar archivo
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button type="button" onClick={() => !finalizando && onClose()} className={btnSecundario}>
              Cancelar
            </button>
            {mode === 'draw' && (
              <button type="button" onClick={clearCanvas} disabled={finalizando} className={btnSecundario}>
                Limpiar
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={finalizando || !canConfirm}
              className="flex-1 min-h-[48px] rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {finalizando ? loadingLabel : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function ModalEditarRecomendacion({
  open,
  onOpenChange,
  rec,
  onSuccess,
  isDark,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  rec: RecomendacionItem;
  onSuccess: () => void;
  isDark: boolean;
}) {
  const [selectContainer, setSelectContainer] = useState<HTMLDivElement | null>(null);
  const estadoSelectRef = useRef<HTMLDivElement>(null);
  const [estadoSelectWidth, setEstadoSelectWidth] = useState(280);
  const [titulo, setTitulo] = useState(rec.recTitulo);
  const [descripcion, setDescripcion] = useState(rec.recDescripcion || '');
  const [estado, setEstado] = useState(rec.recEstado || 'Pendiente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitulo(rec.recTitulo);
    setDescripcion(rec.recDescripcion || '');
    setEstado(rec.recEstado || 'Pendiente');
  }, [rec]);

  useEffect(() => {
    const el = estadoSelectRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === 'number' && w > 0) setEstadoSelectWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await actualizar(rec.recCodigo, {
        recTitulo: titulo.trim(),
        recDescripcion: descripcion.trim() || null,
        recEstado: estado,
      });
      onOpenChange(false);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const modalContent = (
    <div
      ref={(el) => { if (el) setSelectContainer(el); }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 2147483647 }}
      onClick={() => !loading && onOpenChange(false)}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-900 border border-slate-600' : 'bg-white border border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Editar recomendación</h3>
          <button
            type="button"
            onClick={() => !loading && onOpenChange(false)}
            className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="edit-titulo" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título de la recomendación"
              className={`${inputBase} ${isDark ? inputDark : inputLight}`}
              required
            />
          </div>
          <div>
            <label htmlFor="edit-descripcion" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Descripción
            </label>
            <textarea
              id="edit-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
              className={`${textareaBase} ${isDark ? inputDark : inputLight}`}
            />
          </div>
          <div ref={estadoSelectRef} className="space-y-2">
            <label htmlFor="edit-estado" className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              Estado
            </label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger
                id="edit-estado"
                className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-purple-500/50 ${
                  isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-purple-200/50 bg-slate-50 text-slate-700'
                }`}
              >
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent
                container={selectContainer}
                className={`z-[9999] rounded-xl shadow-lg ${
                  isDark ? 'border-slate-500 text-white settings-select-dark' : 'border-slate-200 text-slate-900 select-light-dropdown'
                }`}
                style={isDark ? { backgroundColor: '#334155', width: estadoSelectWidth, minWidth: estadoSelectWidth } : { backgroundColor: '#fff', width: estadoSelectWidth, minWidth: estadoSelectWidth }}
                position="popper"
                sideOffset={4}
              >
                {getEstados().map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                    hideIndicator
                    className={isDark ? 'px-4 py-2.5 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-4 py-2.5 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className={`flex-1 rounded-2xl border px-6 py-3 transition-all disabled:opacity-50 ${
                isDark ? 'border-slate-600 text-slate-200 hover:bg-slate-700' : 'border-purple-200/50 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white transition-all hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function ModalEliminarRecomendacion({
  open,
  onOpenChange,
  rec,
  onSuccess,
  isDark,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  rec: RecomendacionItem;
  onSuccess: () => void;
  isDark: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await eliminar(rec.recCodigo);
      onOpenChange(false);
      onSuccess();
    } catch {
      setLoading(false);
    }
  };

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 2147483647 }}
      onClick={() => !loading && onOpenChange(false)}
    >
      <div
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-900 border border-slate-600' : 'bg-white border border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Eliminar recomendación</h3>
          <button
            type="button"
            onClick={() => !loading && onOpenChange(false)}
            className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            ¿Estás seguro de que deseas eliminar la recomendación &quot;<strong className={isDark ? 'text-slate-100' : 'text-slate-800'}>{rec.recTitulo}</strong>&quot;? Esta acción no se puede deshacer.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => !loading && onOpenChange(false)}
              disabled={loading}
              className={`flex-1 rounded-2xl border px-6 py-3 transition-all disabled:opacity-50 ${
                isDark ? 'border-slate-600 text-slate-200 hover:bg-slate-700' : 'border-purple-200/50 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 rounded-2xl bg-red-600 px-6 py-3 font-medium text-white transition-all hover:bg-red-700 hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}