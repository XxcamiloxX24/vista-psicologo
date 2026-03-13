import { useState, useEffect } from 'react';
import { Calendar, Users, MessageSquare, Activity, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { usePsychologist } from '../contexts/PsychologistContext';
import { useTheme } from '../contexts/ThemeContext';
import { getTotalAprendices } from '../lib/aprendiz';
import { getCitasHoy } from '../lib/citas';
import { getTendenciaEstado } from '../lib/seguimiento';
import type { TendenciaEstadoItem } from '../lib/seguimiento';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

  // Data for appointments comparison chart
  const appointmentsData = [
    { day: 'Lun', semanaActual: 6, semanaAnterior: 8 },
    { day: 'Mar', semanaActual: 8, semanaAnterior: 6 },
    { day: 'Mié', semanaActual: 5, semanaAnterior: 7 },
    { day: 'Jue', semanaActual: 9, semanaAnterior: 5 },
    { day: 'Vie', semanaActual: 7, semanaAnterior: 9 },
    { day: 'Sáb', semanaActual: 4, semanaAnterior: 3 },
    { day: 'Dom', semanaActual: 2, semanaAnterior: 2 }
  ];

  // Data for monthly comparison
  const monthlyData = [
    { mes: 'Ago', citas: 145, seguimientos: 18, mensajes: 320 },
    { mes: 'Sep', citas: 162, seguimientos: 21, mensajes: 380 },
    { mes: 'Oct', citas: 178, seguimientos: 22, mensajes: 420 },
    { mes: 'Nov', citas: 195, seguimientos: 24, mensajes: 456 },
    { mes: 'Dic', citas: 52, seguimientos: 24, mensajes: 124 }
  ];

  const recentAppointments = [
    { time: '09:00', name: 'Ana García Pérez', status: 'pending', ficha: '2589634' },
    { time: '10:30', name: 'Carlos Rodríguez', status: 'pending', ficha: '2589635' },
    { time: '14:00', name: 'María López Santos', status: 'pending', ficha: '2589636' },
  ];

  const criticalCases = [
    { name: 'Juan Martínez', level: 'Crítico', lastContact: 'Hace 2 días', ficha: '2589637' },
    { name: 'Laura Pérez', level: 'En Observación', lastContact: 'Hace 1 día', ficha: '2589638' },
    { name: 'Pedro González', level: 'Crítico', lastContact: 'Hace 3 días', ficha: '2589639' },
  ];

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
          <p className="text-slate-800" style={isDark ? { color: 'white' } : undefined}>Miércoles, 3 de Diciembre 2025</p>
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
            <BarChart data={appointmentsData}>
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
          <p className="text-sm text-slate-500" style={isDark ? { color: '#e2e8f0' } : undefined}>Comparativa de citas, seguimientos y mensajes</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
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
            <Line type="monotone" dataKey="citas" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} name="Citas" />
            <Line type="monotone" dataKey="seguimientos" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} name="Seguimientos" />
            <Line type="monotone" dataKey="mensajes" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 5 }} name="Mensajes" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citas de Hoy */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 dark:border-slate-600/50 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-slate-800" style={isDark ? { color: 'white' } : undefined}>Citas de Hoy</h2>
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            {recentAppointments.map((apt, index) => (
              <div
                key={index}
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
                <div className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs">
                  Pendiente
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Casos Críticos */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 dark:border-slate-600/50 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-slate-800" style={isDark ? { color: 'white' } : undefined}>Casos Prioritarios</h2>
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            {criticalCases.map((case_, index) => {
              const isCritico = case_.level === 'Crítico';
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
                key={index}
                className={`p-4 rounded-xl flex-1 min-h-0 flex flex-col ${
                  isCritico
                    ? isDark ? '' : 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/20'
                    : isDark ? '' : 'border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/20'
                }`}
                style={boxStyle}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={isDark ? 'text-white' : 'text-slate-800'}>{case_.name}</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isCritico
                        ? isDark ? 'text-white' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                        : isDark ? 'text-slate-900' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                    }`}
                    style={isDark ? (isCritico ? { backgroundColor: '#dc2626' } : { backgroundColor: '#facc15' }) : undefined}
                  >
                    {case_.level}
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-500'}`}>Ficha: {case_.ficha}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-white' : 'text-slate-500'}`}>{case_.lastContact}</p>
              </div>
            );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}