import { useState, useEffect } from 'react';
import { Calendar, Users, MessageSquare, Activity, AlertCircle, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { usePsychologist } from '../contexts/PsychologistContext';
import { useTheme } from '../contexts/ThemeContext';
import { getTotalAprendices } from '../lib/aprendiz';
import {
  getCitasHoy,
  getComparacionSemanal,
  getCitasAgenda,
  getCitaFieldFromApi,
  getStudentNameFromCita,
  getFichaFromCita,
  formatHoraCita,
  etiquetaEstadoCita,
} from '../lib/citas';
import { getPsychologistId } from '../lib/auth';
import { getPsychologistIdFromToken } from '../lib/psychologist';
import { getTendenciaEstado, getSeguimientosPrioritariosDashboard } from '../lib/seguimiento';
import type { TendenciaEstadoItem, SeguimientoPrioritarioDashboard } from '../lib/seguimiento';
import { getActividadMensual } from '../lib/dashboard';
import { getMensajesPorMes } from '../lib/chat';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const EMPTY_WEEKLY_DATA = [
  { day: 'Lun', semanaActual: 0, semanaAnterior: 0 },
  { day: 'Mar', semanaActual: 0, semanaAnterior: 0 },
  { day: 'Mié', semanaActual: 0, semanaAnterior: 0 },
  { day: 'Jue', semanaActual: 0, semanaAnterior: 0 },
  { day: 'Vie', semanaActual: 0, semanaAnterior: 0 },
  { day: 'Sáb', semanaActual: 0, semanaAnterior: 0 },
  { day: 'Dom', semanaActual: 0, semanaAnterior: 0 },
];

interface CitaHoyDashboardRow {
  citCodigo: number;
  time: string;
  name: string;
  ficha: string;
  statusLabel: string;
  estadoRaw: string;
}

function claseBadgeEstadoCita(estadoRaw: string, isDark: boolean): string {
  const k = estadoRaw.trim().toLowerCase();
  if (k === 'realizada' || k === 'completada') {
    return isDark ? 'bg-emerald-900/35 text-emerald-300' : 'bg-emerald-100 text-emerald-800';
  }
  if (k === 'cancelada') {
    return isDark ? 'bg-red-900/35 text-red-300' : 'bg-red-100 text-red-800';
  }
  return isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
}

/** Fecha de hoy en español (ej. "Viernes, 27 de marzo de 2026"). */
function formatearFechaHoyLarga(): string {
  const s = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function Dashboard() {
  const { displayName } = usePsychologist();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const chartStroke = isDark ? '#94a3b8' : '#64748b';
  const gridStroke = isDark ? '#334155' : '#e5e7eb';
  const [totalAprendices, setTotalAprendices] = useState<number | null>(null);
  const [citasHoy, setCitasHoy] = useState<number | null>(null);
  const [tendenciaModo, setTendenciaModo] = useState<'recientes' | 'cuatrimestre' | 'rango'>('recientes');
  const [anioCuatrimestre, setAnioCuatrimestre] = useState<string>(String(new Date().getFullYear()));
  const [cuatrimestre, setCuatrimestre] = useState<string>('1');
  const [rangoDesde, setRangoDesde] = useState<string>('');
  const [rangoHasta, setRangoHasta] = useState<string>('');
  const [rangoError, setRangoError] = useState<string>('');
  const [followupTrendsData, setFollowupTrendsData] = useState<TendenciaEstadoItem[]>([]);
  const [appointmentsData, setAppointmentsData] = useState<{ day: string; semanaActual: number; semanaAnterior: number }[]>([]);
  const [monthlyActivityData, setMonthlyActivityData] = useState<
    { mes: string; citas: number; seguimientos: number; mensajes: number }[]
  >([]);
  const [monthlyActivityLoading, setMonthlyActivityLoading] = useState(true);
  const [citasHoyList, setCitasHoyList] = useState<CitaHoyDashboardRow[]>([]);
  const [citasHoyListLoading, setCitasHoyListLoading] = useState(true);
  const [casosPrioritarios, setCasosPrioritarios] = useState<SeguimientoPrioritarioDashboard[]>([]);
  const [casosPrioritariosLoading, setCasosPrioritariosLoading] = useState(true);

  useEffect(() => {
    getTotalAprendices()
      .then(setTotalAprendices)
      .catch(() => setTotalAprendices(0));
  }, []);

  useEffect(() => {
    getCitasHoy()
      .then(setCitasHoy)
      .catch(() => setCitasHoy(0));
  }, []);

  useEffect(() => {
    const pid = getPsychologistIdFromToken() ?? getPsychologistId();
    if (!pid) {
      setCitasHoyList([]);
      setCitasHoyListLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setCitasHoyListLoading(true);
      try {
        const today = toDateInputValue(new Date());
        const citas = await getCitasAgenda(today, today);
        if (cancelled) return;
        setCitasHoyList(
          citas.map((c) => {
            const raw = String(getCitaFieldFromApi<string>(c, 'citEstadoCita', 'CitEstadoCita') ?? '').trim();
            return {
              citCodigo: c.citCodigo,
              time: formatHoraCita(getCitaFieldFromApi<string>(c, 'citHoraInicio', 'CitHoraInicio')),
              name: getStudentNameFromCita(c),
              ficha: getFichaFromCita(c) || '—',
              statusLabel: etiquetaEstadoCita(raw || null),
              estadoRaw: raw,
            };
          })
        );
      } catch {
        if (!cancelled) setCitasHoyList([]);
      } finally {
        if (!cancelled) setCitasHoyListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const pid = getPsychologistIdFromToken() ?? getPsychologistId();
    if (!pid) {
      setCasosPrioritarios([]);
      setCasosPrioritariosLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setCasosPrioritariosLoading(true);
      try {
        const rows = await getSeguimientosPrioritariosDashboard(5);
        if (!cancelled) setCasosPrioritarios(rows);
      } catch {
        if (!cancelled) setCasosPrioritarios([]);
      } finally {
        if (!cancelled) setCasosPrioritariosLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const psicologoId = getPsychologistIdFromToken() ?? getPsychologistId();
    if (!psicologoId) return;
    getComparacionSemanal(psicologoId)
      .then(setAppointmentsData)
      .catch(() => setAppointmentsData([]));
  }, []);

  useEffect(() => {
    const pid = getPsychologistIdFromToken() ?? getPsychologistId();
    if (pid == null) {
      setMonthlyActivityData([]);
      setMonthlyActivityLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setMonthlyActivityLoading(true);
      try {
        const [act, msgs] = await Promise.all([
          getActividadMensual(pid, 6),
          getMensajesPorMes(6).catch(() => [] as { año: number; mes: number; total: number }[]),
        ]);
        if (cancelled) return;
        const msgMap = new Map<string, number>();
        for (const row of msgs) {
          msgMap.set(`${row.año}-${row.mes}`, row.total);
        }
        const merged = act.map((row) => ({
          mes: row.mes,
          citas: row.citas,
          seguimientos: row.seguimientos,
          mensajes: msgMap.get(`${row.anio}-${row.mesNumero}`) ?? row.mensajes ?? 0,
        }));
        setMonthlyActivityData(merged);
      } catch {
        if (!cancelled) setMonthlyActivityData([]);
      } finally {
        if (!cancelled) setMonthlyActivityLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toDateInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const isRangeValid = (from: string, to: string) => {
    if (!from || !to) return true;
    const fromDate = new Date(`${from}T00:00:00`);
    const toDate = new Date(`${to}T00:00:00`);
    if (toDate < fromDate) return false;
    const maxDate = addMonths(fromDate, 4);
    return toDate <= maxDate;
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (tendenciaModo === 'rango') {
        if (!rangoDesde || !rangoHasta || rangoError) {
          setFollowupTrendsData([]);
          return;
        }
      }

      if (tendenciaModo === 'cuatrimestre') {
        const year = parseInt(anioCuatrimestre, 10);
        if (!year || isNaN(year)) {
          setFollowupTrendsData([]);
          return;
        }
      }

      try {
        const data = await getTendenciaEstado({
          modo: tendenciaModo,
          anio: tendenciaModo === 'cuatrimestre' ? parseInt(anioCuatrimestre, 10) : undefined,
          cuatrimestre: tendenciaModo === 'cuatrimestre' ? parseInt(cuatrimestre, 10) : undefined,
          desde: tendenciaModo === 'rango' ? rangoDesde : undefined,
          hasta: tendenciaModo === 'rango' ? rangoHasta : undefined,
        });
        if (!cancelled) setFollowupTrendsData(data);
      } catch {
        if (!cancelled) setFollowupTrendsData([]);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [tendenciaModo, anioCuatrimestre, cuatrimestre, rangoDesde, rangoHasta, rangoError]);

  const stats = [
    {
      label: 'Citas Hoy',
      value: citasHoy !== null ? String(citasHoy) : '—',
      icon: Calendar,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-50',
      change: '+2',
      percentage: '+25%',
      trend: 'up',
      comparison: 'vs ayer'
    },
    {
      label: 'Seguimientos Activos',
      value: '24',
      icon: Activity,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      change: '+3',
      percentage: '+14%',
      trend: 'up',
      comparison: 'vs semana pasada'
    },
    {
      label: 'Mensajes Nuevos',
      value: '12',
      icon: MessageSquare,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      change: '-2',
      percentage: '-14%',
      trend: 'down',
      comparison: 'vs ayer'
    },
    {
      label: 'Total Aprendices',
      value: totalAprendices !== null ? String(totalAprendices) : '—',
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      change: '+8',
      percentage: '+5%',
      trend: 'up' as const,
      comparison: 'vs mes pasado',
      showOnlyTotal: true,
    }
  ];

  const fechaHoyTexto = formatearFechaHoyLarga();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Inicio
          </h1>
          <p className="text-slate-600" style={isDark ? { color: '#e2e8f0' } : undefined}>Bienvenido de nuevo, {displayName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500" style={isDark ? { color: '#cbd5e1' } : undefined}>Hoy</p>
          <p className="text-slate-800" style={isDark ? { color: 'white' } : undefined}>{fechaHoyTexto}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isTotalAprendices = 'showOnlyTotal' in stat && stat.showOnlyTotal;

          if (isTotalAprendices) {
            return (
              <div
                key={index}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} dark:bg-green-900/30 flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-green-600 dark:text-green-400" stroke="currentColor" />
                </div>
                <h3 className="text-3xl mb-1 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent" style={isDark ? { background: 'none', color: 'white', WebkitTextFillColor: 'white' } : undefined}>
                  {stat.value}
                </h3>
                <p className="text-slate-600 text-sm" style={isDark ? { color: '#e2e8f0' } : undefined}>Total de aprendices</p>
              </div>
            );
          }

          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          return (
            <div
              key={index}
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} dark:bg-slate-700/50 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                  stat.trend === 'up' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'
                }`}>
                  <TrendIcon className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.percentage}
                  </span>
                </div>
              </div>
              <h3 className="text-3xl mb-1 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent" style={isDark ? { background: 'none', color: 'white', WebkitTextFillColor: 'white' } : undefined}>
                {stat.value}
              </h3>
              <p className="text-slate-600 text-sm mb-2" style={isDark ? { color: '#e2e8f0' } : undefined}>{stat.label}</p>
              <p className="text-xs text-slate-500" style={isDark ? { color: '#cbd5e1' } : undefined}>
                <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span> {stat.comparison}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Appointments Comparison */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 dark:border-slate-600/50 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl text-slate-800 mb-1" style={isDark ? { color: 'white' } : undefined}>Citas Semanales</h2>
            <p className="text-sm text-slate-500" style={isDark ? { color: '#e2e8f0' } : undefined}>Comparación con semana anterior</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={appointmentsData.length > 0 ? appointmentsData : EMPTY_WEEKLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" stroke={chartStroke} />
              <YAxis stroke={chartStroke} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.95)', 
                  border: isDark ? '1px solid #475569' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: isDark ? '#f8fafc' : undefined
                }}
              />
              <Legend wrapperStyle={isDark ? { color: '#e2e8f0' } : undefined} />
              <Bar dataKey="semanaActual" fill="url(#colorGradient)" name="Semana Actual" radius={[8, 8, 0, 0]} />
              <Bar dataKey="semanaAnterior" fill="#cbd5e1" name="Semana Anterior" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Follow-up Trends */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 dark:border-slate-600/50 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl text-slate-800 mb-1" style={isDark ? { color: 'white' } : undefined}>Tendencia de Seguimientos</h2>
            <div className="mt-2">
              <div className="flex items-center gap-3 flex-nowrap">
              <Select value={tendenciaModo} onValueChange={(v) => setTendenciaModo(v as 'recientes' | 'cuatrimestre' | 'rango')}>
                <SelectTrigger
                  className={`w-40 h-8 px-3 py-1.5 rounded-lg border text-sm focus:ring-2 focus:ring-purple-500/50 ${
                    isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-purple-200/50 bg-slate-50 text-slate-700'
                  }`}
                >
                  <SelectValue placeholder="Recientes" />
                </SelectTrigger>
                <SelectContent
                  className={`!w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-lg ${
                    isDark ? '!bg-slate-700 border-slate-500 text-white settings-select-dark' : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                  }`}
                  style={isDark ? { backgroundColor: '#334155', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' } : { backgroundColor: '#fff', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' }}
                >
                  <SelectItem value="recientes" hideIndicator className={isDark ? 'px-3 py-1.5 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-3 py-1.5 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>Recientes</SelectItem>
                  <SelectItem value="cuatrimestre" hideIndicator className={isDark ? 'px-3 py-1.5 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-3 py-1.5 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>Cuatrimestre</SelectItem>
                  <SelectItem value="rango" hideIndicator className={isDark ? 'px-3 py-1.5 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-3 py-1.5 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>Rango personalizado</SelectItem>
                </SelectContent>
              </Select>

              {tendenciaModo === 'cuatrimestre' && (
                <>
                  <input
                    type="number"
                    min={2000}
                    max={2100}
                    value={anioCuatrimestre}
                    onChange={(e) => setAnioCuatrimestre(e.target.value)}
                    placeholder="Año"
                    className={`w-24 h-8 px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                      isDark ? 'border-slate-500 !bg-transparent text-white placeholder:text-slate-400' : 'border-purple-200/50 bg-slate-50 text-slate-700'
                    }`}
                  />
                  <Select value={cuatrimestre} onValueChange={setCuatrimestre}>
                    <SelectTrigger
                      className={`w-56 h-8 px-3 py-1.5 rounded-lg border text-sm focus:ring-2 focus:ring-purple-500/50 ${
                        isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-purple-200/50 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={`!w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-lg ${
                        isDark ? '!bg-slate-700 border-slate-500 text-white settings-select-dark' : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                      }`}
                      style={isDark ? { backgroundColor: '#334155', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' } : { backgroundColor: '#fff', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' }}
                    >
                      <SelectItem value="1" hideIndicator className={isDark ? 'px-3 py-1.5 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-3 py-1.5 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>Ene - Feb - Mar - Abr</SelectItem>
                      <SelectItem value="2" hideIndicator className={isDark ? 'px-3 py-1.5 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-3 py-1.5 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>May - Jun - Jul - Ago</SelectItem>
                      <SelectItem value="3" hideIndicator className={isDark ? 'px-3 py-1.5 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500 transition-colors duration-150' : 'px-3 py-1.5 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100 transition-colors duration-150'}>Sep - Oct - Nov - Dic</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              {tendenciaModo === 'rango' && (
                <>
                  <input
                    type="date"
                    value={rangoDesde}
                    onChange={(e) => {
                      const next = e.target.value;
                      setRangoDesde(next);
                      if (rangoHasta && !isRangeValid(next, rangoHasta)) {
                        setRangoError('El rango no puede superar 4 meses.');
                      } else {
                        setRangoError('');
                      }
                    }}
                    className={`w-40 h-8 px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                      isDark ? 'border-slate-500 !bg-transparent text-white [color-scheme:dark]' : 'border-purple-200/50 bg-slate-50 text-slate-700'
                    }`}
                  />
                  <input
                    type="date"
                    value={rangoHasta}
                    min={rangoDesde || undefined}
                    max={rangoDesde ? toDateInputValue(addMonths(new Date(`${rangoDesde}T00:00:00`), 4)) : undefined}
                    onChange={(e) => {
                      const next = e.target.value;
                      setRangoHasta(next);
                      if (rangoDesde && !isRangeValid(rangoDesde, next)) {
                        setRangoError('El rango no puede superar 4 meses.');
                      } else {
                        setRangoError('');
                      }
                    }}
                    className={`w-40 h-8 px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                      isDark ? 'border-slate-500 !bg-transparent text-white [color-scheme:dark]' : 'border-purple-200/50 bg-slate-50 text-slate-700'
                    }`}
                  />
                </>
              )}
              </div>
              {rangoError && (
                <span className="mt-2 block text-xs text-red-600">{rangoError}</span>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={followupTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="mes" stroke={chartStroke} />
              <YAxis stroke={chartStroke} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.95)', 
                  border: isDark ? '1px solid #475569' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: isDark ? '#f8fafc' : undefined
                }}
              />
              <Legend wrapperStyle={isDark ? { color: '#e2e8f0' } : undefined} />
              <Area type="monotone" dataKey="estables" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Estables" />
              <Area type="monotone" dataKey="observacion" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} name="En Observación" />
              <Area type="monotone" dataKey="criticos" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Críticos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Activity Chart */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 dark:border-slate-600/50 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl text-slate-800 mb-1" style={isDark ? { color: 'white' } : undefined}>Actividad Mensual</h2>
          <p className="text-sm text-slate-500" style={isDark ? { color: '#e2e8f0' } : undefined}>
            Comparativa de citas, seguimientos y mensajes (últimos 6 meses)
          </p>
        </div>
        {monthlyActivityLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" aria-label="Cargando" />
          </div>
        ) : monthlyActivityData.length === 0 ? (
          <div className={`flex h-[300px] items-center justify-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No hay datos de actividad para mostrar.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="mes" stroke={chartStroke} />
              <YAxis stroke={chartStroke} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.95)', 
                  border: isDark ? '1px solid #475569' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: isDark ? '#f8fafc' : undefined
                }}
              />
              <Legend wrapperStyle={isDark ? { color: '#e2e8f0' } : undefined} />
              <Line type="monotone" dataKey="citas" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} name="Citas" />
              <Line type="monotone" dataKey="seguimientos" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} name="Seguimientos" />
              <Line type="monotone" dataKey="mensajes" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 5 }} name="Mensajes" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citas de Hoy */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 dark:border-slate-600/50 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-slate-800" style={isDark ? { color: 'white' } : undefined}>Citas de Hoy</h2>
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            {citasHoyListLoading ? (
              <div className="flex flex-1 min-h-[120px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" aria-label="Cargando citas" />
              </div>
            ) : citasHoyList.length === 0 ? (
              <div className={`flex flex-1 min-h-[120px] items-center justify-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No hay citas programadas para hoy.
              </div>
            ) : (
              citasHoyList.map((apt) => (
                <div
                  key={apt.citCodigo}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all flex-1 min-h-0 ${
                    isDark
                      ? 'bg-transparent border-slate-600/50 hover:border-slate-500/50'
                      : 'bg-gradient-to-r from-slate-50 to-purple-50/30 border-purple-100/30 hover:border-purple-200/50'
                  }`}
                >
                  <div className="text-center min-w-[60px]">
                    <p className={`text-sm ${isDark ? '' : 'text-slate-500'}`} style={isDark ? { color: '#94a3b8' } : undefined}>Hora</p>
                    <p className={isDark ? '' : 'text-purple-700'} style={isDark ? { color: '#94a3b8' } : undefined}>{apt.time}</p>
                  </div>
                  <div className="flex-1">
                    <p className={isDark ? 'text-white' : 'text-slate-800'}>{apt.name}</p>
                    <p className={`text-sm ${isDark ? '' : 'text-slate-500'}`} style={isDark ? { color: '#94a3b8' } : undefined}>Ficha: {apt.ficha}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${claseBadgeEstadoCita(apt.estadoRaw, isDark)}`}>
                    {apt.statusLabel}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Casos Críticos */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 dark:border-slate-600/50 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-slate-800" style={isDark ? { color: 'white' } : undefined}>Casos Prioritarios</h2>
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            {casosPrioritariosLoading ? (
              <div className="flex flex-1 min-h-[120px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" aria-label="Cargando casos prioritarios" />
              </div>
            ) : casosPrioritarios.length === 0 ? (
              <div className={`flex flex-1 min-h-[120px] items-center justify-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No hay casos en estado crítico u observación.
              </div>
            ) : (
              casosPrioritarios.map((case_) => {
                const isCritico = case_.nivel === 'critico';
                const boxStyle = isDark
                  ? {
                      background: 'transparent',
                      borderWidth: 2,
                      borderLeftWidth: 4,
                      borderStyle: 'solid',
                      borderColor: isCritico ? '#ef4444' : '#facc15',
                    }
                  : undefined;
                return (
                  <div
                    key={case_.segCodigo}
                    className={`p-4 rounded-xl flex-1 min-h-0 flex flex-col ${
                      isCritico
                        ? isDark ? '' : 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/20'
                        : isDark ? '' : 'border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/20'
                    }`}
                    style={boxStyle}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className={isDark ? 'text-white' : 'text-slate-800'}>{case_.nombre}</p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isCritico
                            ? isDark ? 'text-white' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                            : isDark ? 'text-slate-900' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                        }`}
                        style={isDark ? (isCritico ? { backgroundColor: '#dc2626' } : { backgroundColor: '#facc15' }) : undefined}
                      >
                        {case_.nivelLabel}
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-500'}`}>Ficha: {case_.ficha}</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-white' : 'text-slate-500'}`}>{case_.tiempoTexto}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}