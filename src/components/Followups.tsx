import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, AlertCircle, TrendingUp, TrendingDown, Minus, Plus, X, Filter, LayoutGrid, Table2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { StudentProfile } from './StudentProfile.tsx';
import { FollowupsTable } from './FollowupsTable';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { listarSeguimientos, type SeguimientoListarResult } from '../lib/seguimiento';

interface Student {
  id: number;
  name: string;
  ficha: string;
  email: string;
  status: 'stable' | 'observation' | 'critical';
  program: string;
  /** Texto del estado desde la API (misma fila que la tabla) */
  estadoTexto?: string;
}

function mapEstadoToStatus(estado: string): 'stable' | 'observation' | 'critical' {
  const e = (estado || '').toLowerCase();
  if (e.includes('estable')) return 'stable';
  if (e.includes('observ') || e.includes('observacion')) return 'observation';
  if (e.includes('critic')) return 'critical';
  return 'observation';
}

function seguimientoToStudent(r: SeguimientoListarResult): Student {
  const n = r.aprendiz?.aprendiz?.nombres;
  const a = r.aprendiz?.aprendiz?.apellidos;
  const parts: string[] = [];
  if (n?.primerNombre) parts.push(n.primerNombre);
  if (n?.segundoNombre) parts.push(n.segundoNombre);
  if (a?.primerApellido) parts.push(a.primerApellido);
  if (a?.segundoApellido) parts.push(a.segundoApellido);
  const name = parts.filter(Boolean).join(' ') || '—';
  return {
    id: r.segCodigo,
    name,
    ficha: String(r.aprendiz?.ficha?.ficCodigo ?? ''),
    email: r.aprendiz?.aprendiz?.contacto?.correoInstitucional ?? '',
    status: mapEstadoToStatus(r.estadoSeguimiento ?? ''),
    program: r.aprendiz?.ficha?.programaFormacion?.progNombre ?? '',
    estadoTexto: (r.estadoSeguimiento ?? '').trim() || undefined,
  };
}

interface FollowupsProps {
  targetStudentId?: string | null;
}

export function Followups({ targetStudentId }: FollowupsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  useEffect(() => {
    if (targetStudentId) {
      const id = parseInt(targetStudentId, 10);
      if (!Number.isNaN(id)) queueMicrotask(() => setSelectedStudent(id));
    }
  }, [targetStudentId]);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'name' | 'email' | 'id' | 'program' | 'ficha'>('all');
  const [showNewFollowupModal, setShowNewFollowupModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [tableData, setTableData] = useState<SeguimientoListarResult[]>([]);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);
  const [tableTotalPages, setTableTotalPages] = useState(0);
  const [tableTotalRegistros, setTableTotalRegistros] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);

  const [cardsData, setCardsData] = useState<SeguimientoListarResult[]>([]);
  const [cardsPage, setCardsPage] = useState(1);
  const [cardsPageSize] = useState(12);
  const [cardsTotalPages, setCardsTotalPages] = useState(0);
  const [cardsTotalRegistros, setCardsTotalRegistros] = useState(0);
  const [cardsLoading, setCardsLoading] = useState(true);
  /** Tras crear seguimiento o acciones que requieran refrescar listas */
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const [newFollowup, setNewFollowup] = useState({
    studentId: '',
    studentName: '',
    email: '',
    ficha: '',
    program: '',
    status: 'stable' as 'stable' | 'observation' | 'critical',
    initialNotes: ''
  });

  const availableStudents = [
    { id: '1001234573', name: 'Sofia Ramírez Torres', email: 'sofia.ramirez@sena.edu.co', ficha: '2589640', program: 'Enfermería' },
    { id: '1001234574', name: 'Diego Hernández Silva', email: 'diego.hernandez@sena.edu.co', ficha: '2589641', program: 'Mecatrónica' }
  ];

  useEffect(() => {
    if (viewMode !== 'table') return;
    let cancelled = false;
    const startLoading = () => { if (!cancelled) setTableLoading(true); };
    const tid = setTimeout(startLoading, 0);
    listarSeguimientos(tablePage, tablePageSize)
      .then((res) => {
        if (cancelled) return;
        setTableData(res.resultados ?? []);
        setTableTotalPages(res.totalPaginas ?? 0);
        setTableTotalRegistros(res.totalRegistros ?? 0);
      })
      .catch(() => {
        if (!cancelled) setTableData([]);
      })
      .finally(() => {
        if (!cancelled) setTableLoading(false);
      });
    return () => { cancelled = true; clearTimeout(tid); };
  }, [viewMode, tablePage, tablePageSize, listRefreshKey]);

  useEffect(() => {
    if (viewMode !== 'cards') return;
    let cancelled = false;
    const tid = setTimeout(() => { if (!cancelled) setCardsLoading(true); }, 0);
    listarSeguimientos(cardsPage, cardsPageSize)
      .then((res) => {
        if (cancelled) return;
        setCardsData(res.resultados ?? []);
        setCardsTotalPages(res.totalPaginas ?? 0);
        setCardsTotalRegistros(res.totalRegistros ?? 0);
      })
      .catch(() => {
        if (!cancelled) {
          setCardsData([]);
          setCardsTotalPages(0);
          setCardsTotalRegistros(0);
        }
      })
      .finally(() => {
        if (!cancelled) setCardsLoading(false);
      });
    return () => { cancelled = true; clearTimeout(tid); };
  }, [viewMode, cardsPage, cardsPageSize, listRefreshKey]);

  const handleCreateFollowup = () => {
    if (!newFollowup.studentId || !newFollowup.status) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    // TODO: llamar API crear seguimiento; mientras tanto se refresca el listado
    setShowNewFollowupModal(false);
    setNewFollowup({
      studentId: '',
      studentName: '',
      email: '',
      ficha: '',
      program: '',
      status: 'stable',
      initialNotes: ''
    });
    setCardsPage(1);
    setTablePage(1);
    setListRefreshKey((k) => k + 1);
  };

  const students = cardsData.map(seguimientoToStudent);

  const studentBySegCodigo = (segCodigo: number): Student | undefined => {
    const r =
      cardsData.find((x) => x.segCodigo === segCodigo) ??
      tableData.find((x) => x.segCodigo === segCodigo);
    return r ? seguimientoToStudent(r) : undefined;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      stable: {
        light: { border: 'border-l-green-500', bg: 'bg-green-50/50', badge: 'border border-green-200 bg-green-100 text-green-700', iconColor: 'text-green-600' },
        dark: { border: 'border-l-green-500', borderColor: '#22c55e', bg: 'bg-transparent', badge: 'text-white', badgeStyle: { backgroundColor: '#22c55e' } as React.CSSProperties, iconColor: 'text-green-500', iconStyle: { color: '#22c55e' } as React.CSSProperties },
        icon: TrendingUp,
        label: 'Estable'
      },
      observation: {
        light: { border: 'border-l-yellow-500', bg: 'bg-yellow-50/50', badge: 'border border-yellow-200 bg-yellow-100 text-yellow-700', iconColor: 'text-yellow-600' },
        dark: { border: 'border-l-yellow-500', borderColor: '#facc15', bg: 'bg-transparent', badge: 'text-slate-900', badgeStyle: { backgroundColor: '#facc15' } as React.CSSProperties, iconColor: 'text-yellow-500', iconStyle: { color: '#facc15' } as React.CSSProperties },
        icon: Minus,
        label: 'En Observación'
      },
      critical: {
        light: { border: 'border-l-red-500', bg: 'bg-red-50/50', badge: 'border border-red-200 bg-red-100 text-red-700', iconColor: 'text-red-600' },
        dark: { border: 'border-l-red-500', borderColor: '#ef4444', bg: 'bg-transparent', badge: 'text-white', badgeStyle: { backgroundColor: '#dc2626' } as React.CSSProperties, iconColor: 'text-red-500', iconStyle: { color: '#ef4444' } as React.CSSProperties },
        icon: TrendingDown,
        label: 'Crítico'
      }
    };
    return colors[status as keyof typeof colors];
  };

  const filteredStudents = students.filter(student => {
    const search = searchTerm.toLowerCase();
    
    if (filterType === 'all') {
      return (
        student.name.toLowerCase().includes(search) ||
        student.ficha.includes(search) ||
        student.email.toLowerCase().includes(search) ||
        student.program.toLowerCase().includes(search) ||
        student.id.toString().includes(search)
      );
    } else if (filterType === 'name') {
      return student.name.toLowerCase().includes(search);
    } else if (filterType === 'email') {
      return student.email.toLowerCase().includes(search);
    } else if (filterType === 'id') {
      return student.id.toString().includes(search);
    } else if (filterType === 'program') {
      return student.program.toLowerCase().includes(search);
    } else if (filterType === 'ficha') {
      return student.ficha.includes(search);
    }
    return true;
  });

  if (viewingStudent) {
    return (
      <StudentProfile
        student={viewingStudent}
        onBack={() => setViewingStudent(null)}
      />
    );
  }
  if (selectedStudent != null) {
    const student = studentBySegCodigo(selectedStudent);
    if (student) {
      return (
        <StudentProfile
          student={student}
          onBack={() => setSelectedStudent(null)}
        />
      );
    }
    if (cardsLoading || tableLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-slate-500 dark:text-slate-400">
          <p>Cargando…</p>
        </div>
      );
    }
    return (
      <div className="space-y-4 p-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          No se encontró ese seguimiento en los datos cargados. Usa la paginación o la vista Tabla.
        </p>
        <button
          type="button"
          onClick={() => setSelectedStudent(null)}
          className="text-purple-600 dark:text-purple-400 underline"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Seguimientos
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Listado de aprendices con seguimiento activo</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`flex rounded-xl overflow-hidden border ${
              isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-100/50'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-purple-900 text-dark'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-purple-600 text-dark'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Table2 className="w-4 h-4" />
              Tabla
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowNewFollowupModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 shrink-0" />
            Nuevo Seguimiento
          </button>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-green-900/30 border-green-600/50' : 'bg-green-50 border-green-200'}`}>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>Estable</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-yellow-900/30 border-yellow-600/50' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>Observación</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-red-900/30 border-red-600/50' : 'bg-red-50 border-red-200'}`}>
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>Crítico</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-purple-100/50 dark:border-slate-600/50 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative min-w-0">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, ficha, correo..."
              className={`pl-12 min-w-0 w-full h-10 rounded-xl ${
                isDark
                  ? 'border-slate-600 bg-slate-800 text-white placeholder:text-slate-400'
                  : 'border-purple-200/50 bg-slate-50 text-slate-700'
              }`}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 z-10" />
            <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
              <SelectTrigger
                className={`w-full pl-11 pr-10 py-3 rounded-xl border-2 focus:ring-2 focus:ring-purple-500/50 font-medium ${
                  isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-purple-200/60 bg-gradient-to-br from-slate-50 to-purple-50/30 text-slate-700'
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`!w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl z-[2147483648] ${
                  isDark ? '!bg-slate-700 border-slate-500 text-white settings-select-dark' : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                }`}
                style={isDark ? { backgroundColor: '#334155', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' } : { backgroundColor: '#fff', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)' }}
              >
                <SelectItem value="all" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>Todos los campos</SelectItem>
                <SelectItem value="name" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>Nombre</SelectItem>
                <SelectItem value="email" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>Correo</SelectItem>
                <SelectItem value="id" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>ID</SelectItem>
                <SelectItem value="program" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>Programa</SelectItem>
                <SelectItem value="ficha" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>Ficha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* New Followup Modal */}
      {showNewFollowupModal && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex: 2147483647,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
              isDark ? 'bg-slate-900 border border-slate-600' : 'bg-white border border-slate-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 rounded-t-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Crear Nuevo Seguimiento</h2>
              <button
                type="button"
                onClick={() => setShowNewFollowupModal(false)}
                className="rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Seleccionar Aprendiz *</Label>
                <Select
                  value={newFollowup.studentId}
                  onValueChange={(value) => {
                    const student = availableStudents.find(s => s.id === value);
                    if (student) {
                      setNewFollowup({
                        ...newFollowup,
                        studentId: value,
                        studentName: student.name,
                        email: student.email,
                        ficha: student.ficha,
                        program: student.program
                      });
                    }
                  }}
                >
                  <SelectTrigger
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-500/50 ${
                      isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-purple-200/50 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <SelectValue placeholder="Seleccione un aprendiz" />
                  </SelectTrigger>
                  <SelectContent
                    className={`!w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl ${
                      isDark ? '!bg-slate-700 border-slate-500 text-white settings-select-dark' : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                    }`}
                    style={isDark ? { backgroundColor: '#334155', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)', zIndex: 2147483648 } : { backgroundColor: '#fff', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)', zIndex: 2147483648 }}
                  >
                    {availableStudents.map(student => (
                      <SelectItem key={student.id} value={student.id} hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>
                        {student.name} - Ficha: {student.ficha}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newFollowup.studentId && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Correo</p>
                      <p className="text-sm text-slate-800 dark:text-slate-200">{newFollowup.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Ficha</p>
                      <p className="text-sm text-slate-800 dark:text-slate-200">{newFollowup.ficha}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Programa</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200">{newFollowup.program}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="status">Estado Inicial *</Label>
                <Select value={newFollowup.status} onValueChange={(v) => setNewFollowup({ ...newFollowup, status: v as 'stable' | 'observation' | 'critical' })}>
                  <SelectTrigger
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-500/50 ${
                      isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-purple-200/50 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`!w-[var(--radix-select-trigger-width)] !min-w-[var(--radix-select-trigger-width)] rounded-xl ${
                      isDark ? '!bg-slate-700 border-slate-500 text-white settings-select-dark' : '!bg-white border-slate-200 text-slate-900 select-light-dropdown'
                    }`}
                    style={isDark ? { backgroundColor: '#334155', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)', zIndex: 2147483648 } : { backgroundColor: '#fff', width: 'var(--radix-select-trigger-width)', minWidth: 'var(--radix-select-trigger-width)', zIndex: 2147483648 }}
                  >
                    <SelectItem value="stable" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>Estable</SelectItem>
                    <SelectItem value="observation" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>En Observación</SelectItem>
                    <SelectItem value="critical" hideIndicator className={isDark ? 'px-4 py-2 text-white focus:bg-slate-500 data-[highlighted]:bg-slate-500' : 'px-4 py-2 text-slate-900 focus:bg-slate-100 data-[highlighted]:bg-slate-100'}>Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialNotes">Notas Iniciales</Label>
                <Textarea
                  id="initialNotes"
                  value={newFollowup.initialNotes}
                  onChange={(e) => setNewFollowup({ ...newFollowup, initialNotes: e.target.value })}
                  placeholder="Escriba observaciones iniciales sobre el aprendiz..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewFollowupModal(false)}
                  className="flex-1 px-6 py-3 rounded-2xl border border-purple-200/50 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateFollowup}
                  className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
                >
                  Crear Seguimiento
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Cards: mismos datos que la API de la tabla (mis-seguimientos), paginado */}
      {viewMode === 'cards' && (
        <>
          {cardsLoading ? (
            <div className={`rounded-2xl border px-6 py-16 text-center text-slate-500 ${isDark ? 'border-slate-600 bg-slate-800/50' : 'border-purple-100/50 bg-white/90'}`}>
              Cargando seguimientos…
            </div>
          ) : (
            <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => {
          const statusConfig = getStatusColor(student.status);
          const StatusIcon = statusConfig.icon;
          const cfg = isDark ? statusConfig.dark : statusConfig.light;
          const cardStyle = isDark && 'borderColor' in cfg
            ? { borderLeftWidth: 4, borderLeftStyle: 'solid' as const, borderLeftColor: (cfg as { borderColor?: string }).borderColor }
            : undefined;

          return (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student.id)}
              className={`rounded-2xl p-6 border-l-4 ${cfg.border} ${cfg.bg} hover:shadow-lg transition-all text-left group border ${
                isDark
                  ? 'border-slate-600/50 hover:border-slate-500/50'
                  : 'border-purple-100/50 backdrop-blur-sm'
              }`}
              style={cardStyle}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className={`mb-1 group-hover:text-purple-700 transition-colors ${isDark ? 'text-white group-hover:text-purple-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {student.name}
                  </h3>
                  <p className={`text-sm ${!isDark ? 'text-slate-500 dark:text-slate-400' : ''}`} style={isDark ? { color: '#94a3b8' } : undefined}>Ficha: {student.ficha}</p>
                </div>
                <StatusIcon
                  className={`w-5 h-5 shrink-0 ${cfg.iconColor}`}
                  style={isDark && 'iconStyle' in cfg ? (cfg as { iconStyle?: React.CSSProperties }).iconStyle : undefined}
                />
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm" style={isDark ? { color: '#94a3b8' } : undefined}>{student.email}</p>
                <p className="text-sm" style={isDark ? { color: '#94a3b8' } : undefined}>{student.program}</p>
              </div>

              <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-slate-600/50' : 'border-purple-100/50'}`}>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${cfg.badge}`}
                  style={'badgeStyle' in cfg ? (cfg as { badgeStyle?: React.CSSProperties }).badgeStyle : undefined}
                >
                  {student.estadoTexto || statusConfig.label}
                </span>
                <span className={`text-xs group-hover:underline ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  Ver perfil →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {!cardsLoading && filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            {searchTerm.trim()
              ? 'Ningún resultado coincide con la búsqueda en esta página'
              : cardsTotalRegistros === 0
                ? 'No tienes seguimientos activos'
                : 'No hay registros en esta página'}
          </p>
        </div>
      )}

      <div className={`flex flex-wrap items-center justify-between gap-4 pt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        <span className="text-sm">
          {cardsTotalRegistros} registro{cardsTotalRegistros !== 1 ? 's' : ''} · Página {cardsPage} de {cardsTotalPages || 1}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCardsPage((p) => Math.max(1, p - 1))}
            disabled={cardsPage <= 1 || cardsLoading}
            className={`p-2 rounded-lg disabled:opacity-40 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCardsPage((p) => p + 1)}
            disabled={cardsPage >= cardsTotalPages || cardsTotalPages < 1 || cardsLoading}
            className={`p-2 rounded-lg disabled:opacity-40 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}
            aria-label="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
            </>
          )}
        </>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-2xl p-4">
          <FollowupsTable
            data={tableData}
            paginaActual={tablePage}
            totalPaginas={tableTotalPages}
            totalRegistros={tableTotalRegistros}
            tamanoPagina={tablePageSize}
            onPageChange={setTablePage}
            onPageSizeChange={(s) => {
              setTablePageSize(s);
              setTablePage(1);
            }}
            isLoading={tableLoading}
            onRowClick={(r) => setViewingStudent(seguimientoToStudent(r))}
          />
        </div>
      )}
    </div>
  );
}