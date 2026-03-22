import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Calendar, BarChart3, ClipboardList, ListChecks, Pencil, Trash2, Plus, X } from 'lucide-react';
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
  /** Estado de formación de la ficha: en ejecucion, cancelada, terminada, etc. */
  estadoFormacion?: string;
}

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
}

type Tab = 'calendar' | 'charts' | 'test' | 'recommendations';

export function StudentProfile({ student, onBack }: StudentProfileProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [activeTab, setActiveTab] = useState<Tab>('calendar');

  const [recomendaciones, setRecomendaciones] = useState<RecomendacionItem[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [errorRecs, setErrorRecs] = useState<string | null>(null);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState<RecomendacionItem | null>(null);
  const [modalEliminarOpen, setModalEliminarOpen] = useState<RecomendacionItem | null>(null);

  const tabs = [
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
              {activeTab === 'calendar' && (
                <div>
                  <h3 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Registro Emocional</h3>
                  <div className="grid grid-cols-7 gap-3">
                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
                      <div key={i} className={`text-center text-sm py-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
                              : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'
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
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-600'}`}>Positiva</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-500"></div>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-600'}`}>Neutral</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-orange-500"></div>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-600'}`}>Negativa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500"></div>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-600'}`}>Crítica</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'charts' && (
                <div>
                  <h3 className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Estadísticas de Evolución</h3>
                  <div className="space-y-6">
                    {/* Emotional Evolution Chart */}
                    <div className={`rounded-xl p-6 ${isDark ? 'bg-slate-700/50' : 'bg-gradient-to-r from-slate-50 to-purple-50/30'}`}>
                      <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Evolución Emocional (últimos 7 días)</p>
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
                        <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Distribución Emocional (30 días)</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={emotionalDistributionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {emotionalDistributionData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-3">
                        <div className={`rounded-xl p-4 border ${isDark ? 'bg-green-900/30 border-green-700/50' : 'bg-green-50 border-green-200'}`}>
                          <p className={`text-sm mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Días Positivos</p>
                          <p className={`text-2xl ${isDark ? 'text-green-300' : 'text-green-700'}`}>18</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>60% del mes</p>
                        </div>
                        <div className={`rounded-xl p-4 border ${isDark ? 'bg-yellow-900/30 border-yellow-700/50' : 'bg-yellow-50 border-yellow-200'}`}>
                          <p className={`text-sm mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Días Neutrales</p>
                          <p className={`text-2xl ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>9</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>30% del mes</p>
                        </div>
                        <div className={`rounded-xl p-4 border ${isDark ? 'bg-red-900/30 border-red-700/50' : 'bg-red-50 border-red-200'}`}>
                          <p className={`text-sm mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Días Negativos</p>
                          <p className={`text-2xl ${isDark ? 'text-red-300' : 'text-red-700'}`}>3</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>10% del mes</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '80%' }}></div>
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