import { Calendar, Users, MessageSquare, Activity, TrendingUp, AlertCircle, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const stats = [
    {
      label: 'Citas Hoy',
      value: '8',
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
      value: '156',
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      change: '+8',
      percentage: '+5%',
      trend: 'up',
      comparison: 'vs mes pasado'
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

  // Data for follow-up status trends
  const followupTrendsData = [
    { mes: 'Ago', estables: 12, observacion: 4, criticos: 2 },
    { mes: 'Sep', estables: 14, observacion: 5, criticos: 2 },
    { mes: 'Oct', estables: 15, observacion: 5, criticos: 2 },
    { mes: 'Nov', estables: 16, observacion: 6, criticos: 2 },
    { mes: 'Dic', estables: 18, observacion: 4, criticos: 2 }
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
          <p className="text-slate-600">Bienvenido de nuevo, Dr. Paola Garizabalo</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Hoy</p>
          <p className="text-slate-800">Miércoles, 3 de Diciembre 2025</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          return (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                  stat.trend === 'up' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <TrendIcon className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.percentage}
                  </span>
                </div>
              </div>
              <h3 className="text-3xl mb-1 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {stat.value}
              </h3>
              <p className="text-slate-600 text-sm mb-2">{stat.label}</p>
              <p className="text-xs text-slate-500">
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl text-slate-800 mb-1">Citas Semanales</h2>
            <p className="text-sm text-slate-500">Comparación con semana anterior</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={appointmentsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl text-slate-800 mb-1">Tendencia de Seguimientos</h2>
            <p className="text-sm text-slate-500">Evolución por estado</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={followupTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="estables" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Estables" />
              <Area type="monotone" dataKey="observacion" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} name="En Observación" />
              <Area type="monotone" dataKey="criticos" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Críticos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Activity Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl text-slate-800 mb-1">Actividad Mensual</h2>
          <p className="text-sm text-slate-500">Comparativa de citas, seguimientos y mensajes</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mes" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="citas" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} name="Citas" />
            <Line type="monotone" dataKey="seguimientos" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} name="Seguimientos" />
            <Line type="monotone" dataKey="mensajes" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 5 }} name="Mensajes" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citas de Hoy */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-slate-800">Citas de Hoy</h2>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="space-y-3">
            {recentAppointments.map((apt, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-purple-50/30 border border-purple-100/30 hover:border-purple-200/50 transition-all"
              >
                <div className="text-center min-w-[60px]">
                  <p className="text-sm text-slate-500">Hora</p>
                  <p className="text-purple-700">{apt.time}</p>
                </div>
                <div className="flex-1">
                  <p className="text-slate-800">{apt.name}</p>
                  <p className="text-sm text-slate-500">Ficha: {apt.ficha}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">
                  Pendiente
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Casos Críticos */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-slate-800">Casos Prioritarios</h2>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="space-y-3">
            {criticalCases.map((case_, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-l-4 ${
                  case_.level === 'Crítico'
                    ? 'border-l-red-500 bg-red-50/50'
                    : 'border-l-yellow-500 bg-yellow-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-800">{case_.name}</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      case_.level === 'Crítico'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {case_.level}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Ficha: {case_.ficha}</p>
                <p className="text-xs text-slate-500 mt-1">{case_.lastContact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}