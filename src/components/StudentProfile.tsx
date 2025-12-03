import { useState } from 'react';
import { ArrowLeft, Calendar, BarChart3, ClipboardList, Bell, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Student {
  id: number;
  name: string;
  ficha: string;
  email: string;
  status: 'stable' | 'observation' | 'critical';
  program: string;
}

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
}

type Tab = 'calendar' | 'charts' | 'test' | 'reminders' | 'activities';

export function StudentProfile({ student, onBack }: StudentProfileProps) {
  const [activeTab, setActiveTab] = useState<Tab>('calendar');

  const tabs = [
    { id: 'calendar' as Tab, label: 'Calendario', icon: Calendar },
    { id: 'charts' as Tab, label: 'Gráficos', icon: BarChart3 },
    { id: 'test' as Tab, label: 'Test', icon: ClipboardList },
    { id: 'reminders' as Tab, label: 'Recordatorios', icon: Bell },
    { id: 'activities' as Tab, label: 'Actividades', icon: Activity },
  ];

  const emotionalData = [
    { date: '2025-12-01', emotion: 'positive', label: 'Positiva' },
    { date: '2025-12-02', emotion: 'positive', label: 'Positiva' },
    { date: '2025-12-03', emotion: 'neutral', label: 'Neutral' },
    { date: '2025-12-04', emotion: 'negative', label: 'Negativa' },
    { date: '2025-12-05', emotion: 'positive', label: 'Positiva' },
  ];

  // Data for charts
  const emotionalEvolutionData = [
    { day: 'Lun', score: 6.5 },
    { day: 'Mar', score: 7.0 },
    { day: 'Mié', score: 5.5 },
    { day: 'Jue', score: 8.0 },
    { day: 'Vie', score: 7.5 },
    { day: 'Sáb', score: 8.5 },
    { day: 'Dom', score: 9.0 }
  ];

  const sessionAttendanceData = [
    { month: 'Ago', asistidas: 4, programadas: 4 },
    { month: 'Sep', asistidas: 3, programadas: 4 },
    { month: 'Oct', asistidas: 4, programadas: 4 },
    { month: 'Nov', asistidas: 4, programadas: 5 },
    { month: 'Dic', asistidas: 2, programadas: 3 }
  ];

  const emotionalDistributionData = [
    { name: 'Positiva', value: 18, color: '#22c55e' },
    { name: 'Neutral', value: 9, color: '#eab308' },
    { name: 'Negativa', value: 3, color: '#f97316' }
  ];

  const COLORS = ['#22c55e', '#eab308', '#f97316'];

  const getEmotionColor = (emotion: string) => {
    const colors = {
      positive: 'bg-green-500',
      neutral: 'bg-yellow-500',
      negative: 'bg-orange-500',
      critical: 'bg-red-500'
    };
    return colors[emotion as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a la lista
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Student Info */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-sm sticky top-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <h2 className="text-slate-800 mb-1">{student.name}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                student.status === 'stable' ? 'bg-green-100 text-green-700' :
                student.status === 'observation' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {student.status === 'stable' ? 'Estable' :
                 student.status === 'observation' ? 'En Observación' :
                 'Crítico'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Ficha</p>
                <p className="text-sm text-slate-800">{student.ficha}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Programa</p>
                <p className="text-sm text-slate-800">{student.program}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Correo</p>
                <p className="text-sm text-slate-800 break-all">{student.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Teléfono</p>
                <p className="text-sm text-slate-800">+57 300 123 4567</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Facultad</p>
                <p className="text-sm text-slate-800">Tecnología e Informática</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-purple-100/50 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                        : 'border-transparent text-slate-600 hover:text-purple-600 hover:bg-purple-50/30'
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
              {activeTab === 'calendar' && (
                <div>
                  <h3 className="text-lg text-slate-800 mb-4">Registro Emocional</h3>
                  <div className="grid grid-cols-7 gap-3">
                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-sm text-slate-500 py-2">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 30 }, (_, i) => {
                      const emotion = emotionalData.find(e => new Date(e.date).getDate() === i + 1);
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                            emotion
                              ? `${getEmotionColor(emotion.emotion)} text-white`
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {i + 1}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500"></div>
                      <span className="text-sm text-slate-600">Positiva</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-500"></div>
                      <span className="text-sm text-slate-600">Neutral</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-orange-500"></div>
                      <span className="text-sm text-slate-600">Negativa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500"></div>
                      <span className="text-sm text-slate-600">Crítica</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'charts' && (
                <div>
                  <h3 className="text-lg text-slate-800 mb-4">Estadísticas de Evolución</h3>
                  <div className="space-y-6">
                    {/* Emotional Evolution Chart */}
                    <div className="bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-xl p-6">
                      <p className="text-sm text-slate-600 mb-4">Evolución Emocional (últimos 7 días)</p>
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
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl p-6">
                      <p className="text-sm text-slate-600 mb-4">Asistencia a Sesiones</p>
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
                      <div className="bg-gradient-to-r from-slate-50 to-green-50/30 rounded-xl p-6">
                        <p className="text-sm text-slate-600 mb-4">Distribución Emocional (30 días)</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={emotionalDistributionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {emotionalDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                          <p className="text-sm text-slate-600 mb-1">Días Positivos</p>
                          <p className="text-2xl text-green-700">18</p>
                          <p className="text-xs text-slate-500 mt-1">60% del mes</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                          <p className="text-sm text-slate-600 mb-1">Días Neutrales</p>
                          <p className="text-2xl text-yellow-700">9</p>
                          <p className="text-xs text-slate-500 mt-1">30% del mes</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                          <p className="text-sm text-slate-600 mb-1">Días Negativos</p>
                          <p className="text-2xl text-red-700">3</p>
                          <p className="text-xs text-slate-500 mt-1">10% del mes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'test' && (
                <div>
                  <h3 className="text-lg text-slate-800 mb-4">Test de Salud Mental</h3>
                  <div className="bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-xl p-6 mb-6">
                    <div className="text-center mb-4">
                      <p className="text-sm text-slate-600 mb-2">Resultado General</p>
                      <div className="text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        7.5/10
                      </div>
                      <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm">
                        Salud Mental Estable
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 text-center">
                      Última evaluación: 28 de Noviembre 2025
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-white rounded-xl border border-purple-100/50">
                      <p className="text-sm text-slate-800 mb-2">Estado Emocional</p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-purple-100/50">
                      <p className="text-sm text-slate-800 mb-2">Nivel de Estrés</p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-purple-100/50">
                      <p className="text-sm text-slate-800 mb-2">Autoestima</p>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reminders' && (
                <div>
                  <h3 className="text-lg text-slate-800 mb-4">Recordatorios y Retroalimentación</h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                      <p className="text-sm text-slate-600 mb-1">28 Nov 2025</p>
                      <p className="text-slate-800">Continuar con técnicas de respiración aprendidas en sesión anterior.</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500">
                      <p className="text-sm text-slate-600 mb-1">25 Nov 2025</p>
                      <p className="text-slate-800">Excelente progreso en manejo de ansiedad. Mantener rutina de ejercicio.</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-500">
                      <p className="text-sm text-slate-600 mb-1">20 Nov 2025</p>
                      <p className="text-slate-800">Practicar mindfulness 10 minutos diarios antes de dormir.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activities' && (
                <div>
                  <h3 className="text-lg text-slate-800 mb-4">Actividades Asignadas</h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl p-4 border border-purple-100/50 hover:border-purple-200 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-slate-800">Diario de Emociones</h4>
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                          Completada
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Registrar emociones diarias durante 7 días
                      </p>
                      <p className="text-xs text-slate-500">Vencimiento: 5 Dic 2025</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-purple-100/50 hover:border-purple-200 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-slate-800">Ejercicios de Respiración</h4>
                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">
                          En Progreso
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Practicar técnica 4-7-8 dos veces al día
                      </p>
                      <p className="text-xs text-slate-500">Vencimiento: 10 Dic 2025</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-purple-100/50 hover:border-purple-200 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-slate-800">Lectura Recomendada</h4>
                        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                          Pendiente
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Leer capítulo 3 de "Inteligencia Emocional"
                      </p>
                      <p className="text-xs text-slate-500">Vencimiento: 15 Dic 2025</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}